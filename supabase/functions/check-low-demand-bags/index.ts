// Supabase Edge Function — alerte "faible demande" (V1 à règles, voir
// db/schema-v25-low-demand-alerts.sql), déclenchée par le job planifié
// pg_cron toutes les 30 min, pas par le client.
//
// Règle simple : un panier actif, encore à quantité pleine (zéro réservation),
// dont la fin du créneau de retrait arrive dans moins de 2h, déclenche une
// notification au commerçant concerné. Chaque panier n'est alerté qu'une
// seule fois (alerted_low_demand), pour ne pas spammer.
//
// N'envoie rien si le feature flag "low_demand_alerts" est désactivé — même
// garde-fou que send-daily-reminders.
// À déployer depuis le dashboard Supabase (Edge Functions → Code → coller
// ceci → Deploy), puis copier l'URL générée dans schema-v25 (remplacer
// <NOM_GENERE>).

import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@relief.lu";

// Fenêtre d'alerte : paniers dont la fin de créneau arrive dans moins de
// LOOKAHEAD_HOURS, mais pas déjà passée (sinon le panier est juste expiré,
// pas "en difficulté" — inutile d'alerter après coup).
const LOOKAHEAD_HOURS = 2;

function b64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Même reconstruction de clés VAPID que notify-new-bag/send-daily-reminders.
async function loadVapidKeys(): Promise<CryptoKeyPair> {
  const rawPublic = b64urlToBytes(VAPID_PUBLIC_KEY);
  const x = bytesToB64url(rawPublic.slice(1, 33));
  const y = bytesToB64url(rawPublic.slice(33, 65));
  const d = bytesToB64url(b64urlToBytes(VAPID_PRIVATE_KEY));

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"]
  );
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, d, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );
  return { publicKey, privateKey };
}

const vapidKeys = await loadVapidKeys();
const appServer = await webpush.ApplicationServer.new({
  contactInformation: VAPID_SUBJECT,
  vapidKeys,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: flag } = await supabase
    .from("feature_flags")
    .select("enabled")
    .eq("key", "low_demand_alerts")
    .single();
  if (!flag?.enabled) return new Response("disabled", { status: 200 });

  const now = new Date();
  const horizon = new Date(now.getTime() + LOOKAHEAD_HOURS * 60 * 60 * 1000);

  // Panier "en difficulté" : actif, zéro réservation (quantity_left ===
  // quantity_total), pas encore alerté, et la fin du créneau arrive bientôt
  // mais n'est pas encore passée.
  const { data: bags } = await supabase
    .from("bags")
    .select("id, title, merchant_id, quantity_total, quantity_left, pickup_end")
    .eq("status", "active")
    .eq("alerted_low_demand", false)
    .gt("pickup_end", now.toISOString())
    .lte("pickup_end", horizon.toISOString());

  const stale = (bags ?? []).filter((b) => b.quantity_left === b.quantity_total);
  if (!stale.length) return new Response("no stale bags", { status: 200 });

  const merchantIds = [...new Set(stale.map((b) => b.merchant_id))];
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", merchantIds);

  const subsByMerchant = new Map<string, typeof subs>();
  for (const sub of subs ?? []) {
    const list = subsByMerchant.get(sub.user_id) ?? [];
    list.push(sub);
    subsByMerchant.set(sub.user_id, list);
  }

  const staleSubIds: string[] = [];
  const alertedBagIds: string[] = [];
  let sent = 0;

  await Promise.all(
    stale.map(async (bag) => {
      const merchantSubs = subsByMerchant.get(bag.merchant_id) ?? [];
      if (!merchantSubs.length) return;

      const minutesLeft = Math.round((new Date(bag.pickup_end).getTime() - now.getTime()) / 60000);
      const hoursLeft = Math.round(minutesLeft / 60);
      const timeLabel = hoursLeft >= 1 ? `${hoursLeft}h` : `${minutesLeft} min`;

      const notification = JSON.stringify({
        title: "Relief.lu",
        body: `"${bag.title}" n'a pas encore été réservé — plus que ${timeLabel} avant la fin du créneau. Baisser le prix ?`,
        url: "./app.html?view=merchant",
      });

      let bagSent = false;
      await Promise.all(
        merchantSubs.map(async (sub) => {
          try {
            const subscriber = appServer.subscribe({
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            });
            await subscriber.pushTextMessage(notification, {});
            bagSent = true;
          } catch (err) {
            const status = err?.response?.status;
            if (status === 404 || status === 410) staleSubIds.push(sub.id);
          }
        })
      );

      if (bagSent) sent++;
      alertedBagIds.push(bag.id);
    })
  );

  if (staleSubIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", staleSubIds);
  }
  if (alertedBagIds.length) {
    await supabase.from("bags").update({ alerted_low_demand: true }).in("id", alertedBagIds);
  }

  return new Response(JSON.stringify({ sent, checked: stale.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
