// Reçoit les événements Stripe (paiement réussi / session expirée / compte
// Connect mis à jour / remboursement) et met à jour la réservation ou le
// commerçant en conséquence. À configurer dans le Dashboard Stripe
// (Developers → Webhooks → Add endpoint) une fois l'URL de cette fonction
// déployée : .../functions/v1/stripe-webhook, événements à cocher :
// checkout.session.completed, checkout.session.expired, account.updated,
// charge.refunded.
// Secrets requis : STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (donné par Stripe
// au moment de créer le endpoint), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (mêmes clés que notify-new-bag, pour
// prévenir le commerçant par push qu'une réservation vient d'être payée —
// seul moyen pour lui de le savoir sans garder le tableau de bord ouvert),
// RESEND_API_KEY (confirmations email client/commerçant/admin — domaine
// relief.lu déjà vérifié sur Resend, utilisé par ailleurs pour le SMTP de
// Supabase Auth, mais ce secret-ci est distinct : les Edge Functions n'ont
// pas accès à la config SMTP d'Auth, il faut leur propre clé API Resend).
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@relief.lu";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "relief.lu <contact@relief.lu>";
// Même adresse que refund-reservation/index.ts (ADMIN_EMAIL) — dupliquée ici
// plutôt que partagée, chaque Edge Function étant déployée indépendamment
// (pas de module commun entre fonctions dans ce projet).
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

// Best-effort, comme les notifications push : un email raté ne doit jamais
// faire échouer le traitement du webhook. Pas de vérification de la réponse
// au-delà du log — si Resend refuse l'envoi (clé absente/invalide, domaine
// non vérifié), on le voit dans les logs de la fonction plutôt que de
// bloquer quoi que ce soit côté paiement.
async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return; // secret pas encore configuré — silencieux
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
  } catch (err) {
    console.error("Resend fetch failed", err);
  }
}

// Les emails interpolent des valeurs saisies par le commerçant (titre du
// sachet, nom du commerce) directement dans du HTML — sans ça, un titre
// contenant des balises (volontaire ou non) s'afficherait tel quel dans
// l'email envoyé au client/admin au lieu d'un texte brut.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPickupWindow(startIso: string, endIso: string) {
  const fmt = new Intl.DateTimeFormat("fr-LU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Luxembourg" });
  const start = new Date(startIso);
  const end = new Date(endIso);
  const endTime = new Intl.DateTimeFormat("fr-LU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Luxembourg" }).format(end);
  return `${fmt.format(start)} – ${endTime}`;
}

// Même gabarit que le template "Magic Link" de Supabase Auth (Dashboard →
// Authentication → Email Templates) — repris tel quel pour que toutes les
// emails relief.lu, qu'elles viennent d'Auth ou d'ici, se ressemblent.
function emailShell(bodyHtml: string) {
  return `<div style="background:#EFE6D3;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
<div style="background:#16232C;padding:20px;text-align:center;font-size:22px;font-weight:bold;color:#EFE6D3;">relief<span style="color:#E8A33D;">.lu</span></div>
<div style="padding:24px 28px;color:#16232C;font-size:15px;line-height:1.5;">
${bodyHtml}
</div>
</div>
</div>`;
}

