import { Link } from 'react-router'
import { useCart } from '../../store/cart'
import { TILE_BG } from '../../lib/constants'
import { formatPKR } from '../../lib/format'
import { cx } from '../../lib/cx'
import ProductImage from '../ProductImage'
import QuantityStepper from './QuantityStepper'

export default function CartLine({ item, large = false }) {
  const setQty = useCart((s) => s.setQty)
  const removeItem = useCart((s) => s.removeItem)
  const product = { name: item.name, art: item.art, images: item.image ? [item.image] : [] }

  return (
    <li className="flex gap-4 py-4">
      <Link
        to={`/product/${item.id}`}
        className={cx('shrink-0 overflow-hidden rounded-2xl border-2 border-black', large ? 'h-32 w-28 md:h-40 md:w-32' : 'h-24 w-20')}
        style={{ background: TILE_BG[item.tile] || TILE_BG.yellow }}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage product={product} view="single" decorative artClassName="h-[88%] w-[88%]" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${item.id}`} className={cx('block font-black uppercase leading-none hover:underline', large ? 'text-xl md:text-2xl' : 'text-base')}>
              {item.name}
            </Link>
            <p className="mt-1 text-sm font-semibold lowercase">
              size {item.size}
              {item.colorway ? ` · ${item.colorway.label}` : ''} · {formatPKR(item.price)} each
            </p>
          </div>
          <p className={cx('shrink-0 font-black', large ? 'text-xl' : 'text-base')}>{formatPKR(item.price * item.qty)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2">
            <QuantityStepper
              small
              value={item.qty}
              max={item.maxQty}
              onChange={(qty) => setQty(item.key, qty)}
              label={`quantity for ${item.name}`}
            />
            {item.qty >= item.maxQty && <span className="text-xs font-bold lowercase leading-tight">that’s all<br />we’ve got</span>}
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.key)}
            className="text-sm font-extrabold lowercase underline decoration-2 underline-offset-4 hover:decoration-wavy"
            aria-label={`remove ${item.name} size ${item.size}`}
          >
            remove
          </button>
        </div>
      </div>
    </li>
  )
}
