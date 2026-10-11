# relief.lu — build natif iOS / Android

Ce dossier encapsule la PWA existante (`app.html` à la racine) dans une
coquille native avec [Capacitor](https://capacitorjs.com/), sans toucher
au site web déployé sur relief.lu.

## Build dans le cloud (recommandé)

Cette machine locale n'a ni Node.js, ni Xcode, ni Android Studio installés
— et sa RAM (4 Go) est de toute façon trop limitée pour les faire tourner
confortablement. Le build se fait donc entièrement sur GitHub Actions,
comme le déploiement web actuel.

**Déclencher un build :**

```bash
gh workflow run native-build.yml
```

Ou depuis GitHub : onglet **Actions** → **native-build** → **Run workflow**.

**Récupérer le résultat :**

- Android : un fichier `.apk` de debug, téléchargeable comme artefact du
  run (installable directement sur un téléphone Android, à distribuer
  manuellement — pas besoin de compte Google Play pour ça).
- iOS : le workflow compile pour le **simulateur** uniquement (pas de
  signature requise), pour vérifier que tout s'assemble correctement. Pour
  un vrai build installable sur iPhone, il faudra un compte Apple
  Developer (voir plus bas).

## Build en local (si un jour la machine le permet)

```bash
cd native
npm install
npm run sync          # build le projet racine + prépare www/
npx cap add ios       # première fois seulement
npx cap add android   # première fois seulement
npx cap sync
npx cap open ios      # ouvre Xcode
npx cap open android  # ouvre Android Studio
```

Prérequis : Node.js, et pour iOS Xcode + CocoaPods (`brew install
cocoapods`), pour Android Android Studio avec `ANDROID_HOME` configuré.

## Pourquoi `app.html` devient `index.html`

Capacitor charge toujours `index.html` depuis `webDir` (`www/` ici). Mais
`index.html` à la racine du projet est la page vitrine du site, pas
l'application — c'est `app.html` qui contient la vraie PWA React. Le
script `scripts/sync-web.mjs` copie donc `dist/app.html` → `www/index.html`
(plus les assets JS/CSS associés) à chaque build.

## Pour aller plus loin (distribution réelle)

- **iOS** : un compte [Apple Developer Program](https://developer.apple.com/programs/)
  (99 $/an, vérification d'identité) est nécessaire pour signer un build
  destiné à un vrai iPhone, à TestFlight, ou à l'App Store.
- **Android** : un compte [Google Play Developer](https://play.google.com/console/)
  (25 $ une fois, vérification d'identité) est nécessaire pour publier sur
  le Play Store — mais un `.apk` de debug se distribue déjà librement sans
  ce compte.
- **Icônes/splash screen** : une fois Node disponible, `npx @capacitor/assets generate`
  régénère toutes les tailles d'icônes à partir de `public/icon-512.png`
  (déjà le bon visuel, cohérent avec le reste de la marque).
