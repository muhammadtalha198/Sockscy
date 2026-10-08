import { GIFT_PACK_PRICE } from '../../lib/constants'
import { formatPKR } from '../../lib/format'
import PizzaBox from '../art/PizzaBox'

/** Add-on: socks shipped in a pizza-box style gift pack */
export default function GiftPackToggle({ checked, onChange, compact = false }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-black bg-yellow p-3 text-black shadow-hard [--tone-focus:#000]">
      <PizzaBox className={compact ? 'w-16 shrink-0' : 'w-24 shrink-0'} />
      <span className="min-w-0 flex-1">
        <span className="block font-black uppercase leading-tight">pizza-box gift pack</span>
        {!compact && (
          <span className="mt-1 block text-sm font-semibold lowercase leading-snug">
            your socks, folded like a hot slice in a printed pizza box with a handwritten note.
          </span>
        )}
        <span className="mt-1 block text-sm font-black">+{formatPKR(GIFT_PACK_PRICE)}</span>
      </span>
      <input
        type="checkbox"
        className="h-6 w-6 shrink-0 accent-black"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}
