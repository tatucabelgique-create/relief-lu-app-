-- Relief.lu — migration v34 : compteur d'installations PWA par plateforme.
--
-- iOS n'a aucun événement JS pour détecter une installation (Safari
-- n'expose pas "appinstalled"/"beforeinstallprompt") — on journalise donc
-- la première fois qu'un appareil est détecté en mode standalone (lancé
-- depuis l'écran d'accueil), une seule fois par appareil via localStorage.
-- Android/Chrome ont le vrai événement "appinstalled", journalisé au
-- moment exact de l'installation. Table anonyme et minimale (aucune
-- donnée personnelle) : juste la plateforme et l'horodatage.

create table if not exists pwa_installs (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('ios', 'android', 'other')),
  created_at timestamptz not null default now()
);

alter table pwa_installs enable row level security;

create policy "anyone can log a pwa install"
  on pwa_installs for insert
  to anon, authenticated
  with check (true);

create policy "admin can read pwa installs"
  on pwa_installs for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'giovanni.ehp@gmail.com');

grant insert on public.pwa_installs to anon;
grant select, insert on public.pwa_installs to authenticated;
grant select, insert, update, delete on public.pwa_installs to service_role;

notify pgrst, 'reload schema';
