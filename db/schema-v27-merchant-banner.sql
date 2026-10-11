-- Relief.lu — migration v27 : bannière commerçant, photo par défaut des
-- sachets sans image.
--
-- Au lieu d'exiger une photo à chaque création de sachet (friction, et un
-- commerçant pressé publie souvent sans), on reprend l'idée du logo : une
-- seule bannière uploadée une fois sur le profil commerçant (voir
-- MerchantBannerUpload.jsx), réutilisée automatiquement comme fond de
-- carte pour tous ses sachets sans photo propre (voir BagCard.jsx).
alter table merchants add column if not exists banner_url text;
