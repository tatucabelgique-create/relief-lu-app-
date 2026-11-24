-- Relief.lu — migration v38 : contribution commerçant aux frais Stripe.
--
-- Négocié avec Boulangerie PAUL (pilotes Foetz/Kirchberg, 2026-11-24) : en
-- échange de la suppression du frais de service client (merchants.
-- waive_service_fee, v29 — pas opportun en tout début de partenariat), PAUL
-- prend à sa charge un forfait de 0,25€ + TVA par transaction pour couvrir
-- les frais Stripe, en plus de sa commission de 21% habituelle. Prélevé sur
-- la part du commerçant (application_fee_amount), jamais ajouté au prix
-- payé par le client — voir supabase/functions/create-checkout-session/index.ts.
--
-- Montant HT, une fois par transaction (pas par sachet/quantité) — la TVA
-- est calculée dessus au moment du paiement, comme pour la commission.
-- NULL ou 0 = comportement actuel inchangé pour tous les autres commerçants.
alter table merchants add column if not exists stripe_fee_cents int;

notify pgrst, 'reload schema';
