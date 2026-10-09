import { useEffect, useRef, useState } from 'react'
import { CART_LANDED } from '../fx/flyToCart'
import { selectCount, useCart } from '../store/cart'

/**
 * Black vertical tab on the right edge (the reference's "Honors" tab) — opens the cart
 * drawer. It is also the landing pad for flying socks: it shakes and the counter pops.
 */
export default function SideTab() {
  const count = useCart(selectCount)
  const isOpen = useCart((s) => s.isOpen)
  const openCart = useCart((s) => s.openCart)
  const [bump, setBump] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const onLand = () => setBump((n) => n + 1)
    window.addEventListener(CART_LANDED, onLand)
    return () => window.removeEventListener(CART_LANDED, onLand)
  }, [])

  return (
    <button
      ref={ref}
      type="button"
      onClick={openCart}
      data-cart-target
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      className="side-tab fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-3 bg-black px-1.5 pb-4 pt-3 text-offwhite [--tone-focus:var(--color-yellow)] hover:bg-red hover:text-black md:gap-4 md:px-3 md:pb-6 md:pt-4"
    >
      <span key={`s${bump}`} className={`side-tab-inner flex flex-col items-center gap-3 md:gap-4${bump ? ' is-bumped' : ''}`}>
        <span className="text-xl font-black leading-none text-yellow md:text-3xl" aria-hidden="true">
          S.
        </span>
        <span className="rotate-180 text-sm font-bold tracking-wide [writing-mode:vertical-rl] md:text-lg" aria-hidden="true">
          Cart (<span key={`c${bump}`} className={`inline-block${bump ? ' side-tab-count' : ''}`}>{count}</span>)
        </span>
      </span>
    </button>
  )
}