// Déclenché juste après notifyMerchantOfPaidReservation sur
// checkout.session.completed — une seule requête imbriquée (reservations →
// bags → merchants) suffit : email client et email commerçant sont déjà
// dupliqués sur leurs tables respectives (voir schema-v23-merchant-email),
// pas besoin d'appeler l'API Auth admin pour les récupérer.
async function sendReservationEmails(reservationId: string, amountTotalCents: number) {
  try {
    const { data: reservation } = await supabase
      .from("reservations")
      .select("quantity, pickup_code, email, bags(title, pickup_start, pickup_end, merchants(business_name, email))")
      .eq("id", reservationId)
      .single();

    const bag = reservation?.bags as {
      title: string;
      pickup_start: string;
      pickup_end: string;
      merchants: { business_name: string; email: string | null } | null;
    } | null;
    if (!reservation || !bag) return;

    const merchant = bag.merchants;
    const pickupWindow = formatPickupWindow(bag.pickup_start, bag.pickup_end);
    const total = (amountTotalCents / 100).toFixed(2).replace(".", ",");
    // Échappés une fois ici : ce sont les deux seules valeurs de ce bloc
    // saisies librement par un commerçant plutôt que générées par le
    // système (pickup_code, dates, montants).
    const title = escapeHtml(bag.title);
    const businessName = escapeHtml(merchant?.business_name ?? "");

    if (reservation.email) {
      await sendEmail(
        reservation.email,
        `Réservation confirmée — ${bag.title}`,
        emailShell(`
          <p>Bonjour,</p>
          <p>C'est réservé ! ${businessName || "Ton commerçant"} — <b>${title}</b> (${reservation.quantity})</p>
          <p>Retrait : ${pickupWindow}<br>Total payé : <b>${total} €</b></p>
          <p style="background:#EFE6D3;border-radius:8px;padding:10px 18px;display:inline-block;font-family:monospace;font-size:22px;font-weight:bold;letter-spacing:5px;">${reservation.pickup_code}</p>
          <p style="font-size:13px;color:#6B6455;">Code de retrait — à montrer sur place.</p>
        `)
      );
    }

    if (merchant?.email) {
      await sendEmail(
        merchant.email,
        `Nouvelle réservation payée — ${bag.title}`,
        emailShell(`
          <p>Bonjour,</p>
          <p>Nouvelle vente : ${reservation.quantity} × <b>${title}</b></p>
          <p>Retrait prévu : ${pickupWindow}<br>Montant total payé par le client : ${total} €</p>
        `)
      );
    }

    await sendEmail(
      ADMIN_EMAIL,
      `Vente — ${merchant?.business_name ?? "Commerçant"} — ${bag.title}`,
      emailShell(`
        <p>${businessName || "Commerçant inconnu"}</p>
        <p>${reservation.quantity} × ${title} — ${total} €</p>
        <p>Retrait : ${pickupWindow}</p>
      `)
    );
  } catch (err) {
    console.error("sendReservationEmails failed", err);
  }
}

// Même logique que notifyMerchantOfPaidReservation ci-dessus, mais côté
// client. Volontairement ici et nulle part ailleurs : charge.refunded se
// déclenche pour TOUT remboursement, qu'il vienne de refund-reservation/
// index.ts (annulation client/commerçant/admin dans l'app) ou d'une action
// manuelle dans le Dashboard Stripe — une seule source de vérité, jamais
// deux notifications pour un seul remboursement. Le client est notifié même
// s'il a annulé lui-même : confirmation utile, pas un doublon gênant.
async function notifyCustomerOfRefund(paymentIntentId: string) {
  try {
    const appServer = await getAppServer();
    const { data: reservation } = await supabase
      .from("reservations")
      .select("user_id, bags(title, merchants(business_name))")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .single();

    const bag = reservation?.bags as { title: string; merchants: { business_name: string } | null } | null;
    if (!reservation || !bag) return;

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", reservation.user_id);

    if (!subs?.length) return;

    const notification = JSON.stringify({
      title: "Réservation remboursée",
      body: `${bag.merchants?.business_name ?? "relief.lu"} — ${bag.title} : ta réservation a été annulée et intégralement remboursée.`,
      url: "./app.html?view=account",
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
    // silencieux, voir commentaire sur notifyMerchantOfPaidReservation
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
      // payment_intent stocké ici (pas seulement stripe_session_id) : c'est
      // ce que refund-reservation/index.ts doit passer à
      // stripe.refunds.create() — sans ça, aucune réservation payée avant ce
      // changement ne serait remboursable par l'app (voir schema-v33).
      await supabase
        .from("reservations")
        .update({ payment_status: "paid", stripe_payment_intent_id: session.payment_intent as string })
        .eq("id", reservationId);
      await notifyMerchantOfPaidReservation(reservationId);
      await sendReservationEmails(reservationId, session.amount_total ?? 0);
    }
  }

  // Se déclenche pour TOUT remboursement (API via refund-reservation/
  // index.ts ou action manuelle dans le Dashboard Stripe) — resynchronise la
  // base (sinon la réservation resterait "payée" pour toujours et le sachet
  // ne serait jamais remis en stock) et notifie le client (voir
  // notifyCustomerOfRefund ci-dessus).
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    if (paymentIntentId) {
      await supabase.rpc("refund_reservation_by_intent", { p_payment_intent_id: paymentIntentId });
      await notifyCustomerOfRefund(paymentIntentId);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservation_id;
    if (reservationId) {
      await supabase.rpc("release_reservation", { p_reservation_id: reservationId });
    }
  }

  // Le compte Connect passe par plusieurs étapes (identité, IBAN, vérification)
  // avant de pouvoir réellement recevoir des paiements — charges_enabled ne
  // devient true qu'une fois tout validé côté Stripe. On ne l'active donc
  // jamais depuis create-connect-account (juste après création), seulement ici.
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await supabase
      .from("merchants")
      .update({ stripe_payouts_enabled: !!account.charges_enabled })
      .eq("stripe_account_id", account.id);
  }

  return new Response("ok", { status: 200 });
});
