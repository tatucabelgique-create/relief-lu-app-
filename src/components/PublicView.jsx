import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadActiveBags, loadSoldOutToday } from "../lib/bags";
import { haversineKm, loadSavedPosition, locate } from "../lib/geolocation";
import { useFavorites } from "../lib/favorites";
import { getMerchantRatings } from "../lib/reviews";
import BagCard from "./BagCard.jsx";
import BagDetail from "./BagDetail.jsx";
import MerchantProfile from "./MerchantProfile.jsx";
import ReserveModal from "./ReserveModal.jsx";
import FiltersBar from "./FiltersBar.jsx";
import MapView from "./MapView.jsx";
import ImpactBanner from "./ImpactBanner.jsx";
import MissionIntro from "./MissionIntro.jsx";

export default function PublicView({ user, pendingReserveBagId, onPendingReserveHandled }) {
  const { t } = useI18n();
  const [bags, setBags] = useState(null); // null = loading
  const [reserving, setReserving] = useState(null);
  const [viewingDetail, setViewingDetail] = useState(null);
  const [viewingMerchant, setViewingMerchant] = useState(null);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [userPos, setUserPos] = useState(() => loadSavedPosition());
  const [geoStatus, setGeoStatus] = useState("idle");
  const { favoriteIds, toggleFavorite } = useFavorites(user);
  const [ratings, setRatings] = useState({});
  const [soldOutToday, setSoldOutToday] = useState([]);

  async function refresh() {
    setBags(await loadActiveBags());
    setSoldOutToday(await loadSoldOutToday());
  }

  useEffect(() => {
    refresh();
    getMerchantRatings().then(setRatings);

    // Demande la position automatiquement à l'ouverture plutôt que d'attendre
    // un tap sur "Utiliser ma position" — si elle a déjà été refusée, le
    // navigateur ne réaffiche pas de popup (comportement natif), donc pas de
    // risque de solliciter l'utilisateur en boucle. Si elle avait déjà été
    // accordée, ce useEffect ne fait rien puisque userPos est déjà rempli
    // depuis le localStorage (voir useState plus haut).
    if (!userPos) handleLocate();

    // Recharge la liste à chaque retour au premier plan — sans ça, un sachet
    // publié pendant que l'app était en arrière-plan (ou ouverte depuis une
    // notification) restait invisible tant qu'on ne fermait/rouvrait pas
    // complètement l'app.
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Rouvre la modale de réservation sur le sachet précis après un retour de
  // lien magique déclenché depuis "Réserver" (voir ReserveModal + App.jsx).
  useEffect(() => {
    if (!pendingReserveBagId || !bags) return;
    const bag = bags.find((b) => b.id === pendingReserveBagId);
    if (bag) setReserving(bag);
    onPendingReserveHandled?.();
  }, [pendingReserveBagId, bags]);

  async function handleLocate() {
    setGeoStatus("loading");
    try {
      setUserPos(await locate());
      setGeoStatus("ok");
    } catch {
      setGeoStatus("denied");
    }
  }

  const filtered = useMemo(() => {
    if (!bags) return [];
    let list = bags.map((b) => ({
      ...b,
      distanceKm: userPos && b.merchants?.lat != null ? haversineKm(userPos.lat, userPos.lng, b.merchants.lat, b.merchants.lng) : null,
    }));

    if (category) list = list.filter((b) => b.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.merchants?.business_name?.toLowerCase().includes(q));
    }

    if (sort === "price") list = [...list].sort((a, b) => a.price_cents - b.price_cents);
    else if (sort === "distance")
      list = [...list].sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    else list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return list;
  }, [bags, category, search, sort, userPos]);

  // Sous-ensemble trié par urgence de retrait — reprend le pattern "À sauver
  // avant qu'il ne soit trop tard" façon TGTG. Affiché seulement s'il reste
  // des sachets EN PLUS dans la grille du dessous — sinon le carrousel et la
  // grille montrent exactement les mêmes cartes en double, ce qui ressemble
  // à un bug plutôt qu'à une mise en avant utile.
  const closingSoon = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(a.pickup_end) - new Date(b.pickup_end)).slice(0, 8);
  }, [filtered]);
  const showCarousel = !search.trim() && !category && closingSoon.length > 1 && filtered.length > closingSoon.length;

  const soldOutTodayWithDistance = useMemo(() => {
    return soldOutToday.map((b) => ({
      ...b,
      distanceKm: userPos && b.merchants?.lat != null ? haversineKm(userPos.lat, userPos.lng, b.merchants.lat, b.merchants.lng) : null,
    }));
  }, [soldOutToday, userPos]);

  return (
    <div>
      <button className="location-picker" onClick={handleLocate}>
        📍 {geoStatus === "loading" ? t("filters.locating") : userPos ? t("filters.currentPosition") : t("filters.useLocation")}
        <span className="chevron">›</span>
      </button>
      <h1 className="page-title">{t("public.title")}</h1>
      <p className="page-sub">{t("public.sub")}</p>

      <ImpactBanner />

      {showCarousel && (
        <div className="carousel-section">
          <h2>{t("public.closingSoon")}</h2>
          <div className="carousel-track">
            {closingSoon.map((bag) => (
              <div className="carousel-card" key={bag.id}>
                <BagCard
                  bag={bag}
                  onReserve={setReserving}
                  onOpenDetail={setViewingDetail}
                  distanceKm={bag.distanceKm}
                  onToggleFavorite={user ? toggleFavorite : undefined}
                  isFavorite={favoriteIds.has(bag.merchant_id)}
                  rating={ratings[bag.merchant_id]}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {soldOutToday.length > 0 && (
        <div className="carousel-section">
          <h2>{t("public.soldOutToday")}</h2>
          <div className="carousel-track">
            {soldOutTodayWithDistance.map((bag) => (
              <div className="carousel-card" key={bag.id}>
                <BagCard
                  bag={bag}
                  onReserve={setReserving}
                  onOpenDetail={setViewingDetail}
                  distanceKm={bag.distanceKm}
                  onToggleFavorite={user ? toggleFavorite : undefined}
                  isFavorite={favoriteIds.has(bag.merchant_id)}
                  rating={ratings[bag.merchant_id]}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {bags !== null && bags.length === 0 && <MissionIntro />}

      {bags !== null && bags.length > 0 && (
        <FiltersBar
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          search={search}
          setSearch={setSearch}
          onLocate={handleLocate}
          geoStatus={geoStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {viewMode === "map" && bags && bags.length > 0 && <MapView bags={filtered} userPos={userPos} />}

      <div className="grid">
        {bags === null ? (
          <div className="empty">{t("public.loading")}</div>
        ) : !filtered.length ? (
          <div className="empty">{t("public.empty")}</div>
        ) : (
          filtered.map((bag) => (
            <BagCard
              key={bag.id}
              bag={bag}
              onReserve={setReserving}
              onOpenDetail={setViewingDetail}
              distanceKm={bag.distanceKm}
              onToggleFavorite={user ? toggleFavorite : undefined}
              isFavorite={favoriteIds.has(bag.merchant_id)}
              rating={ratings[bag.merchant_id]}
            />
          ))
        )}
      </div>
      {viewingDetail && (
        <BagDetail
          bag={viewingDetail}
          distanceKm={viewingDetail.distanceKm}
          rating={ratings[viewingDetail.merchant_id]}
          isFavorite={favoriteIds.has(viewingDetail.merchant_id)}
          onToggleFavorite={user ? toggleFavorite : undefined}
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
          rating={ratings[viewingMerchant.id]}
          distanceKm={userPos && viewingMerchant.lat != null ? haversineKm(userPos.lat, userPos.lng, viewingMerchant.lat, viewingMerchant.lng) : null}
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
