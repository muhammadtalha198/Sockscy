import { useCallback } from 'react'
import { flyToCart } from '../fx/flyToCart'
import { artFor } from '../lib/stock'
import { useCart } from '../store/cart'

/**
 * Add to cart with the full celebration: the sock flies into the cart tab, the tab
 * shakes, the counter pops, sound + flower confetti, and a toast offers checkout.
 *   const add = useAddToCart()
 *   add(product, size, qty, { colorway, source: buttonEl })
 */
export function useAddToCart() {
  const addItem = useCart((s) => s.addItem)
  return useCallback(
    (product, size, qty = 1, { colorway = null, source = null } = {}) => {
      const added = addItem(product, size, qty, { colorway, open: false })
      if (added > 0) {
        flyToCart({ from: source, art: artFor(product, colorway) })
      }
      return added
    },
    [addItem],
  )
}
