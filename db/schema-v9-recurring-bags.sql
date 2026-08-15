-- Relief.lu — migration v9 : sachets récurrents (façon TGTG).
-- Un commerçant peut marquer un sachet "Répéter chaque jour" : une fois son
-- créneau de retrait dépassé, il est automatiquement reprogrammé au même
-- horaire le lendemain, avec le stock remis à quantity_total — sans action
-- manuelle du commerçant. C'est ce qui permet d'afficher "Demain" plutôt que
-- de laisser un sachet expiré visible/réservable.

alter table bags add column if not exists is_recurring boolean not null default false;

create or replace function refresh_recurring_bags()
returns void as $$
begin
  update bags
  set pickup_start = pickup_start + interval '1 day',
      pickup_end = pickup_end + interval '1 day',
      quantity_left = quantity_total,
      status = 'active'
  where is_recurring = true
    and pickup_end < now();
end;
$$ language plpgsql security definer;

-- Nécessite l'extension pg_cron (Database → Extensions dans le dashboard
-- Supabase si la commande ci-dessous échoue par manque de droits).
create extension if not exists pg_cron;

-- Vérifie toutes les 15 minutes — assez fréquent pour qu'un sachet dont le
-- créneau vient de se terminer bascule vite sur "Demain", sans être excessif.
select cron.schedule('refresh-recurring-bags', '*/15 * * * *', $$select refresh_recurring_bags()$$);
