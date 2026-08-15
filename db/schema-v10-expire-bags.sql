-- Relief.lu — migration v10 : marque automatiquement comme "invendu" un
-- sachet non récurrent jamais entièrement vendu dont le créneau est passé.
-- (Un sachet récurrent, lui, est reprogrammé par refresh_recurring_bags()
-- plutôt qu'expiré — voir schema-v9.) Purement pour la lisibilité du
-- statut côté commerçant ; l'affichage public l'ignore déjà (schema
-- inchangé côté RLS, filtre déjà fait côté app sur pickup_end).

create or replace function expire_unsold_bags()
returns void as $$
begin
  update bags
  set status = 'expired'
  where status = 'active'
    and is_recurring = false
    and pickup_end < now();
end;
$$ language plpgsql security definer;

select cron.schedule('expire-unsold-bags', '*/15 * * * *', $$select expire_unsold_bags()$$);
