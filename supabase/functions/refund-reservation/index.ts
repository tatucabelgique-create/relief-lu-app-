// Rembourse une réservation payée — remplace l'unique filet qui existait
// avant (une intervention manuelle dans le Dashboard Stripe), risquée à deux
// titres : oublier de cocher reverse_transfer/refund_application_fee sur une
// destination charge (relief.lu perd le montant remboursé pendant que le
// commerçant garde sa part), et la base ne se resynchronise jamais toute
// seule (voir refund_reservation_by_intent, schema-v33).
//
// Trois appelants possibles, chacun avec ses propres règles :
// - le client lui-même, jusqu'à 2h avant le début du créneau de retrait
//   (même coupure que Too Good To Go : self-service avant, contact direct du
//   commerçant après — pas de centre d'aide à reconstruire ici) ;
// - le commerçant propriétaire du sachet, sans limite de temps (annulation
//   de son propre sachet, voir cancelBag côté client) ;
// - l'admin (ADMIN_EMAIL), sans limite de temps.
//
// Pas de notification Web Push ici volontairement : stripe.refunds.create()
// déclenche l'événement Stripe charge.refunded quel que soit l'appelant
// (API ou Dashboard), et c'est stripe-webhook/index.ts qui notifie le client
// sur cet événement — une seule source de vérité, pour ne jamais envoyer
// deux notifications pour un seul remboursement.
//
// Secrets requis : STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_EMAIL = "giovanni.ehp@gmail.com";
const CANCELLATION_CUTOFF_MS = 2 * 60 * 60 * 1000; // 2h, aligné sur TGTG

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Non authentifié." }), { status: 401, headers: corsHeaders });
    }

    const { reservation_id } = await req.json();

    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("id, user_id, payment_status, stripe_payment_intent_id, bags(merchant_id, pickup_start)")
      .eq("id", reservation_id)
      .single();

    if (error || !reservation) {
      return new Response(JSON.stringify({ error: "Réservation introuvable." }), { status: 404, headers: corsHeaders });
    }
    if (reservation.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Cette réservation n'est pas (ou plus) payée." }), { status: 400, headers: corsHeaders });
    }
    if (!reservation.stripe_payment_intent_id) {
      return new Response(JSON.stringify({ error: "Paiement introuvable côté Stripe pour cette réservation." }), { status: 400, headers: corsHeaders });
    }

    const bag = reservation.bags as { merchant_id: string; pickup_start: string } | null;
    const isAdmin = user.email === ADMIN_EMAIL;
    const isMerchant = !!bag && user.id === bag.merchant_id;
    const isOwnCustomer = user.id === reservation.user_id;

    if (!isAdmin && !isMerchant && !isOwnCustomer) {
      return new Response(JSON.stringify({ error: "Non autorisé." }), { status: 403, headers: corsHeaders });
    }

    // Le client ne peut annuler que jusqu'à 2h avant le retrait ; l'admin et
    // le commerçant (qui annule son propre sachet) n'ont pas cette limite.
    if (isOwnCustomer && !isAdmin && !isMerchant && bag?.pickup_start) {
      const msUntilPickup = new Date(bag.pickup_start).getTime() - Date.now();
      if (msUntilPickup < CANCELLATION_CUTOFF_MS) {
        return new Response(
          JSON.stringify({ error: "Trop tard pour annuler en ligne — contacte directement le commerçant." }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // reverse_transfer/refund_application_fee ne s'appliquent que si le
    // paiement était bien une destination charge (le commerçant avait
    // terminé l'onboarding Stripe Connect au moment du paiement, voir
    // create-checkout-session) — sinon Stripe refuse la requête (aucun
    // transfert à annuler sur un paiement resté entièrement sur le compte
    // relief.lu).
    const paymentIntent = await stripe.paymentIntents.retrieve(reservation.stripe_payment_intent_id);
    const hadTransfer = !!paymentIntent.transfer_data?.destination;

    await stripe.refunds.create({
      payment_intent: reservation.stripe_payment_intent_id,
      ...(hadTransfer && { reverse_transfer: true, refund_application_fee: true }),
    });

    // Même fonction que le webhook (charge.refunded) pour resynchroniser la
    // base — une seule source de vérité pour "que se passe-t-il quand une
    // réservation payée est remboursée" (remise en stock incluse). Le
    // webhook, déclenché par l'événement Stripe ci-dessus, se charge aussi
    // de notifier le client par Web Push (voir ce fichier).
    await supabase.rpc("refund_reservation_by_intent", { p_payment_intent_id: reservation.stripe_payment_intent_id });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erreur inconnue." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
