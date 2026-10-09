import { getTotals } from '../../lib/pricing'
import { formatPKR } from '../../lib/format'
import { useCart } from '../../store/cart'

export default function CartSummary({ items, giftPack, className = '', removable = false }) {
  const discount = useCart((s) => s.discount)
  const removeDiscount = useCart((s) => s.removeDiscount)
  const t = getTotals(items, giftPack, discount)
  return (
    <dl className={`space-y-1.5 text-[0.95rem] font-bold lowercase ${className}`}>
      <div className="flex justify-between gap-4">
        <dt>subtotal</dt>
        <dd>{formatPKR(t.subtotal)}</dd>
      </div>
      {t.discount > 0 && (
        <div className="flex justify-between gap-4">
          <dt>
            discount <span className="rounded-full border-2 border-black bg-yellow px-2 py-0.5 text-xs font-black uppercase">{t.discountCode}</span>
            {removable && (
              <button type="button" onClick={removeDiscount} className="ml-2 text-xs font-extrabold underline underline-offset-2">
                remove
              </button>
            )}
          </dt>
          <dd>−{formatPKR(t.discount)}</dd>
        </div>
      )}
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
