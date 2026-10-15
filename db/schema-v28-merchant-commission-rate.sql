-- Relief.lu — migration v28 : commission configurable par commerçant.
--
-- Jusqu'ici, le taux de commission (18% HT) était une constante codée en dur,
-- dupliquée dans create-checkout-session/index.ts et merchantStats.js —
-- identique pour tous les commerçants. NULL garde le taux par défaut (18%),
-- une valeur (ex. 0.20) applique un taux négocié propre à ce commerçant.

alter table merchants add column if not exists commission_rate numeric;
