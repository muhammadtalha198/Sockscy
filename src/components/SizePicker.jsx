import { useId } from 'react'
import { SIZES } from '../lib/constants'
import { cx } from '../lib/cx'

/** Radio-group of size pills. Sold-out sizes are disabled and struck through. */
export default function SizePicker({ product, value, onChange, showFit = true, legend = 'size' }) {
  const name = `size${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const sizes = SIZES.filter((s) => product.sizes.includes(s.id))
  const fit = SIZES.find((s) => s.id === value)?.fit

  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      <div className="flex flex-wrap gap-3">
        {sizes.map((s) => {
          const left = product.stock?.[s.id] ?? 0
          const soldOut = left === 0
          return (
            <label key={s.id} className={cx('relative', soldOut ? 'cursor-not-allowed' : 'cursor-pointer')}>
              <input
                type="radio"
                name={name}
                value={s.id}
                checked={value === s.id}
                disabled={soldOut}
                onChange={() => onChange(s.id)}
                className="peer sr-only"
              />
              <span
                className={cx(
                  'grid h-14 min-w-14 place-items-center rounded-full border-2 border-black bg-white px-4 text-lg font-black text-black shadow-hard transition-transform',
                  'peer-checked:translate-x-1 peer-checked:translate-y-1 peer-checked:bg-black peer-checked:text-yellow peer-checked:shadow-none',
                  'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-(--tone-focus)',
                  soldOut && 'bg-white/60 text-black/45 line-through shadow-none',
                )}
              >
                {s.label}
                <span className="sr-only">{soldOut ? ' (sold out)' : left === 1 ? ' (last pair)' : ''}</span>
              </span>
            </label>
          )
        })}
      </div>
      {showFit && fit && <p className="mt-2 text-sm font-semibold lowercase">fits {fit}</p>}
    </fieldset>
  )
}

export function firstInStockSize(product) {
  return product?.sizes.find((s) => (product.stock?.[s] ?? 0) > 0) ?? null
}
