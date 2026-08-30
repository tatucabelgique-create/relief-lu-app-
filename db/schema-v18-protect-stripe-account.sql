-- Relief.lu — migration v18 : verrouille stripe_account_id contre une
-- auto-modification par le commerçant.
--
-- Comme pour "verified" (schema-v14) : Postgres RLS ne filtre pas par
-- colonne, donc la policy "merchants can update own row" (qui autorise déjà
-- la mise à jour de sa propre fiche pour l'adresse/le téléphone/etc.)
-- laissait n'importe quel commerçant remplacer stripe_account_id par un
-- autre ID de compte Stripe en appelant directement l'API Supabase — de quoi
-- détourner vers ce compte les paiements de ses propres ventes.
--
-- auth.jwt() est NULL pour les appels faits avec la clé service_role (nos
-- Edge Functions create-connect-account/stripe-webhook), donc le trigger ne
-- bloque que les écritures faites avec une session utilisateur normale.

create or replace function merchants_protect_stripe_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stripe_account_id is distinct from old.stripe_account_id
     and auth.jwt() is not null then
    new.stripe_account_id := old.stripe_account_id;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_merchant_stripe_account on merchants;
create trigger protect_merchant_stripe_account
  before update on merchants
  for each row
  execute function merchants_protect_stripe_account();
