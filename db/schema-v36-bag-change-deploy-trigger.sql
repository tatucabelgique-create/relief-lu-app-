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
-- trigger-pages-deploy) est lu via un paramètre de configuration Postgres
-- plutôt que codé en dur ici, pour ne jamais committer ce secret dans ce
-- repo public — voir l'étape "ALTER DATABASE" à exécuter séparément après
-- ce script.

create extension if not exists pg_net;

create or replace function public.notify_bag_change()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://ucxsqregeorfjakgomaj.supabase.co/functions/v1/trigger-pages-deploy',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', current_setting('app.pages_webhook_secret', true)
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
