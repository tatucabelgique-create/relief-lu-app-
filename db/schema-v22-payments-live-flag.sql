-- Relief.lu — migration v22 : garde-fou "paiements en direct".
--
-- Le compte Stripe de relief.lu n'est pas encore finalisé en mode live (clé
-- secrète encore en mode test) — tant que ce flag reste désactivé, le front
-- empêche toute tentative de réservation/paiement plutôt que de laisser un
-- vrai client arriver sur un Checkout Stripe qui refusera sa vraie carte.
-- Réutilise la table feature_flags créée en v21 (schema-v21-daily-reminders.sql).
--
-- À activer manuellement (update feature_flags set enabled = true where key
-- = 'payments_live') une fois le compte Stripe passé en mode live.
insert into feature_flags (key, enabled)
values ('payments_live', false)
on conflict (key) do nothing;
