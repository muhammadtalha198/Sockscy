import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import productsData from '../data/products.json'
import { lookupDiscount } from '../lib/discount'
import { artFor, stockFor } from '../lib/stock'

/** "id:size" or "id:size:colorway" */
const lineKey = (id, size, colorwayId) => (colorwayId ? `${id}:${size}:${colorwayId}` : `${id}:${size}`)

/** Pairs held by the other lines of the same product + size. */
const othersInSize = (items, key, id, size) =>
  items.filter((o) => o.key !== key && o.id === id && o.size === size).reduce((n, o) => n + o.qty, 0)

/**
 * Each colourway has its own per-size stock (`lineStock`); the product's per-size
 * stock (`sizeStock`) is their sum. A line's maxQty is the smaller of its own stock
 * and what the size has left after the product's other lines.
 */
function rebalance(items) {
  return items.map((item) => {
    const sizeStock = item.sizeStock ?? item.maxQty
    const lineStock = item.lineStock ?? sizeStock
    const cap = Math.min(lineStock, sizeStock - othersInSize(items, item.key, item.id, item.size))
    return { ...item, sizeStock, lineStock, maxQty: Math.max(item.qty, cap) }
  })
}

/**
 * v1 → v2: carts saved before colourways had their own stock may hold lines that
 * colour can't fill. Re-derive both stock caps from the (static) catalogue, clamp the
 * quantities, drop lines with nothing left. The server re-checks stock at checkout anyway.
 */
function migrateCart(state, version) {
  if (version >= 2 || !Array.isArray(state?.items)) return state
  const items = []
  const used = {} // pairs already given to earlier lines of the same product + size
  for (const item of state.items) {
    const product = productsData.find((p) => p.id === item.id)
    if (!product) {
      items.push(item) // unknown here (real backend catalogue) — let checkout validate it
      continue
    }
    const colorway = product.colorways?.find((c) => c.id === item.colorway?.id) ?? null
    const sizeStock = product.stock?.[item.size] ?? 0
    const lineStock = Math.min(sizeStock, stockFor(product, colorway)[item.size] ?? 0)
    const k = `${item.id}:${item.size}`
    const qty = Math.min(item.qty, lineStock, sizeStock - (used[k] || 0))
    if (qty > 0) {
      used[k] = (used[k] || 0) + qty
      items.push({ ...item, sizeStock, lineStock, qty })
    }
  }
  return { ...state, items: rebalance(items) }
}

/**
 * Cart state. `items`, `giftPack` and `discount` persist to localStorage ("socksavvy-cart");
 * drawer state, announcements and the last-added toast do not.
 */
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      giftPack: false,
      discount: null, // { code, percent } — e.g. PAIRUP10 from the Find the Pair game
      isOpen: false,
      announcement: '',
      lastAdded: null,

      /**
       * @param opts.colorway  one of product.colorways (optional)
       * @param opts.open      open the drawer afterwards (default true; the fly-to-cart
       *                       animation passes false and shows a toast instead)
       * @returns number of pairs actually added (0 when stock is used up)
       */
      addItem(product, size, qty = 1, { colorway = null, open = true } = {}) {
        const sizeStock = product.stock?.[size] ?? 0
        const lineStock = Math.min(sizeStock, stockFor(product, colorway)[size] ?? 0)
        const key = lineKey(product.id, size, colorway?.id)
        const items = get().items
        const existing = items.find((i) => i.key === key)
        const cap = Math.max(0, Math.min(lineStock, sizeStock - othersInSize(items, key, product.id, size)))
        const currentQty = existing?.qty ?? 0
        const nextQty = Math.max(currentQty, Math.min(cap, currentQty + qty))
        const added = nextQty - currentQty
        const art = artFor(product, colorway)
        const label = colorway ? ` in ${colorway.label}` : ''

        let next = items
        if (added > 0) {
          next = existing
            ? items.map((i) => (i.key === key ? { ...i, qty: nextQty, sizeStock, lineStock } : i))
            : [
                ...items,
                {
                  key,
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  size,
                  qty: nextQty,
                  maxQty: cap,
                  sizeStock,
                  lineStock,
                  colorway: colorway ? { id: colorway.id, label: colorway.label } : null,
                  tile: product.tile,
                  art,
                  image: product.images?.[0] ?? null,
                },
              ]
        }
        set({
          items: rebalance(next),
          isOpen: open && added > 0 ? true : get().isOpen,
          lastAdded: { added, requested: qty, name: product.name, size, label, at: Date.now() },
          announcement:
            added > 0
              ? `added ${added} × ${product.name}${label} (${size}) to your cart${added < qty ? ` — that’s every pair we’ve got` : ''}`
              : `you already have every pair of ${product.name}${label} in ${size}`,
        })
        return added
      },

      setQty(key, qty) {
        set((state) => ({
          items: rebalance(
            state.items
              .map((i) => (i.key === key ? { ...i, qty: Math.max(0, Math.min(i.maxQty, qty)) } : i))
              .filter((i) => i.qty > 0),
          ),
        }))
      },

      removeItem(key) {
        const item = get().items.find((i) => i.key === key)
        set((state) => ({
          items: rebalance(state.items.filter((i) => i.key !== key)),
          announcement: item
            ? `removed ${item.name}${item.colorway ? ` in ${item.colorway.label}` : ''} (${item.size}) from your cart`
            : '',
        }))
      },

      clear: () => set({ items: [], giftPack: false, discount: null }),
      applyDiscount(code) {
        const d = lookupDiscount(code)
        if (d) set({ discount: { code: d.code, percent: d.percent }, announcement: `${d.code} applied: ${d.percent}% off your socks` })
        return Boolean(d)
      },
      removeDiscount: () => set({ discount: null, announcement: 'discount removed' }),
      setGiftPack: (giftPack) => set({ giftPack }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      dismissToast: () => set({ lastAdded: null }),
    }),
    {
      name: 'socksavvy-cart',
      version: 2,
      migrate: migrateCart,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, giftPack: state.giftPack, discount: state.discount }),
    },
  ),
)

export const selectCount = (state) => state.items.reduce((sum, i) => sum + i.qty, 0)
