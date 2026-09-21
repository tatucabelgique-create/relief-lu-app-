-- Relief.lu — migration v21 : rappel quotidien (façon TGTG).
--
-- Contrairement aux favoris (commerçant précis) et aux notifications de
-- ville (city_subscriptions), ce rappel est générique : l'utilisateur choisit
-- les jours de la semaine où il veut recevoir une notification "n'oublie pas
-- de sauver un panier aujourd'hui", indépendamment de tout commerçant/ville.
--
-- feature_flags contrôle si la fonctionnalité est visible côté utilisateur
-- et si le job planifié envoie quoi que ce soit — désactivée par défaut.
-- Volontaire : avec peu de commerçants actifs, un rappel qui mène à un app
-- vide ferait plus de mal que de bien. À activer une fois l'offre suffisante
-- (voir DailyReminderToggle.jsx dans l'admin).

create table if not exists feature_flags (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into feature_flags (key, enabled)
values ('daily_reminders', false)
on conflict (key) do nothing;

alter table feature_flags enable row level security;

-- Lecture publique (le front doit savoir si la fonctionnalité est active),
-- aucune policy d'écriture : seule une Edge Function avec la clé service_role
-- (qui contourne RLS) peut modifier ce flag, via la fonction "rapid-api"
-- (nom généré par Supabase pour le code de toggle-daily-reminders/index.ts).
create policy "feature flags are publicly readable"
  on feature_flags for select
  to anon, authenticated
  using (true);

create table if not exists daily_reminders (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Jours ISO (1 = lundi ... 7 = dimanche), ex. '{1,3,5}' = lun/mer/ven.
  days smallint[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table daily_reminders enable row level security;

create policy "users manage their own daily reminder days"
  on daily_reminders for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Planification de l'envoi quotidien (18h heure du Luxembourg = 16h UTC en
-- CEST l'été ; se décale à 17h heure locale après le passage à l'heure d'hiver
-- le 25 octobre 2026 côté UTC fixe — pg_cron ne gère pas nativement le fuseau
-- Europe/Luxembourg sur tous les plans Supabase, ajustable manuellement à
-- cette date si besoin).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- L'en-tête Authorization est requis : les Edge Functions Supabase exigent un
-- JWT valide par défaut. Remplace <TON_ANON_KEY> par la clé "anon public"
-- (Project Settings → API) avant d'exécuter ce script.
-- URL "super-action" = nom généré par Supabase pour send-daily-reminders/index.ts.
select cron.schedule(
  'send-daily-reminders',
  '0 16 * * *',
  $$
  select net.http_post(
    url := 'https://ucxsqregeorfjakgomaj.supabase.co/functions/v1/super-action',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer <TON_ANON_KEY>'),
    body := '{}'::jsonb
  );
  $$
);
