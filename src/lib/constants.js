// Store-wide settings. Prices are in PKR (whole rupees).

export const SITE = {
  name: 'SOCKSAVVY',
  domain: 'socksavvy.co',
  instagram: 'https://instagram.com/socksavvy.co',
  instagramHandle: '@socksavvy.co',
  email: 'hello@socksavvy.co',
  // Replace with the real number (digits only, 92 = Pakistan) via VITE_WHATSAPP_NUMBER in .env
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '923001234567',
}

export const FREE_SHIPPING_THRESHOLD = 3000
export const SHIPPING_FEE = 250
export const GIFT_PACK_PRICE = 350

export const COLLECTIONS = [
  { id: 'eggs', label: 'Eggs', blurb: 'the breakfast club: fried eggs & matcha' },
  { id: 'fruits', label: 'Fruits', blurb: 'avocado, peach & pizza (tomato is a fruit)' },
  { id: 'hearts', label: 'Hearts', blurb: 'hearts & doodle flowers' },
  { id: 'checkers', label: 'Checkers', blurb: 'checkerboard, smileys & stripes' },
  { id: 'creatures', label: 'Creatures', blurb: 'cats, blobs & other weirdos' },
]

// Filter swatches — sock colours, not site colours.
export const COLORS = [
  { id: 'black', label: 'black', hex: '#111111' },
  { id: 'white', label: 'white', hex: '#ffffff' },
  { id: 'yellow', label: 'yellow', hex: '#f4d500' },
  { id: 'orange', label: 'orange', hex: '#ff8a2b' },
  { id: 'red', label: 'red', hex: '#e63a3f' },
  { id: 'pink', label: 'pink', hex: '#ff52a1' },
  { id: 'green', label: 'green', hex: '#1c7d56' },
  { id: 'blue', label: 'blue', hex: '#2f6fd1' },
]

export const SIZES = [
  { id: 'S', label: 'S', fit: 'EU 35–38 · UK 3–5' },
  { id: 'M', label: 'M', fit: 'EU 39–42 · UK 6–8' },
  { id: 'L', label: 'L', fit: 'EU 43–46 · UK 9–11' },
]

export const PRICE_RANGES = [
  { id: 'under-1000', label: 'under Rs 1,000', min: 0, max: 999 },
  { id: '1000-1250', label: 'Rs 1,000 – 1,250', min: 1000, max: 1250 },
  { id: 'over-1250', label: 'over Rs 1,250', min: 1251, max: Infinity },
]

export const SORTS = [
  { id: 'featured', label: 'featured' },
  { id: 'price-asc', label: 'price: low → high' },
  { id: 'price-desc', label: 'price: high → low' },
  { id: 'name', label: 'a → z' },
]

export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
]

export const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Sialkot',
  'Gujranwala',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
]

// Flat brand colours for tiles (product cards, carousel, instagram tiles)
export const TILE_BG = {
  yellow: 'var(--color-yellow)',
  red: 'var(--color-red)',
  green: 'var(--color-green)',
  pink: 'var(--color-pink)',
  black: 'var(--color-black)',
  offwhite: 'var(--color-offwhite)',
}

// On hover a card switches to the next colour in this cycle (hard cut, no fade)
export const TILE_CYCLE = { yellow: 'pink', pink: 'green', green: 'red', red: 'yellow' }
