import { Fragment, useState } from "react";
import { generateWeeklyInvoices, getPreviousWeekRange, invoicesToCsv, toDateInputValue } from "../lib/billing";

function fmt(n) {
  return n.toLocaleString("fr-LU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MerchantBilling() {
  const initialRange = getPreviousWeekRange();
  const [weekStart, setWeekStart] = useState(toDateInputValue(initialRange.start));
  const [weekEnd, setWeekEnd] = useState(toDateInputValue(initialRange.end));
  const [invoices, setInvoices] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openMerchantId, setOpenMerchantId] = useState(null);

  async function handleGenerate() {
    setBusy(true);
    setError("");
    setOpenMerchantId(null);
    try {
      const result = await generateWeeklyInvoices(new Date(weekStart), new Date(weekEnd));
      setInvoices(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleExportCsv() {
    const csv = invoicesToCsv(invoices, new Date(weekStart), new Date(weekEnd));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facturation-relief-${weekStart}-au-${weekEnd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalNet = invoices?.reduce((sum, inv) => sum + inv.netAmount, 0) ?? 0;

  return (
    <div className="panel">
      <h2>Facturation commerçants</h2>
      <p className="page-sub">
        Calcule, pour chaque commerçant, le chiffre d'affaires payé sur la période, la commission relief.lu (20% HT +
        TVA 17%) et le montant net à leur reverser. Usage interne — rien n'est envoyé aux commerçants.
      </p>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="field">
          <label>Du</label>
          <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
        </div>
        <div className="field">
          <label>Au</label>
          <input type="date" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} />
        </div>
      </div>
      <button className="btn" onClick={handleGenerate} disabled={busy} style={{ marginTop: 8 }}>
        {busy ? "Calcul…" : "Générer les factures"}
      </button>
      {error && <p className="error-msg">{error}</p>}

      {invoices && (
        <div style={{ marginTop: 24 }}>
          {invoices.length === 0 ? (
            <p className="page-sub">Aucune réservation payée sur cette période.</p>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(239,230,211,0.2)" }}>
                      <th style={{ padding: "8px 6px" }}>Commerçant</th>
                      <th style={{ padding: "8px 6px" }}>Résa.</th>
                      <th style={{ padding: "8px 6px" }}>Unités</th>
                      <th style={{ padding: "8px 6px" }}>CA brut</th>
                      <th style={{ padding: "8px 6px" }}>Commission TTC</th>
                      <th style={{ padding: "8px 6px" }}>Net à verser</th>
                      <th style={{ padding: "8px 6px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <Fragment key={inv.merchantId}>
                        <tr style={{ borderBottom: "1px solid rgba(239,230,211,0.08)" }}>
                          <td style={{ padding: "8px 6px" }}>{inv.businessName}</td>
                          <td style={{ padding: "8px 6px" }}>{inv.reservationCount}</td>
                          <td style={{ padding: "8px 6px" }}>{inv.unitsSold}</td>
                          <td style={{ padding: "8px 6px" }}>{fmt(inv.revenue)} €</td>
                          <td style={{ padding: "8px 6px" }}>{fmt(inv.commissionTtc)} €</td>
                          <td style={{ padding: "8px 6px", fontWeight: 700 }}>{fmt(inv.netAmount)} €</td>
                          <td style={{ padding: "8px 6px" }}>
                            <button
                              className="btn secondary small"
                              onClick={() => setOpenMerchantId(openMerchantId === inv.merchantId ? null : inv.merchantId)}
                            >
                              {openMerchantId === inv.merchantId ? "Masquer" : "Détails"}
                            </button>
                          </td>
                        </tr>
                        {openMerchantId === inv.merchantId && (
                          <tr key={`${inv.merchantId}-details`}>
                            <td colSpan={7} style={{ padding: "0 6px 14px" }}>
                              <table style={{ width: "100%", fontSize: 12.5, color: "var(--paper-dim)" }}>
                                <tbody>
                                  {inv.lines.map((line, i) => (
                                    <tr key={i}>
                                      <td style={{ padding: "3px 6px" }}>
                                        {new Date(line.createdAt).toLocaleString("fr-LU", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </td>
                                      <td style={{ padding: "3px 6px" }}>{line.title}</td>
                                      <td style={{ padding: "3px 6px" }}>× {line.quantity}</td>
                                      <td style={{ padding: "3px 6px" }}>{fmt((line.unitPriceCents * line.quantity) / 100)} €</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "1px solid rgba(239,230,211,0.2)", fontWeight: 700 }}>
                      <td style={{ padding: "8px 6px" }} colSpan={5}>
                        Total net à verser
                      </td>
                      <td style={{ padding: "8px 6px" }}>{fmt(totalNet)} €</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <button className="btn secondary small" onClick={handleExportCsv} style={{ marginTop: 14 }}>
                Exporter en CSV
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
