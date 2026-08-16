import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getMerchantStats } from "../lib/merchantStats";

export default function MerchantStats({ merchantId, refreshKey }) {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getMerchantStats(merchantId).then(setStats);
  }, [merchantId, refreshKey]);

  if (!stats) return null;

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.bagsPublished}</div>
          <div className="stat-label">{t("stats.bagsPublished")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.unitsSold}</div>
          <div className="stat-label">{t("stats.unitsSold")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.bagsUnsold}</div>
          <div className="stat-label">{t("stats.bagsUnsold")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.noShowRate}%</div>
          <div className="stat-label">{t("stats.noShowRate")}</div>
        </div>
      </div>

      <div className="reserve-row">
        <span>{t("stats.revenue")}</span>
        <b className="figures">{stats.revenue.toFixed(2)} €</b>
      </div>
      <div className="reserve-row">
        <span>{t("stats.commissionHt")}</span>
        <span className="figures">− {stats.commissionHt.toFixed(2)} €</span>
      </div>
      <div className="reserve-row">
        <span>{t("stats.vat")}</span>
        <span className="figures">− {stats.vat.toFixed(2)} €</span>
      </div>
      <div className="reserve-row reserve-total">
        <span>{t("stats.netRevenue")}</span>
        <b className="figures">{stats.netRevenue.toFixed(2)} €</b>
      </div>
    </>
  );
}
