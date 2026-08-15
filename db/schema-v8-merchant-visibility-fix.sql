-- Relief.lu — migration v8 : corrige une policy RLS trop restrictive.
-- "anyone can read basic merchant info" ne s'appliquait qu'au rôle "anon" —
-- un client CONNECTÉ (authenticated) qui n'est pas le commerçant lui-même
-- n'avait donc accès à AUCUNE ligne de la table merchants, ce qui faisait
-- disparaître adresse/carte/nom du commerçant sur la fiche sachet dès que le
-- client se connectait. On étend la policy aux deux rôles.

alter policy "anyone can read basic merchant info"
  on merchants
  to anon, authenticated
  using (true);
