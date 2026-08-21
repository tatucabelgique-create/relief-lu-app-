import { useI18n } from "../lib/i18n.jsx";

const CONTACT = "relief-lu@outlook.com";
const COMPANY = "RELIEF.LU SARL-S";
const ADDRESS = "11, rue de l'Industrie, L-8399 Windhof, Luxembourg";

const CONTENT = {
  fr: {
    mentions: {
      title: "Mentions légales",
      paragraphs: [
        `Éditeur : ${COMPANY}, société à responsabilité limitée simplifiée (SARL-S) de droit luxembourgeois, en cours de constitution.`,
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
        { heading: "1. Responsable du traitement", text: `${COMPANY} (SARL-S en cours de constitution), ${ADDRESS}, contact : ${CONTACT}.` },
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
    cguClients: {
      title: "Conditions Générales d'Utilisation — Clients",
      paragraphs: [
        `Les présentes Conditions Générales d'Utilisation ("CGU Clients") régissent l'utilisation de la plateforme relief.lu par les utilisateurs souhaitant réserver des sachets, éditée par ${COMPANY} (SARL-S en cours de constitution), dont le siège social est situé ${ADDRESS}. Les commerçants sont soumis à des conditions distinctes (voir les CGU Commerçants). Ce texte, rédigé pour ce type de plateforme, sera revu par un professionnel du droit avant une exploitation à grande échelle.`,
        {
          heading: "1. Objet et rôle de relief.lu",
          text: "relief.lu est une plateforme de mise en relation entre des commerçants (boulangeries, restaurants, épiceries, traiteurs, supermarchés...) disposant d'invendus alimentaires et des utilisateurs souhaitant les acquérir à prix réduit sous forme de \"sachets surprise\". relief.lu agit exclusivement en tant qu'intermédiaire technique : elle n'est ni producteur, ni vendeur, ni propriétaire des denrées proposées, et n'est partie à aucun moment au contrat de vente conclu directement entre le commerçant et l'utilisateur.",
        },
        {
          heading: "2. Inscription et compte",
          text: "L'inscription se fait par adresse email, sans mot de passe (lien de connexion à usage unique). Chaque utilisateur garantit l'exactitude des informations fournies, doit être en mesure de conclure un contrat au regard du droit applicable, et est seul responsable de l'utilisation de son compte et de la confidentialité de son accès.",
        },
        {
          heading: "3. Réservation et paiement",
          text: "La réservation d'un sachet donne lieu à un paiement immédiat et intégral en ligne, traité par notre prestataire de paiement Stripe (carte bancaire, Bancontact). Le prix affiché est fixé librement par le commerçant ; aucun paiement en espèces ou sur place n'est requis ou accepté.",
        },
        {
          heading: "4. Absence de droit de rétractation légal",
          text: "Conformément à la réglementation européenne relative aux droits des consommateurs (denrées susceptibles de se détériorer ou de se périmer rapidement), le droit de rétractation de 14 jours applicable aux achats en ligne ne s'applique pas aux sachets réservés sur relief.lu. La faculté d'annulation avant retrait décrite à l'article suivant est une facilité propre à relief.lu, distincte de ce droit légal.",
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
          heading: "9. Réclamations et résolution des litiges",
          text: "Pour toute réclamation, contactez-nous d'abord directement à l'adresse ci-dessous. Conformément au règlement européen relatif au règlement en ligne des litiges de consommation, vous pouvez également recourir à la plateforme européenne de résolution des litiges en ligne (ODR), accessible à l'adresse ec.europa.eu/consumers/odr.",
        },
        {
          heading: "10. Compte et résiliation",
          text: "Tout utilisateur peut cesser d'utiliser relief.lu à tout moment en nous contactant, avec suppression de son compte et de ses données conformément à la politique de confidentialité. relief.lu se réserve le droit de suspendre ou supprimer un compte, avec ou sans préavis selon la gravité, en cas d'usage abusif, frauduleux ou contraire aux présentes CGU.",
        },
        {
          heading: "11. Propriété intellectuelle",
          text: "La marque relief.lu, le logo, le nom de domaine et l'ensemble des éléments graphiques et logiciels de la plateforme sont la propriété exclusive de relief.lu et ne peuvent être reproduits sans autorisation préalable.",
        },
        { heading: "12. Modification des CGU", text: "relief.lu peut modifier les présentes CGU à tout moment ; les utilisateurs seront informés des changements significatifs via l'application ou par email." },
        { heading: "13. Droit applicable et juridiction", text: "Les présentes CGU sont soumises au droit luxembourgeois. Tout litige relatif à l'utilisation de la plateforme relève des tribunaux compétents du Grand-Duché de Luxembourg, sauf disposition légale impérative contraire, notamment en matière de protection des consommateurs." },
        { heading: "14. Contact", text: `Pour toute question relative aux présentes CGU : ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
      ],
    },
    cguCommercants: {
      title: "Conditions Générales d'Utilisation — Commerçants",
      paragraphs: [
        `Les présentes Conditions Générales d'Utilisation ("CGU Commerçants") régissent l'inscription et l'utilisation de la plateforme relief.lu par les commerçants souhaitant y publier des sachets, éditées par ${COMPANY} (SARL-S en cours de constitution), dont le siège social est situé ${ADDRESS}. Les clients sont soumis à des conditions distinctes (voir les CGU Clients). Ce texte, rédigé pour ce type de plateforme, sera revu par un professionnel du droit avant une exploitation à grande échelle.`,
        {
          heading: "1. Objet et rôle de relief.lu",
          text: "relief.lu est une plateforme de mise en relation entre des commerçants disposant d'invendus alimentaires et des utilisateurs souhaitant les acquérir à prix réduit sous forme de \"sachets surprise\". relief.lu agit exclusivement en tant qu'intermédiaire technique : elle n'est ni acheteur, ni revendeur, ni propriétaire des denrées proposées, et n'est partie à aucun moment au contrat de vente conclu directement entre le commerçant et l'utilisateur.",
        },
        {
          heading: "2. Inscription, vérification et activation du compte",
          text: "L'inscription du commerçant nécessite la fourniture d'informations exactes (nom du commerce, adresse, contact, numéro d'immatriculation le cas échéant). La publication de sachets n'est activée qu'après vérification manuelle de ces informations par relief.lu, destinée à s'assurer que le compte correspond à un commerce réel et légitime. relief.lu peut refuser ou différer une activation sans avoir à en justifier le motif.",
        },
        {
          heading: "3. Obligations du commerçant",
          text: "Le commerçant est seul responsable du contenu de ses annonces (description, quantité, prix, créneau de retrait) et garantit être légalement habilité à vendre les denrées proposées, dans le respect intégral de la réglementation applicable en matière d'hygiène et de sécurité alimentaire. Il s'engage notamment à indiquer, lorsque la réglementation européenne relative à l'information des consommateurs sur les denrées alimentaires l'exige, la présence des substances allergènes à déclaration obligatoire. Le commerçant s'engage à honorer chaque réservation payée dans le créneau annoncé.",
        },
        {
          heading: "4. Non-exclusivité",
          text: "L'inscription sur relief.lu n'est assortie d'aucune exclusivité : le commerçant reste libre de proposer ses invendus, simultanément, sur d'autres plateformes ou par tout autre moyen de son choix.",
        },
        {
          heading: "5. Prix, réservation et paiement",
          text: "Le prix de chaque sachet est fixé librement par le commerçant. Le paiement est réalisé intégralement par l'utilisateur au moment de la réservation, via notre prestataire Stripe ; le commerçant n'a aucun encaissement à gérer en caisse pour les ventes réalisées sur la plateforme.",
        },
        {
          heading: "6. Commission et versement des fonds",
          text: "relief.lu perçoit le paiement du client pour le compte du commerçant et prélève une commission de service, dont le taux est communiqué à chaque commerçant lors de son inscription. Le solde dû au commerçant lui est reversé selon la périodicité et les modalités convenues à l'inscription (notamment par virement bancaire) ; ces modalités peuvent faire l'objet d'un accord commercial individuel complémentaire.",
        },
        {
          heading: "7. Fiscalité et obligations comptables",
          text: "Le commerçant demeure seul responsable de la déclaration et du paiement de la TVA et de toute autre taxe applicable à ses ventes réalisées via relief.lu, ainsi que de leur enregistrement comptable. relief.lu n'agit pas en tant que représentant fiscal du commerçant.",
        },
        {
          heading: "8. Contenus fournis par le commerçant",
          text: "Le commerçant garantit détenir les droits nécessaires sur les noms, logos, descriptions et photographies qu'il met en ligne, et accorde à relief.lu une licence non exclusive d'utilisation de ces contenus, limitée à l'affichage sur la plateforme et à des fins de promotion de son activité de commerçant partenaire, révocable à la fermeture de son compte.",
        },
        {
          heading: "9. Annulation ou non-respect d'une réservation par le commerçant",
          text: "Si un sachet réservé et payé ne peut être fourni (annulation par le commerçant, indisponibilité), le client est intégralement remboursé. relief.lu se réserve le droit de suspendre ou résilier le compte d'un commerçant en cas de manquements répétés à ses engagements.",
        },
        {
          heading: "10. Avis clients",
          text: "Les utilisateurs ayant retiré un sachet peuvent laisser un avis public sur le commerçant. relief.lu ne modère ces avis que s'ils sont manifestement abusifs, mensongers ou contraires à la loi ; elle n'intervient pas dans les avis reflétant une expérience réelle, même négative.",
        },
        {
          heading: "11. Responsabilité",
          text: "Le commerçant est seul responsable de la qualité, de la fraîcheur, de la composition exacte et de l'innocuité des produits qu'il propose, ainsi que du respect de la réglementation applicable. La responsabilité de relief.lu, en tant qu'intermédiaire technique, ne saurait être engagée à ce titre, sauf faute propre et directe de relief.lu dans le fonctionnement de la plateforme.",
        },
        {
          heading: "12. Suspension et résiliation du compte commerçant",
          text: "Le commerçant peut cesser d'utiliser relief.lu à tout moment en nous contactant. relief.lu se réserve le droit de suspendre ou supprimer un compte commerçant, avec ou sans préavis selon la gravité, notamment en cas de manquement aux règles d'hygiène et de sécurité alimentaire, de non-respect répété des réservations, ou d'usage frauduleux de la plateforme.",
        },
        {
          heading: "13. Propriété intellectuelle",
          text: "La marque relief.lu, le logo, le nom de domaine et l'ensemble des éléments graphiques et logiciels de la plateforme sont la propriété exclusive de relief.lu et ne peuvent être reproduits sans autorisation préalable.",
        },
        { heading: "14. Modification des CGU", text: "relief.lu peut modifier les présentes CGU à tout moment ; les commerçants seront informés des changements significatifs via l'application ou par email." },
        { heading: "15. Droit applicable et juridiction", text: "Les présentes CGU sont soumises au droit luxembourgeois. Tout litige relatif à l'utilisation de la plateforme relève des tribunaux compétents du Grand-Duché de Luxembourg." },
        { heading: "16. Contact", text: `Pour toute question relative aux présentes CGU : ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
        `Herausgeber: ${COMPANY}, vereinfachte Gesellschaft mit beschränkter Haftung (SARL-S) luxemburgischen Rechts, in Gründung.`,
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
        { heading: "1. Verantwortlicher", text: `${COMPANY} (SARL-S in Gründung), ${ADDRESS}, Kontakt: ${CONTACT}.` },
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
    cguClients: {
      title: "Allgemeine Nutzungsbedingungen — Kund:innen",
      paragraphs: [
        `Diese Allgemeinen Nutzungsbedingungen ("AGB Kund:innen") regeln die Nutzung der Plattform relief.lu durch Nutzer:innen, die Tüten reservieren möchten, herausgegeben von ${COMPANY} (SARL-S in Gründung) mit Sitz ${ADDRESS}. Für Geschäfte gelten gesonderte Bedingungen (siehe AGB Geschäfte). Dieser Text wird vor einem umfangreichen Betrieb von einem Rechtsexperten geprüft.`,
        {
          heading: "1. Gegenstand und Rolle von relief.lu",
          text: "relief.lu ist eine Vermittlungsplattform zwischen Geschäften (Bäckereien, Restaurants, Lebensmittelgeschäfte, Caterer, Supermärkte usw.) mit überschüssigen Lebensmitteln und Nutzer:innen, die diese zu reduzierten Preisen als \"Überraschungstüte\" erwerben möchten. relief.lu handelt ausschließlich als technischer Vermittler: sie ist weder Hersteller noch Verkäufer noch Eigentümer der angebotenen Waren und zu keinem Zeitpunkt Vertragspartei des Kaufvertrags zwischen Geschäft und Nutzer.",
        },
        { heading: "2. Registrierung und Konto", text: "Die Registrierung erfolgt per E-Mail, ohne Passwort (einmaliger Login-Link). Jede:r Nutzer:in garantiert die Richtigkeit der angegebenen Informationen, muss vertragsfähig sein und ist allein für die Nutzung seines Kontos und die Vertraulichkeit seines Zugangs verantwortlich." },
        {
          heading: "3. Reservierung und Zahlung",
          text: "Die Reservierung einer Tüte erfordert eine sofortige und vollständige Online-Zahlung, abgewickelt über unseren Zahlungsdienstleister Stripe (Kreditkarte, Bancontact). Der angezeigte Preis wird vom Geschäft frei festgelegt; keine Barzahlung oder Zahlung vor Ort ist erforderlich oder wird akzeptiert.",
        },
        {
          heading: "4. Kein gesetzliches Widerrufsrecht",
          text: "Gemäß den europäischen Verbraucherschutzvorschriften (Waren, die schnell verderben oder deren Verfallsdatum schnell überschritten wird) gilt das bei Online-Käufen übliche 14-tägige Widerrufsrecht nicht für über relief.lu reservierte Tüten. Die im folgenden Artikel beschriebene Stornierungsmöglichkeit vor Abholung ist eine eigene Kulanzregelung von relief.lu, unabhängig von diesem gesetzlichen Recht.",
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
          heading: "9. Beschwerden und Streitbeilegung",
          text: "Bei Beschwerden kontaktieren Sie uns bitte zunächst direkt über die unten stehende Adresse. Gemäß der europäischen Verordnung über die Online-Streitbeilegung in Verbraucherangelegenheiten können Sie zudem die europäische Plattform zur Online-Streitbeilegung (OS-Plattform) unter ec.europa.eu/consumers/odr nutzen.",
        },
        {
          heading: "10. Konto und Kündigung",
          text: "Jede:r Nutzer:in kann die Nutzung von relief.lu jederzeit durch Kontaktaufnahme beenden, mit Löschung von Konto und Daten gemäß der Datenschutzerklärung. relief.lu behält sich das Recht vor, ein Konto je nach Schwere mit oder ohne Vorankündigung bei missbräuchlicher, betrügerischer oder gegen diese AGB verstoßender Nutzung zu sperren oder zu löschen.",
        },
        {
          heading: "11. Geistiges Eigentum",
          text: "Die Marke relief.lu, das Logo, die Domain und sämtliche grafischen und softwaretechnischen Elemente der Plattform sind ausschließliches Eigentum von relief.lu und dürfen ohne vorherige Genehmigung nicht reproduziert werden.",
        },
        { heading: "12. Änderung der AGB", text: "relief.lu kann diese AGB jederzeit ändern; Nutzer werden über wesentliche Änderungen über die App oder per E-Mail informiert." },
        { heading: "13. Anwendbares Recht und Gerichtsstand", text: "Diese AGB unterliegen luxemburgischem Recht. Streitigkeiten im Zusammenhang mit der Nutzung der Plattform unterliegen der Zuständigkeit der Gerichte des Großherzogtums Luxemburg, soweit zwingendes Recht — insbesondere zum Verbraucherschutz — nicht anderes vorsieht." },
        { heading: "14. Kontakt", text: `Bei Fragen zu diesen AGB: ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
      ],
    },
    cguCommercants: {
      title: "Allgemeine Nutzungsbedingungen — Geschäfte",
      paragraphs: [
        `Diese Allgemeinen Nutzungsbedingungen ("AGB Geschäfte") regeln die Registrierung und Nutzung der Plattform relief.lu durch Geschäfte, die dort Tüten veröffentlichen möchten, herausgegeben von ${COMPANY} (SARL-S in Gründung) mit Sitz ${ADDRESS}. Für Kund:innen gelten gesonderte Bedingungen (siehe AGB Kund:innen). Dieser Text wird vor einem umfangreichen Betrieb von einem Rechtsexperten geprüft.`,
        {
          heading: "1. Gegenstand und Rolle von relief.lu",
          text: "relief.lu ist eine Vermittlungsplattform zwischen Geschäften mit überschüssigen Lebensmitteln und Nutzer:innen, die diese zu reduzierten Preisen als \"Überraschungstüte\" erwerben möchten. relief.lu handelt ausschließlich als technischer Vermittler: sie ist weder Käufer noch Wiederverkäufer noch Eigentümer der angebotenen Waren und zu keinem Zeitpunkt Vertragspartei des Kaufvertrags zwischen Geschäft und Nutzer.",
        },
        {
          heading: "2. Registrierung, Prüfung und Aktivierung des Kontos",
          text: "Die Registrierung als Geschäft erfordert korrekte Angaben (Name, Adresse, Kontakt, ggf. Handelsregisternummer). Die Veröffentlichung von Tüten wird erst nach manueller Prüfung dieser Angaben durch relief.lu freigeschaltet, um sicherzustellen, dass es sich um ein reales, legitimes Geschäft handelt. relief.lu kann eine Freischaltung ohne Angabe von Gründen ablehnen oder verzögern.",
        },
        {
          heading: "3. Pflichten des Geschäfts",
          text: "Das Geschäft ist allein verantwortlich für den Inhalt seiner Angebote (Beschreibung, Menge, Preis, Abholzeitraum) und garantiert, im vollen Einklang mit den geltenden Hygiene- und Lebensmittelsicherheitsvorschriften zum Verkauf berechtigt zu sein. Es verpflichtet sich insbesondere, gemäß der europäischen Verordnung zur Information der Verbraucher über Lebensmittel die kennzeichnungspflichtigen Allergene anzugeben, sofern erforderlich. Das Geschäft verpflichtet sich, jede bezahlte Reservierung im angekündigten Zeitfenster zu erfüllen.",
        },
        {
          heading: "4. Keine Exklusivität",
          text: "Die Registrierung bei relief.lu ist an keine Exklusivität geknüpft: Das Geschäft kann seine überschüssigen Lebensmittel weiterhin gleichzeitig über andere Plattformen oder auf andere Weise anbieten.",
        },
        {
          heading: "5. Preis, Reservierung und Zahlung",
          text: "Der Preis jeder Tüte wird vom Geschäft frei festgelegt. Die Zahlung erfolgt vollständig durch den Nutzer bei der Reservierung über unseren Dienstleister Stripe; das Geschäft muss für über die Plattform getätigte Verkäufe keine eigene Kassenabwicklung vornehmen.",
        },
        {
          heading: "6. Provision und Auszahlung",
          text: "relief.lu vereinnahmt die Zahlung des Kunden im Namen des Geschäfts und erhebt eine Servicegebühr, deren Satz jedem Geschäft bei der Registrierung mitgeteilt wird. Der dem Geschäft zustehende Restbetrag wird gemäß der bei der Registrierung vereinbarten Periodizität und Modalitäten ausgezahlt (insbesondere per Banküberweisung); diese Modalitäten können Gegenstand einer zusätzlichen individuellen Geschäftsvereinbarung sein.",
        },
        {
          heading: "7. Steuern und buchhalterische Pflichten",
          text: "Das Geschäft bleibt allein verantwortlich für die Meldung und Zahlung der Mehrwertsteuer und aller weiteren auf seine über relief.lu getätigten Verkäufe anwendbaren Abgaben sowie deren buchhalterische Erfassung. relief.lu handelt nicht als steuerlicher Vertreter des Geschäfts.",
        },
        {
          heading: "8. Vom Geschäft bereitgestellte Inhalte",
          text: "Das Geschäft garantiert, über die erforderlichen Rechte an den von ihm veröffentlichten Namen, Logos, Beschreibungen und Fotografien zu verfügen, und räumt relief.lu eine nicht ausschließliche Nutzungslizenz für diese Inhalte ein, beschränkt auf die Anzeige auf der Plattform und die Bewerbung seiner Tätigkeit als Partnergeschäft, widerruflich bei Schließung seines Kontos.",
        },
        {
          heading: "9. Stornierung oder Nichteinhaltung einer Reservierung durch das Geschäft",
          text: "Kann eine reservierte und bezahlte Tüte nicht bereitgestellt werden (Stornierung durch das Geschäft, Nichtverfügbarkeit), wird der Kunde vollständig erstattet. relief.lu behält sich das Recht vor, das Konto eines Geschäfts bei wiederholten Pflichtverstößen zu sperren oder zu kündigen.",
        },
        {
          heading: "10. Kundenbewertungen",
          text: "Nutzer:innen, die eine Tüte abgeholt haben, können eine öffentliche Bewertung des Geschäfts abgeben. relief.lu moderiert diese Bewertungen nur, wenn sie offensichtlich missbräuchlich, falsch oder rechtswidrig sind; sie greift nicht in Bewertungen ein, die eine reale, auch negative Erfahrung widerspiegeln.",
        },
        {
          heading: "11. Haftung",
          text: "Das Geschäft ist allein verantwortlich für Qualität, Frische, genaue Zusammensetzung und Unbedenklichkeit der von ihm angebotenen Produkte sowie für die Einhaltung der geltenden Vorschriften. Die Haftung von relief.lu als technischem Vermittler ist insoweit ausgeschlossen, außer bei eigenem, unmittelbarem Verschulden von relief.lu beim Betrieb der Plattform.",
        },
        {
          heading: "12. Sperrung und Kündigung des Geschäftskontos",
          text: "Das Geschäft kann die Nutzung von relief.lu jederzeit durch Kontaktaufnahme beenden. relief.lu behält sich das Recht vor, ein Geschäftskonto je nach Schwere mit oder ohne Vorankündigung zu sperren oder zu löschen, insbesondere bei Verstößen gegen Hygiene- und Lebensmittelsicherheitsvorschriften, wiederholter Nichteinhaltung von Reservierungen oder betrügerischer Nutzung der Plattform.",
        },
        {
          heading: "13. Geistiges Eigentum",
          text: "Die Marke relief.lu, das Logo, die Domain und sämtliche grafischen und softwaretechnischen Elemente der Plattform sind ausschließliches Eigentum von relief.lu und dürfen ohne vorherige Genehmigung nicht reproduziert werden.",
        },
        { heading: "14. Änderung der AGB", text: "relief.lu kann diese AGB jederzeit ändern; Geschäfte werden über wesentliche Änderungen über die App oder per E-Mail informiert." },
        { heading: "15. Anwendbares Recht und Gerichtsstand", text: "Diese AGB unterliegen luxemburgischem Recht. Streitigkeiten im Zusammenhang mit der Nutzung der Plattform unterliegen der Zuständigkeit der Gerichte des Großherzogtums Luxemburg." },
        { heading: "16. Kontakt", text: `Bei Fragen zu diesen AGB: ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
        `Publisher: ${COMPANY}, a simplified private limited company (SARL-S) under Luxembourg law, currently being incorporated.`,
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
        { heading: "1. Data controller", text: `${COMPANY} (SARL-S being incorporated), ${ADDRESS}, contact: ${CONTACT}.` },
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
    cguClients: {
      title: "Terms of Service — Customers",
      paragraphs: [
        `These Terms of Service ("Customer Terms") govern the use of the relief.lu platform by users wishing to reserve bags, published by ${COMPANY} (SARL-S being incorporated), with registered office at ${ADDRESS}. Merchants are subject to separate terms (see the Merchant Terms). This text, written for this type of platform, will be reviewed by a legal professional before large-scale operation.`,
        {
          heading: "1. Purpose and role of relief.lu",
          text: "relief.lu is a matchmaking platform between merchants (bakeries, restaurants, grocery stores, caterers, supermarkets...) with surplus food and users wishing to buy it at a reduced price as a \"surprise bag\". relief.lu acts exclusively as a technical intermediary: it is neither the producer, seller, nor owner of the food offered, and is never a party to the sale contract concluded directly between the merchant and the user.",
        },
        { heading: "2. Registration and account", text: "Registration is done by email, without a password (single-use sign-in link). Each user guarantees the accuracy of the information provided, must be able to enter into a contract under applicable law, and is solely responsible for the use of their account and the confidentiality of their access." },
        {
          heading: "3. Reservation and payment",
          text: "Reserving a bag requires immediate and full online payment, processed by our payment provider Stripe (card, Bancontact). The displayed price is freely set by the merchant; no cash or on-site payment is required or accepted.",
        },
        {
          heading: "4. No statutory right of withdrawal",
          text: "In accordance with EU consumer protection regulations (goods liable to deteriorate or expire rapidly), the standard 14-day withdrawal right for online purchases does not apply to bags reserved on relief.lu. The pre-pickup cancellation option described in the next article is a courtesy feature of relief.lu, separate from this statutory right.",
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
          heading: "9. Complaints and dispute resolution",
          text: "For any complaint, please contact us directly first at the address below. In accordance with the EU regulation on online dispute resolution for consumers, you may also use the European Online Dispute Resolution (ODR) platform, available at ec.europa.eu/consumers/odr.",
        },
        {
          heading: "10. Account and termination",
          text: "Any user may stop using relief.lu at any time by contacting us, with deletion of their account and data in accordance with the privacy policy. relief.lu reserves the right to suspend or delete an account, with or without notice depending on severity, in case of abusive, fraudulent use or use contrary to these Terms.",
        },
        {
          heading: "11. Intellectual property",
          text: "The relief.lu brand, logo, domain name, and all graphic and software elements of the platform are the exclusive property of relief.lu and may not be reproduced without prior authorization.",
        },
        { heading: "12. Changes to these Terms", text: "relief.lu may modify these Terms at any time; users will be informed of significant changes via the app or by email." },
        { heading: "13. Applicable law and jurisdiction", text: "These Terms are governed by Luxembourg law. Any dispute relating to the use of the platform falls under the jurisdiction of the courts of the Grand Duchy of Luxembourg, unless mandatory legal provisions state otherwise, notably regarding consumer protection." },
        { heading: "14. Contact", text: `For any question regarding these Terms: ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
      ],
    },
    cguCommercants: {
      title: "Terms of Service — Merchants",
      paragraphs: [
        `These Terms of Service ("Merchant Terms") govern the registration and use of the relief.lu platform by merchants wishing to publish bags on it, published by ${COMPANY} (SARL-S being incorporated), with registered office at ${ADDRESS}. Customers are subject to separate terms (see the Customer Terms). This text, written for this type of platform, will be reviewed by a legal professional before large-scale operation.`,
        {
          heading: "1. Purpose and role of relief.lu",
          text: "relief.lu is a matchmaking platform between merchants with surplus food and users wishing to buy it at a reduced price as a \"surprise bag\". relief.lu acts exclusively as a technical intermediary: it is neither the buyer, reseller, nor owner of the food offered, and is never a party to the sale contract concluded directly between the merchant and the user.",
        },
        {
          heading: "2. Registration, verification and account activation",
          text: "Merchant registration requires accurate information (business name, address, contact, registration number where applicable). Publishing bags is only enabled after manual verification of this information by relief.lu, intended to confirm the account corresponds to a real, legitimate business. relief.lu may refuse or delay activation without having to justify the reason.",
        },
        {
          heading: "3. Merchant obligations",
          text: "The merchant is solely responsible for the content of their listings (description, quantity, price, pickup window) and guarantees they are legally entitled to sell the food offered, in full compliance with applicable hygiene and food safety regulations. In particular, the merchant agrees to indicate mandatory allergen information where required under EU food information regulations. The merchant agrees to honor every paid reservation within the announced window.",
        },
        {
          heading: "4. No exclusivity",
          text: "Registering on relief.lu does not entail any exclusivity: the merchant remains free to offer their surplus food simultaneously on other platforms or through any other channel of their choosing.",
        },
        {
          heading: "5. Price, reservation and payment",
          text: "The price of each bag is freely set by the merchant. Payment is made in full by the user at the time of reservation, via our provider Stripe; the merchant has no till-side collection to manage for sales made through the platform.",
        },
        {
          heading: "6. Commission and payout",
          text: "relief.lu collects the customer's payment on the merchant's behalf and charges a service commission, at a rate communicated to each merchant upon registration. The balance owed to the merchant is paid out according to the frequency and terms agreed at registration (notably by bank transfer); these terms may be the subject of an additional individual commercial agreement.",
        },
        {
          heading: "7. Tax and accounting obligations",
          text: "The merchant remains solely responsible for declaring and paying VAT and any other tax applicable to their sales made via relief.lu, as well as for their accounting records. relief.lu does not act as the merchant's tax representative.",
        },
        {
          heading: "8. Content provided by the merchant",
          text: "The merchant guarantees holding the necessary rights to the names, logos, descriptions and photographs they upload, and grants relief.lu a non-exclusive license to use this content, limited to display on the platform and promotion of their activity as a partner merchant, revocable upon closure of their account.",
        },
        {
          heading: "9. Cancellation or failure to honor a reservation by the merchant",
          text: "If a reserved and paid bag cannot be provided (cancellation by the merchant, unavailability), the customer is fully refunded. relief.lu reserves the right to suspend or terminate a merchant's account in case of repeated failure to meet their obligations.",
        },
        {
          heading: "10. Customer reviews",
          text: "Users who have collected a bag may leave a public review of the merchant. relief.lu only moderates these reviews if they are clearly abusive, false, or unlawful; it does not intervene in reviews reflecting a genuine experience, even a negative one.",
        },
        {
          heading: "11. Liability",
          text: "The merchant is solely responsible for the quality, freshness, exact composition and safety of the products they offer, as well as for compliance with applicable regulations. relief.lu's liability, as a technical intermediary, cannot be engaged in this respect, except for relief.lu's own direct fault in the operation of the platform.",
        },
        {
          heading: "12. Suspension and termination of the merchant account",
          text: "The merchant may stop using relief.lu at any time by contacting us. relief.lu reserves the right to suspend or delete a merchant account, with or without notice depending on severity, notably in case of breach of hygiene and food safety rules, repeated failure to honor reservations, or fraudulent use of the platform.",
        },
        {
          heading: "13. Intellectual property",
          text: "The relief.lu brand, logo, domain name, and all graphic and software elements of the platform are the exclusive property of relief.lu and may not be reproduced without prior authorization.",
        },
        { heading: "14. Changes to these Terms", text: "relief.lu may modify these Terms at any time; merchants will be informed of significant changes via the app or by email." },
        { heading: "15. Applicable law and jurisdiction", text: "These Terms are governed by Luxembourg law. Any dispute relating to the use of the platform falls under the jurisdiction of the courts of the Grand Duchy of Luxembourg." },
        { heading: "16. Contact", text: `For any question regarding these Terms: ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
