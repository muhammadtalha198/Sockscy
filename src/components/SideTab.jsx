import { selectCount, useCart } from '../store/cart'

/** Black vertical tab on the right edge (the reference's "Honors" tab) — opens the cart drawer. */
export default function SideTab() {
  const count = useCart(selectCount)
  const isOpen = useCart((s) => s.isOpen)
  const openCart = useCart((s) => s.openCart)

  return (
    <button
      type="button"
      onClick={openCart}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-3 bg-black px-1.5 pb-4 pt-3 text-offwhite [--tone-focus:var(--color-yellow)] hover:bg-red hover:text-black md:gap-4 md:px-3 md:pb-6 md:pt-4"
    >
      <span className="text-xl font-black leading-none text-yellow md:text-3xl" aria-hidden="true">
        S.
      </span>
      <span className="rotate-180 text-sm font-bold tracking-wide [writing-mode:vertical-rl] md:text-lg" aria-hidden="true">
        Cart ({count})
      </span>
    </button>
  )
}
