const pkr = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 })

/** 1250 → "Rs 1,250" */
export function formatPKR(amount) {
  return `Rs ${pkr.format(Math.round(amount || 0))}`
}

/** Normalise Pakistani mobile numbers: "+92 300 1234567" / "0300-1234567" → "03001234567" */
export function normalisePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('92') && digits.length === 12) return `0${digits.slice(2)}`
  return digits
}

/** Valid PK mobile: 03XXXXXXXXX (11 digits) */
export function isValidPkMobile(value) {
  return /^03\d{9}$/.test(normalisePhone(value))
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

export function totalStock(product) {
  return Object.values(product?.stock || {}).reduce((sum, n) => sum + n, 0)
}

/** Stock note shown on cards and the product page */
export function stockNote(product, size) {
  const total = totalStock(product)
  if (total === 0) return 'sold out — thrifted pairs don’t restock'
  if (total === 1) return 'thrifted / one of one — this exact pair won’t come back'
  if (size) {
    const left = product.stock?.[size] ?? 0
    if (left === 0) return `sold out in ${size} — try another size`
    if (left === 1) return `thrifted / one of one in ${size}`
    return `thrifted / only ${left} pairs left in ${size}`
  }
  return `thrifted / only ${total} pairs left, all sizes`
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}
