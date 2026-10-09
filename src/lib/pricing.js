import { FREE_SHIPPING_THRESHOLD, GIFT_PACK_PRICE, SHIPPING_FEE } from './constants'

/**
 * Cart totals shown to the shopper. The backend must recompute these from
 * product ids + sizes + quantities (+ discount code) when an order is placed —
 * never trust the client.
 *   discount: { code, percent } | null — taken off the socks only (not gift pack / shipping);
 *   free shipping is judged on the socks total after the discount.
 */
export function getTotals(items, giftPack = false, discount = null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const discountAmount = discount?.percent ? Math.round((subtotal * discount.percent) / 100) : 0
  const merchandise = subtotal - discountAmount
  const gift = giftPack && items.length ? GIFT_PACK_PRICE : 0
  const freeShipping = merchandise >= FREE_SHIPPING_THRESHOLD
  const shipping = items.length === 0 || freeShipping ? 0 : SHIPPING_FEE
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - merchandise)
  const progress = Math.min(1, merchandise / FREE_SHIPPING_THRESHOLD)
  return {
    subtotal,
    discount: discountAmount,
    discountCode: discountAmount ? discount.code : null,
    merchandise,
    gift,
    shipping,
    total: merchandise + gift + shipping,
    freeShipping,
    remainingForFree,
    progress,
  }
}
