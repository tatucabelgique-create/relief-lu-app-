-- Relief.lu — migration v30 : tag "snack sucré/salé" sur les sachets.
--
-- Permet de distinguer un sachet "snack" (viennoiserie, barre, chips...) des
-- autres, pour la puce "Snacks sucrés & salés" de la rangée de catégories
-- Découvrir (CategoryIconRow.jsx) — façon TGTG. Coché par le commerçant à
-- la publication, même pattern que vegetarian/vegan (schema-app.sql).

alter table bags add column if not exists snack boolean not null default false;
