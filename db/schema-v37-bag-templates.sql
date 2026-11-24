-- Relief.lu — migration v37 : modèles de paniers réutilisables.
--
-- Demande de Boulangerie PAUL (pilotes Foetz + Kirchberg, 2026-11-24) : ils
-- publient le même type de panier chaque soir et ne veulent pas retaper
-- titre/catégorie/prix/horaire à chaque fois — juste choisir un modèle et
-- indiquer la quantité du jour. Le prix ET l'horaire sont figés dans le
-- modèle (demande explicite) ; seule la date est recalculée sur "aujourd'hui"
-- au moment de l'application du modèle, côté client (voir MerchantDashboard.jsx).

create table if not exists bag_templates (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  title text not null,
  category text not null,
  description text not null default '',
  price_cents int not null,
  original_price_cents int,
  -- Heure du jour uniquement ("18:30"), pas une date — la date réelle est
  -- recalculée sur "aujourd'hui" à chaque publication depuis ce modèle.
  pickup_start_time text not null,
  pickup_end_time text not null,
  container_provided boolean not null default false,
  bag_provided boolean not null default false,
  vegetarian boolean not null default false,
  vegan boolean not null default false,
  snack boolean not null default false,
  created_at timestamptz not null default now()
);

alter table bag_templates enable row level security;

create policy "merchants manage their own bag templates"
  on bag_templates for all
  to authenticated
  using (auth.uid() = merchant_id)
  with check (auth.uid() = merchant_id);

grant select, insert, update, delete on public.bag_templates to authenticated;
grant select, insert, update, delete on public.bag_templates to service_role;

notify pgrst, 'reload schema';
