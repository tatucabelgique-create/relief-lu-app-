// Supabase Edge Function — rappel quotidien générique (façon TGTG), déclenchée
// par le job planifié pg_cron (voir db/schema-v21-daily-reminders.sql), pas
// par le client. Envoie "N'oublie pas de sauver un panier aujourd'hui" à tous
// les utilisateurs ayant coché le jour courant dans DailyReminders.jsx.
// N'envoie rien si le feature flag "daily_reminders" est désactivé (voir
// DailyReminderToggle.jsx) — sécurité en plus du filtre déjà fait par pg_cron
// qui n'appelle cette fonction que si elle existe, sans connaître l'état du flag.
// À déployer depuis le dashboard Supabase (Edge Functions → Code → coller
// ceci → Deploy).

import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@relief.lu";

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

// Même reconstruction de clés VAPID que notify-new-bag/send-marketing-push.
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

  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "daily_reminders").single();
  if (!flag?.enabled) return new Response("disabled", { status: 200 });

  // ISO : 1 = lundi ... 7 = dimanche. Date.getUTCDay() renvoie 0 = dimanche,
  // d'où le mapping ci-dessous.
  const jsDay = new Date().getUTCDay();
  const isoDay = jsDay === 0 ? 7 : jsDay;

  const { data: reminders } = await supabase.from("daily_reminders").select("user_id").contains("days", [isoDay]);
  const userIds = (reminders ?? []).map((r) => r.user_id);
  if (!userIds.length) return new Response("no subscribers today", { status: 200 });

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  const notification = JSON.stringify({
    title: "Relief.lu",
    body: "N'oublie pas de sauver un panier aujourd'hui !",
    url: "./app.html",
  });

  const staleIds: string[] = [];
  let sent = 0;

  await Promise.all(
    (subs ?? []).map(async (sub) => {
      try {
        const subscriber = appServer.subscribe({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        });
        await subscriber.pushTextMessage(notification, {});
        sent++;
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404 || status === 410) staleIds.push(sub.id);
      }
    })
  );

  if (staleIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return new Response(JSON.stringify({ sent, total: subs?.length ?? 0 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
