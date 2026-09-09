-- Relief.lu — migration v20 : notifications par ville ("topics").
--
-- Jusqu'ici, un client ne pouvait être notifié que via un favori sur un
-- commerçant précis déjà connu — impossible d'être alerté sur une ville
-- entière (utile pour découvrir de nouveaux commerçants sans avoir à les
-- suivre un par un). Table séparée de "favorites" : même mécanique
-- d'abonnement, mais la clé est une ville et non un commerçant.

create table if not exists city_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city text not null,
  created_at timestamptz not null default now(),
  unique(user_id, city)
);

alter table city_subscriptions enable row level security;

create policy "users manage their own city subscriptions"
  on city_subscriptions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
