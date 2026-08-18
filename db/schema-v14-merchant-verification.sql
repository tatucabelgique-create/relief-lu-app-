-- Vérification manuelle des commerçants avant publication de sachets.
-- Jusqu'ici, remplir le formulaire d'inscription suffisait à publier des
-- sachets — rien n'empêchait quelqu'un de se faire passer pour un commerce
-- existant (aucune preuve de propriété n'était demandée). Un commerçant
-- doit désormais être approuvé par l'admin avant de pouvoir publier.

alter table merchants add column if not exists verified boolean not null default false;

drop policy if exists "merchants can insert their own bags" on bags;
create policy "verified merchants can insert their own bags"
  on bags for insert
  to authenticated
  with check (
    auth.uid() = merchant_id
    and exists (select 1 from merchants m where m.id = auth.uid() and m.verified = true)
  );

-- Autorise l'admin (identifié par l'email du JWT, même logique que
-- src/lib/admin.js) à modifier la fiche d'un commerçant qui n'est pas la
-- sienne — la policy "merchants can update own row" existante ne couvre
-- que auth.uid() = id, donc sans ceci l'admin ne pourrait vérifier
-- personne d'autre que lui-même.
create policy "admin can update any merchant"
  on merchants for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'giovanni.ehp@gmail.com');

-- Postgres RLS ne filtre pas par colonne : sans ce verrou, un commerçant
-- pourrait s'auto-passer verified=true via la policy "merchants can update
-- own row" (qui autorise déjà la mise à jour de sa propre fiche pour
-- l'adresse/le téléphone/etc). Le trigger annule silencieusement tout
-- changement de "verified" qui ne vient pas du compte admin.
create or replace function merchants_protect_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verified is distinct from old.verified
     and coalesce(auth.jwt() ->> 'email', '') <> 'giovanni.ehp@gmail.com' then
    new.verified := old.verified;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_merchant_verified on merchants;
create trigger protect_merchant_verified
  before update on merchants
  for each row
  execute function merchants_protect_verified();
