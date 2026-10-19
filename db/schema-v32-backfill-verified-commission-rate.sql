-- Relief.lu — migration v32 : rattrapage commission_rate pour les
-- commerçants déjà validés avant ce changement.
--
-- Jusqu'ici, commission_rate restait NULL indéfiniment (défaut 18% appliqué
-- silencieusement côté code, voir merchantStats.js) — à partir de
-- maintenant, setMerchantVerified() le fixe explicitement à 18% au moment
-- de l'approbation, et l'absence de valeur signifie "pas encore validé"
-- (affiché comme tel dans MerchantStats.jsx). Sans ce rattrapage, tous les
-- commerçants DÉJÀ validés avant ce changement se retrouveraient affichés à
-- tort comme "en attente de validation" sur leur propre tableau de bord.
update merchants
set commission_rate = 0.18
where verified = true and commission_rate is null;
