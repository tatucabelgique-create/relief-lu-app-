-- Relief.lu — migration v11 : "Contenant" et "Sac de transport" deviennent
-- des champs dynamiques renseignés par le commerçant à la publication,
-- au lieu du texte générique fixe "Non fourni" affiché jusqu'ici.

alter table bags add column if not exists container_provided boolean not null default false;
alter table bags add column if not exists bag_provided boolean not null default false;
