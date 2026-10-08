import { getTotals } from '../../lib/pricing'
import { formatPKR } from '../../lib/format'

export default function CartSummary({ items, giftPack, className = '' }) {
  const t = getTotals(items, giftPack)
  return (
    <dl className={`space-y-1.5 text-[0.95rem] font-bold lowercase ${className}`}>
      <div className="flex justify-between gap-4">
        <dt>subtotal</dt>
        <dd>{formatPKR(t.subtotal)}</dd>
      </div>
      {t.gift > 0 && (
        <div className="flex justify-between gap-4">
          <dt>pizza-box gift pack</dt>
          <dd>{formatPKR(t.gift)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt>shipping</dt>
        <dd>{t.shipping === 0 ? 'free' : formatPKR(t.shipping)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t-2 border-black pt-2 text-xl font-black uppercase">
        <dt>total</dt>
        <dd>{formatPKR(t.total)}</dd>
      </div>
    </dl>
  )
}
