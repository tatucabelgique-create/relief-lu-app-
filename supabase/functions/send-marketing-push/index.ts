// Supabase Edge Function — envoi manuel d'une notification push "marketing"
// (façon TGTG : "Cap sur le Japon ce soir", pas juste "nouveau sachet") à
// TOUS les utilisateurs abonnés aux notifications, pas seulement ceux ayant
// mis un commerçant précis en favori (contrairement à notify-new-bag).
// Déclenchée manuellement par le commerçant/opérateur (pas automatique) via
// une requête POST protégée par un secret partagé — pas de système de rôle
// admin construit, ce secret sert de seule protection.
// À déployer depuis le dashboard Supabase (Edge Functions → Code → coller
// ceci → Deploy). Secret requis en plus de ceux déjà utilisés par
// notify-new-bag : MARKETING_PUSH_SECRET (à choisir toi-même, une longue
// chaîne aléatoire).
//
// Appel :
// curl -X POST https://<ref>.supabase.co/functions/v1/send-marketing-push \
//   -H "content-type: application/json" \
//   -H "x-admin-secret: <MARKETING_PUSH_SECRET>" \
//   -d '{"title": "Cap sur le Japon ce soir", "body": "Découvrez les spécialités japonaises à sauver près de chez vous.", "url": "./app.html"}'

import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@relief.lu";
const ADMIN_SECRET = Deno.env.get("MARKETING_PUSH_SECRET")!;

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

// Même reconstruction de clés VAPID que notify-new-bag — indispensable pour
// rester compatible avec les abonnements déjà enregistrés côté navigateur.
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

// En-têtes standards uniquement (authorization, apikey, content-type...) —
// Supabase impose une liste fixe d'en-têtes autorisés en amont de la
// fonction pour la réponse au préflight CORS, qui ignore ce que le code
// demande en plus ; un en-tête personnalisé comme x-admin-secret est donc
// toujours rejeté au préflight, quel que soit le code déployé. Le secret
// passe donc dans le corps de la requête (JSON), jamais soumis à cette
// restriction.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { title, body, url, admin_secret } = await req.json();

  if (admin_secret !== ADMIN_SECRET) {
    return new Response("unauthorized", { status: 401, headers: corsHeaders });
  }

  if (!title || !body) {
    return new Response(JSON.stringify({ error: "title et body requis" }), { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: subs } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth");

  const notification = JSON.stringify({ title, body, url: url || "./app.html" });
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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
