// Liste fermée plutôt que texte libre — un commerçant qui tapait "Esch",
// "Esch/Alzette" ou "Esch-sur-Alzette" au choix rendait tout filtrage par
// ville impossible à fiabiliser (voir le footer de la landing, qui filtre
// les sachets par ville exacte). Couvre les communes les plus peuplées du
// pays, pas seulement celles mises en avant dans le footer.
export const LUXEMBOURG_CITIES = [
  "Luxembourg-Ville",
  "Esch-sur-Alzette",
  "Dudelange",
  "Differdange",
  "Bettembourg",
  "Pétange",
  "Sanem",
  "Hesperange",
  "Bertrange",
  "Strassen",
  "Schifflange",
  "Mamer",
  "Mersch",
  "Walferdange",
  "Kayl",
  "Rumelange",
  "Ettelbruck",
  "Diekirch",
  "Wiltz",
  "Echternach",
  "Grevenmacher",
  "Remich",
  "Steinfort",
  "Junglinster",
];
