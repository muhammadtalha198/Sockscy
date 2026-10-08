import { cx } from '../../lib/cx'

export default function QuantityStepper({ value, min = 1, max = 99, onChange, label = 'quantity', small = false }) {
  const btn = cx(
    'grid place-items-center font-black leading-none disabled:cursor-not-allowed disabled:opacity-30',
    small ? 'h-9 w-9 text-lg' : 'h-12 w-12 text-2xl',
  )
  return (
    <div className="inline-flex items-center rounded-full border-2 border-black bg-white text-black" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`decrease ${label}`}>
        −
      </button>
      <output className={cx('text-center font-black tabular-nums', small ? 'w-6' : 'w-8 text-lg')} aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`increase ${label}`}>
        +
      </button>
    </div>
  )
}
