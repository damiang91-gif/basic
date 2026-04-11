import { PortalMatch } from '../types';

/**
 * Known invoice portals for major Mexican businesses.
 * Keys are lowercase, accent-free aliases for fuzzy matching.
 * URLs point directly to the invoicing/facturación page.
 *
 * NOTE: Verify these URLs periodically — businesses change their portal paths.
 */
const KNOWN_PORTALS: Record<string, PortalMatch> = {
  // Convenience stores
  oxxo: { url: 'https://www.oxxo.com/facturacion', displayName: 'OXXO' },
  seven: { url: 'https://7eleven.facturify.com/', displayName: '7-Eleven' },
  'seven eleven': { url: 'https://7eleven.facturify.com/', displayName: '7-Eleven' },

  // Supermarkets
  walmart: { url: 'https://www.walmart.com.mx/facturacion', displayName: 'Walmart' },
  superama: { url: 'https://www.walmart.com.mx/facturacion', displayName: 'Superama' },
  'bodega aurrera': { url: 'https://www.walmart.com.mx/facturacion', displayName: 'Bodega Aurrerá' },
  sams: { url: 'https://www.samsclub.com.mx/facturacion', displayName: "Sam's Club" },
  'sams club': { url: 'https://www.samsclub.com.mx/facturacion', displayName: "Sam's Club" },
  costco: { url: 'https://www.costco.com.mx/facturacion', displayName: 'Costco' },
  soriana: { url: 'https://www.soriana.com/i/facturacion.html', displayName: 'Soriana' },
  chedraui: { url: 'https://facturacion.chedraui.com.mx', displayName: 'Chedraui' },
  comercial: { url: 'https://www.comercialmexicana.com/facturacion', displayName: 'Comercial Mexicana' },
  'la comer': { url: 'https://www.lacomer.com.mx/lacomer/facturacion', displayName: 'La Comer' },

  // Department stores
  liverpool: { url: 'https://www.liverpool.com.mx/tienda/facturacion', displayName: 'Liverpool' },
  palacio: { url: 'https://www.elpalaciodehierro.com/facturacion', displayName: 'El Palacio de Hierro' },
  sears: { url: 'https://facturacion.sears.com.mx', displayName: 'Sears' },
  suburbia: { url: 'https://facturacion.suburbia.com.mx', displayName: 'Suburbia' },
  zara: { url: 'https://www.zara.com/mx/es/invoice', displayName: 'Zara' },

  // Home improvement
  'home depot': { url: 'https://www.homedepot.com.mx/facturacion', displayName: 'The Home Depot' },
  homedepot: { url: 'https://www.homedepot.com.mx/facturacion', displayName: 'The Home Depot' },
  ikea: { url: 'https://www.ikea.com/mx/es/customer-service/invoice/', displayName: 'IKEA' },

  // Office supplies
  'office depot': { url: 'https://facturacion.officedepot.com.mx', displayName: 'Office Depot' },
  'office max': { url: 'https://facturacion.officemax.com.mx', displayName: 'OfficeMax' },
  officemax: { url: 'https://facturacion.officemax.com.mx', displayName: 'OfficeMax' },

  // Cinemas
  cinepolis: { url: 'https://facturacion.cinepolis.com', displayName: 'Cinépolis' },
  cinemex: { url: 'https://facturacion.cinemex.com', displayName: 'Cinemex' },

  // Coffee & fast food
  starbucks: { url: 'https://starbucksfacturacion.com.mx', displayName: 'Starbucks' },
  mcdonalds: { url: 'https://facturacion.mcdonalds.com.mx', displayName: "McDonald's" },
  'burger king': { url: 'https://bkfacturacion.com.mx', displayName: 'Burger King' },
  burgerking: { url: 'https://bkfacturacion.com.mx', displayName: 'Burger King' },
  dominos: { url: 'https://facturacion.dominos.com.mx', displayName: "Domino's" },
  'pizza hut': { url: 'https://facturacion.pizzahut.com.mx', displayName: 'Pizza Hut' },
  pizzahut: { url: 'https://facturacion.pizzahut.com.mx', displayName: 'Pizza Hut' },
  kfc: { url: 'https://facturacion.kfc.com.mx', displayName: 'KFC' },
  subway: { url: 'https://facturacion.subway.com.mx', displayName: 'Subway' },
  vips: { url: 'https://facturacion.vips.com.mx', displayName: 'Vips' },
  applebees: { url: 'https://facturacion.applebees.com.mx', displayName: "Applebee's" },
  chilis: { url: 'https://facturacion.chilis.com.mx', displayName: "Chili's" },
  sanborns: { url: 'https://facturacion.sanborns.com.mx', displayName: 'Sanborns' },

  // Gas stations
  pemex: { url: 'https://facturacion.pemex.com', displayName: 'Pemex' },

  // Pharmacies
  farmacias: { url: 'https://www.farmaciasdelahorro.mx/facturacion', displayName: 'Farmacias del Ahorro' },
  'del ahorro': { url: 'https://www.farmaciasdelahorro.mx/facturacion', displayName: 'Farmacias del Ahorro' },
  benavides: { url: 'https://www.farmaciasbenavides.com.mx/facturacion', displayName: 'Farmacias Benavides' },
  'guadalajara': { url: 'https://facturacion.farmaciasguadalajara.com.mx', displayName: 'Farmacias Guadalajara' },

  // Electronics
  liverpool_tech: { url: 'https://www.liverpool.com.mx/tienda/facturacion', displayName: 'Liverpool' },
  'best buy': { url: 'https://facturacion.bestbuy.com.mx', displayName: 'Best Buy' },
  bestbuy: { url: 'https://facturacion.bestbuy.com.mx', displayName: 'Best Buy' },
  telcel: { url: 'https://facturacion.telcel.com', displayName: 'Telcel' },

  // Restaurants
  'italianni': { url: 'https://facturacion.italiannis.com.mx', displayName: "Italianni's" },
  'toks': { url: 'https://facturacion.toks.com.mx', displayName: 'Toks' },
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(de|la|el|los|las|y|e|del|sa|sab|sapi|cv|comercio|tienda|grupo|cadena)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds the invoice portal URL for a given business name.
 * Uses fuzzy substring matching against the known portals database.
 * Returns null if the business is not in the database.
 */
export function findPortalUrl(businessName: string): PortalMatch | null {
  if (!businessName.trim()) return null;

  const normalizedInput = normalize(businessName);
  const inputWords = normalizedInput.split(' ').filter(w => w.length > 2);

  let bestMatch: PortalMatch | null = null;
  let bestScore = 0;

  for (const [key, data] of Object.entries(KNOWN_PORTALS)) {
    const normalizedKey = normalize(key);

    // Exact match
    if (normalizedInput === normalizedKey || normalizedInput.includes(normalizedKey)) {
      return data;
    }

    // Score based on word overlap
    const keyWords = normalizedKey.split(' ').filter(w => w.length > 2);
    const matchedWords = inputWords.filter(w => keyWords.some(kw => kw.includes(w) || w.includes(kw)));
    const score = matchedWords.length / Math.max(keyWords.length, 1);

    if (score > 0.5 && score > bestScore) {
      bestScore = score;
      bestMatch = data;
    }
  }

  return bestMatch;
}
