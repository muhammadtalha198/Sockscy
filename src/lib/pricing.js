import { FREE_SHIPPING_THRESHOLD, GIFT_PACK_PRICE, SHIPPING_FEE } from './constants'

/**
 * Cart totals shown to the shopper. The backend must recompute these from
 * product ids + sizes + quantities when an order is placed — never trust the client.
 */
export function getTotals(items, giftPack = false) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const gift = giftPack && items.length ? GIFT_PACK_PRICE : 0
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping = items.length === 0 || freeShipping ? 0 : SHIPPING_FEE
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD)
  return {
    subtotal,
    gift,
    shipping,
    total: subtotal + gift + shipping,
    freeShipping,
    remainingForFree,
    progress,
  }
}
