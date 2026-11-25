-- Relief.lu — migration v39 : paiement en espèces (opt-in par commerçant).
--
-- Jusqu'ici toute réservation passait par Stripe Checkout : le client a déjà
-- payé au moment où le commerçant peut la marquer "retirée" (payment_status
-- doit valoir 'paid', voir schema-v7). En espèces, personne n'a encore payé
-- au moment de la réservation — le vrai risque, c'est le client qui réserve
-- et ne vient pas, le commerçant perdant l'invendu pour rien. Les garde-fous
-- ajoutés ici :
--   1. Opt-in par commerçant (merchants.cash_enabled) — pas une option
--      globale, certains partenaires (ex. chaînes) préfèrent 100% carte.
--   2. Téléphone + consentement explicite à être recontacté obligatoires
--      pour réserver en espèces (reservations.customer_phone /
--      phone_contact_consent) — validés ici, pas seulement côté front.
--   3. Réputation : un seul no-show en espèces désactive l'option espèces
--      pour ce compte (il garde l'accès au paiement carte). Remise à zéro
--      manuelle en base si besoin, pas d'UI dédiée pour l'instant.
--   4. Le cron de libération des réservations "pending" (schema-v35) ne doit
--      viser que le carte — une résa espèces reste légitimement "pending"
--      jusqu'au retrait, elle n'a pas 5 minutes pour "revenir de Stripe".

alter table merchants add column if not exists cash_enabled boolean not null default false;

alter table reservations add column if not exists payment_method text not null default 'card'; -- card | cash
alter table reservations add column if not exists customer_phone text;
alter table reservations add column if not exists phone_contact_consent boolean not null default false;

-- ---------- reserve_bag : ajoute le chemin espèces, sans toucher au chemin carte existant ----------
create or replace function reserve_bag(
  p_bag_id uuid,
  p_quantity int,
  p_payment_method text default 'card',
  p_customer_phone text default null,
  p_phone_contact_consent boolean default false
)
returns table(reservation_id uuid, pickup_code text) as $$
declare
  v_left int;
  v_code text;
  v_res_id uuid;
  v_user_id uuid := auth.uid();
  v_email text;
  v_merchant_id uuid;
  v_cash_enabled boolean;
begin
  if v_user_id is null then
    raise exception 'Connexion requise pour réserver.';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  select quantity_left, merchant_id into v_left, v_merchant_id from bags where id = p_bag_id for update;

  if v_left is null then
    raise exception 'Ce sachet n''existe plus.';
  end if;

  if v_left < p_quantity then
    raise exception 'Il ne reste plus assez de sachets disponibles.';
  end if;

  if p_payment_method = 'cash' then
    select cash_enabled into v_cash_enabled from merchants where id = v_merchant_id;
    if not coalesce(v_cash_enabled, false) then
      raise exception 'Ce commerçant n''accepte pas le paiement en espèces.';
    end if;

    if p_customer_phone is null or trim(p_customer_phone) = '' or not p_phone_contact_consent then
      raise exception 'Numéro de téléphone et consentement à être recontacté requis pour payer en espèces.';
    end if;

    if exists (
      select 1 from reservations
      where user_id = v_user_id and payment_method = 'cash' and status = 'no_show'
    ) then
      raise exception 'Le paiement en espèces n''est plus disponible pour ce compte suite à une réservation non retirée.';
    end if;
  elsif p_payment_method <> 'card' then
    raise exception 'Mode de paiement inconnu.';
  end if;

  update bags
    set quantity_left = quantity_left - p_quantity,
        status = case when quantity_left - p_quantity = 0 then 'sold_out' else status end
    where id = p_bag_id;

  v_code := upper(substr(md5(random()::text), 1, 6));

  insert into reservations (bag_id, user_id, email, quantity, pickup_code, payment_method, customer_phone, phone_contact_consent)
  values (
    p_bag_id, v_user_id, v_email, p_quantity, v_code, p_payment_method,
    case when p_payment_method = 'cash' then trim(p_customer_phone) else null end,
    case when p_payment_method = 'cash' then p_phone_contact_consent else false end
  )
  returning id into v_res_id;

  return query select v_res_id, v_code;
end;
$$ language plpgsql security definer;

-- ---------- release_stale_pending_reservations : exclut le cash (schema-v35) ----------
create or replace function release_stale_pending_reservations()
returns void as $$
declare
  v_id uuid;
begin
  for v_id in
    select id from reservations
    where payment_status = 'pending'
      and payment_method = 'card'
      and created_at < now() - interval '5 minutes'
  loop
    perform release_reservation(v_id);
  end loop;
end;
$$ language plpgsql security definer;

grant execute on function reserve_bag(uuid, int, text, text, boolean) to authenticated, anon;

notify pgrst, 'reload schema';
