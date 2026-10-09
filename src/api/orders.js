// Orders API.
//
// Go backend contract:
//   POST /orders
//     body: {
//       customer: { name, phone, email? },
//       shipping: { address, city, province, postalCode?, notes? },
//       payment: "cod" | "card",
//       giftPack: boolean,
//       items: [{ id, size, qty, colorway? }] ← ids only; the server prices the order.
//                                              Stock is per size, shared by all colourways.
//     }
//     → { orderNumber, status, total, payment, paymentUrl? }
//       For "card", return paymentUrl from your gateway (PayFast / Safepay / Stripe…)
//       and the frontend redirects there. Never send raw card numbers to your own API.
//
//   GET /orders/:orderNumber?phone=03XXXXXXXXX
//     → { orderNumber, createdAt, status, payment, total, items[], timeline[{ key, label, at, done }] }

import productsData from '../data/products.json'
import { getTotals } from '../lib/pricing'
import { normalisePhone } from '../lib/format'
import { ApiError, USE_MOCK, mockDelay, request, toQuery } from './client'

export async function createOrder(payload) {
  if (!USE_MOCK) return request('/orders', { method: 'POST', body: payload })
  await mockDelay(700)
  return mockCreateOrder(payload)
}

export async function trackOrder(orderNumber, phone) {
  const id = String(orderNumber || '').trim().toUpperCase()
  if (!USE_MOCK) {
    return request(`/orders/${encodeURIComponent(id)}${toQuery({ phone: phone ? normalisePhone(phone) : '' })}`)
  }
  await mockDelay(400)
  const order = readMockOrders()[id]
  if (!order) throw new ApiError('we couldn’t find that order number', 404)
  if (phone && normalisePhone(phone) !== order.customer.phone) {
    throw new ApiError('that phone number doesn’t match this order', 403)
  }
  return withTimeline(order)
}

// ---------------------------------------------------------------------------
// Mock implementation (localStorage). Delete once the Go API is live.
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'socksavvy-mock-orders'
export const DEMO_ORDER_NUMBER = 'SS-10234'

const STEPS = [
  { key: 'placed', label: 'order placed', after: 0 },
  { key: 'confirmed', label: 'confirmed on whatsapp', after: 2 * 60_000 },
  { key: 'packed', label: 'packed (with a sticker)', after: 60 * 60_000 },
  { key: 'shipped', label: 'shipped with courier', after: 24 * 60 * 60_000 },
  { key: 'delivered', label: 'delivered — go show off', after: 3 * 24 * 60 * 60_000 },
]

function readMockOrders() {
  let orders = {}
  try {
    orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    orders = {}
  }
  if (!orders[DEMO_ORDER_NUMBER]) {
    orders[DEMO_ORDER_NUMBER] = {
      orderNumber: DEMO_ORDER_NUMBER,
      createdAt: new Date(Date.now() - 36 * 60 * 60_000).toISOString(),
      payment: 'cod',
      customer: { name: 'demo customer', phone: '03001234567' },
      shipping: { city: 'Lahore' },
      items: [{ id: 'sunny-side-up', name: 'Sunny Side Up', size: 'M', qty: 1, price: 1250 }],
      total: 1500,
    }
  }
  return orders
}

function writeMockOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    /* storage full or blocked — mock only */
  }
}

function mockCreateOrder({ customer, shipping, payment, giftPack, items }) {
  if (!items?.length) throw new ApiError('your cart is empty', 400)

  // Re-price on the "server" from the catalogue, like the real backend must.
  const wanted = {}
  for (const { id, size, qty } of items) wanted[`${id}:${size}`] = (wanted[`${id}:${size}`] || 0) + qty
  const priced = items.map(({ id, size, qty, colorway }) => {
    const product = productsData.find((p) => p.id === id)
    if (!product) throw new ApiError(`product ${id} no longer exists`, 409)
    const left = product.stock?.[size] ?? 0
    if (left < wanted[`${id}:${size}`]) {
      throw new ApiError(`sorry — only ${left} left of ${product.name} in ${size}`, 409)
    }
    const cw = product.colorways?.find((c) => c.id === colorway)
    return { id, size, qty, colorway: cw?.id, name: cw ? `${product.name} (${cw.label})` : product.name, price: product.price }
  })

  const totals = getTotals(priced, giftPack)
  const orderNumber = `SS-${String(Date.now()).slice(-5)}${Math.floor(Math.random() * 10)}`
  const order = {
    orderNumber,
    createdAt: new Date().toISOString(),
    payment,
    giftPack: Boolean(giftPack),
    customer: { ...customer, phone: normalisePhone(customer.phone) },
    shipping,
    items: priced,
    total: totals.total,
  }

  const orders = readMockOrders()
  orders[orderNumber] = order
  writeMockOrders(orders)

  return {
    orderNumber,
    status: 'placed',
    total: order.total,
    payment,
    // Real backend: return the payment gateway URL for card payments.
    paymentUrl: null,
  }
}

function withTimeline(order) {
  const created = new Date(order.createdAt).getTime()
  const now = Date.now()
  const timeline = STEPS.map((step) => ({
    key: step.key,
    label: step.label,
    at: new Date(created + step.after).toISOString(),
    done: now >= created + step.after,
  }))
  const current = [...timeline].reverse().find((s) => s.done)
  return { ...order, status: current?.key ?? 'placed', timeline }
}
