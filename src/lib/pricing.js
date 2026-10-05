// Frais de service intégrés directement dans le prix affiché au client — il
// n'existe plus de ligne "Frais de service" séparée nulle part (ni dans
// l'app, ni sur la page Stripe) : le prix encodé par le commerçant (3,99€
// par ex.) s'affiche toujours majoré de ce montant côté client (4,59€), par
// sachet. Le commerçant ne voit et ne manipule que son propre prix — ce
// supplément reste purement côté affichage client.
//
// Entièrement conservé par relief.lu : SERVICE_FEE_CENTS est la part nette,
// SERVICE_FEE_VAT_CENTS la TVA sur ce frais (17%, taux normal LU) que
// relief.lu reverse à l'État (frais TTC = 0,59€ par sachet).
//
// Doit rester synchronisé avec les mêmes constantes dans
// supabase/functions/create-checkout-session/index.ts.
export const SERVICE_FEE_CENTS = 50;
export const SERVICE_FEE_VAT_CENTS = Math.round(SERVICE_FEE_CENTS * 0.17);
export const SERVICE_FEE_TOTAL_CENTS = SERVICE_FEE_CENTS + SERVICE_FEE_VAT_CENTS;

export function displayPriceCents(priceCents) {
  return priceCents + SERVICE_FEE_TOTAL_CENTS;
}
