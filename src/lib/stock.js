// Colourway-aware stock helpers. Each colourway carries its own per-size stock
// ({ S, M, L }); the product's `stock` is the sum across colourways. Products
// without colourways just use `product.stock`.

/** Per-size stock of one colourway (or the product when there is none). */
export function stockFor(product, colorway) {
  return colorway?.stock ?? product?.stock ?? {}
}

/** The product's sock art recoloured to a colourway. */
export function artFor(product, colorway) {
  return colorway ? { ...product.art, base: colorway.base, trim: colorway.trim } : product.art
}

/** Pairs left in a colourway across all sizes. */
export function colorwayTotal(colorway) {
  return Object.values(colorway?.stock || {}).reduce((n, v) => n + v, 0)
}

/**
 * First colourway with a pair left in `size` (any size when size is null), not
 * counting pairs already in the cart (`cartItems`); then any colourway stocked in
 * `size`, then the first one. Null when the product has no colourways.
 */
export function pickColorway(product, size, cartItems = []) {
  const cws = product?.colorways
  if (!cws?.length) return null
  const inCart = (c) =>
    cartItems.find((i) => i.id === product.id && i.size === size && i.colorway?.id === c.id)?.qty ?? 0
  const has = (c) => (size ? (c.stock?.[size] ?? 0) - inCart(c) > 0 : colorwayTotal(c) > 0)
  return cws.find(has) ?? cws.find((c) => (c.stock?.[size] ?? 0) > 0) ?? cws[0]
}
