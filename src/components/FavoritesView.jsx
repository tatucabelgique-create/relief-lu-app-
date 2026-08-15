import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadActiveBags } from "../lib/bags";
import { useFavorites } from "../lib/favorites";
import BagCard from "./BagCard.jsx";
import BagDetail from "./BagDetail.jsx";
import MerchantProfile from "./MerchantProfile.jsx";
import ReserveModal from "./ReserveModal.jsx";
import AuthPrompt from "./AuthPrompt.jsx";
import NotificationToggle from "./NotificationToggle.jsx";

export default function FavoritesView({ user }) {
  const { t } = useI18n();
  const [bags, setBags] = useState(null);
  const [reserving, setReserving] = useState(null);
  const [viewingDetail, setViewingDetail] = useState(null);
  const [viewingMerchant, setViewingMerchant] = useState(null);
  const { favoriteIds, toggleFavorite } = useFavorites(user);

  async function refresh() {
    setBags(await loadActiveBags());
  }

  useEffect(() => {
    refresh();
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const favBags = (bags || []).filter((b) => favoriteIds.has(b.merchant_id));

  return (
    <div>
      <h1 className="page-title">{t("nav.favorites")}</h1>
      {!user ? (
        <div className="panel">
          <AuthPrompt view="favorites" />
        </div>
      ) : bags === null ? (
        <p className="page-sub">{t("public.loading")}</p>
      ) : (
        <>
        <NotificationToggle user={user} />
        <div className="grid">
          {!favBags.length ? (
            <div className="empty">{t("favorites.empty")}</div>
          ) : (
            favBags.map((bag) => (
              <BagCard
                key={bag.id}
                bag={bag}
                onReserve={setReserving}
                onOpenDetail={setViewingDetail}
                onToggleFavorite={toggleFavorite}
                isFavorite={favoriteIds.has(bag.merchant_id)}
              />
            ))
          )}
        </div>
        </>
      )}
      {viewingDetail && (
        <BagDetail
          bag={viewingDetail}
          isFavorite={favoriteIds.has(viewingDetail.merchant_id)}
          onToggleFavorite={toggleFavorite}
          onBack={() => setViewingDetail(null)}
          onOpenMerchant={setViewingMerchant}
          onReserve={(bag) => {
            setViewingDetail(null);
            setReserving(bag);
          }}
        />
      )}
      {viewingMerchant && (
        <MerchantProfile
          merchant={viewingMerchant}
          bags={(bags || []).filter((b) => b.merchant_id === viewingMerchant.id)}
          onBack={() => setViewingMerchant(null)}
          onOpenBag={(bag) => {
            setViewingMerchant(null);
            setViewingDetail(bag);
          }}
        />
      )}
      <ReserveModal bag={reserving} user={user} onClose={() => setReserving(null)} onReserved={refresh} />
    </div>
  );
}
