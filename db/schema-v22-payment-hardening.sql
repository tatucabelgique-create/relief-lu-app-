-- Relief.lu — migration v22 : fiabilisation du paiement + email de confirmation.
--
-- Trois trous identifiés à l'audit du flux de paiement (29/09) :
--
-- 1. Paiement accepté sur une réservation déjà annulée. Le client annule sur
--    Stripe → retour ?paid=0 → release_reservation() remet le stock en vente.
--    Mais la session Stripe reste ouverte 30 min : s'il revient en arrière
--    dans son navigateur et paie, le webhook passait la réservation en
--    'paid' sans reprendre le stock → survente possible, et une réservation
--    'cancelled' mais payée. confirm_reservation_payment() gère ce cas :
--    reprend le stock s'il en reste, sinon signale qu'il faut rembourser.
--
-- 2. Réservation 'pending' sans session Stripe jamais libérée. Si l'appel à
--    create-checkout-session échoue ou si l'onglet est fermé avant la
--    redirection, aucune session n'existe → aucun checkout.session.expired
--    → le stock restait bloqué indéfiniment. Job planifié toutes les 10 min
--    qui libère les 'pending' de plus de 45 min (la session Stripe expire à
--    30 min, donc aucun paiement légitime n'est encore possible à ce stade ;
--    et si un paiement arrive quand même, le point 1 le rattrape).
--
-- 3. Email de confirmation : colonne pour ne l'envoyer qu'une seule fois,
--    même si Stripe renvoie le même webhook plusieurs fois.

alter table reservations add column if not exists paid_at timestamptz;
alter table reservations add column if not exists confirmation_email_sent_at timestamptz;

-- Appelée uniquement par le webhook Stripe (clé service_role). Retourne :
--   'paid'          → passage pending → paid (cas normal)
--   'already_paid'  → webhook rejoué, rien à faire (pas de double notif)
--   'paid_restored' → réservation annulée entre-temps, stock repris : OK
--   'needs_refund'  → réservation annulée et plus de stock : rembourser
--   'not_found'     → réservation inconnue
create or replace function confirm_reservation_payment(p_reservation_id uuid)
returns text as $$
declare
  v_res reservations%rowtype;
  v_left int;
begin
  select * into v_res from reservations where id = p_reservation_id for update;

  if v_res.id is null then
    return 'not_found';
  end if;

  if v_res.payment_status = 'paid' then
    return 'already_paid';
  end if;

  if v_res.payment_status = 'pending' then
    update reservations set payment_status = 'paid', paid_at = now() where id = p_reservation_id;
    return 'paid';
  end if;

  if v_res.payment_status = 'refunded' then
    return 'needs_refund'; -- déjà remboursée : le webhook ne refera rien (clé d'idempotence Stripe)
  end if;

  -- 'failed' : le stock a été rendu par release_reservation() → le reprendre
  select quantity_left into v_left from bags where id = v_res.bag_id for update;

  if v_left is null or v_left < v_res.quantity then
    return 'needs_refund';
  end if;

  update bags
    set quantity_left = quantity_left - v_res.quantity,
        status = case when quantity_left - v_res.quantity = 0 then 'sold_out' else status end
    where id = v_res.bag_id;

  update reservations
    set payment_status = 'paid', status = 'confirmed', paid_at = now()
    where id = p_reservation_id;

  return 'paid_restored';
end;
$$ language plpgsql security definer;

-- Jamais appelable depuis le navigateur : sinon n'importe qui pourrait
-- passer sa propre réservation en 'paid' sans payer.
revoke execute on function confirm_reservation_payment(uuid) from public, anon, authenticated;
grant execute on function confirm_reservation_payment(uuid) to service_role;

create or replace function release_stale_pending_reservations()
returns void as $$
declare
  r record;
begin
  for r in
    select id from reservations
    where payment_status = 'pending' and created_at < now() - interval '45 minutes'
  loop
    perform release_reservation(r.id);
  end loop;
end;
$$ language plpgsql security definer;

revoke execute on function release_stale_pending_reservations() from public, anon, authenticated;

select cron.schedule(
  'release-stale-pending-reservations',
  '*/10 * * * *',
  $$select release_stale_pending_reservations()$$
);
