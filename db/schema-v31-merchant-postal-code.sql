-- Relief.lu — migration v31 : code postal sur la fiche commerçant.
-- La fiche n'avait jusqu'ici que rue + ville, sans code postal — adresse
-- incomplète pour une fiche commerçant sérieuse. Format luxembourgeois
-- "L-XXXX", validé côté formulaire (MerchantRegistrationForm.jsx).
alter table merchants add column if not exists postal_code text;

-- Redéfinit la fonction de notification (v24) pour inclure le code postal
-- dans le payload envoyé à l'edge function notify-new-merchant/bright-endpoint
-- — sans ça, la notif push à l'inscription d'un nouveau commerçant continuerait
-- d'afficher une adresse sans code postal. create or replace = sûr à rejouer,
-- ne recrée pas le trigger qui l'appelle (déjà en place depuis v24).
create or replace function notify_new_merchant()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://ucxsqregeorfjakgomaj.supabase.co/functions/v1/bright-endpoint',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer <TON_ANON_KEY>'),
    body := jsonb_build_object(
      'business_name', new.business_name,
      'address', new.address,
      'postal_code', new.postal_code,
      'city', new.city,
      'email', new.email,
      'phone', new.phone,
      'registration_number', new.registration_number
    )
  );
  return new;
end;
$$;
