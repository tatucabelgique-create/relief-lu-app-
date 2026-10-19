-- Relief.lu — migration v33 : capacité de remboursement réelle.
--
-- Jusqu'ici, aucune fonction du code (edge function, RPC, UI) ne pouvait
-- rembourser une réservation payée — seule une intervention manuelle dans le
-- Dashboard Stripe le permettait, avec deux risques : oublier de cocher
-- reverse_transfer/refund_application_fee (le paiement est une destination
-- charge, voir create-checkout-session — sans ces options, le remboursement
-- est prélevé sur le solde relief.lu alors que le commerçant garde sa part),
-- et la base ne se resynchronisait jamais (réservation encore "paid" pour
-- toujours, sachet jamais remis en stock). Voir refund-reservation/index.ts
-- (edge function qui appelle Stripe) et stripe-webhook/index.ts (synchro
-- charge.refunded, filet de sécurité si un remboursement est fait depuis le
-- Dashboard Stripe plutôt que depuis l'app).

-- Nécessaire pour pouvoir rembourser : le webhook ne stockait jusqu'ici que
-- stripe_session_id (l'id de la Checkout Session), pas le PaymentIntent
-- qu'il faut passer à stripe.refunds.create().
alter table reservations add column if not exists stripe_payment_intent_id text;

-- Logique de remboursement centralisée ici (plutôt que dupliquée dans
-- l'edge function ET le webhook) : remet le sachet en stock et marque la
-- réservation remboursée, par PaymentIntent plutôt que par id de réservation
-- puisque c'est ce que le webhook Stripe charge.refunded fournit. Idempotent
-- (sans effet si déjà remboursée ou introuvable) — security definer comme
-- release_reservation, pour les mêmes raisons (appelée par l'edge function
-- avec la clé service_role, où auth.uid() est toujours null).
create or replace function refund_reservation_by_intent(p_payment_intent_id text)
returns void as $$
declare
  v_bag_id uuid;
  v_qty int;
begin
  select bag_id, quantity into v_bag_id, v_qty
    from reservations
    where stripe_payment_intent_id = p_payment_intent_id and payment_status = 'paid';

  if v_bag_id is null then
    return; -- déjà remboursée, ou introuvable — idempotent, pas d'erreur
  end if;

  update reservations
    set payment_status = 'refunded', status = 'cancelled'
    where stripe_payment_intent_id = p_payment_intent_id;

  update bags
    set quantity_left = quantity_left + v_qty,
        status = case when status = 'sold_out' then 'active' else status end
    where id = v_bag_id;
end;
$$ language plpgsql security definer;
