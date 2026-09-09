// Supabase Edge Function — appelée directement par le client juste après la
// publication d'un sachet (voir src/lib/notify.js côté app).
// Notifie par Web Push les utilisateurs ayant mis le commerçant en favori.
// À déployer depuis le dashboard Supabase (Edge Functions → smart-service → Code → coller ceci → Deploy).
//
// Utilise @negrel/webpush (natif Deno) plutôt que le paquet npm "web-push"
// (pensé pour Node) qui plante sous Deno après l'envoi — voir l'historique
// de ce fichier si besoin de contexte sur ce changement.

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

// Reconstruit la paire de clés VAPID existante (les mêmes clés déjà connues
// du navigateur des utilisateurs, indispensable pour ne pas invalider les
// abonnements déjà créés) au format JWK attendu par le crypto natif de Deno.
async function loadVapidKeys(): Promise<CryptoKeyPair> {
  const rawPublic = b64urlToBytes(VAPID_PUBLIC_KEY); // 0x04 || X(32) || Y(32)
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Le navigateur envoie d'abord une requête OPTIONS de vérification (sans
  // corps) avant le vrai POST — sans ce court-circuit, req.json() plantait
  // en essayant de lire un contenu qui n'existe pas sur cette requête-là.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const payload = await req.json();
  const bag = payload.record;

  if (!bag || payload.type !== "INSERT") {
    return new Response("ignored", { status: 200 });
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("business_name, city")
    .eq("id", bag.merchant_id)
    .single();

  const { data: favorites } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("merchant_id", bag.merchant_id);

  // En plus des favoris (commerçant précis déjà connu), notifie aussi les
  // utilisateurs abonnés à la ville du commerçant — voir CityNotifications.jsx.
  // Un même utilisateur peut être dans les deux listes, d'où le Set pour dédupliquer.
  const { data: citySubs } = merchant?.city
    ? await supabase.from("city_subscriptions").select("user_id").eq("city", merchant.city)
    : { data: [] };

  const userIds = [...new Set([...(favorites ?? []).map((f) => f.user_id), ...(citySubs ?? []).map((c) => c.user_id)])];
  if (!userIds.length) return new Response("no subscribers", { status: 200 });

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  const notification = JSON.stringify({
    title: merchant?.business_name ?? "Relief.lu",
    body: `Nouveau sachet : ${bag.title}`,
    url: "./app.html",
  });

  const staleIds: string[] = [];

  await Promise.all(
    (subs ?? []).map(async (sub) => {
      try {
        const subscriber = appServer.subscribe({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        });
        await subscriber.pushTextMessage(notification, {});
      } catch (err) {
        // 404/410 = l'abonnement n'existe plus côté navigateur, on le nettoie.
        const status = err?.response?.status;
        if (status === 404 || status === 410) staleIds.push(sub.id);
      }
    })
  );

  if (staleIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return new Response("ok", { status: 200 });
});
