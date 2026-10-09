// Discount codes + the "Find the Pair" daily win record.
// The backend must validate codes itself (POST /orders sends `discountCode`).

export const DISCOUNTS = {
  PAIRUP10: { code: 'PAIRUP10', percent: 10, label: 'find-the-pair win' },
}

export function lookupDiscount(code) {
  return DISCOUNTS[String(code || '').trim().toUpperCase()] || null
}

const GAME_KEY = 'socksavvy-game'

/** local calendar day, e.g. "2026-10-09" */
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function hasWonToday() {
  try {
    return JSON.parse(localStorage.getItem(GAME_KEY) || '{}').lastWin === todayKey()
  } catch {
    return false
  }
}

export function recordWin() {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify({ lastWin: todayKey() }))
  } catch {
    /* storage blocked — the win still applies for this session */
  }
}
