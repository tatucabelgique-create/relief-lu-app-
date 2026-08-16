import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../lib/i18n.jsx";
import { loadActiveBags, loadSoldOutToday } from "../lib/bags";
import { haversineKm, loadSavedPosition, locate } from "../lib/geolocation";
import { useFavorites } from "../lib/favorites";
import { getMerchantRatings } from "../lib/reviews";
import BagCard, { isToday, isTomorrow } from "./BagCard.jsx";
import BagDetail from "./BagDetail.jsx";
import MerchantProfile from "./MerchantProfile.jsx";
import ReserveModal from "./ReserveModal.jsx";
import FiltersBar from "./FiltersBar.jsx";
import MapView from "./MapView.jsx";
import ImpactBanner from "./ImpactBanner.jsx";
import MissionIntro from "./MissionIntro.jsx";

export default function PublicView({ user, pendingReserveBagId, onPendingReserveHandled, initialViewMode = "grid", compact = false }) {
  const { t } = useI18n();
  const [bags, setBags] = useState(null); // null = loading
  const [reserving, setReserving] = useState(null);
  const [viewingDetail, setViewingDetail] = useState(null);
  const [viewingMerchant, setViewingMerchant] = useState(null);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [diet, setDiet] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [viewMode, setViewMode] = useState(initialViewMode);
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
    if (diet === "vegetarian") list = list.filter((b) => b.vegetarian);
    else if (diet === "vegan") list = list.filter((b) => b.vegan);
    if (pickupTime === "today") list = list.filter((b) => isToday(b.pickup_start));
    else if (pickupTime === "tomorrow") list = list.filter((b) => isTomorrow(b.pickup_start));
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
  }, [bags, category, diet, pickupTime, search, sort, userPos]);

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

  // false = carte + feuille en aperçu (façon TGTG par défaut) ; true = liste
  // plein écran, carte masquée, bouton flottant "Carte" pour y revenir.
  const [showList, setShowList] = useState(false);

  const modals = (
    <>
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
    </>
  );

  // Portée directement dans document.body : sur l'onglet Parcourir, ces
  // modales seraient sinon imbriquées dans .browse-map-page (position:
  // fixed) qui contient la carte Leaflet — les panneaux/contrôles internes
  // de Leaflet ont des z-index très élevés qui pouvaient malgré tout passer
  // par-dessus (confirmé sur Chrome et Safari), même avec un contexte
  // d'empilement local sur le conteneur de la carte. Un portail évite le
  // problème à la racine : ces éléments ne sont plus du tout descendants de
  // .browse-map-page dans le DOM.
  const modalsPortal = createPortal(modals, document.body);

  // Onglet "Parcourir" façon TGTG : carte plein écran avec une feuille de
  // résultats en bas, repliable — pas la page Découvrir avec sa carte
  // encastrée au milieu du contenu éditorial (bannière d'impact, carrousels).
  if (compact) {
    return (
      <div className="browse-map-page">
        <div className="browse-topbar">
          <div className="browse-search-row">
            <input
              type="text"
              placeholder={t("filters.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="browse-locate-btn" onClick={handleLocate} aria-label={t("filters.useLocation")}>
              {geoStatus === "loading" ? "…" : "📍"}
            </button>
          </div>
          <div className="browse-chip-row">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t("filters.allCategories")}</option>
              {["boulangerie", "restaurant", "epicerie", "supermarche", "traiteur", "autre"].map((c) => (
                <option key={c} value={c}>
                  {t(`merchant.category.${c}`)}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">{t("filters.sortRecent")}</option>
              <option value="price">{t("filters.sortPrice")}</option>
              <option value="distance">{t("filters.sortDistance")}</option>
            </select>
            <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}>
              <option value="">{t("filters.pickupTime")}</option>
              <option value="today">{t("filters.pickupToday")}</option>
              <option value="tomorrow">{t("filters.pickupTomorrow")}</option>
            </select>
            <select value={diet} onChange={(e) => setDiet(e.target.value)}>
              <option value="">{t("filters.allDiets")}</option>
              <option value="vegetarian">{t("diet.vegetarian")}</option>
              <option value="vegan">{t("diet.vegan")}</option>
            </select>
          </div>
        </div>

        <div className={`browse-map-area ${showList ? "hidden" : ""}`}>
          {bags && <MapView bags={filtered} userPos={userPos} invalidateKey={showList} />}
        </div>

        <div className={`browse-sheet ${showList ? "full" : ""}`}>
          <button className="browse-sheet-handle" onClick={() => setShowList((v) => !v)} aria-label="toggle">
            <span />
          </button>
          <button className="browse-sheet-header" onClick={() => setShowList((v) => !v)}>
            {bags === null
              ? t("public.loading")
              : `${filtered.length} ${filtered.length === 1 ? t("browse.result") : t("browse.results")}`}
          </button>
          <div className="browse-sheet-body">
            {bags !== null && !filtered.length && <div className="empty">{t("public.empty")}</div>}
            {filtered.map((bag) => (
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
            ))}
          </div>
        </div>

        {showList && (
          <button className="browse-map-fab" onClick={() => setShowList(false)}>
            🗺️ {t("browse.showMap")}
          </button>
        )}

        {modalsPortal}
      </div>
    );
  }

  return (
    <div>
      <button className="location-picker" onClick={handleLocate}>
        📍 {geoStatus === "loading" ? t("filters.locating") : userPos ? t("filters.currentPosition") : t("filters.useLocation")}
        <span className="chevron">›</span>
      </button>
      {!compact && (
        <>
          <h1 className="page-title">{t("public.title")}</h1>
          <p className="page-sub">{t("public.sub")}</p>

          <ImpactBanner />
        </>
      )}

      {!compact && showCarousel && (
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

      {!compact && soldOutToday.length > 0 && (
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

      {!compact && bags !== null && bags.length === 0 && <MissionIntro />}

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
      {modalsPortal}
    </div>
  );
}
