// Reçoit les événements Stripe (paiement réussi / session expirée) et met à
// jour la réservation en conséquence. À configurer dans le Dashboard Stripe
// (Developers → Webhooks → Add endpoint) une fois l'URL de cette fonction
// déployée : .../functions/v1/stripe-webhook, événements à cocher :
// checkout.session.completed, checkout.session.expired.
// Secrets requis : STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (donné par Stripe
// au moment de créer le endpoint), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (mêmes clés que notify-new-bag, pour
// prévenir le commerçant par push qu'une réservation vient d'être payée —
// seul moyen pour lui de le savoir sans garder le tableau de bord ouvert).
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

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

// Reconstruit la paire de clés VAPID existante (identique à notify-new-bag —
// voir ce fichier pour le détail du format attendu par le crypto natif de Deno).
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

// Best-effort : une notification ratée ne doit jamais faire échouer le
// traitement du webhook Stripe (le paiement est déjà confirmé à ce stade).
async function notifyMerchantOfPaidReservation(reservationId: string) {
  try {
    const { data: reservation } = await supabase
      .from("reservations")
      .select("quantity, bags(title, merchant_id)")
      .eq("id", reservationId)
      .single();

    const bag = reservation?.bags as { title: string; merchant_id: string } | null;
    if (!bag) return;

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", bag.merchant_id);

    if (!subs?.length) return;

    const qty = reservation!.quantity;
    const notification = JSON.stringify({
      title: "Nouvelle réservation payée",
      body: `${qty} × ${bag.title}`,
      url: "./app.html?view=merchant",
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
  } catch {
    // silencieux, voir commentaire au-dessus de la fonction
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Signature invalide: ${err instanceof Error ? err.message : "erreur"}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservation_id;
    if (reservationId) {
      await supabase.from("reservations").update({ payment_status: "paid" }).eq("id", reservationId);
      await notifyMerchantOfPaidReservation(reservationId);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservation_id;
    if (reservationId) {
      await supabase.rpc("release_reservation", { p_reservation_id: reservationId });
    }
  }

  return new Response("ok", { status: 200 });
});
