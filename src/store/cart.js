import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** "id:size" or "id:size:colorway" */
const lineKey = (id, size, colorwayId) => (colorwayId ? `${id}:${size}:${colorwayId}` : `${id}:${size}`)

/**
 * Stock is per size and shared by every colourway of a product, so each line's
 * maxQty = size stock − what other lines of the same product+size already hold.
 */
function rebalance(items) {
  return items.map((item) => {
    const stock = item.sizeStock ?? item.maxQty
    const others = items
      .filter((o) => o.key !== item.key && o.id === item.id && o.size === item.size)
      .reduce((n, o) => n + o.qty, 0)
    return { ...item, sizeStock: stock, maxQty: Math.max(item.qty, stock - others) }
  })
}

/**
 * Cart state. `items` and `giftPack` persist to localStorage ("socksavvy-cart");
 * drawer state, announcements and the last-added toast do not.
 */
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      giftPack: false,
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
        const stock = product.stock?.[size] ?? 0
        if (stock <= 0) return 0
        const key = lineKey(product.id, size, colorway?.id)
        const items = get().items
        const existing = items.find((i) => i.key === key)
        const others = items
          .filter((i) => i.key !== key && i.id === product.id && i.size === size)
          .reduce((n, i) => n + i.qty, 0)
        const cap = Math.max(0, stock - others)
        const currentQty = existing?.qty ?? 0
        const nextQty = Math.min(cap, currentQty + qty)
        const added = nextQty - currentQty
        const art = colorway ? { ...product.art, base: colorway.base, trim: colorway.trim } : product.art
        const label = colorway ? ` in ${colorway.label}` : ''

        let next = items
        if (added > 0) {
          next = existing
            ? items.map((i) => (i.key === key ? { ...i, qty: nextQty } : i))
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
                  sizeStock: stock,
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
          lastAdded: { added, name: product.name, size, label, at: Date.now() },
          announcement:
            added > 0
              ? `added ${added} × ${product.name}${label} (${size}) to your cart`
              : `you already have every pair of ${product.name} in ${size}`,
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
          announcement: item ? `removed ${item.name} (${item.size}) from your cart` : '',
        }))
      },

      clear: () => set({ items: [], giftPack: false }),
      setGiftPack: (giftPack) => set({ giftPack }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      dismissToast: () => set({ lastAdded: null }),
    }),
    {
      name: 'socksavvy-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, giftPack: state.giftPack }),
    },
  ),
)

export const selectCount = (state) => state.items.reduce((sum, i) => sum + i.qty, 0)
