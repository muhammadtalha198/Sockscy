// Route metadata shared by the layout (nav ink), the page-transition curtain
// (its colour = the next page's first section) and chunk preloading.

/** Colour of each page's first section. */
export function toneFor(pathname) {
  if (pathname === '/') return 'yellow'
  if (pathname.startsWith('/shop')) return 'green'
  if (pathname.startsWith('/product')) return 'offwhite'
  if (pathname.startsWith('/cart')) return 'yellow'
  if (pathname.startsWith('/checkout')) return 'offwhite'
  if (pathname.startsWith('/order-placed')) return 'green'
  if (pathname.startsWith('/about')) return 'red'
  if (pathname.startsWith('/contact') || pathname.startsWith('/orders')) return 'green'
  return 'pink' // 404
}

/** Lazy page modules (Home ships in the main bundle). */
export const PAGE_LOADERS = {
  shop: () => import('../pages/Shop'),
  product: () => import('../pages/Product'),
  cart: () => import('../pages/Cart'),
  checkout: () => import('../pages/Checkout'),
  orderPlaced: () => import('../pages/OrderPlaced'),
  about: () => import('../pages/About'),
  contact: () => import('../pages/Contact'),
  notFound: () => import('../pages/NotFound'),
}

/** The loader for a pathname, so its chunk can be fetched while the curtain covers the screen. */
export function loaderFor(pathname) {
  if (pathname === '/') return null
  const seg = pathname.split('/')[1]
  const map = {
    shop: 'shop',
    product: 'product',
    cart: 'cart',
    checkout: 'checkout',
    'order-placed': 'orderPlaced',
    about: 'about',
    contact: 'contact',
    orders: 'contact',
  }
  return PAGE_LOADERS[map[seg] || 'notFound']
}
