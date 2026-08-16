-- Relief.lu — migration v12 : libération immédiate du stock à l'annulation.
--
-- Jusqu'ici, release_reservation() n'était appelée que par le webhook Stripe
-- sur checkout.session.expired — expiration par défaut 24h côté Stripe, donc
-- un paiement annulé/échoué laissait le sachet indisponible toute la journée
-- alors qu'il n'était en réalité plus réservé. Le client appelle désormais
-- release_reservation() directement dès son retour sur ?paid=0 (voir
-- PaymentResult.jsx) — il faut donc vérifier ici que l'appelant est bien le
-- propriétaire de la réservation, puisque la fonction n'est plus seulement
-- appelée par le webhook (clé service_role, où auth.uid() est toujours null).
create or replace function release_reservation(p_reservation_id uuid)
returns void as $$
declare
  v_bag_id uuid;
  v_qty int;
  v_user_id uuid;
begin
  select bag_id, quantity, user_id into v_bag_id, v_qty, v_user_id
    from reservations where id = p_reservation_id and payment_status = 'pending';

  if v_bag_id is null then
    return; -- déjà traité, ou introuvable — idempotent, pas d'erreur
  end if;

  -- auth.uid() est null pour le webhook (clé service_role) — toujours
  -- autorisé dans ce cas ; pour un appel client, doit correspondre au
  -- propriétaire de la réservation.
  if auth.uid() is not null and auth.uid() <> v_user_id then
    return;
  end if;

  update reservations set payment_status = 'failed', status = 'cancelled' where id = p_reservation_id;

  update bags
    set quantity_left = quantity_left + v_qty,
        status = case when status = 'sold_out' then 'active' else status end
    where id = v_bag_id;
end;
$$ language plpgsql security definer;
