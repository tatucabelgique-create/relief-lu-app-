-- Relief.lu — migration v19 : seuil de prix dynamique configurable par commerçant.
--
-- Jusqu'ici, le seuil (5 sachets vendus/28 jours avant de passer de -70% à
-- -50%) était fixe et codé en dur — mal calibré pour un commerçant qui débute
-- (déclenché trop vite, avant même d'avoir construit une vraie base de
-- clients fidèles à -70%). Chaque commerçant connaît mieux que nous son
-- propre volume : NULL désactive le prix dynamique (toujours -70% suggéré),
-- une valeur active le mécanisme à ce seuil précis.

alter table merchants add column if not exists dynamic_pricing_threshold integer;
