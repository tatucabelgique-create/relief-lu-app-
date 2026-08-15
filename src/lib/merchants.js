import { supabase } from "./supabase";

// Ne crée plus de fiche commerçant juste en visitant "Espace commerçant" —
// n'importe quel compte client qui jetait un œil sur cette section devenait
// silencieusement commerçant, ce qui mélangeait les deux rôles. La fiche
// n'existe désormais qu'une fois le formulaire d'inscription soumis
// (voir updateMerchantProfile, qui fait l'upsert).
export async function getMerchantOrNull(userId) {
  const { data, error } = await supabase.from("merchants").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

// Une inscription est considérée complète une fois l'adresse renseignée —
// avant ça, le formulaire d'inscription s'affiche à la place du dashboard.
export function isRegistrationComplete(merchant) {
  return Boolean(merchant?.address);
}

// Crée la fiche commerçant au premier enregistrement, la met à jour ensuite —
// c'est le seul endroit qui crée une ligne dans "merchants".
export async function updateMerchantProfile(userId, profile) {
  const row = {
    id: userId,
    business_name: profile.business_name,
    address: profile.address,
    city: profile.city,
    phone: profile.phone,
    registration_number: profile.registration_number,
  };
  // lat/lng optionnels : seulement si le géocodage de l'adresse a réussi
  // (voir MerchantRegistrationForm) — sinon on ne touche pas aux coordonnées
  // existantes plutôt que de les écraser par du vide.
  if (profile.lat != null && profile.lng != null) {
    row.lat = profile.lat;
    row.lng = profile.lng;
  }
  const { error } = await supabase.from("merchants").upsert(row);
  if (error) throw error;
}

// Réutilise le bucket "bag-photos" (déjà public, déjà autorisé en écriture
// pour les commerçants connectés) plutôt que d'en créer un dédié.
export async function uploadMerchantLogo(userId, file) {
  const path = `${userId}/logo-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("bag-photos").upload(path, file);
  if (error) throw error;
  const logo_url = supabase.storage.from("bag-photos").getPublicUrl(path).data.publicUrl;
  const { error: updateError } = await supabase.from("merchants").update({ logo_url }).eq("id", userId);
  if (updateError) throw updateError;
  return logo_url;
}
