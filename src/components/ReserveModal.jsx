import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { reserveBag, hasCashNoShowHistory } from "../lib/reservations";
import { createCheckoutSession, arePaymentsLive } from "../lib/payments";
import { formatPickupWindow, isToday, isTomorrow } from "./BagCard.jsx";
import AuthPrompt from "./AuthPrompt.jsx";
import { notifyEngaged } from "./InstallPrompt.jsx";
import { displayPriceCents } from "../lib/pricing.js";
import { trackEvent } from "../lib/analytics";

export default function ReserveModal({ bag, user, onClose, onReserved, onOpenLegal }) {
  const { lang, t } = useI18n();
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  // Écran "Ce que tu dois savoir" façon TGTG, affiché à CHAQUE réservation
  // (pas juste la première fois) — protection légale explicite juste avant
  // le paiement, pas seulement une mention dans les CGU : renforce l'absence
  // de garantie sur la composition/les allergènes (voir LegalModal.jsx,
  // article 8) au moment précis où ça compte le plus pour le client.
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  // "card" ou "cash" — choisi sur l'écran principal quand le commerçant
  // accepte les espèces (merchants.cash_enabled, schema-v39), sinon reste
  // "card" par défaut (seul chemin possible dans ce cas).
  const [paymentChoice, setPaymentChoice] = useState("card");
  const [showCashDetails, setShowCashDetails] = useState(false);
  const [cashPhone, setCashPhone] = useState("");
  const [cashConsent, setCashConsent] = useState(false);
  // Résultat d'une réservation en espèces confirmée : {reservation_id,
  // pickup_code} — affiché directement dans ce composant (pas de retour
  // Stripe à attendre comme pour le carte, voir PaymentResult.jsx).
  const [cashReservation, setCashReservation] = useState(null);
  // Un seul no-show en espèces désactive l'option pour ce compte
  // (schema-v39) — vrai par défaut pour ne pas montrer le bouton une
  // fraction de seconde avant la vérification.
  const [cashEligible, setCashEligible] = useState(true);
  // Démarre bloqué (fail-closed) : mieux vaut un très bref flash du message
  // "bientôt disponible" le temps du fetch, que risquer d'autoriser un clic
  // avant d'avoir confirmé que les paiements sont réellement en mode live.
  const [paymentsLive, setPaymentsLive] = useState(false);
  // Ce composant ne se démonte jamais (seul `bag` passe à null, voir
  // `if (!bag) return null` plus bas) — sans cet état, fermer via n'importe
  // lequel des 4 écrans (✕ ou fond) ferait disparaître la fenêtre d'un coup
  // dès que le parent efface `bag`, avant que l'animation de sortie
  // (.overlay.closing / .location-sheet-overlay.closing) ait pu jouer.
  const [modalClosing, setModalClosing] = useState(false);
  function requestFullClose() {
    if (modalClosing) return;
    setModalClosing(true);
    setTimeout(onClose, 220);
  }

  // Ce composant reste monté en permanence (bag passe de null à un sachet à
  // l'ouverture, voir PublicView) — un simple useEffect au montage ne
  // suffirait pas, il faut suivre les changements de `bag`. Réserver
  // directement depuis la liste (sans passer par BagDetail) est au moins
  // aussi fréquent que l'ouverture du détail, donc le même signal
  // d'engagement doit s'y déclencher.
  useEffect(() => {
    if (bag) notifyEngaged();
    setShowDisclaimer(false);
    setPaymentChoice("card");
    setShowCashDetails(false);
    setCashPhone("");
    setCashConsent(false);
    setCashReservation(null);
    setModalClosing(false);
  }, [bag]);

  useEffect(() => {
    if (bag && user && bag.merchants?.cash_enabled) {
      hasCashNoShowHistory(user.id).then((hasNoShow) => setCashEligible(!hasNoShow));
    } else {
      setCashEligible(true);
    }
  }, [bag, user]);

  // Vérifié une fois au montage (flag global, pas lié à un sachet précis) —
  // voir arePaymentsLive() dans payments.js : tant que le compte Stripe
  // n'est pas en mode live, on bloque ici plutôt que de laisser un client
  // atteindre un Checkout qui refusera sa vraie carte.
  useEffect(() => {
    arePaymentsLive().then(setPaymentsLive);
  }, []);

  if (!bag) return null;

  // Le prix affiché au client intègre déjà les frais de service (voir
  // pricing.js) — il n'y a pas de ligne séparée à montrer, juste ce total.
  const total = ((displayPriceCents(bag.price_cents, bag.merchants?.waive_service_fee) * qty) / 100).toFixed(2);
  const maxQty = Math.max(1, bag.quantity_left ?? 1);

  function changeQty(delta) {
    setQty((q) => Math.min(maxQty, Math.max(1, q + delta)));
  }

  // Le sachet est déjà réservé (stock décrémenté) à ce stade, en
  // payment_status='pending' — la redirection vers Stripe Checkout est
  // l'étape suivante ; le code de retrait n'est montré qu'après paiement
  // confirmé (voir PaymentResult.jsx, appelé par App.jsx via ?paid=1).
  async function handleConfirmCard() {
    if (!paymentsLive) return; // double sécurité, le bouton est déjà masqué dans ce cas
    setError("");
    setRedirecting(true);
    try {
      const row = await reserveBag(bag.id, qty);
      onReserved();
      // Deuxième maillon du funnel (voir ViewContent dans BagDetail.jsx) —
      // juste après la réservation réelle (stock décrémenté), avant la
      // redirection Stripe : tout décrochage après ce point (abandon sur la
      // page Stripe, carte refusée...) se verra comme un écart avec Purchase.
      trackEvent("InitiateCheckout", {
        content_ids: [bag.id],
        content_type: "product",
        value: (displayPriceCents(bag.price_cents, bag.merchants?.waive_service_fee) * qty) / 100,
        currency: "EUR",
      });
      const url = await createCheckoutSession(row.reservation_id);
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
      setRedirecting(false);
    }
  }

  // Accepté par l'écran "Ce que tu dois savoir" (voir plus bas) : pour le
  // carte, enchaîne directement sur Stripe comme avant ; pour l'espèces,
  // ouvre l'écran téléphone + consentement avant toute réservation réelle.
  function handleDisclaimerAccept() {
    if (paymentChoice === "cash") {
      setShowDisclaimer(false);
      setShowCashDetails(true);
    } else {
      handleConfirmCard();
    }
  }

  // Aucune redirection externe ici (contrairement au carte) — la réservation
  // espèces est définitive dès cet appel (payment_status reste 'pending'
  // jusqu'au retrait, voir schema-v39), donc le code de retrait est montré
  // tout de suite plutôt que d'attendre un retour de paiement qui n'existe pas.
  async function handleConfirmCash() {
    if (!paymentsLive || !cashPhone.trim() || !cashConsent) return;
    setError("");
    setRedirecting(true);
    try {
      const row = await reserveBag(bag.id, qty, {
        paymentMethod: "cash",
        customerPhone: cashPhone.trim(),
        phoneContactConsent: true,
      });
      onReserved();
      trackEvent("InitiateCheckout", {
        content_ids: [bag.id],
        content_type: "product",
        value: (displayPriceCents(bag.price_cents, bag.merchants?.waive_service_fee) * qty) / 100,
        currency: "EUR",
      });
      setCashReservation(row);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setRedirecting(false);
    }
  }

  // Écran terminal du chemin espèces : affiché à la place de tout le reste
  // une fois la réservation créée — pas de retour Stripe à attendre, donc
  // c'est ici, et seulement ici, que le code de retrait apparaît pour ce
  // chemin (même rôle que PaymentResult.jsx pour le carte).
  if (user && cashReservation) {
    return (
      <div className={`overlay ${modalClosing ? "closing" : "open"}`} onClick={(e) => e.target === e.currentTarget && requestFullClose()}>
        <div className="modal">
          <button className="close" onClick={requestFullClose}>
            ✕
          </button>
          <h2>{t("reserve.doneTitle")}</h2>
          <p className="desc">{t("reserve.cashDoneDesc")}</p>
          <div className="code-box">
            <div className="code">{cashReservation.pickup_code}</div>
            <div className="code-label">{t("reserve.codeLabel")}</div>
          </div>
        </div>
      </div>
    );
  }

  if (user && showCashDetails) {
    return (
      <div
        className={`location-sheet-overlay${modalClosing ? " closing" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setShowCashDetails(false)}
      >
        <div className="location-sheet reserve-disclaimer-sheet">
          <div className="location-sheet-handle" />
          <button className="close" onClick={requestFullClose}>
            ✕
          </button>
          <h2>{t("reserve.payCash")}</h2>
          <div className="field" style={{ marginTop: 16 }}>
            <label>{t("reserve.cashPhoneLabel")}</label>
            <input
              type="tel"
              value={cashPhone}
              onChange={(e) => setCashPhone(e.target.value)}
              placeholder="+352 621 234 567"
              disabled={redirecting}
            />
          </div>
          <label className="checkbox-field">
            <input type="checkbox" checked={cashConsent} onChange={(e) => setCashConsent(e.target.checked)} disabled={redirecting} />
            {t("reserve.cashConsent")}
          </label>
          <button
            className="btn"
            style={{ marginTop: 10, width: "100%" }}
            onClick={handleConfirmCash}
            disabled={redirecting || !cashPhone.trim() || !cashConsent}
          >
            {redirecting ? t("reserve.redirecting") : t("reserve.cashConfirm")}
          </button>
          <button
            className="location-sheet-close"
            onClick={() => {
              setShowCashDetails(false);
              setShowDisclaimer(true);
            }}
            disabled={redirecting}
          >
            {t("reserve.disclaimerBack")}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </div>
      </div>
    );
  }

  // Feuille ancrée en bas (même coquille que LocationPicker/CategoryPicker)
  // plutôt que la carte centrée des autres écrans de ce composant — imite le
  // rendu TGTG pour cet écran précis (bottom sheet qui monte depuis le bas),
  // le reste de ReserveModal gardant la carte centrée du système existant.
  if (user && showDisclaimer) {
    return (
      <div
        className={`location-sheet-overlay${modalClosing ? " closing" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setShowDisclaimer(false)}
      >
        <div className="location-sheet reserve-disclaimer-sheet">
          <div className="location-sheet-handle" />
          <button className="close" onClick={requestFullClose}>
            ✕
          </button>
          <h2>{t("reserve.disclaimerTitle")}</h2>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <span className="disclaimer-icon">🛍️</span>
            <div>
              <b style={{ display: "block", marginBottom: 6 }}>{t("reserve.disclaimerHeading")}</b>
              <p className="page-sub" style={{ margin: 0 }}>{t("reserve.disclaimerBody")}</p>
            </div>
          </div>
          <p className="page-sub" style={{ marginTop: 16, textAlign: "center" }}>
            {t("reserve.legalPre")}{" "}
            <button type="button" className="link-btn" onClick={() => onOpenLegal?.("cguClients")}>
              {t("reserve.legalLink")}
            </button>
            {t("reserve.legalPost")}
          </p>
          <button className="btn" style={{ marginTop: 10, width: "100%" }} onClick={handleDisclaimerAccept} disabled={redirecting}>
            {redirecting ? t("reserve.redirecting") : t("reserve.disclaimerAccept")}
          </button>
          <button className="location-sheet-close" onClick={() => setShowDisclaimer(false)} disabled={redirecting}>
            {t("reserve.disclaimerBack")}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`overlay ${modalClosing ? "closing" : "open"}`} onClick={(e) => e.target === e.currentTarget && requestFullClose()}>
      <div className="modal">
        <button className="close" onClick={requestFullClose}>
          ✕
        </button>
        {!user ? (
          <AuthPrompt title={t("reserve.loginRequired")} view={`reserve:${bag.id}`} />
        ) : (
          <div>
            <div className="reserve-header">
              {bag.merchants?.logo_url && <img className="reserve-logo" src={bag.merchants.logo_url} alt="" />}
              <h2>{bag.title}</h2>
              {bag.merchants?.business_name && <p className="desc">{bag.merchants.business_name}</p>}
            </div>

            <div className="reserve-time-row">
              <span className="reserve-time-label">
                {isToday(bag.pickup_start) ? t("bagDetail.today") : isTomorrow(bag.pickup_start) ? t("bagDetail.tomorrow") : t("reserve.pickup")}
              </span>
              <span className="reserve-time-badge figures">{formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}</span>
            </div>

            <div className="reserve-row">
              <span>{t("reserve.qty")}</span>
              <div className="qty-stepper">
                <button type="button" onClick={() => changeQty(-1)} disabled={redirecting || qty <= 1} aria-label="-">
                  −
                </button>
                <span className="figures">{qty}</span>
                <button type="button" onClick={() => changeQty(1)} disabled={redirecting || qty >= maxQty} aria-label="+">
                  +
                </button>
              </div>
            </div>

            <div className="reserve-row reserve-total">
              <span>{t("reserve.total")}</span>
              <b className="figures">{total} €</b>
            </div>

            {paymentsLive ? (
              bag.merchants?.cash_enabled ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    className="btn"
                    onClick={() => {
                      setPaymentChoice("card");
                      setShowDisclaimer(true);
                    }}
                  >
                    {t("reserve.payCard")}
                  </button>
                  {cashEligible ? (
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setPaymentChoice("cash");
                        setShowDisclaimer(true);
                      }}
                    >
                      {t("reserve.payCash")}
                    </button>
                  ) : (
                    <p className="page-sub" style={{ textAlign: "center", margin: 0 }}>
                      {t("reserve.cashUnavailable")}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  className="btn"
                  onClick={() => {
                    setPaymentChoice("card");
                    setShowDisclaimer(true);
                  }}
                >
                  {t("reserve.confirm")}
                </button>
              )
            ) : (
              <p className="page-sub" style={{ textAlign: "center" }}>
                {t("reserve.paymentsComingSoon")}
              </p>
            )}
            {error && <p className="error-msg">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
