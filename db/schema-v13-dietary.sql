-- Relief.lu — migration v13 : régime alimentaire (végétarien / végan) sur les sachets.
-- Deux booléens plutôt qu'un enum unique — un sachet peut être les deux à la
-- fois (végan implique végétarien), même pattern que container_provided/
-- bag_provided (schema-v11).

alter table bags add column if not exists vegetarian boolean not null default false;
alter table bags add column if not exists vegan boolean not null default false;
