-- Relief.lu — migration v17 : Stripe Connect pour les commerçants
--
-- Jusqu'ici, Stripe Checkout encaissait le paiement client directement sur le
-- compte Stripe de relief.lu, sans aucun mécanisme pour reverser sa part au
-- commerçant — la facturation hebdomadaire (schema-v16) facture la commission
-- au commerçant, ce qui suppose à tort que c'est LUI qui encaisse. En réalité
-- c'est l'inverse : c'est relief.lu qui encaisse et doit reverser.
--
-- Avec un compte Stripe Connect (Express) par commerçant, create-checkout-session
-- peut utiliser une "destination charge" : Stripe répartit automatiquement le
-- paiement au moment de la transaction — la part du commerçant part directement
-- sur son compte connecté, la commission (application_fee_amount) reste chez
-- relief.lu. Plus besoin de reversement manuel.

alter table merchants add column if not exists stripe_account_id text;
alter table merchants add column if not exists stripe_payouts_enabled boolean not null default false;
