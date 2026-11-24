import { useI18n } from "../lib/i18n.jsx";

// Un commerçant vérifié sans panier actif en ce moment (tout nouveau, ou
// simplement entre deux fournées) — mélangé directement dans la même grille
// que les vrais paniers (voir PublicView.jsx), avec le même gabarit de carte
// que BagCard, plutôt que relégué dans un carousel à part : donne
// l'impression d'un réseau vivant et dense plutôt que de cacher ces
// commerçants ailleurs. Non cliquable, grisé via .card-placeholder
// (index.css) — jamais confondu avec un vrai panier réservable.
export default function MerchantPlaceholderCard({ merchant }) {
  const { t } = useI18n();

  return (
    <div className="card card-placeholder">
      <div className="thumb">
        {!merchant.logo_url && "🥡"}
        <div className="pill-base badge-availability badge-sold-out">{t("public.comingSoon")}</div>
        {merchant.logo_url && (
          <div className="merchant-logo">
            <img src={merchant.logo_url} alt="" loading="lazy" />
          </div>
        )}
      </div>
      <div className="body">
        <div className="merchant row">
          <span>{merchant.business_name}</span>
        </div>
        <h3>{t("public.noBagRightNow")}</h3>
        <div className="meta">{merchant.city}</div>
      </div>
    </div>
  );
}
