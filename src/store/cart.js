import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const lineKey = (id, size) => `${id}:${size}`

/**
 * Cart state. `items` and `giftPack` persist to localStorage ("socksavvy-cart");
 * drawer state does not.
 */
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      giftPack: false,
      isOpen: false,
      announcement: '',

      addItem(product, size, qty = 1) {
        const maxQty = product.stock?.[size] ?? 0
        if (maxQty <= 0) return 0
        const key = lineKey(product.id, size)
        const existing = get().items.find((i) => i.key === key)
        const nextQty = Math.min(maxQty, (existing?.qty ?? 0) + qty)
        const added = nextQty - (existing?.qty ?? 0)

        set((state) => ({
          items: existing
            ? state.items.map((i) => (i.key === key ? { ...i, qty: nextQty, maxQty } : i))
            : [
                ...state.items,
                {
                  key,
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  size,
                  qty: nextQty,
                  maxQty,
                  tile: product.tile,
                  art: product.art,
                  image: product.images?.[0] ?? null,
                },
              ],
          isOpen: true,
          announcement:
            added > 0
              ? `added ${added} × ${product.name} (${size}) to your cart`
              : `you already have every pair of ${product.name} in ${size}`,
        }))
        return added
      },

      setQty(key, qty) {
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, qty: Math.max(0, Math.min(i.maxQty, qty)) } : i))
            .filter((i) => i.qty > 0),
        }))
      },

      removeItem(key) {
        const item = get().items.find((i) => i.key === key)
        set((state) => ({
          items: state.items.filter((i) => i.key !== key),
          announcement: item ? `removed ${item.name} (${item.size}) from your cart` : '',
        }))
      },

      clear: () => set({ items: [], giftPack: false }),
      setGiftPack: (giftPack) => set({ giftPack }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
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
