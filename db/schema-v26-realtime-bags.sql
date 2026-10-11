-- Relief.lu — migration v26 : mises à jour en direct des sachets (Supabase
-- Realtime) sur la vue publique.
--
-- Sans ça, un changement de prix (voir updateBagPrice, schema-v25 /
-- MerchantBagRow.jsx) ou un nouveau sachet publié ne s'affiche à un
-- visiteur qui a déjà la page ouverte qu'au prochain rechargement manuel ou
-- retour au premier plan — pas très crédible pour une PWA censée se sentir
-- "vivante". Realtime pousse les changements de la table "bags" directement
-- aux clients abonnés (voir le useEffect dans PublicView.jsx).
--
-- "supabase_realtime" est la publication Postgres que Supabase écoute par
-- défaut pour diffuser les changements — y ajouter "bags" suffit, aucune
-- configuration côté dashboard nécessaire au-delà de ce SQL. Idempotent :
-- sans danger si déjà exécuté.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'bags'
  ) then
    alter publication supabase_realtime add table bags;
  end if;
end $$;
