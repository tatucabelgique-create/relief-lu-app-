-- Relief.lu — migration v29 : frais de service client désactivables par commerçant.
--
-- Jusqu'ici, SERVICE_FEE_CENTS (0,50€ + TVA, voir pricing.js et
-- create-checkout-session/index.ts) était ajouté au prix affiché pour TOUS
-- les commerçants, sans exception. Un partenariat négocié peut échanger ce
-- frais contre une commission plus élevée (ex. 21% au lieu de 18%) plutôt
-- que de cumuler les deux — ce flag permet de désactiver le frais client
-- pour ce commerçant précis, sans toucher au comportement par défaut des
-- autres. false par défaut : comportement inchangé pour tout le monde.

alter table merchants add column if not exists waive_service_fee boolean not null default false;
