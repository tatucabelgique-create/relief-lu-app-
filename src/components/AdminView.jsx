import { useEffect, useState } from "react";
import AuthPrompt from "./AuthPrompt.jsx";
import MarketingPush from "./MarketingPush.jsx";
import MerchantVerification from "./MerchantVerification.jsx";
import { supabase } from "../lib/supabase";
import { ADMIN_EMAIL } from "../lib/admin";

// Seul ce compte peut voir/utiliser les outils admin (notifications
// marketing, et toute future opération admin) — pas de rôle admin en base,
// donc vérification d'email plutôt qu'une URL "cachée" accessible à
// n'importe qui la devinant. Protégé en plus par la 2FA TOTP native de
// Supabase (Google Authenticator/Authy) : lien magique = 1er facteur
// (possession de l'email), code à 6 chiffres = 2e facteur.

export default function AdminView({ user }) {
  const [aal, setAal] = useState(null); // { currentLevel, nextLevel }
  const [factors, setFactors] = useState(null);
  const [enrollData, setEnrollData] = useState(null); // { id, totp: { qr_code } }
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin) refresh();
  }, [isAdmin]);

  async function refresh() {
    const [{ data: aalData }, { data: factorData }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);
    setAal(aalData);
    setFactors(factorData?.totp || []);
  }

  async function startEnroll() {
    setError("");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error) {
      setError(error.message);
      return;
    }
    setEnrollData(data);
  }

  async function confirmEnroll() {
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollData.id, code });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEnrollData(null);
    setCode("");
    refresh();
  }

  async function confirmLogin() {
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factors[0].id, code });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setCode("");
    refresh();
  }

  if (!user) {
    return (
      <div className="panel">
        <AuthPrompt view="admin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="panel">
        <p className="page-sub">Accès réservé.</p>
      </div>
    );
  }

  if (aal === null) {
    return <p className="page-sub">Chargement…</p>;
  }

  // Aucun facteur 2FA enregistré sur ce compte — inscription obligatoire
  // avant tout accès aux outils admin, une seule fois (le facteur reste
  // lié au compte, pas à cet appareil).
  if (!factors.length) {
    return (
      <div className="panel">
        <h2>Activer la double authentification</h2>
        {!enrollData ? (
          <>
            <p className="desc">
              Obligatoire pour accéder à l'admin. Installe d'abord une app comme Google Authenticator ou Authy sur ton téléphone.
            </p>
            <button className="btn" onClick={startEnroll}>
              Générer le code QR
            </button>
          </>
        ) : (
          <>
            <p className="desc">Scanne ce code avec ton app d'authentification, puis entre le code à 6 chiffres généré.</p>
            <div
              style={{ background: "#fff", padding: 12, borderRadius: 12, width: 200, marginBottom: 16 }}
              dangerouslySetInnerHTML={{ __html: enrollData.totp.qr_code }}
            />
            <div className="field">
              <label>Code à 6 chiffres</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} inputMode="numeric" />
            </div>
            <button className="btn" onClick={confirmEnroll} disabled={busy || code.length !== 6}>
              Confirmer
            </button>
          </>
        )}
        {error && <p className="error-msg">{error}</p>}
      </div>
    );
  }

  // Facteur déjà enregistré, mais pas encore vérifié pour cette session —
  // demande le code à chaque nouvelle connexion (le lien magique seul ne
  // suffit pas, aal2 exige la vérification du 2e facteur).
  if (aal.currentLevel !== "aal2") {
    return (
      <div className="panel">
        <h2>Code de vérification</h2>
        <p className="desc">Entre le code à 6 chiffres de ton app d'authentification.</p>
        <div className="field">
          <label>Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} inputMode="numeric" />
        </div>
        <button className="btn" onClick={confirmLogin} disabled={busy || code.length !== 6}>
          Valider
        </button>
        {error && <p className="error-msg">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Admin</h1>
      <MerchantVerification />
      <MarketingPush />
    </div>
  );
}
