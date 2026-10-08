// Product API.
//
// Go backend contract (JSON, prices in whole PKR):
//   GET /products?collection=eggs&color=black,yellow&size=S,M&price=under-1000&sort=price-asc
//       → Product[]
//   GET /products/:id                → Product            (404 if missing)
//   GET /products/featured?limit=4   → Product[]
//   GET /products/sock-of-the-day    → Product
//   GET /products/:id/related?limit=4 → Product[]
//
// Product shape: see src/data/products.json
//   { id, name, price, collection, colors[], sizes[], stock{size:qty}, tile,
//     featured, art{pattern,base,trim}, description, details[], images[{src,view,alt}] }

import productsData from '../data/products.json'
import { PRICE_RANGES } from '../lib/constants'
import { totalStock } from '../lib/format'
import { ApiError, USE_MOCK, mockDelay, request, toQuery } from './client'

export async function getProducts(filters = {}, { signal } = {}) {
  if (!USE_MOCK) {
    return request(
      `/products${toQuery({
        collection: filters.collection,
        color: filters.colors,
        size: filters.sizes,
        price: filters.price,
        sort: filters.sort,
      })}`,
      { signal },
    )
  }
  await mockDelay()
  return filterProducts(productsData, filters)
}

export async function getProduct(id, { signal } = {}) {
  if (!USE_MOCK) return request(`/products/${encodeURIComponent(id)}`, { signal })
  await mockDelay()
  const product = productsData.find((p) => p.id === id)
  if (!product) throw new ApiError('product not found', 404)
  return product
}

export async function getFeatured(limit = 4, { signal } = {}) {
  if (!USE_MOCK) return request(`/products/featured${toQuery({ limit })}`, { signal })
  await mockDelay()
  const featured = productsData.filter((p) => p.featured)
  return (featured.length ? featured : productsData).slice(0, limit)
}

/** Mock: rotates daily through in-stock products. */
export async function getSockOfTheDay({ signal } = {}) {
  if (!USE_MOCK) return request('/products/sock-of-the-day', { signal })
  await mockDelay()
  const inStock = productsData.filter((p) => totalStock(p) > 0)
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000)
  return inStock[dayOfYear % inStock.length]
}

/** Same collection first, then the rest. */
export async function getRelated(id, limit = 4, { signal } = {}) {
  if (!USE_MOCK) return request(`/products/${encodeURIComponent(id)}/related${toQuery({ limit })}`, { signal })
  await mockDelay()
  const current = productsData.find((p) => p.id === id)
  const others = productsData.filter((p) => p.id !== id)
  const same = others.filter((p) => p.collection === current?.collection)
  const rest = others.filter((p) => p.collection !== current?.collection && totalStock(p) > 0)
  return [...same, ...rest].slice(0, limit)
}

/** Pure filter + sort — mirrors what the backend should do for GET /products. */
export function filterProducts(list, { collection, colors = [], sizes = [], price, sort = 'featured' } = {}) {
  const range = PRICE_RANGES.find((r) => r.id === price)
  const result = list.filter((p) => {
    if (collection && collection !== 'all' && p.collection !== collection) return false
    if (colors.length && !colors.some((c) => p.colors.includes(c))) return false
    if (sizes.length && !sizes.some((s) => (p.stock?.[s] ?? 0) > 0)) return false
    if (range && (p.price < range.min || p.price > range.max)) return false
    return true
  })

  const soldOutLast = (a, b) => (totalStock(a) === 0) - (totalStock(b) === 0)
  const sorters = {
    featured: (a, b) => soldOutLast(a, b) || Number(b.featured) - Number(a.featured),
    'price-asc': (a, b) => soldOutLast(a, b) || a.price - b.price,
    'price-desc': (a, b) => soldOutLast(a, b) || b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
  }
  return [...result].sort(sorters[sort] || sorters.featured)
}
