-- Relief.lu — migration v25 : alerte "faible demande" (V1 à règles).
--
-- Détecte les sachets publiés qui n'ont reçu aucune réservation alors que la
-- fin du créneau de retrait approche, et prévient le commerçant par push —
-- "personne n'a réservé, baisse le prix ?" plutôt que de laisser le panier
-- expirer sans rien tenter. Pas de machine learning ici : une règle simple
-- (zéro réservation + échéance proche) suffit tant qu'on n'a pas assez
-- d'historique pour entraîner un vrai modèle. Voir la discussion produit —
-- c'est la V1 d'un système qui pourra devenir prédictif plus tard.
--
-- feature_flags contrôle l'envoi, désactivé par défaut (même précaution que
-- daily_reminders : ne pas spammer les commerçants avant d'avoir validé le
-- comportement en conditions réelles).

insert into feature_flags (key, enabled)
values ('low_demand_alerts', false)
on conflict (key) do nothing;

-- Empêche de réalerter le même panier à chaque run du cron (toutes les
-- 30 min) une fois l'alerte déjà envoyée une fois.
alter table bags add column if not exists alerted_low_demand boolean not null default false;

-- Planification toutes les 30 minutes. L'en-tête Authorization est requis :
-- remplace <TON_ANON_KEY> par la clé "anon public" (Project Settings → API)
-- avant d'exécuter ce script. URL "<NOM_GENERE>" = nom généré par Supabase
-- pour check-low-demand-bags/index.ts une fois déployée (voir Edge Functions
-- → Code → copier l'URL affichée et remplacer ci-dessous).
select cron.schedule(
  'check-low-demand-bags',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://ucxsqregeorfjakgomaj.supabase.co/functions/v1/<NOM_GENERE>',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer <TON_ANON_KEY>'),
    body := '{}'::jsonb
  );
  $$
);
