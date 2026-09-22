export const notifyStockAlert = async (barId: string, productNom: string, stockRestant: number) => {
  // TODO: Intégration Twilio / WhatsApp API
  console.log(`[ALERTE SMS/WHATSAPP] Bar ${barId} - Rupture imminente sur ${productNom}. Reste ${stockRestant} bouteilles.`);
};
