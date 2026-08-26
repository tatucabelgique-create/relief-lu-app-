import { useI18n } from "../lib/i18n.jsx";

const CONTACT = "contact@relief.lu";
const COMPANY = "RELIEF.LU SARL-S";
const ADDRESS = "2, rue Dr. Elvire Engel, L-8346 Grass, Luxembourg";

const CONTENT = {
  fr: {
    mentions: {
      title: "Mentions légales",
      paragraphs: [
        `Éditeur : ${COMPANY}, société à responsabilité limitée simplifiée (SARL-S) de droit luxembourgeois, en cours de constitution.`,
        `Siège social : ${ADDRESS}`,
        `Contact : ${CONTACT}`,
        "Gérant : en cours de désignation — cette mention sera complétée dès la constitution effective de la société.",
        "Numéro RCS / matricule : en cours d'immatriculation — ces mentions seront complétées dès leur obtention.",
        "Capital social : en cours de constitution.",
        "Numéro de TVA intracommunautaire : en cours d'obtention.",
        "Directeur de la publication : le gérant de la société, dont le nom sera communiqué dès sa désignation.",
        "Hébergement du site : GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (GitHub Pages).",
        "Base de données, authentification et stockage : Supabase, Inc.",
        "Paiements en ligne : Stripe Payments Europe, Ltd. — relief.lu ne stocke aucune donnée de carte bancaire, celles-ci sont traitées exclusivement par Stripe.",
      ],
    },
    confidentialite: {
      title: "Politique de confidentialité",
      paragraphs: [
        `Cette politique explique quelles données personnelles relief.lu traite, pourquoi, sur quelle base légale, avec qui elles sont partagées et comment les faire corriger, exporter ou supprimer. Le responsable du traitement est ${COMPANY} (SARL-S en cours de constitution), ${ADDRESS}, contact : ${CONTACT}.`,
        {
          heading: "1. Données que nous collectons",
          text: "Pour tous les utilisateurs : votre email (inscription, compte), le contenu de vos réservations (sachet, quantité, statut de paiement, code de retrait), vos favoris, les avis que vous laissez, et — si vous l'activez — votre position approximative (pour trier par distance) ainsi qu'un identifiant technique d'abonnement aux notifications push. Pour les commerçants, en plus : nom du commerce, adresse et position sur la carte, numéro de téléphone, numéro d'immatriculation le cas échéant, photos et logo publiés, données liées aux ventes réalisées sur la plateforme. Les données de paiement (numéro de carte, etc.) ne transitent jamais par nos serveurs : elles sont saisies et traitées directement par Stripe.",
        },
        {
          heading: "2. Base légale et finalités du traitement",
          text: "Nous traitons ces données parce qu'elles sont nécessaires à l'exécution du contrat qui nous lie à vous (créer et gérer votre compte, traiter vos réservations et paiements, permettre aux commerçants de publier et suivre leurs ventes), sur la base de notre intérêt légitime à faire fonctionner et améliorer relief.lu (affichage des favoris et avis, notifications de nouveaux sachets, sécurité et prévention de la fraude), ou, lorsque la loi l'exige, sur la base de votre consentement (notamment pour la géolocalisation et les cookies non essentiels, voir notre politique de cookies).",
        },
        {
          heading: "3. Avec qui ces données sont partagées",
          text: "Avec les prestataires techniques nécessaires au fonctionnement du service, agissant comme sous-traitants : Supabase (base de données, authentification, stockage des photos), Stripe (traitement des paiements en ligne), et les services de notification push de votre navigateur (Google, Mozilla ou Apple selon le cas) pour l'acheminement technique des notifications. Nous pouvons également divulguer des données aux autorités compétentes si la loi nous y oblige. Aucune donnée n'est vendue, et aucune n'est utilisée à des fins publicitaires en dehors du consentement donné via le bandeau cookies.",
        },
        {
          heading: "4. Transferts hors Union européenne",
          text: "Certains de nos prestataires (notamment Stripe et GitHub, sociétés basées aux États-Unis) peuvent traiter des données en dehors de l'Union européenne. Dans ce cas, nous nous assurons que ce transfert repose sur un mécanisme reconnu par le RGPD (clauses contractuelles types de la Commission européenne ou équivalent).",
        },
        {
          heading: "5. Durée de conservation",
          text: "Vos données sont conservées tant que votre compte est actif. Elles peuvent être conservées plus longtemps lorsqu'une obligation légale nous y contraint (notamment en matière comptable et fiscale pour les données de facturation des commerçants) ou en cas de litige en cours. Vous pouvez demander la suppression de votre compte à tout moment.",
        },
        {
          heading: "6. Sécurité",
          text: "L'accès aux données est protégé par des règles techniques (chaque utilisateur ne peut voir/modifier que ses propres réservations, favoris et sachets) et le site est servi en HTTPS. Nous ne faisons appel qu'à des prestataires appliquant des mesures de sécurité appropriées.",
        },
        {
          heading: "7. Vos droits",
          text: `Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition au traitement, ainsi que d'un droit à la portabilité de vos données personnelles, et d'un droit de retirer votre consentement à tout moment lorsque le traitement en repose. Pour les exercer, écrivez-nous à ${CONTACT}.`,
        },
        {
          heading: "8. Réclamation auprès de l'autorité de contrôle",
          text: "Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la Commission Nationale pour la Protection des Données (CNPD), l'autorité de contrôle luxembourgeoise : 15, Boulevard du Jazz, L-4370 Belvaux, Luxembourg — cnpd.public.lu. Nous vous encourageons à nous contacter d'abord afin que nous puissions tenter de résoudre votre demande directement.",
        },
        {
          heading: "9. Protection des mineurs",
          text: "relief.lu s'adresse à des utilisateurs majeurs ou légalement en capacité de conclure un contrat. Nous ne collectons pas sciemment de données concernant des mineurs n'ayant pas cette capacité.",
        },
        { heading: "10. Modification de cette politique", text: "Nous pouvons modifier cette politique à tout moment ; vous serez informé des changements significatifs via l'application ou par email." },
        { heading: "11. Contact", text: `Pour toute question relative à cette politique : ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
      title: "Politique de cookies",
      paragraphs: [
        "Un cookie (ou une technologie de stockage similaire, comme le stockage local de votre navigateur) est un petit fichier déposé sur votre appareil lors de votre visite. Cette politique détaille ceux que relief.lu utilise, leur finalité et leur durée.",
        {
          heading: "1. Cookies et stockages strictement nécessaires",
          text: "Toujours actifs, sans demande de consentement, car indispensables au fonctionnement du service : relief_cookie_consent (mémorise votre choix en matière de cookies, 12 mois), relief-user-position (votre position pour trier les sachets par distance, jusqu'à suppression), relief-pending-view (retrouver la bonne page après un clic sur un lien de connexion par email, quelques minutes), ainsi que le jeton de session déposé par notre prestataire d'authentification Supabase (garder votre connexion active).",
        },
        {
          heading: "2. Cookies de mesure d'audience",
          text: "Déposés uniquement après votre consentement explicite via le bandeau : les cookies Google Analytics (notamment _ga, _ga_*, _gid), qui nous permettent de mesurer la fréquentation du site de façon agrégée, jusqu'à 13 mois.",
        },
        {
          heading: "3. Cookies publicitaires",
          text: "Déposés uniquement après votre consentement explicite via le bandeau : le cookie Meta Pixel (_fbp), qui nous permet de mesurer l'efficacité de nos campagnes publicitaires sur Facebook/Instagram, jusqu'à 3 mois.",
        },
        {
          heading: "4. Gérer vos choix",
          text: "Vous pouvez à tout moment modifier votre choix via le lien « Gérer les cookies » en bas de page, ou en supprimant les cookies directement dans les réglages de votre navigateur. Le refus des cookies non essentiels n'affecte pas votre accès au service — seule la mesure d'audience et la publicité en sont affectées.",
        },
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
        "Geschäftsführer: wird derzeit bestimmt — diese Angabe wird nach der endgültigen Gründung der Gesellschaft ergänzt.",
        "Handelsregisternummer: wird derzeit beantragt — diese Angaben werden nach Erhalt ergänzt.",
        "Stammkapital: befindet sich in Gründung.",
        "Umsatzsteuer-Identifikationsnummer: wird derzeit beantragt.",
        "Inhaltlich Verantwortlicher: der Geschäftsführer der Gesellschaft, dessen Name nach Bestimmung mitgeteilt wird.",
        "Hosting der Website: GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA (GitHub Pages).",
        "Datenbank, Authentifizierung und Speicherung: Supabase, Inc.",
        "Online-Zahlungen: Stripe Payments Europe, Ltd. — relief.lu speichert keine Kreditkartendaten, diese werden ausschließlich von Stripe verarbeitet.",
      ],
    },
    confidentialite: {
      title: "Datenschutzerklärung",
      paragraphs: [
        `Diese Erklärung beschreibt, welche personenbezogenen Daten relief.lu verarbeitet, warum, auf welcher Rechtsgrundlage, mit wem sie geteilt werden und wie Sie diese berichtigen, exportieren oder löschen lassen können. Verantwortlicher ist ${COMPANY} (SARL-S in Gründung), ${ADDRESS}, Kontakt: ${CONTACT}.`,
        {
          heading: "1. Erhobene Daten",
          text: "Für alle Nutzer:innen: Ihre E-Mail (Registrierung, Konto), der Inhalt Ihrer Reservierungen (Tüte, Menge, Zahlungsstatus, Abholcode), Ihre Favoriten, von Ihnen abgegebene Bewertungen sowie — bei Aktivierung — Ihr ungefährer Standort (zur Sortierung nach Entfernung) und eine technische Push-Abonnement-Kennung. Für Geschäfte zusätzlich: Name und Adresse des Geschäfts, Position auf der Karte, Telefonnummer, Handelsregisternummer sofern vorhanden, veröffentlichte Fotos und Logo, Daten zu den auf der Plattform getätigten Verkäufen. Zahlungsdaten (Kartennummer usw.) laufen niemals über unsere Server: sie werden ausschließlich von Stripe erfasst und verarbeitet.",
        },
        {
          heading: "2. Rechtsgrundlage und Zwecke der Verarbeitung",
          text: "Wir verarbeiten diese Daten, weil sie zur Erfüllung des mit Ihnen bestehenden Vertrags erforderlich sind (Konto erstellen und verwalten, Reservierungen und Zahlungen abwickeln, Geschäften die Veröffentlichung und Nachverfolgung ihrer Verkäufe ermöglichen), aufgrund unseres berechtigten Interesses am Betrieb und an der Verbesserung von relief.lu (Anzeige von Favoriten und Bewertungen, Benachrichtigungen über neue Tüten, Sicherheit und Betrugsprävention), oder, wo gesetzlich vorgeschrieben, auf Grundlage Ihrer Einwilligung (insbesondere für Standortdaten und nicht notwendige Cookies, siehe unsere Cookie-Richtlinie).",
        },
        {
          heading: "3. Weitergabe an Dritte",
          text: "An die für den Betrieb notwendigen technischen Dienstleister als Auftragsverarbeiter: Supabase (Datenbank, Authentifizierung, Foto-Speicherung), Stripe (Abwicklung von Online-Zahlungen) sowie die Push-Benachrichtigungsdienste Ihres Browsers (je nach Fall Google, Mozilla oder Apple) für die technische Zustellung. Wir können Daten zudem an zuständige Behörden weitergeben, wenn wir gesetzlich dazu verpflichtet sind. Keine Daten werden verkauft oder außerhalb der über das Cookie-Banner erteilten Einwilligung zu Werbezwecken genutzt.",
        },
        {
          heading: "4. Übermittlung außerhalb der EU",
          text: "Einige unserer Dienstleister (insbesondere Stripe und GitHub, beide mit Sitz in den USA) können Daten außerhalb der Europäischen Union verarbeiten. In diesem Fall stellen wir sicher, dass die Übermittlung auf einem von der DSGVO anerkannten Mechanismus beruht (Standardvertragsklauseln der Europäischen Kommission oder gleichwertig).",
        },
        {
          heading: "5. Speicherdauer",
          text: "Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Eine längere Speicherung ist möglich, wenn eine gesetzliche Verpflichtung dazu besteht (insbesondere buchhalterische und steuerliche Pflichten bei Abrechnungsdaten von Geschäften) oder ein laufender Rechtsstreit dies erfordert. Sie können die Löschung Ihres Kontos jederzeit beantragen.",
        },
        {
          heading: "6. Sicherheit",
          text: "Der Zugriff auf die Daten ist durch technische Regeln geschützt (jeder Nutzer sieht/ändert nur seine eigenen Reservierungen, Favoriten und Tüten); die Website wird über HTTPS ausgeliefert. Wir beauftragen ausschließlich Dienstleister mit angemessenen Sicherheitsmaßnahmen.",
        },
        {
          heading: "7. Ihre Rechte",
          text: `Sie haben ein Recht auf Auskunft, Berichtigung, Löschung, Einschränkung und Widerspruch gegen die Verarbeitung sowie ein Recht auf Datenübertragbarkeit und, soweit die Verarbeitung darauf beruht, ein Recht auf jederzeitigen Widerruf Ihrer Einwilligung. Zur Ausübung schreiben Sie uns an ${CONTACT}.`,
        },
        {
          heading: "8. Beschwerde bei der Aufsichtsbehörde",
          text: "Wenn Sie der Ansicht sind, dass Ihre Rechte nicht gewahrt werden, können Sie eine Beschwerde bei der Commission Nationale pour la Protection des Données (CNPD), der luxemburgischen Aufsichtsbehörde, einreichen: 15, Boulevard du Jazz, L-4370 Belvaux, Luxemburg — cnpd.public.lu. Wir empfehlen, uns zuerst zu kontaktieren, damit wir versuchen können, Ihr Anliegen direkt zu klären.",
        },
        {
          heading: "9. Schutz Minderjähriger",
          text: "relief.lu richtet sich an volljährige oder rechtlich vertragsfähige Nutzer:innen. Wir erheben wissentlich keine Daten von Minderjährigen ohne diese Fähigkeit.",
        },
        { heading: "10. Änderung dieser Erklärung", text: "Wir können diese Erklärung jederzeit ändern; Sie werden über wesentliche Änderungen über die App oder per E-Mail informiert." },
        { heading: "11. Kontakt", text: `Bei Fragen zu dieser Erklärung: ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
      title: "Cookie-Richtlinie",
      paragraphs: [
        "Ein Cookie (oder eine ähnliche Speichertechnologie, z. B. der lokale Speicher Ihres Browsers) ist eine kleine Datei, die bei Ihrem Besuch auf Ihrem Gerät abgelegt wird. Diese Richtlinie beschreibt, welche relief.lu verwendet, zu welchem Zweck und für wie lange.",
        {
          heading: "1. Technisch notwendige Cookies und Speicher",
          text: "Immer aktiv, ohne Zustimmungspflicht, da für den Betrieb unerlässlich: relief_cookie_consent (speichert Ihre Cookie-Wahl, 12 Monate), relief-user-position (Ihr Standort zur Sortierung der Tüten nach Entfernung, bis zur Löschung), relief-pending-view (Rückkehr zur richtigen Seite nach Klick auf einen Login-Link per E-Mail, einige Minuten), sowie das von unserem Authentifizierungsdienstleister Supabase gesetzte Sitzungstoken (Anmeldung aufrechterhalten).",
        },
        {
          heading: "2. Reichweitenmessungs-Cookies",
          text: "Nur nach ausdrücklicher Zustimmung über das Banner gesetzt: die Google-Analytics-Cookies (u. a. _ga, _ga_*, _gid), die uns eine aggregierte Besuchermessung ermöglichen, bis zu 13 Monate.",
        },
        {
          heading: "3. Werbe-Cookies",
          text: "Nur nach ausdrücklicher Zustimmung über das Banner gesetzt: das Meta-Pixel-Cookie (_fbp), das uns die Erfolgsmessung unserer Werbekampagnen auf Facebook/Instagram ermöglicht, bis zu 3 Monate.",
        },
        {
          heading: "4. Ihre Wahl verwalten",
          text: "Sie können Ihre Wahl jederzeit über den Link „Cookies verwalten“ am Seitenende ändern oder Cookies direkt in Ihren Browser-Einstellungen löschen. Die Ablehnung nicht notwendiger Cookies beeinträchtigt Ihren Zugang zum Dienst nicht — nur die Reichweitenmessung und Werbung sind betroffen.",
        },
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
        "Managing director: pending appointment — this detail will be completed once the company is formally incorporated.",
        "Company registration number: pending — these details will be completed once obtained.",
        "Share capital: pending incorporation.",
        "EU VAT number: pending.",
        "Publication director: the company's managing director, whose name will be communicated once appointed.",
        "Website hosting: GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States (GitHub Pages).",
        "Database, authentication and storage: Supabase, Inc.",
        "Online payments: Stripe Payments Europe, Ltd. — relief.lu never stores card data, which is processed exclusively by Stripe.",
      ],
    },
    confidentialite: {
      title: "Privacy policy",
      paragraphs: [
        `This policy explains what personal data relief.lu processes, why, on what legal basis, who it is shared with, and how to have it corrected, exported or deleted. The data controller is ${COMPANY} (SARL-S being incorporated), ${ADDRESS}, contact: ${CONTACT}.`,
        {
          heading: "1. Data we collect",
          text: "For all users: your email (registration, account), the content of your reservations (bag, quantity, payment status, pickup code), your favorites, the reviews you leave, and — if enabled — your approximate location (to sort by distance) and a technical push-subscription identifier. For merchants, in addition: business name and address, map position, phone number, registration number where applicable, published photos and logo, data related to sales made on the platform. Payment data (card number, etc.) never passes through our servers: it is captured and processed exclusively by Stripe.",
        },
        {
          heading: "2. Legal basis and purposes of processing",
          text: "We process this data because it is necessary for the performance of our contract with you (creating and managing your account, processing reservations and payments, letting merchants publish and track their sales), on the basis of our legitimate interest in operating and improving relief.lu (displaying favorites and reviews, notifying new bags, security and fraud prevention), or, where required by law, on the basis of your consent (notably for location data and non-essential cookies, see our cookie policy).",
        },
        {
          heading: "3. Who it is shared with",
          text: "With the technical providers necessary to operate the service, acting as processors: Supabase (database, authentication, photo storage), Stripe (online payment processing), and your browser's push notification services (Google, Mozilla or Apple depending on the case) for technical delivery. We may also disclose data to competent authorities where legally required. No data is sold or used for advertising purposes beyond the consent given via the cookie banner.",
        },
        {
          heading: "4. Transfers outside the EU",
          text: "Some of our providers (notably Stripe and GitHub, both US-based companies) may process data outside the European Union. Where this occurs, we ensure the transfer relies on a mechanism recognized under the GDPR (European Commission standard contractual clauses or equivalent).",
        },
        {
          heading: "5. Retention period",
          text: "Your data is kept as long as your account is active. It may be kept longer where a legal obligation requires it (notably accounting and tax obligations for merchant billing data) or in case of an ongoing dispute. You can request deletion of your account at any time.",
        },
        {
          heading: "6. Security",
          text: "Access to data is protected by technical rules (each user can only see/edit their own reservations, favorites and bags) and the site is served over HTTPS. We only work with providers implementing appropriate security measures.",
        },
        {
          heading: "7. Your rights",
          text: `You have a right of access, rectification, erasure, restriction and objection to processing, a right to data portability, and, where processing relies on it, a right to withdraw your consent at any time. To exercise these rights, write to us at ${CONTACT}.`,
        },
        {
          heading: "8. Complaint to the supervisory authority",
          text: "If you believe your rights are not being respected, you may lodge a complaint with the Commission Nationale pour la Protection des Données (CNPD), Luxembourg's supervisory authority: 15, Boulevard du Jazz, L-4370 Belvaux, Luxembourg — cnpd.public.lu. We encourage you to contact us first so we can try to resolve your request directly.",
        },
        {
          heading: "9. Protection of minors",
          text: "relief.lu is intended for users of legal age or otherwise legally able to enter into a contract. We do not knowingly collect data from minors lacking this capacity.",
        },
        { heading: "10. Changes to this policy", text: "We may modify this policy at any time; you will be informed of significant changes via the app or by email." },
        { heading: "11. Contact", text: `For any question regarding this policy: ${CONTACT} — ${COMPANY}, ${ADDRESS}.` },
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
      title: "Cookie policy",
      paragraphs: [
        "A cookie (or a similar storage technology, such as your browser's local storage) is a small file placed on your device when you visit. This policy details which ones relief.lu uses, for what purpose, and for how long.",
        {
          heading: "1. Strictly necessary cookies and storage",
          text: "Always active, with no consent required, as they are essential to the service: relief_cookie_consent (remembers your cookie choice, 12 months), relief-user-position (your location to sort bags by distance, until deleted), relief-pending-view (returning to the right page after clicking an email sign-in link, a few minutes), and the session token set by our authentication provider Supabase (keeping you signed in).",
        },
        {
          heading: "2. Audience-measurement cookies",
          text: "Only set after your explicit consent via the banner: the Google Analytics cookies (notably _ga, _ga_*, _gid), which let us measure site traffic in aggregate, for up to 13 months.",
        },
        {
          heading: "3. Advertising cookies",
          text: "Only set after your explicit consent via the banner: the Meta Pixel cookie (_fbp), which lets us measure the effectiveness of our Facebook/Instagram ad campaigns, for up to 3 months.",
        },
        {
          heading: "4. Managing your choices",
          text: "You can change your choice at any time via the \"Manage cookies\" link at the bottom of the page, or by deleting cookies directly in your browser settings. Declining non-essential cookies does not affect your access to the service — only audience measurement and advertising are affected.",
        },
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
