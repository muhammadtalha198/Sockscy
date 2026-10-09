import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { hasWonToday } from '../lib/discount'
import { subscribeVelocity } from '../motion/velocity'
import { useCart } from '../store/cart'
import { useUi } from '../store/ui'
import SockArt from './art/SockArt'
import Badge from './Badge'

const loadGame = () => import('../game/FindThePair')
const FindThePair = lazy(loadGame)

// no game nudges while someone is paying
const HIDDEN_ON = ['/checkout', '/order-placed']

/** Floating sticker "play for a discount" → lazy-loaded Find the Pair game. */
export default function PlayButton() {
  const { pathname } = useLocation()
  const open = useUi((s) => s.gameOpen)
  const openGame = useUi((s) => s.openGame)
  const closeGame = useUi((s) => s.closeGame)
  const discount = useCart((s) => s.discount)
  const [prefetched, setPrefetched] = useState(false)
  const [tucked, setTucked] = useState(false)

  // phones: slide away while scrolling down so it never sits on top of what you're reading
  useEffect(() => {
    if (!window.matchMedia('(max-width: 47.99rem)').matches) return
    let timer = 0
    const unsub = subscribeVelocity((v) => {
      if (v > 2) setTucked(true)
      else if (v < -2) setTucked(false)
      clearTimeout(timer)
      timer = setTimeout(() => setTucked(false), 900)
    })
    return () => {
      unsub()
      clearTimeout(timer)
    }
  }, [])
  const won = discount?.code === 'PAIRUP10' || hasWonToday()
  const prefetch = () => {
    if (!prefetched) {
      setPrefetched(true)
      loadGame()
    }
  }

  return (
    <>
      {!HIDDEN_ON.includes(pathname) && (
        <button
          type="button"
          onClick={openGame}
          onPointerEnter={prefetch}
          onFocus={prefetch}
          data-tucked={tucked || undefined}
          className="play-button fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-3 z-40 w-[4.75rem] rounded-full md:bottom-6 md:left-6 md:w-24"
          aria-label={won ? 'play find the pair (PAIRUP10 is already in your cart)' : 'play find the pair to win 10% off'}
          aria-haspopup="dialog"
        >
          <Badge
            text={won ? 'PAIRUP10 APPLIED ✦ PLAY AGAIN ✦ ' : 'PLAY FOR A DISCOUNT ✦ FIND THE PAIR ✦ '}
            bg="var(--color-pink)"
            ink="#000"
            center={
              <span className="flex -space-x-2">
                <SockArt art={{ pattern: 'smiley', base: '#111111', trim: '#f4d500' }} view="upright" className="h-9 w-auto -rotate-12 md:h-11" />
                <SockArt art={{ pattern: 'smiley', base: '#111111', trim: '#f4d500' }} view="upright" className="h-9 w-auto rotate-12 md:h-11" />
              </span>
            }
            className="w-full"
          />
        </button>
      )}
      {open && (
        <Suspense fallback={null}>
          <FindThePair onClose={closeGame} />
        </Suspense>
      )}
    </>
  )
}
