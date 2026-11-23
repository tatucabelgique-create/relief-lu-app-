-- Relief.lu — migration v36 : déclenche un redéploiement GitHub Pages à
-- chaque changement de panier, indépendamment du cron GitHub Actions
-- (*/15 * * * *) qui s'est avéré ne jamais se déclencher de façon fiable
-- (constaté le 2026-11-23 : aucun run "schedule" sur tout un mois
-- d'historique — seuls les push et déclenchements manuels apparaissent).
-- Les pages statiques commerçant (/commercant/<slug>/, avec leur QR code)
-- restaient donc figées sur l'état du dernier déploiement de code tant que
-- personne ne poussait de commit.
--
-- Le secret partagé (x-webhook-secret, vérifié dans l'edge function
-- trigger-pages-deploy) devait initialement être lu via un paramètre de
-- configuration Postgres (ALTER DATABASE ... SET) pour ne jamais le
-- committer dans ce repo public — mais Supabase refuse cette commande au
-- rôle utilisé par le SQL Editor ("ERROR 42501: permission denied to set
-- parameter", le rôle "postgres" managé n'est pas un vrai superuser).
-- Le secret est donc codé en dur ci-dessous (placeholder) : ne jamais
-- committer la vraie valeur ici — ce fichier sert de référence, la version
-- réellement exécutée (avec la vraie valeur) n'a existé que dans le SQL
-- Editor, jamais dans git.

create extension if not exists pg_net;

create or replace function public.notify_bag_change()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://ucxsqregeorfjakgomaj.supabase.co/functions/v1/trigger-pages-deploy',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'REPLACE_WITH_PAGES_WEBHOOK_SECRET'
    ),
    body := '{}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_bag_change_deploy on public.bags;

create trigger on_bag_change_deploy
after insert or update on public.bags
for each row
execute function public.notify_bag_change();
