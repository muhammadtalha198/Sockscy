import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { FREE_SHIPPING_THRESHOLD } from '../../lib/constants'
import { formatPKR } from '../../lib/format'
import { useCart } from '../../store/cart'
import SockArt from '../art/SockArt'

const DEFAULT_ART = { pattern: 'eggs', base: '#111111', trim: '#f4d500' }

/**
 * Progress to free shipping. A little sock (the last pair you added) walks along the
 * bar to where you are, turns round when you remove something, and jumps for joy
 * once shipping is free.
 */
export default function FreeShippingBar({ subtotal }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD)
  const unlocked = remaining === 0
  const art = useCart((s) => s.items.at(-1)?.art) ?? DEFAULT_ART

  // start at 0 and walk to the real progress on mount, then follow every change
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? progress : 0))
  const [walk, setWalk] = useState(null) // 'fwd' | 'back' while moving
  const [facing, setFacing] = useState('fwd')
  const prev = useRef(shown)
  useEffect(() => {
    if (prev.current === progress) return
    const dir = progress > prev.current ? 'fwd' : 'back'
    prev.current = progress
    const raf = requestAnimationFrame(() => {
      setShown(progress)
      if (prefersReducedMotion()) return
      setFacing(dir)
      setWalk(dir)
    })
    const t = setTimeout(() => setWalk(null), 950)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [progress])

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
      <div className="ship-track relative mt-1 pt-8">
        <span
          className="ship-sock"
          data-walk={walk || undefined}
          data-facing={facing}
          data-done={(unlocked && !walk) || undefined}
          style={{ left: `calc(${shown} * (100% - var(--ship-sock-w)))` }}
          aria-hidden="true"
        >
          <span className="ship-sock-body">
            <SockArt art={art} view="single" />
          </span>
        </span>
        <div
          role="progressbar"
          aria-label="progress to free shipping"
          aria-valuemin={0}
          aria-valuemax={FREE_SHIPPING_THRESHOLD}
          aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
          aria-valuetext={unlocked ? 'free shipping unlocked' : `${formatPKR(remaining)} to go`}
          className="h-5 overflow-hidden rounded-full border-2 border-black bg-white"
        >
          <div
            className="ship-fill h-full rounded-full bg-green"
            style={{ width: `${shown * 100}%`, borderRight: shown > 0 && shown < 1 ? '2px solid #000' : undefined }}
          />
        </div>
      </div>
    </div>
  )
}
