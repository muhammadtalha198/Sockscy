import { FREE_SHIPPING_THRESHOLD } from '../../lib/constants'
import { formatPKR } from '../../lib/format'

export default function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD)
  const unlocked = remaining === 0

  return (
    <div>
      <p className="text-[0.95rem] font-extrabold lowercase">
        {unlocked ? (
          <>free shipping unlocked ✦ nice.</>
        ) : (
          <>
            you’re <span className="font-black">{formatPKR(remaining)}</span> away from free shipping
          </>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="progress to free shipping"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
        aria-valuetext={unlocked ? 'free shipping unlocked' : `${formatPKR(remaining)} to go`}
        className="mt-2 h-5 overflow-hidden rounded-full border-2 border-black bg-white"
      >
        <div
          className="h-full rounded-full bg-green transition-[width] duration-500 ease-snap"
          style={{ width: `${progress * 100}%`, borderRight: progress > 0 && progress < 1 ? '2px solid #000' : undefined }}
        />
      </div>
    </div>
  )
}
