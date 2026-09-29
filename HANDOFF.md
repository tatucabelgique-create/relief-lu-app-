# Relief.lu — état du projet (handoff)

> **Source de vérité du projet.** À relire au début de chaque session et à
> mettre à jour à la fin de chaque session qui change une décision, une
> fonctionnalité ou une priorité. Les conversations de chat ne sont pas
> conservées de façon fiable : ce qui n'est pas écrit ici (ou dans un
> message de commit) est considéré comme perdu.
>
> Dernière mise à jour : 2026-09-29 (reconstruit à partir du code et des
> 242 commits du 08/08 au 24/09/2026).

Plateforme anti-gaspillage alimentaire pour le Luxembourg (façon Too Good
To Go), positionnement social / pouvoir d'achat plutôt que climat. Projet
mené en parallèle de Tatuca (location d'objets, Arlon/Luxembourg).

- Site : **https://relief.lu** (`index.html` = landing, `app.html` = app)
- Lancement public prévu : **15 octobre 2026** (compte à rebours sur la
  landing, initialement 1er octobre, repoussé le 20/09)
- Contact : relief-lu@outlook.com — Admin : giovanni.ehp@gmail.com
- Société : RELIEF.LU SARL-S **en cours de constitution**

## Stack (réelle, pas celle d'origine)

- Frontend : **React 18 + Vite 5**, multi-page (pas une SPA) :
  `index.html` (landing statique, waitlist, SEO) et `app.html` (app React,
  code dans `src/`). PWA installable (`public/sw.js`, `manifest.json`).
- Carte : Leaflet / react-leaflet. Géocodage : Photon (villes, landing) et
  Nominatim (adresse commerçant).
- Backend : **Supabase** (projet séparé de Tatuca, volontairement).
  Auth par magic link **et** code à 8 chiffres par email (le code est le
  seul moyen fiable depuis une PWA iOS installée). Admin protégé par
  email + 2FA TOTP.
- Paiement : **Stripe Checkout** (carte, Bancontact, Apple/Google Pay) +
  **Stripe Connect** (API Accounts v2) pour reverser sa part au commerçant.
- Edge Functions (`supabase/functions/`) : `create-checkout-session`,
  `stripe-webhook`, `create-connect-account`, `notify-new-bag`,
  `send-marketing-push`, `send-daily-reminders`, `toggle-daily-reminders`.
  ⚠️ Supabase attribue des noms aléatoires aux fonctions déployées depuis le
  dashboard : le client appelle les **noms déployés**, pas les noms de
  dossier. Toujours vérifier après un déploiement.
- Base de données : migrations numérotées dans `db/` (`schema-app.sql` puis
  `schema-v2` → `schema-v21`), à exécuter dans l'ordre. Pas de v15.
- Déploiement : **GitHub Pages** via `.github/workflows/deploy.yml` à chaque
  push sur `main`. Le build génère aussi une page statique par commerçant
  vérifié + le sitemap (`scripts/generate-merchant-pages.mjs`).
- Tracking : GA4 + Meta Pixel (CompleteRegistration, Purchase), chargés
  uniquement après consentement cookies. Chat support : Tawk.to (onglet
  « Aide »).

## Décisions prises (et pourquoi)

Ne pas les remettre en cause sans raison nouvelle ; si on change, noter ici
la nouvelle décision et la raison.

**Modèle économique**
- Commission relief.lu : **20 % HT** du CA (+ TVA 17 % sur la commission).
  Était 18 %, passé à 20 % le 31/08.
- Facturation hebdomadaire des commerçants depuis l'admin ; Stripe Connect
  prélève la commission automatiquement (`application_fee_amount`).
- **Prix de vente minimum : 3,99 €** : en dessous, les frais fixes Stripe
  mangent une part disproportionnée de la commission.

**Prix suggéré (mécanique TGTG, reconstituée à partir de vrais sachets)**
- Prix réduit suggéré = prix normal **÷ 3** (≈ -66,7 %) par défaut ;
  **÷ 2** (-50 %) quand le commerçant dépasse son propre seuil de volume.
- Seuil **configurable par commerçant** (NULL = toujours ÷ 3) : un seuil
  unique déclenchait le ÷ 2 trop tôt pour un commerçant qui débute.
- Arrondi au prix « charme » le plus proche (,49 / ,95 / ,99), plancher
  3,99 €. Suggestion uniquement : dès que le commerçant touche au prix,
  on ne l'écrase plus.

**Produit**
- Ouvert à **tous les commerçants dès le premier jour** (décision du 08/08,
  pas de séquençage phase 1 / phase 2 dans la communication).
- **Vérification manuelle** de chaque commerçant par l'admin avant qu'il
  puisse publier ; suspension possible.
- Réservation = **paiement obligatoire** en ligne avant le retrait.
- Description du sachet : texte générique par catégorie (façon TGTG), pas
  saisi par le commerçant.
- Identité visuelle : palette relief.lu (navy / miel / papier, Fraunces /
  Work Sans). Essayé de copier les couleurs TGTG le 11/08, **annulé** :
  on reprend la structure TGTG, jamais son vert ni son identité.
- Notifications push : par commerçant favori **et** par ville ; rappel
  quotidien façon TGTG, activable seulement via un toggle admin.

## Fonctionnalités en place

Parcours client : découverte + onglet Parcourir (carte plein écran),
filtres (catégorie, régime végé/végan, heure de collecte), fiche sachet,
profil commerçant, favoris, réservation + paiement, historique, avis
multi-critères, compteur d'impact (CO₂), carrousels « bientôt fini » /
« succès du jour », PWA + bandeau d'installation.

Espace commerçant : inscription (RCS/TVA), logo, publication de sachets
avec photo, sachets récurrents quotidiens (pg_cron), expiration auto des
invendus, gestion des réservations, stats, Stripe Connect, profil éditable.

Admin : vérification commerçants, facturation hebdo, push marketing,
toggle rappels quotidiens.

Légal : mentions légales, CGU clients, CGU commerçants, confidentialité,
cookies (FR/DE/EN), modale de consentement cookies.

SEO : titre ciblé (« anti-gaspi »), JSON-LD, image OG, une page indexable
par commerçant vérifié, sitemap généré au build.

## Pas fait / risques ouverts

- **Société pas encore constituée** alors que le paiement Stripe et les
  CGU la citent. Point bloquant juridique pour encaisser de vrais
  paiements le 15/10 : à vérifier avec un professionnel avant le lancement.
- **Textes légaux** rédigés sans juriste (le texte le dit lui-même). À
  faire relire avant une exploitation à grande échelle.
- **Email de confirmation de réservation** : aucune Edge Function n'envoie
  d'email ; le code de retrait n'existe que dans l'app.
- **Traduction du contenu commerçant** : seule l'interface est traduite
  FR/DE/EN.
- **Pas de tests automatisés.** Tout est validé à la main en production.
- Lien LinkedIn encore en placeholder.

## Séquence business

⚠️ **Contradiction à trancher.** L'ancienne version de ce fichier prévoyait
d'abord un pilote manuel avec un traiteur (invendus du soir, sans app),
puis le volet entreprises, et seulement ensuite l'app grand public. Le
produit réellement construit va dans l'autre sens : app grand public
complète, ouverte à tous les commerçants, lancement public le 15/10.
Écrire ici quelle séquence est la bonne aujourd'hui, et quel chiffre
mesure le succès du lancement (commerçants vérifiés actifs ? sachets
vendus par semaine ?).
