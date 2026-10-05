-- Relief.lu — migration v24 : email à l'admin à chaque nouvelle inscription.
--
-- Trigger côté base plutôt qu'un appel depuis le code front (comme pour
-- notify-new-bag) : ça garantit l'envoi même si le trigger de création vient
-- d'ailleurs un jour (Dashboard, script, etc.), pas seulement du formulaire
-- d'inscription actuel. AFTER INSERT uniquement — une modification de fiche
-- existante (UPDATE) ne redéclenche pas l'email.
--
-- Déployer d'abord la fonction supabase/functions/notify-new-merchant/
-- (voir son en-tête pour le secret RESEND_API_KEY à ajouter), noter le nom
-- généré par Supabase (ex. "clever-handler"), puis remplacer <NOM_FONCTION>
-- et <TON_ANON_KEY> ci-dessous avant d'exécuter ce script.
create extension if not exists pg_net;

create or replace function notify_new_merchant()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://ucxsqregeorfjakgomaj.supabase.co/functions/v1/<NOM_FONCTION>',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer <TON_ANON_KEY>'),
    body := jsonb_build_object(
      'business_name', new.business_name,
      'address', new.address,
      'city', new.city,
      'email', new.email,
      'phone', new.phone,
      'registration_number', new.registration_number
    )
  );
  return new;
end;
$$;

drop trigger if exists trg_notify_new_merchant on merchants;
create trigger trg_notify_new_merchant
after insert on merchants
for each row
execute function notify_new_merchant();
