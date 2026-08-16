import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useI18n } from "../lib/i18n.jsx";
import { merchantMarkerIcon, userLocationIcon } from "../lib/leafletIcon";

const LUXEMBOURG_CENTER = [49.75, 6.15];

// Leaflet ne détecte pas tout seul qu'un conteneur masqué (display:none /
// hauteur 0, ex. l'onglet Parcourir qui bascule carte/liste) reprend une
// taille normale — sans ce recalcul explicite, la carte réapparaît coupée/
// mal centrée tant qu'on n'interagit pas avec elle.
function InvalidateOnShow({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 50);
    return () => clearTimeout(id);
  }, [trigger]);
  return null;
}

export default function MapView({ bags, userPos, invalidateKey }) {
  const { t } = useI18n();

  const merchants = {};
  for (const bag of bags) {
    const m = bag.merchants;
    if (!m || m.lat == null || m.lng == null) continue;
    const id = bag.merchant_id;
    if (!merchants[id]) merchants[id] = { ...m, merchantId: id, bags: [] };
    merchants[id].bags.push(bag);
  }
  const merchantList = Object.values(merchants);

  const center = userPos ? [userPos.lat, userPos.lng] : merchantList[0] ? [merchantList[0].lat, merchantList[0].lng] : LUXEMBOURG_CENTER;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
        {invalidateKey !== undefined && <InvalidateOnShow trigger={invalidateKey} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPos && <Marker position={[userPos.lat, userPos.lng]} icon={userLocationIcon()} />}
        {merchantList.map((m) => (
          <Marker key={m.merchantId} position={[m.lat, m.lng]} icon={merchantMarkerIcon(m.logo_url)}>
            <Popup>
              <b>{m.business_name}</b>
              <br />
              {m.bags.length} {t("left")}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
