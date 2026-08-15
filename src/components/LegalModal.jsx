import { useI18n } from "../lib/i18n.jsx";

const CONTACT = "relief-lu@outlook.com";

const CONTENT = {
  fr: {
    mentions: {
      title: "Mentions légales",
      paragraphs: [
        "Éditeur : Relief.lu — projet indépendant basé au Luxembourg, en cours de constitution en société.",
        `Contact : ${CONTACT}`,
        "Numéro d'entreprise : en cours d'enregistrement — ces mentions seront complétées dès son obtention.",
        "Hébergement du site : GitHub, Inc. (GitHub Pages).",
        "Base de données, authentification et stockage : Supabase, Inc.",
      ],
    },
    confidentialite: {
      title: "Politique de confidentialité",
      paragraphs: [
        "Cette politique explique quelles données Relief.lu collecte, pourquoi, et comment les faire corriger ou supprimer.",
        { heading: "1. Responsable du traitement", text: `Relief.lu, contact : ${CONTACT}.` },
        {
          heading: "2. Données collectées",
          text: "Email (liste d'attente, compte utilisateur), contenu de vos réservations (sachet, quantité, code de retrait), vos favoris, les avis que vous laissez. Pour les commerçants : nom du commerce, position approximative sur la carte, photos des sachets publiés. Si vous activez les notifications, un identifiant technique d'abonnement push est stocké (aucune information personnelle supplémentaire).",
        },
        {
          heading: "3. Pourquoi ces données",
          text: "Uniquement pour faire fonctionner Relief.lu : créer votre compte, afficher et gérer vos réservations, vos favoris, vos avis, et vous notifier des nouveaux sachets chez les commerçants suivis.",
        },
        {
          heading: "4. Avec qui elles sont partagées",
          text: "Avec les prestataires techniques nécessaires au fonctionnement du service : Supabase (base de données, authentification, stockage des photos), et les services de notification push de votre navigateur (Google, Mozilla ou Apple selon le cas) pour l'acheminement technique des notifications. Aucune donnée n'est vendue ni utilisée à des fins publicitaires.",
        },
        { heading: "5. Durée de conservation", text: "Vos données sont conservées tant que votre compte est actif. Vous pouvez en demander la suppression à tout moment." },
        { heading: "6. Vos droits", text: `Vous pouvez demander l'accès, la correction, la suppression ou l'export de vos données à tout moment en écrivant à ${CONTACT}.` },
        {
          heading: "7. Sécurité",
          text: "L'accès aux données est protégé par des règles techniques (chaque utilisateur ne peut voir/modifier que ses propres réservations, favoris et sachets) et le site est servi en HTTPS.",
        },
      ],
    },
    cgu: {
      title: "Conditions Générales d'Utilisation",
      paragraphs: [
        "Ce document encadre l'utilisation de Relief.lu. Il s'agit d'un texte rédigé pour ce type de plateforme, à faire valider par un professionnel du droit avant une exploitation à grande échelle.",
        {
          heading: "1. Objet",
          text: "Relief.lu met en relation des commerçants (boulangeries, restaurants, épiceries, traiteurs...) proposant des invendus alimentaires à prix réduit, et des utilisateurs souhaitant les réserver et les récupérer sur place. Relief.lu n'est ni producteur, ni vendeur, ni acheteur des produits proposés : la plateforme fournit uniquement les outils de mise en relation et de réservation.",
        },
        { heading: "2. Inscription", text: "L'inscription se fait par email, sans mot de passe (lien de connexion). Chaque utilisateur garantit l'exactitude des informations fournies et est responsable de l'utilisation de son compte." },
        {
          heading: "3. Sachets et réservations",
          text: "Le commerçant est seul responsable du contenu de ses annonces (description, quantité, prix, créneau de retrait) et garantit être en droit de vendre les denrées proposées, dans le respect de la réglementation applicable en matière d'hygiène et de sécurité alimentaire. L'utilisateur s'engage à récupérer sa réservation dans le créneau indiqué ; en cas de non-retrait répété, Relief.lu se réserve le droit de suspendre le compte concerné.",
        },
        {
          heading: "4. Prix et paiement",
          text: "Le prix affiché est fixé librement par le commerçant. À ce stade, Relief.lu ne traite aucun paiement : celui-ci s'effectue directement entre l'utilisateur et le commerçant, sur place, au moment du retrait.",
        },
        {
          heading: "5. Responsabilité",
          text: "Relief.lu agit en tant qu'intermédiaire technique et n'est pas partie à la transaction conclue entre le commerçant et l'utilisateur. Relief.lu ne garantit pas la qualité, la fraîcheur ou l'innocuité des produits proposés — cette responsabilité incombe exclusivement au commerçant, seul habilité à vendre des denrées alimentaires conformément à la réglementation en vigueur.",
        },
        { heading: "6. Compte et résiliation", text: "Tout utilisateur peut cesser d'utiliser Relief.lu à tout moment en nous contactant. Relief.lu se réserve le droit de suspendre ou supprimer un compte en cas d'usage abusif, frauduleux ou contraire aux présentes conditions." },
        { heading: "7. Modification des CGU", text: "Relief.lu peut modifier les présentes conditions à tout moment ; les utilisateurs seront informés des changements significatifs." },
        { heading: "8. Droit applicable", text: "Les présentes conditions sont soumises au droit luxembourgeois. Tout litige relatif à l'utilisation de la plateforme relève des tribunaux compétents du Grand-Duché de Luxembourg, sauf disposition légale impérative contraire." },
        { heading: "9. Contact", text: `Pour toute question : ${CONTACT}.` },
      ],
    },
    cookies: {
      title: "Cookies",
      paragraphs: [
        "Ce site utilise des cookies et espaces de stockage techniques, nécessaires à son fonctionnement (garder votre connexion, mémoriser votre langue, votre position pour trier par distance) — ceux-ci sont toujours actifs, sans demande de consentement puisqu'ils sont indispensables au service.",
        "Ce site utilise également, avec votre consentement, des cookies de mesure d'audience (Google Analytics) et de publicité (Meta Pixel). Ils ne sont déposés qu'après acceptation explicite via le bandeau affiché lors de votre première visite.",
        "Vous pouvez à tout moment modifier votre choix via le lien « Gérer les cookies » en bas de page.",
      ],
    },
  },
  de: {
    mentions: {
      title: "Impressum",
      paragraphs: [
        "Herausgeber: Relief.lu — unabhängiges Projekt mit Sitz in Luxemburg, Gesellschaftsgründung läuft.",
        `Kontakt: ${CONTACT}`,
        "Handelsregisternummer: wird derzeit beantragt — diese Angaben werden nach Erhalt ergänzt.",
        "Hosting der Website: GitHub, Inc. (GitHub Pages).",
        "Datenbank, Authentifizierung und Speicherung: Supabase, Inc.",
      ],
    },
    confidentialite: {
      title: "Datenschutzerklärung",
      paragraphs: [
        "Diese Erklärung beschreibt, welche Daten Relief.lu erhebt, warum, und wie Sie diese berichtigen oder löschen lassen können.",
        { heading: "1. Verantwortlicher", text: `Relief.lu, Kontakt: ${CONTACT}.` },
        {
          heading: "2. Erhobene Daten",
          text: "E-Mail (Warteliste, Nutzerkonto), Inhalt Ihrer Reservierungen (Tüte, Menge, Abholcode), Ihre Favoriten, von Ihnen abgegebene Bewertungen. Für Geschäfte: Name des Geschäfts, ungefähre Position auf der Karte, Fotos der veröffentlichten Tüten. Bei aktivierten Benachrichtigungen wird eine technische Push-Abonnement-Kennung gespeichert (keine weiteren personenbezogenen Daten).",
        },
        {
          heading: "3. Zweck der Datenverarbeitung",
          text: "Ausschließlich zum Betrieb von Relief.lu: Konto erstellen, Ihre Reservierungen, Favoriten und Bewertungen anzeigen und verwalten, Sie über neue Tüten bei favorisierten Geschäften benachrichtigen.",
        },
        {
          heading: "4. Weitergabe an Dritte",
          text: "An die für den Betrieb notwendigen technischen Dienstleister: Supabase (Datenbank, Authentifizierung, Foto-Speicherung) sowie die Push-Benachrichtigungsdienste Ihres Browsers (je nach Fall Google, Mozilla oder Apple) für die technische Zustellung. Keine Daten werden verkauft oder zu Werbezwecken genutzt.",
        },
        { heading: "5. Speicherdauer", text: "Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Sie können jederzeit deren Löschung beantragen." },
        { heading: "6. Ihre Rechte", text: `Sie können jederzeit Auskunft, Berichtigung, Löschung oder Export Ihrer Daten verlangen, per E-Mail an ${CONTACT}.` },
        {
          heading: "7. Sicherheit",
          text: "Der Zugriff auf die Daten ist durch technische Regeln geschützt (jeder Nutzer sieht/ändert nur seine eigenen Reservierungen, Favoriten und Tüten); die Website wird über HTTPS ausgeliefert.",
        },
      ],
    },
    cgu: {
      title: "Allgemeine Nutzungsbedingungen",
      paragraphs: [
        "Dieses Dokument regelt die Nutzung von Relief.lu. Es handelt sich um einen für diese Art von Plattform verfassten Text, der vor einem umfangreichen Betrieb von einem Rechtsexperten geprüft werden sollte.",
        {
          heading: "1. Gegenstand",
          text: "Relief.lu bringt Geschäfte (Bäckereien, Restaurants, Lebensmittelgeschäfte, Caterer usw.), die überschüssige Lebensmittel zu reduzierten Preisen anbieten, mit Nutzer:innen zusammen, die diese reservieren und abholen möchten. Relief.lu ist weder Hersteller noch Verkäufer noch Käufer der angebotenen Produkte: Die Plattform stellt lediglich die Vermittlungs- und Reservierungswerkzeuge bereit.",
        },
        { heading: "2. Registrierung", text: "Die Registrierung erfolgt per E-Mail, ohne Passwort (Login-Link). Jeder Nutzer garantiert die Richtigkeit der angegebenen Informationen und ist für die Nutzung seines Kontos verantwortlich." },
        {
          heading: "3. Tüten und Reservierungen",
          text: "Das Geschäft ist allein verantwortlich für den Inhalt seiner Angebote (Beschreibung, Menge, Preis, Abholzeitraum) und garantiert, im Einklang mit den geltenden Hygiene- und Lebensmittelsicherheitsvorschriften zum Verkauf berechtigt zu sein. Der Nutzer verpflichtet sich, seine Reservierung im angegebenen Zeitfenster abzuholen; bei wiederholtem Nichtabholen behält sich Relief.lu das Recht vor, das betreffende Konto zu sperren.",
        },
        {
          heading: "4. Preis und Zahlung",
          text: "Der angezeigte Preis wird vom Geschäft frei festgelegt. Relief.lu wickelt derzeit keine Zahlungen ab: Diese erfolgen direkt zwischen Nutzer und Geschäft, vor Ort, bei der Abholung.",
        },
        {
          heading: "5. Haftung",
          text: "Relief.lu handelt als technischer Vermittler und ist nicht Vertragspartei des zwischen Geschäft und Nutzer geschlossenen Geschäfts. Relief.lu übernimmt keine Garantie für Qualität, Frische oder Unbedenklichkeit der angebotenen Produkte — diese Verantwortung liegt ausschließlich beim Geschäft, das allein zum Verkauf von Lebensmitteln gemäß geltendem Recht berechtigt ist.",
        },
        { heading: "6. Konto und Kündigung", text: "Jeder Nutzer kann die Nutzung von Relief.lu jederzeit durch Kontaktaufnahme beenden. Relief.lu behält sich das Recht vor, ein Konto bei missbräuchlicher, betrügerischer oder gegen diese Bedingungen verstoßender Nutzung zu sperren oder zu löschen." },
        { heading: "7. Änderung der Bedingungen", text: "Relief.lu kann diese Bedingungen jederzeit ändern; Nutzer werden über wesentliche Änderungen informiert." },
        { heading: "8. Anwendbares Recht", text: "Diese Bedingungen unterliegen luxemburgischem Recht. Streitigkeiten im Zusammenhang mit der Nutzung der Plattform unterliegen der Zuständigkeit der Gerichte des Großherzogtums Luxemburg, soweit zwingendes Recht nicht anderes vorsieht." },
        { heading: "9. Kontakt", text: `Bei Fragen: ${CONTACT}.` },
      ],
    },
    cookies: {
      title: "Cookies",
      paragraphs: [
        "Diese Website verwendet technisch notwendige Cookies und Speicher (Anmeldung aufrechterhalten, Sprache merken, Standort für die Sortierung nach Entfernung) — diese sind immer aktiv und erfordern keine Zustimmung, da sie für den Dienst unerlässlich sind.",
        "Mit Ihrer Zustimmung verwendet diese Website außerdem Cookies zur Reichweitenmessung (Google Analytics) und Werbung (Meta Pixel). Diese werden erst nach ausdrücklicher Zustimmung über das beim ersten Besuch angezeigte Banner gesetzt.",
        "Sie können Ihre Wahl jederzeit über den Link „Cookies verwalten” am Seitenende ändern.",
      ],
    },
  },
  en: {
    mentions: {
      title: "Legal notice",
      paragraphs: [
        "Publisher: Relief.lu — independent project based in Luxembourg, currently being incorporated as a company.",
        `Contact: ${CONTACT}`,
        "Company registration number: pending — these details will be completed once obtained.",
        "Website hosting: GitHub, Inc. (GitHub Pages).",
        "Database, authentication and storage: Supabase, Inc.",
      ],
    },
    confidentialite: {
      title: "Privacy policy",
      paragraphs: [
        "This policy explains what data Relief.lu collects, why, and how to have it corrected or deleted.",
        { heading: "1. Data controller", text: `Relief.lu, contact: ${CONTACT}.` },
        {
          heading: "2. Data collected",
          text: "Email (waitlist, user account), the content of your reservations (bag, quantity, pickup code), your favorites, the reviews you leave. For merchants: business name, approximate map position, photos of published bags. If you enable notifications, a technical push-subscription identifier is stored (no further personal information).",
        },
        {
          heading: "3. Why this data is collected",
          text: "Solely to operate Relief.lu: create your account, display and manage your reservations, favorites and reviews, and notify you of new bags from merchants you follow.",
        },
        {
          heading: "4. Who it is shared with",
          text: "With the technical providers necessary to operate the service: Supabase (database, authentication, photo storage), and your browser's push notification services (Google, Mozilla or Apple depending on the case) for technical delivery. No data is sold or used for advertising purposes.",
        },
        { heading: "5. Retention period", text: "Your data is kept as long as your account is active. You can request its deletion at any time." },
        { heading: "6. Your rights", text: `You can request access, correction, deletion or export of your data at any time by writing to ${CONTACT}.` },
        {
          heading: "7. Security",
          text: "Access to data is protected by technical rules (each user can only see/edit their own reservations, favorites and bags) and the site is served over HTTPS.",
        },
      ],
    },
    cgu: {
      title: "Terms of Service",
      paragraphs: [
        "This document governs the use of Relief.lu. It is a standard text written for this type of platform, to be validated by a legal professional before large-scale operation.",
        {
          heading: "1. Purpose",
          text: "Relief.lu connects merchants (bakeries, restaurants, grocery stores, caterers...) offering surplus food at a reduced price with users wishing to reserve and pick it up. Relief.lu is neither the producer, seller, nor buyer of the products offered: the platform only provides matchmaking and reservation tools.",
        },
        { heading: "2. Registration", text: "Registration is done by email, without a password (sign-in link). Each user guarantees the accuracy of the information provided and is responsible for the use of their account." },
        {
          heading: "3. Bags and reservations",
          text: "The merchant is solely responsible for the content of their listings (description, quantity, price, pickup window) and guarantees they are entitled to sell the food offered, in compliance with applicable hygiene and food safety regulations. The user agrees to collect their reservation within the indicated window; in case of repeated no-shows, Relief.lu reserves the right to suspend the account concerned.",
        },
        {
          heading: "4. Price and payment",
          text: "The displayed price is freely set by the merchant. At this stage, Relief.lu does not process any payment: this takes place directly between the user and the merchant, on site, at pickup.",
        },
        {
          heading: "5. Liability",
          text: "Relief.lu acts as a technical intermediary and is not a party to the transaction between the merchant and the user. Relief.lu does not guarantee the quality, freshness or safety of the products offered — this responsibility lies solely with the merchant, who alone is authorized to sell food in accordance with applicable regulations.",
        },
        { heading: "6. Account and termination", text: "Any user may stop using Relief.lu at any time by contacting us. Relief.lu reserves the right to suspend or delete an account in case of abusive, fraudulent use or use contrary to these terms." },
        { heading: "7. Changes to these terms", text: "Relief.lu may modify these terms at any time; users will be informed of significant changes." },
        { heading: "8. Applicable law", text: "These terms are governed by Luxembourg law. Any dispute relating to the use of the platform falls under the jurisdiction of the courts of the Grand Duchy of Luxembourg, unless mandatory legal provisions state otherwise." },
        { heading: "9. Contact", text: `For any question: ${CONTACT}.` },
      ],
    },
    cookies: {
      title: "Cookies",
      paragraphs: [
        "This site uses technical cookies and storage necessary for it to function (keeping you signed in, remembering your language, your position to sort by distance) — these are always active and require no consent, as they're essential to the service.",
        "With your consent, this site also uses audience-measurement (Google Analytics) and advertising (Meta Pixel) cookies. These are only set after explicit acceptance via the banner shown on your first visit.",
        "You can change your choice at any time via the \"Manage cookies\" link at the bottom of the page.",
      ],
    },
  },
};

export default function LegalModal({ type, onClose }) {
  const { lang, setLang } = useI18n();
  const content = (CONTENT[lang] || CONTENT.fr)[type];
  if (!content) return null;

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: "80vh", overflowY: "auto" }}>
        <button className="close" onClick={onClose}>
          ✕
        </button>
        {/* Le sélecteur de langue du header est caché derrière cette modale (overlay
            plein écran) et donc inatteignable — on en propose un ici, dans la modale. */}
        <div className="langs" style={{ display: "inline-flex", marginBottom: 14 }}>
          {["fr", "de", "en"].map((l) => (
            <button key={l} className={lang === l ? "active" : ""} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <h2>{content.title}</h2>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          {content.paragraphs.map((p, i) =>
            typeof p === "string" ? (
              <p key={i} className="desc">
                {p}
              </p>
            ) : (
              <div key={i} style={{ marginTop: 14 }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{p.heading}</p>
                {p.text && <p className="desc">{p.text}</p>}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
