// Crée une session Stripe Checkout pour une réservation déjà créée (en
// payment_status='pending' — voir reserve_bag() dans schema-app.sql/v2).
// Le stock est déjà décrémenté à ce stade ; si le paiement est annulé, le
// client appelle release_reservation() dès son retour (PaymentResult.jsx),
// et le webhook stripe-webhook fait de même sur checkout.session.expired en
// filet de sécurité. Secrets requis (Supabase Dashboard → Edge Functions → Secrets) :
// STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ces deux
// derniers sont déjà fournis automatiquement par Supabase à chaque fonction).
import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    const { reservation_id, return_base } = await req.json();

    const { data: reservation, error } = await supabase
      .from("reservations")
      .select("id, quantity, user_id, payment_status, bags(title, price_cents, merchant_id, merchants(stripe_account_id))")
      .eq("id", reservation_id)
      .single();

    if (error || !reservation) {
      return new Response(JSON.stringify({ error: "Réservation introuvable." }), { status: 404, headers: corsHeaders });
    }
    if (reservation.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Non autorisé." }), { status: 403, headers: corsHeaders });
    }
    if (reservation.payment_status !== "pending") {
      return new Response(JSON.stringify({ error: "Cette réservation a déjà été traitée." }), { status: 400, headers: corsHeaders });
    }

    // return_base inclut déjà le sous-dossier (ex. /relief-lu-app-/) — envoyé
    // par le client (voir payments.js), plus fiable que de le déduire du seul
    // header Origin côté serveur (qui ne contient jamais de chemin).
    const base = (return_base || "https://relief.lu/").replace(/\/+$/, "");

    // Mêmes taux que merchantStats.js/billing.js — à garder synchronisés.
    const COMMISSION_RATE = 0.18;
    const VAT_RATE = 0.17;
    const totalCents = reservation.bags.price_cents * reservation.quantity;
    const commissionHtCents = Math.round(totalCents * COMMISSION_RATE);
    const commissionTtcCents = commissionHtCents + Math.round(commissionHtCents * VAT_RATE);

    const merchant = reservation.bags.merchants as { stripe_account_id: string | null } | null;
    // Destination charge : Stripe répartit le paiement au moment de la
    // transaction — la part du commerçant part directement sur son compte
    // connecté, la commission reste chez relief.lu. Si le commerçant n'a pas
    // encore terminé l'onboarding Stripe Connect (schema-v17), on retombe sur
    // l'ancien comportement (tout sur le compte relief.lu) plutôt que de
    // bloquer la vente — le reversement devra alors se faire manuellement.
    //
    // Vérifié en direct auprès de Stripe (charges_enabled) plutôt que via la
    // colonne stripe_payouts_enabled mise à jour par webhook : le routage des
    // événements account.updated pour les comptes créés via l'API v2 s'est
    // révélé peu fiable en pratique (voir schema-v17) — un appel direct évite
    // de dépendre de la bonne réception d'un webhook pour une information
    // aussi critique que "peut-on reverser sa part à ce commerçant".
    let canSplit = false;
    if (merchant?.stripe_account_id) {
      const account = await stripe.accounts.retrieve(merchant.stripe_account_id);
      canSplit = !!account.charges_enabled;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // "card" couvre déjà Apple Pay / Google Pay (détectés automatiquement
      // par Stripe selon l'appareil du client) — "bancontact" ajoute le
      // moyen de paiement belge/luxembourgeois le plus courant après la carte.
      payment_method_types: ["card", "bancontact"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: reservation.bags.title },
            unit_amount: reservation.bags.price_cents,
          },
          quantity: reservation.quantity,
        },
      ],
      metadata: { reservation_id: reservation.id },
      success_url: `${base}/app.html?paid=1&reservation=${reservation.id}`,
      cancel_url: `${base}/app.html?paid=0&reservation=${reservation.id}`,
      // Minimum autorisé par Stripe — le client libère déjà le stock tout de
      // suite en revenant sur ?paid=0 (voir PaymentResult.jsx) ; ceci n'est
      // qu'un filet de sécurité si l'onglet est fermé avant d'y revenir,
      // pour éviter de bloquer le sachet jusqu'à l'expiration par défaut (24h).
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      ...(canSplit && {
        payment_intent_data: {
          application_fee_amount: commissionTtcCents,
          transfer_data: { destination: merchant!.stripe_account_id! },
        },
      }),
    });

    await supabase.from("reservations").update({ stripe_session_id: session.id }).eq("id", reservation.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erreur inconnue." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
