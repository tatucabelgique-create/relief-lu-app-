// Reçoit les événements Stripe (paiement réussi / session expirée) et met à
// jour la réservation en conséquence. À configurer dans le Dashboard Stripe
// (Developers → Webhooks → Add endpoint) une fois l'URL de cette fonction
// déployée : .../functions/v1/stripe-webhook, événements à cocher :
// checkout.session.completed, checkout.session.expired.
// Secrets requis : STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (donné par Stripe
// au moment de créer le endpoint), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

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
