// Reçoit les événements Stripe (paiement réussi / session expirée / compte
// Connect mis à jour) et met à jour la réservation ou le commerçant en
// conséquence, puis envoie l'email de confirmation au client. À configurer
// dans le Dashboard Stripe (Developers → Webhooks → Add endpoint) une fois
// l'URL de cette fonction déployée : .../functions/v1/stripe-webhook,
// événements à cocher : voir la liste juste au-dessus de Deno.serve.
// Nécessite la migration db/schema-v22-payment-hardening.sql.
// Secrets requis : STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (donné par Stripe
// au moment de créer le endpoint), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (mêmes clés que notify-new-bag, pour
// prévenir le commerçant par push qu'une réservation vient d'être payée —
// seul moyen pour lui de le savoir sans garder le tableau de bord ouvert),
// RESEND_API_KEY et EMAIL_FROM (email de confirmation, voir plus bas).
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

// Chargé à la demande (pas au démarrage du module) : si la génération des
// clés VAPID échouait au niveau module, ça ferait planter TOUTE la fonction
// avant même qu'elle puisse traiter le moindre webhook Stripe — y compris la
// mise à jour du paiement, qui elle est critique. Isolé ici + mis en cache
// après le premier succès, pour que seul le push (best-effort) soit affecté.
let appServerPromise: ReturnType<typeof webpush.ApplicationServer.new> | null = null;
function getAppServer() {
  if (!appServerPromise) {
    appServerPromise = loadVapidKeys().then((vapidKeys) =>
      webpush.ApplicationServer.new({ contactInformation: VAPID_SUBJECT, vapidKeys })
    );
  }
  return appServerPromise;
}

