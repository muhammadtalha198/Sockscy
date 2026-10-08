// Contact + newsletter API.
//
// Go backend contract:
//   POST /contact     body: { name, contact, orderNumber?, message } → { ok: true }
//   POST /newsletter  body: { email }                                → { ok: true }

import { USE_MOCK, mockDelay, request } from './client'

export async function sendContactMessage(payload) {
  if (!USE_MOCK) return request('/contact', { method: 'POST', body: payload })
  await mockDelay(600)
  return { ok: true }
}

export async function subscribeNewsletter(email) {
  if (!USE_MOCK) return request('/newsletter', { method: 'POST', body: { email } })
  await mockDelay(500)
  return { ok: true }
}
