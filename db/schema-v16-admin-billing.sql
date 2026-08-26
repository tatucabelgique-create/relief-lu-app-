-- Permet à l'admin (identifié par l'email du JWT, même logique que les
-- policies existantes — voir schema-v14) de lire toutes les réservations,
-- pas seulement celles de ses propres sachets (l'admin n'est pas forcément
-- lui-même commerçant) — nécessaire pour calculer les factures hebdomadaires
-- par commerçant depuis le panneau admin.
create policy "admin can read all reservations"
  on reservations for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'giovanni.ehp@gmail.com');
