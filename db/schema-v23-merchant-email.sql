-- Relief.lu — migration v23 : email sur la fiche commerçant.
--
-- L'email du commerçant ne vivait jusqu'ici que dans auth.users, inaccessible
-- depuis l'écran d'admin (MerchantVerification.jsx) qui interroge la table
-- publique merchants via le client — auth.users n'est pas exposée par
-- l'API REST publique. On le duplique donc ici, renseigné une fois à
-- l'inscription (voir updateMerchantProfile côté app).
alter table merchants add column if not exists email text;

-- Backfill ponctuel pour les commerçants déjà inscrits avant cette colonne
-- (ex. Cake&Go) — à exécuter une seule fois, sans risque à relancer (idempotent).
update merchants
set email = auth.users.email
from auth.users
where merchants.id = auth.users.id and merchants.email is null;