// Best-effort : une notification ratée ne doit jamais faire échouer le
// traitement du webhook Stripe (le paiement est déjà confirmé à ce stade).
async function notifyMerchantOfPaidReservation(reservationId: string) {
  try {
    const appServer = await getAppServer();
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

// ---------- Email de confirmation (Resend) ----------
// Secrets requis : RESEND_API_KEY, et EMAIL_FROM (ex. "relief.lu
// <reservations@relief.lu>", domaine vérifié dans Resend). Sans
// RESEND_API_KEY, l'envoi est simplement ignoré : le paiement fonctionne
// comme avant, seul l'email manque.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "relief.lu <reservations@relief.lu>";
const APP_URL = Deno.env.get("APP_URL") ?? "https://relief.lu/app.html";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function formatPickup(startIso: string, endIso: string): string {
  const tz = "Europe/Luxembourg";
  const day = new Intl.DateTimeFormat("fr-FR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(new Date(startIso));
  const time = (iso: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  return `${day}, ${time(startIso)} – ${time(endIso)}`;
}

// Best-effort, et au plus une fois par réservation : la colonne
// confirmation_email_sent_at est « réservée » avant l'envoi, donc un webhook
// rejoué par Stripe ne renvoie jamais un deuxième email.
async function sendConfirmationEmail(reservationId: string) {
  if (!RESEND_API_KEY) return;
  try {
    const { data: claimed } = await supabase
      .from("reservations")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", reservationId)
      .is("confirmation_email_sent_at", null)
      .select("email, quantity, pickup_code, bags(title, price_cents, pickup_start, pickup_end, merchants(business_name, address, city))")
      .maybeSingle();
    if (!claimed?.email) return;

    const bag = claimed.bags as {
      title: string;
      price_cents: number;
      pickup_start: string;
      pickup_end: string;
      merchants: { business_name: string; address: string | null; city: string | null } | null;
    };
    const m = bag.merchants;
    const where = [m?.business_name, m?.address, m?.city].filter(Boolean).map((s) => escapeHtml(s!)).join(", ");
    const total = ((bag.price_cents * claimed.quantity) / 100).toFixed(2).replace(".", ",");
    const pickup = formatPickup(bag.pickup_start, bag.pickup_end);
    const code = escapeHtml(claimed.pickup_code);

    const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1c2536">
  <h2 style="margin-bottom:4px">Ta réservation est confirmée ✅</h2>
  <p style="margin-top:0;color:#555">Merci d'avoir sauvé un panier avec relief.lu.</p>
  <div style="border:2px dashed #e0a526;border-radius:12px;padding:16px;text-align:center;margin:20px 0">
    <div style="font-size:13px;color:#555">Code de retrait · Abholcode · Pickup code</div>
    <div style="font-size:32px;font-weight:bold;letter-spacing:4px">${code}</div>
  </div>
  <p><b>${claimed.quantity} × ${escapeHtml(bag.title)}</b> — ${total} € payés</p>
  <p><b>Où :</b> ${where}<br><b>Quand :</b> ${escapeHtml(pickup)}</p>
  <p>Présente ce code au commerçant pendant le créneau de retrait.</p>
  <p style="color:#555;font-size:13px">DE : Zeige diesen Code dem Händler während des Abholzeitfensters.<br>
  EN: Show this code to the shop during the pickup window.</p>
  <p><a href="${APP_URL}?view=account" style="color:#1c2536">Voir mes réservations</a></p>
</div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: claimed.email,
        subject: `Réservation confirmée — code ${claimed.pickup_code}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend a refusé l'email", reservationId, res.status, await res.text());
      // Libère le verrou pour permettre un renvoi manuel / au prochain rejeu.
      await supabase.from("reservations").update({ confirmation_email_sent_at: null }).eq("id", reservationId);
    }
  } catch (err) {
    console.error("Email de confirmation non envoyé", reservationId, err);
  }
}

// Paiement reçu alors qu'il n'y a plus de sachet à livrer (réservation
// annulée entre-temps et stock revendu) : on rembourse intégralement, y
// compris la part déjà transférée au commerçant et la commission.
async function refundOrphanPayment(session: Stripe.Checkout.Session, reservationId: string) {
  const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!piId) throw new Error(`Aucun payment_intent pour la session ${session.id}`);
  const pi = await stripe.paymentIntents.retrieve(piId);
  await stripe.refunds.create(
    {
      payment_intent: piId,
      ...(pi.transfer_data && { reverse_transfer: true, refund_application_fee: true }),
    },
    { idempotencyKey: `refund-orphan-${reservationId}` }
  );
  await supabase.from("reservations").update({ payment_status: "refunded" }).eq("id", reservationId);
  console.warn("Paiement remboursé : plus de stock pour la réservation", reservationId);
}

async function handlePaidSession(session: Stripe.Checkout.Session) {
  const reservationId = session.metadata?.reservation_id;
  if (!reservationId) return;

  const { data: outcome, error } = await supabase.rpc("confirm_reservation_payment", { p_reservation_id: reservationId });
  // Erreur base de données → on la remonte : réponse 500, Stripe rejouera le
  // webhook. Répondre 200 ici laisserait un paiement encaissé sans réservation.
  if (error) throw error;

  if (outcome === "paid" || outcome === "paid_restored") {
    await notifyMerchantOfPaidReservation(reservationId);
    await sendConfirmationEmail(reservationId);
  } else if (outcome === "needs_refund") {
    await refundOrphanPayment(session, reservationId);
  }
}

async function releaseSession(session: Stripe.Checkout.Session) {
  const reservationId = session.metadata?.reservation_id;
  if (!reservationId) return;
  const { error } = await supabase.rpc("release_reservation", { p_reservation_id: reservationId });
  if (error) throw error;
}

// Événements à cocher dans le Dashboard Stripe : checkout.session.completed,
// checkout.session.async_payment_succeeded, checkout.session.async_payment_failed,
// checkout.session.expired, account.updated.
Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Signature invalide: ${err instanceof Error ? err.message : "erreur"}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Moyen de paiement différé : la session est « complétée » mais
        // l'argent n'est pas encore là → on attend async_payment_succeeded.
        if (session.payment_status === "paid") await handlePaidSession(session);
        break;
      }
      case "checkout.session.async_payment_succeeded":
        await handlePaidSession(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await releaseSession(event.data.object as Stripe.Checkout.Session);
        break;
      // Le compte Connect passe par plusieurs étapes (identité, IBAN, vérification)
      // avant de pouvoir réellement recevoir des paiements — charges_enabled ne
      // devient true qu'une fois tout validé côté Stripe. On ne l'active donc
      // jamais depuis create-connect-account (juste après création), seulement ici.
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const { error } = await supabase
          .from("merchants")
          .update({ stripe_payouts_enabled: !!account.charges_enabled })
          .eq("stripe_account_id", account.id);
        if (error) throw error;
        break;
      }
    }
  } catch (err) {
    console.error("Échec du traitement du webhook", event.type, event.id, err);
    return new Response("Erreur de traitement, à rejouer", { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
