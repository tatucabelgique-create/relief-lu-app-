import AuthPrompt from "./AuthPrompt.jsx";
import MarketingPush from "./MarketingPush.jsx";

// Seul ce compte peut voir/utiliser les outils admin (notifications
// marketing, et toute future opération admin) — pas de rôle admin en base,
// donc simple vérification d'email plutôt qu'une URL "cachée" accessible à
// n'importe qui la devinant.
const ADMIN_EMAIL = "giovanni.ehp@gmail.com";

export default function AdminView({ user }) {
  if (!user) {
    return (
      <div className="panel">
        <AuthPrompt view="admin" />
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="panel">
        <p className="page-sub">Accès réservé.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Admin</h1>
      <MarketingPush />
    </div>
  );
}
