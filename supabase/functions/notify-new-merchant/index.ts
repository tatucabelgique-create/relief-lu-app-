// Supabase Edge Function — appelée automatiquement par un trigger Postgres
// (voir db/schema-v24-notify-new-merchant.sql) juste après la création d'une
// nouvelle fiche commerçant (première inscription, pas les modifications
// ultérieures — le trigger est en AFTER INSERT, pas AFTER UPDATE).
// Notifie l'admin par Web Push (même mécanisme que notify-new-bag) plutôt
// que par email — aucun service tiers requis, tout est déjà en place.
// À déployer depuis le dashboard Supabase (Edge Functions → bright-endpoint
// → Code → coller ceci → Deploy).
import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@relief.lu";

// Même compte que ADMIN_EMAIL côté app (src/lib/admin.js) — dupliqué ici
// plutôt qu'importé car les Edge Functions Deno n'ont pas accès au code
// src/ du build Vite.
const ADMIN_EMAIL = "giovanni.ehp@gmail.com";

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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const merchant = await req.json();
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // auth.users n'est pas exposée via le client normal — seule une requête
  // avec la clé service_role (admin API) peut y chercher l'admin par email.
  const { data: usersPage } = await supabase.auth.admin.listUsers();
  const admin = usersPage?.users.find((u) => u.email === ADMIN_EMAIL);
  if (!admin) return new Response("admin not found", { status: 200, headers: corsHeaders });

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", admin.id);

  if (!subs?.length) return new Response("admin has no push subscription", { status: 200, headers: corsHeaders });

  const notification = JSON.stringify({
    title: "Nouveau commerçant",
    body: merchant.business_name
      ? `${merchant.business_name} — ${[merchant.address, merchant.city].filter(Boolean).join(", ")}`
      : "Un commerçant vient de s'inscrire",
    url: "./app.html?view=admin",
  });

  const staleIds: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        const subscriber = appServer.subscribe({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        });
        await subscriber.pushTextMessage(notification, {});
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404 || status === 410) staleIds.push(sub.id);
      }
    })
  );

  if (staleIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
