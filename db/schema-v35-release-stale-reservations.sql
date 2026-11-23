-- Relief.lu — migration v35 : filet de sécurité indépendant de Stripe pour
-- les réservations abandonnées.
--
-- Jusqu'ici, le stock décrémenté par reserve_bag() n'était restauré par
-- release_reservation() que dans deux cas : le client revient lui-même sur
-- ?paid=0 (PaymentResult.jsx), ou le webhook Stripe "checkout.session.expired"
-- arrive — et la session Checkout dure 30 minutes (voir
-- create-checkout-session/index.ts, expires_at). Si quelqu'un ferme l'onglet
-- sans revenir ET que le webhook tarde ou échoue à arriver, le sachet reste
-- indisponible jusqu'à 30 min sans aucun filet côté base.
--
-- Ce cron tourne chaque minute et libère toute réservation encore "pending"
-- depuis plus de 5 minutes — bien avant l'expiration Stripe. Il réutilise
-- release_reservation() (même idempotence, même restauration de stock,
-- schema-v12) plutôt que de dupliquer sa logique : appelé hors contexte
-- PostgREST, auth.uid() y est toujours null, exactement comme pour le
-- webhook — déjà le cas autorisé par cette fonction.

create extension if not exists pg_cron;

create or replace function release_stale_pending_reservations()
returns void as $$
declare
  v_id uuid;
begin
  for v_id in
    select id from reservations
    where payment_status = 'pending'
      and created_at < now() - interval '5 minutes'
  loop
    perform release_reservation(v_id);
  end loop;
end;
$$ language plpgsql security definer;

select cron.schedule(
  'release-stale-pending-reservations',
  '* * * * *',
  $$select release_stale_pending_reservations()$$
);
