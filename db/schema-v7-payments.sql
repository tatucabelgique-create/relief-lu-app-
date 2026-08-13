-- Relief.lu — migration v7 : paiement en ligne (Stripe Checkout).
-- Le flux reste : reserve_bag() décrémente le stock tout de suite (empêche la
-- survente), mais la réservation démarre en payment_status='pending' — le
-- commerçant ne peut la marquer "retirée" que si payment_status='paid'.
-- Si le paiement échoue/expire, release_reservation() restaure le stock.

alter table reservations add column if not exists payment_status text not null default 'pending'; -- pending | paid | failed | refunded
alter table reservations add column if not exists stripe_session_id text;

-- Appelée par la fonction Edge stripe-webhook (clé service_role) quand un
-- paiement échoue ou expire côté Stripe — remet le sachet en stock.
create or replace function release_reservation(p_reservation_id uuid)
returns void as $$
declare
  v_bag_id uuid;
  v_qty int;
begin
  select bag_id, quantity into v_bag_id, v_qty from reservations where id = p_reservation_id and payment_status = 'pending';

  if v_bag_id is null then
    return; -- déjà traité, ou introuvable — idempotent, pas d'erreur
  end if;

  update reservations set payment_status = 'failed', status = 'cancelled' where id = p_reservation_id;

  update bags
    set quantity_left = quantity_left + v_qty,
        status = case when status = 'sold_out' then 'active' else status end
    where id = v_bag_id;
end;
$$ language plpgsql security definer;
