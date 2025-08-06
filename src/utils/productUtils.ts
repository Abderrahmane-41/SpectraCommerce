/**
 * Normalizes a quantity offer object to ensure it has the required properties
 * and adds default values for missing properties.
 * 
 * @param offer - The quantity offer object to normalize
 * @returns A normalized quantity offer object with all required properties
 */
export const normalizeQuantityOffer = (offer: any): {
  quantity: number;
  price: number;
  name: string;
} => {
  return {
    quantity: typeof offer.quantity === 'string' ? parseInt(offer.quantity, 10) : offer.quantity || 0,
    price: typeof offer.price === 'string' ? parseFloat(offer.price) : offer.price || 0,
    name: offer.name || "قطع" // Ensure a default name is always present
  };
};

/**
 * Normalizes an array of quantity offers to ensure all have the required properties
 * 
 * @param offers - The array of quantity offers to normalize
 * @returns An array of normalized quantity offer objects
 */
export const normalizeQuantityOffers = (offers: any[] | null | undefined): {
  quantity: number;
  price: number;
  name: string;
}[] => {
  if (!offers || !Array.isArray(offers) || offers.length === 0) {
    return [];
  }
  
  return offers.map(offer => normalizeQuantityOffer(offer));
};