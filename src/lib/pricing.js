// Frais de service intégrés directement dans le prix affiché au client — il
// n'existe plus de ligne "Frais de service" séparée nulle part (ni dans
// l'app, ni sur la page Stripe) : le prix encodé par le commerçant (3,99€
// par ex.) s'affiche toujours majoré de ce montant côté client, par sachet,
// puis arrondi au centime supérieur se terminant par 9 (prix "charme",
// ,X9) pour que TOUT prix final affiché se termine par 9 — jamais vers le
// bas, pour ne jamais perdre de marge. Cet écart d'arrondi (0 à 9 centimes)
// reste entièrement chez relief.lu, comme le reste du frais de service.
//
// Entièrement conservé par relief.lu : SERVICE_FEE_CENTS est la part nette,
// SERVICE_FEE_VAT_CENTS la TVA sur ce frais (17%, taux normal LU) que
// relief.lu reverse à l'État.
//
// Doit rester synchronisé avec les mêmes constantes/logique dans
// supabase/functions/create-checkout-session/index.ts.
export const SERVICE_FEE_CENTS = 50;
export const SERVICE_FEE_VAT_CENTS = Math.round(SERVICE_FEE_CENTS * 0.17);
export const SERVICE_FEE_TOTAL_CENTS = SERVICE_FEE_CENTS + SERVICE_FEE_VAT_CENTS;

export function roundUpToNiceCents(cents) {
  const remainder = cents % 10;
  return remainder === 9 ? cents : cents + (9 - remainder);
}

export function displayPriceCents(priceCents) {
  return roundUpToNiceCents(priceCents + SERVICE_FEE_TOTAL_CENTS);
}
