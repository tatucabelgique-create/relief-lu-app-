import { useI18n } from "../lib/i18n.jsx";

const CONTACT = "relief-lu@outlook.com";
const COMPANY = "RELIEF.LU SARL-S";
const ADDRESS = "11, rue de l'Industrie, L-8399 Windhof, Luxembourg";

const CONTENT = {
  fr: {
    mentions: {
      title: "Mentions légales",
      paragraphs: [
        `Éditeur : ${COMPANY}, société à responsabilité limitée simplifiée (SARL-S) de droit luxembourgeois, en cours de constitution et d'établissement.`,
        `Siège social : ${ADDRESS}`,
        `Contact : ${CONTACT}`,
        "Numéro RCS / matricule : en cours d'immatriculation — ces mentions seront complétées dès leur obtention.",
        "Hébergement du site : GitHub, Inc. (GitHub Pages).",
        "Base de données, authentification et stockage : Supabase, Inc.",
        "Paiements en ligne : Stripe Payments Europe, Ltd. — relief.lu ne stocke aucune donnée de carte bancaire, celles-ci sont traitées exclusivement par Stripe.",
      ],
    },
    confidentialite: {
      title: "Politique de confidentialité",
      paragraphs: [
        "Cette politique explique quelles données Relief.lu collecte, pourquoi, et comment les faire corriger ou supprimer.",
        { heading: "1. Responsable du traitement", text: `${COMPANY} (SARL-S en cours de constitution et d'établissement), ${ADDRESS}, contact : ${CONTACT}.` },
        {
          heading: "2. Données collectées",
          text: "Email (liste d'attente, compte utilisateur), contenu de vos réservations (sachet, quantité, statut de paiement, code de retrait), vos favoris, les avis que vous laissez. Pour les commerçants : nom du commerce, adresse et position sur la carte, photos des sachets publiés, données de facturation liées aux ventes réalisées. Si vous activez les notifications, un identifiant technique d'abonnement push est stocké (aucune information personnelle supplémentaire). Les données de paiement (numéro de carte, etc.) ne transitent jamais par nos serveurs : elles sont saisies et traitées directement par Stripe.",
        },
        {
          heading: "3. Pourquoi ces données",
          text: "Uniquement pour faire fonctionner relief.lu : créer votre compte, traiter vos réservations et paiements, afficher et gérer vos favoris et avis, vous notifier des nouveaux sachets chez les commerçants suivis, et permettre aux commerçants de suivre leurs ventes et leur facturation.",
        },
        {
          heading: "4. Avec qui elles sont partagées",
          text: "Avec les prestataires techniques nécessaires au fonctionnement du service : Supabase (base de données, authentification, stockage des photos), Stripe (traitement des paiements en ligne), et les services de notification push de votre navigateur (Google, Mozilla ou Apple selon le cas) pour l'acheminement technique des notifications. Aucune donnée n'est vendue ni utilisée à des fins publicitaires en dehors du consentement donné via le bandeau cookies.",
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
        `Les présentes Conditions Générales d'Utilisation ("CGU") régissent l'accès et l'utilisation de la plateforme relief.lu, éditée par ${COMPANY} (SARL-S en cours de constitution et d'établissement), dont le siège social est situé ${ADDRESS}. Ce texte, rédigé pour ce type de plateforme, sera revu par un professionnel du droit avant une exploitation à grande échelle.`,
        {
          heading: "1. Objet et rôle de relief.lu",
          text: "relief.lu est une plateforme de mise en relation entre des commerçants (boulangeries, restaurants, épiceries, traiteurs, supermarchés...) disposant d'invendus alimentaires et des utilisateurs souhaitant les acquérir à prix réduit sous forme de \"sachets surprise\". relief.lu agit exclusivement en tant qu'intermédiaire technique : elle n'est ni producteur, ni vendeur, ni propriétaire des denrées proposées, et n'est partie à aucun moment au contrat de vente conclu directement entre le commerçant et l'utilisateur.",
        },
        {
          heading: "2. Inscription et compte",
          text: "L'inscription se fait par adresse email, sans mot de passe (lien de connexion à usage unique). Chaque utilisateur garantit l'exactitude des informations fournies, doit être en mesure de conclure un contrat au regard du droit applicable, et est seul responsable de l'utilisation de son compte et de la confidentialité de son accès.",
        },
        {
          heading: "3. Obligations du commerçant",
          text: "Le commerçant est seul responsable du contenu de ses annonces (description, quantité, prix, créneau de retrait, allergènes) et garantit être légalement habilité à vendre les denrées proposées, dans le respect intégral de la réglementation applicable en matière d'hygiène, de sécurité alimentaire et d'information du consommateur (notamment sur les allergènes). Le commerçant s'engage à honorer chaque réservation payée dans le créneau annoncé.",
        },
        {
          heading: "4. Réservation, paiement et commission",
          text: "La réservation d'un sachet donne lieu à un paiement immédiat en ligne, traité par notre prestataire de paiement Stripe (carte bancaire, Bancontact). Le prix affiché est fixé librement par le commerçant et payé intégralement par l'utilisateur au moment de la réservation ; aucun paiement en espèces ou sur place n'est requis. relief.lu perçoit une commission de service, prélevée sur le montant versé par le commerçant, dont le taux est communiqué à chaque commerçant partenaire lors de son inscription.",
        },
        {
          heading: "5. Annulation, non-disponibilité et remboursement",
          text: "En cas d'annulation avant retrait, d'indisponibilité du sachet ou d'échec du paiement, la réservation est automatiquement annulée et aucun montant n'est débité (ou celui-ci est intégralement remboursé si le débit avait déjà eu lieu). En cas de non-retrait par l'utilisateur dans le créneau indiqué sans annulation préalable, le sachet est considéré comme retiré et le montant payé n'est pas remboursé ; relief.lu se réserve le droit de suspendre le compte concerné en cas de non-retrait répété.",
        },
        {
          heading: "6. Retrait du sachet",
          text: "L'utilisateur récupère son sachet directement auprès du commerçant, dans le créneau indiqué lors de la réservation, en présentant le code de retrait affiché dans l'application. Le respect du créneau est essentiel au bon fonctionnement du service et à la gestion des stocks du commerçant.",
        },
        {
          heading: "7. Avis et évaluations",
          text: "Un utilisateur ayant effectivement retiré un sachet peut laisser un avis et une note sur le commerçant concerné. Les avis doivent refléter une expérience réelle et rester respectueux ; relief.lu se réserve le droit de retirer tout avis manifestement abusif, mensonger ou contraire à la loi.",
        },
        {
          heading: "8. Responsabilité",
          text: "relief.lu ne garantit pas la qualité, la fraîcheur, la composition exacte ou l'innocuité des produits proposés — cette responsabilité incombe exclusivement au commerçant. La responsabilité de relief.lu, en tant qu'intermédiaire technique, ne saurait être engagée au titre du contenu des annonces, de la qualité des produits ou de l'exécution de la transaction entre commerçant et utilisateur, sauf faute propre et directe de relief.lu dans le fonctionnement de la plateforme.",
        },
        {
          heading: "9. Propriété intellectuelle",
          text: "La marque relief.lu, le logo, le nom de domaine et l'ensemble des éléments graphiques et logiciels de la plateforme sont la propriété exclusive de relief.lu et ne peuvent être reproduits sans autorisation préalable.",
        },
        {
          heading: "10. Compte et résiliation",
          text: "Tout utilisateur peut cesser d'utiliser relief.lu à tout moment en nous contactant, avec suppression de son compte et de ses données conformément à la politique de confidentialité. relief.lu se réserve le droit de suspendre ou supprimer un compte, avec ou sans préavis selon la gravité, en cas d'usage abusif, frauduleux ou contraire aux présentes CGU.",
        },
        { heading: "11. Modification des CGU", text: "relief.lu peut modifier les présentes CGU à tout moment ; les utilisateurs seront informés des changements significatifs via l'application ou par email." },
        { heading: "12. Droit applicable et juridiction", text: "Les présentes CGU sont soumises au droit luxembourgeois. Tout litige relatif à l'utilisation de la plateforme relève des tribunaux compétents du Grand-Duché de Luxembourg, sauf disposition légale impérative contraire, notamment en matière de protection des consommateurs." },
        { heading: "13. Contact", text: `Pour toute question relative aux présentes CGU : ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
        `Herausgeber: ${COMPANY}, vereinfachte Gesellschaft mit beschränkter Haftung (SARL-S) luxemburgischen Rechts, in Gründung und Niederlassung.`,
        `Gesellschaftssitz: ${ADDRESS}`,
        `Kontakt: ${CONTACT}`,
        "Handelsregisternummer: wird derzeit beantragt — diese Angaben werden nach Erhalt ergänzt.",
        "Hosting der Website: GitHub, Inc. (GitHub Pages).",
        "Datenbank, Authentifizierung und Speicherung: Supabase, Inc.",
        "Online-Zahlungen: Stripe Payments Europe, Ltd. — relief.lu speichert keine Kreditkartendaten, diese werden ausschließlich von Stripe verarbeitet.",
      ],
    },
    confidentialite: {
      title: "Datenschutzerklärung",
      paragraphs: [
        "Diese Erklärung beschreibt, welche Daten Relief.lu erhebt, warum, und wie Sie diese berichtigen oder löschen lassen können.",
        { heading: "1. Verantwortlicher", text: `${COMPANY} (SARL-S in Gründung und Niederlassung), ${ADDRESS}, Kontakt: ${CONTACT}.` },
        {
          heading: "2. Erhobene Daten",
          text: "E-Mail (Warteliste, Nutzerkonto), Inhalt Ihrer Reservierungen (Tüte, Menge, Zahlungsstatus, Abholcode), Ihre Favoriten, von Ihnen abgegebene Bewertungen. Für Geschäfte: Name und Adresse des Geschäfts, Position auf der Karte, Fotos der veröffentlichten Tüten, Abrechnungsdaten zu den getätigten Verkäufen. Bei aktivierten Benachrichtigungen wird eine technische Push-Abonnement-Kennung gespeichert (keine weiteren personenbezogenen Daten). Zahlungsdaten (Kartennummer usw.) laufen niemals über unsere Server: sie werden ausschließlich von Stripe erfasst und verarbeitet.",
        },
        {
          heading: "3. Zweck der Datenverarbeitung",
          text: "Ausschließlich zum Betrieb von relief.lu: Konto erstellen, Reservierungen und Zahlungen abwickeln, Ihre Favoriten und Bewertungen anzeigen und verwalten, Sie über neue Tüten bei favorisierten Geschäften benachrichtigen, und Geschäften die Nachverfolgung ihrer Verkäufe und Abrechnungen ermöglichen.",
        },
        {
          heading: "4. Weitergabe an Dritte",
          text: "An die für den Betrieb notwendigen technischen Dienstleister: Supabase (Datenbank, Authentifizierung, Foto-Speicherung), Stripe (Abwicklung von Online-Zahlungen) sowie die Push-Benachrichtigungsdienste Ihres Browsers (je nach Fall Google, Mozilla oder Apple) für die technische Zustellung. Keine Daten werden verkauft oder außerhalb der über das Cookie-Banner erteilten Einwilligung zu Werbezwecken genutzt.",
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
        `Diese Allgemeinen Nutzungsbedingungen ("AGB") regeln den Zugang zur und die Nutzung der Plattform relief.lu, herausgegeben von ${COMPANY} (SARL-S in Gründung und Niederlassung) mit Sitz ${ADDRESS}. Dieser Text wird vor einem umfangreichen Betrieb von einem Rechtsexperten geprüft.`,
        {
          heading: "1. Gegenstand und Rolle von relief.lu",
          text: "relief.lu ist eine Vermittlungsplattform zwischen Geschäften (Bäckereien, Restaurants, Lebensmittelgeschäfte, Caterer, Supermärkte usw.) mit überschüssigen Lebensmitteln und Nutzer:innen, die diese zu reduzierten Preisen als \"Überraschungstüte\" erwerben möchten. relief.lu handelt ausschließlich als technischer Vermittler: sie ist weder Hersteller noch Verkäufer noch Eigentümer der angebotenen Waren und zu keinem Zeitpunkt Vertragspartei des Kaufvertrags zwischen Geschäft und Nutzer.",
        },
        { heading: "2. Registrierung und Konto", text: "Die Registrierung erfolgt per E-Mail, ohne Passwort (einmaliger Login-Link). Jede:r Nutzer:in garantiert die Richtigkeit der angegebenen Informationen, muss vertragsfähig sein und ist allein für die Nutzung seines Kontos und die Vertraulichkeit seines Zugangs verantwortlich." },
        {
          heading: "3. Pflichten des Geschäfts",
          text: "Das Geschäft ist allein verantwortlich für den Inhalt seiner Angebote (Beschreibung, Menge, Preis, Abholzeitraum, Allergene) und garantiert, im vollen Einklang mit den geltenden Hygiene-, Lebensmittelsicherheits- und Verbraucherinformationsvorschriften (insbesondere zu Allergenen) zum Verkauf berechtigt zu sein. Das Geschäft verpflichtet sich, jede bezahlte Reservierung im angekündigten Zeitfenster zu erfüllen.",
        },
        {
          heading: "4. Reservierung, Zahlung und Provision",
          text: "Die Reservierung einer Tüte erfordert eine sofortige Online-Zahlung, abgewickelt über unseren Zahlungsdienstleister Stripe (Kreditkarte, Bancontact). Der angezeigte Preis wird vom Geschäft frei festgelegt und vollständig vom Nutzer bei der Reservierung bezahlt; keine Barzahlung oder Zahlung vor Ort ist erforderlich. relief.lu erhebt eine Servicegebühr, die vom an das Geschäft ausgezahlten Betrag abgezogen wird; der Satz wird jedem Partnergeschäft bei der Registrierung mitgeteilt.",
        },
        {
          heading: "5. Stornierung, Nichtverfügbarkeit und Erstattung",
          text: "Bei Stornierung vor Abholung, Nichtverfügbarkeit der Tüte oder fehlgeschlagener Zahlung wird die Reservierung automatisch storniert und kein Betrag abgebucht (bzw. vollständig erstattet, falls bereits abgebucht). Bei Nichtabholung durch den Nutzer im angegebenen Zeitfenster ohne vorherige Stornierung gilt die Tüte als abgeholt, der gezahlte Betrag wird nicht erstattet; relief.lu behält sich bei wiederholter Nichtabholung das Recht vor, das betreffende Konto zu sperren.",
        },
        {
          heading: "6. Abholung der Tüte",
          text: "Der Nutzer holt seine Tüte direkt beim Geschäft ab, im bei der Reservierung angegebenen Zeitfenster, unter Vorlage des in der App angezeigten Abholcodes. Die Einhaltung des Zeitfensters ist wesentlich für das reibungslose Funktionieren des Dienstes und die Lagerplanung des Geschäfts.",
        },
        {
          heading: "7. Bewertungen",
          text: "Ein:e Nutzer:in, die eine Tüte tatsächlich abgeholt hat, kann eine Bewertung des betreffenden Geschäfts abgeben. Bewertungen müssen eine reale Erfahrung widerspiegeln und respektvoll bleiben; relief.lu behält sich das Recht vor, offensichtlich missbräuchliche, falsche oder rechtswidrige Bewertungen zu entfernen.",
        },
        {
          heading: "8. Haftung",
          text: "relief.lu übernimmt keine Garantie für Qualität, Frische, genaue Zusammensetzung oder Unbedenklichkeit der angebotenen Produkte — diese Verantwortung liegt ausschließlich beim Geschäft. Die Haftung von relief.lu als technischem Vermittler ist ausgeschlossen für Inhalt der Angebote, Produktqualität oder Durchführung der Transaktion zwischen Geschäft und Nutzer, außer bei eigenem, unmittelbarem Verschulden von relief.lu beim Betrieb der Plattform.",
        },
        {
          heading: "9. Geistiges Eigentum",
          text: "Die Marke relief.lu, das Logo, die Domain und sämtliche grafischen und softwaretechnischen Elemente der Plattform sind ausschließliches Eigentum von relief.lu und dürfen ohne vorherige Genehmigung nicht reproduziert werden.",
        },
        {
          heading: "10. Konto und Kündigung",
          text: "Jede:r Nutzer:in kann die Nutzung von relief.lu jederzeit durch Kontaktaufnahme beenden, mit Löschung von Konto und Daten gemäß der Datenschutzerklärung. relief.lu behält sich das Recht vor, ein Konto je nach Schwere mit oder ohne Vorankündigung bei missbräuchlicher, betrügerischer oder gegen diese AGB verstoßender Nutzung zu sperren oder zu löschen.",
        },
        { heading: "11. Änderung der AGB", text: "relief.lu kann diese AGB jederzeit ändern; Nutzer werden über wesentliche Änderungen über die App oder per E-Mail informiert." },
        { heading: "12. Anwendbares Recht und Gerichtsstand", text: "Diese AGB unterliegen luxemburgischem Recht. Streitigkeiten im Zusammenhang mit der Nutzung der Plattform unterliegen der Zuständigkeit der Gerichte des Großherzogtums Luxemburg, soweit zwingendes Recht — insbesondere zum Verbraucherschutz — nicht anderes vorsieht." },
        { heading: "13. Kontakt", text: `Bei Fragen zu diesen AGB: ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
        `Publisher: ${COMPANY}, a simplified private limited company (SARL-S) under Luxembourg law, currently being incorporated and established.`,
        `Registered office: ${ADDRESS}`,
        `Contact: ${CONTACT}`,
        "Company registration number: pending — these details will be completed once obtained.",
        "Website hosting: GitHub, Inc. (GitHub Pages).",
        "Database, authentication and storage: Supabase, Inc.",
        "Online payments: Stripe Payments Europe, Ltd. — relief.lu never stores card data, which is processed exclusively by Stripe.",
      ],
    },
    confidentialite: {
      title: "Privacy policy",
      paragraphs: [
        "This policy explains what data Relief.lu collects, why, and how to have it corrected or deleted.",
        { heading: "1. Data controller", text: `${COMPANY} (SARL-S being incorporated and established), ${ADDRESS}, contact: ${CONTACT}.` },
        {
          heading: "2. Data collected",
          text: "Email (waitlist, user account), the content of your reservations (bag, quantity, payment status, pickup code), your favorites, the reviews you leave. For merchants: business name and address, map position, photos of published bags, billing data related to completed sales. If you enable notifications, a technical push-subscription identifier is stored (no further personal information). Payment data (card number, etc.) never passes through our servers: it is captured and processed exclusively by Stripe.",
        },
        {
          heading: "3. Why this data is collected",
          text: "Solely to operate relief.lu: create your account, process reservations and payments, display and manage your favorites and reviews, notify you of new bags from merchants you follow, and let merchants track their sales and billing.",
        },
        {
          heading: "4. Who it is shared with",
          text: "With the technical providers necessary to operate the service: Supabase (database, authentication, photo storage), Stripe (online payment processing), and your browser's push notification services (Google, Mozilla or Apple depending on the case) for technical delivery. No data is sold or used for advertising purposes beyond the consent given via the cookie banner.",
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
        `These Terms of Service ("Terms") govern access to and use of the relief.lu platform, published by ${COMPANY} (SARL-S being incorporated and established), with registered office at ${ADDRESS}. This text, written for this type of platform, will be reviewed by a legal professional before large-scale operation.`,
        {
          heading: "1. Purpose and role of relief.lu",
          text: "relief.lu is a matchmaking platform between merchants (bakeries, restaurants, grocery stores, caterers, supermarkets...) with surplus food and users wishing to buy it at a reduced price as a \"surprise bag\". relief.lu acts exclusively as a technical intermediary: it is neither the producer, seller, nor owner of the food offered, and is never a party to the sale contract concluded directly between the merchant and the user.",
        },
        { heading: "2. Registration and account", text: "Registration is done by email, without a password (single-use sign-in link). Each user guarantees the accuracy of the information provided, must be able to enter into a contract under applicable law, and is solely responsible for the use of their account and the confidentiality of their access." },
        {
          heading: "3. Merchant obligations",
          text: "The merchant is solely responsible for the content of their listings (description, quantity, price, pickup window, allergens) and guarantees they are legally entitled to sell the food offered, in full compliance with applicable hygiene, food safety and consumer information regulations (notably on allergens). The merchant agrees to honor every paid reservation within the announced window.",
        },
        {
          heading: "4. Reservation, payment and commission",
          text: "Reserving a bag requires immediate online payment, processed by our payment provider Stripe (card, Bancontact). The displayed price is freely set by the merchant and paid in full by the user at the time of reservation; no cash or on-site payment is required. relief.lu charges a service commission, deducted from the amount paid out to the merchant, at a rate communicated to each partner merchant upon registration.",
        },
        {
          heading: "5. Cancellation, unavailability and refunds",
          text: "In case of cancellation before pickup, bag unavailability, or payment failure, the reservation is automatically cancelled and no amount is charged (or fully refunded if already charged). If the user fails to collect their reservation within the indicated window without prior cancellation, the bag is considered collected and the amount paid is not refunded; relief.lu reserves the right to suspend the account concerned in case of repeated no-shows.",
        },
        {
          heading: "6. Bag pickup",
          text: "The user collects their bag directly from the merchant, within the window indicated at reservation, by presenting the pickup code shown in the app. Respecting the time window is essential to the smooth operation of the service and the merchant's stock management.",
        },
        {
          heading: "7. Reviews and ratings",
          text: "A user who has actually collected a bag may leave a review and rating for the merchant concerned. Reviews must reflect a genuine experience and remain respectful; relief.lu reserves the right to remove any review that is clearly abusive, false, or unlawful.",
        },
        {
          heading: "8. Liability",
          text: "relief.lu does not guarantee the quality, freshness, exact composition, or safety of the products offered — this responsibility lies solely with the merchant. relief.lu's liability, as a technical intermediary, cannot be engaged for the content of listings, product quality, or the execution of the transaction between merchant and user, except for relief.lu's own direct fault in the operation of the platform.",
        },
        {
          heading: "9. Intellectual property",
          text: "The relief.lu brand, logo, domain name, and all graphic and software elements of the platform are the exclusive property of relief.lu and may not be reproduced without prior authorization.",
        },
        {
          heading: "10. Account and termination",
          text: "Any user may stop using relief.lu at any time by contacting us, with deletion of their account and data in accordance with the privacy policy. relief.lu reserves the right to suspend or delete an account, with or without notice depending on severity, in case of abusive, fraudulent use or use contrary to these Terms.",
        },
        { heading: "11. Changes to these Terms", text: "relief.lu may modify these Terms at any time; users will be informed of significant changes via the app or by email." },
        { heading: "12. Applicable law and jurisdiction", text: "These Terms are governed by Luxembourg law. Any dispute relating to the use of the platform falls under the jurisdiction of the courts of the Grand Duchy of Luxembourg, unless mandatory legal provisions state otherwise, notably regarding consumer protection." },
        { heading: "13. Contact", text: `For any question regarding these Terms: ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
