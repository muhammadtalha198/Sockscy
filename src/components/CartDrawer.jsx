import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { useCart } from '../store/cart'
import { useDialog } from '../hooks/useDialog'
import { cx } from '../lib/cx'
import { SockMonster } from './art/Doodles'
import CartLine from './cart/CartLine'
import CartSummary from './cart/CartSummary'
import FreeShippingBar from './cart/FreeShippingBar'
import GiftPackToggle from './cart/GiftPackToggle'
import Sticker from './Sticker'

/** Slide-in cart from the right. Esc / overlay closes; focus is trapped while open. */
export default function CartDrawer() {
  const { items, isOpen, giftPack, closeCart, setGiftPack } = useCart(
    useShallow((s) => ({ items: s.items, isOpen: s.isOpen, giftPack: s.giftPack, closeCart: s.closeCart, setGiftPack: s.setGiftPack })),
  )
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const { pathname } = useLocation()
  const count = items.reduce((n, i) => n + i.qty, 0)
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0)

  // close when navigating
  useEffect(() => {
    closeCart()
  }, [pathname, closeCart])

  useDialog(isOpen, { onClose: closeCart, panelRef, initialFocusRef: closeRef })

  return (
    <div className={cx('fixed inset-0 z-50', !isOpen && 'pointer-events-none')} inert={!isOpen}>
      <div
        className={cx('absolute inset-0 bg-black/60 transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0')}
        onClick={closeCart}
        aria-hidden="true"
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cx(
          'tone-offwhite absolute right-0 top-0 flex h-dvh w-full max-w-[28rem] flex-col border-l-2 border-black transition-[transform,visibility] duration-[400ms] ease-snap',
          isOpen ? 'visible translate-x-0' : 'invisible translate-x-full',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b-2 border-black px-5 pb-4 pt-5">
          <h2 id="cart-drawer-title" className="giant text-[clamp(3rem,14vw,4.5rem)] leading-[0.85] tracking-[-0.05em] t-display">
            cart <span className="align-top text-2xl tracking-normal text-black">({count})</span>
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="btn btn-sm btn-offwhite mt-1 shrink-0"
            aria-label="close cart"
          >
            close ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="relative flex flex-1 flex-col items-start justify-center gap-5 px-5 pb-16">
            <Sticker className="w-28" rotate={-10}>
              <SockMonster />
            </Sticker>
            <p className="giant text-display">empty.</p>
            <p className="copy">your cart is emptier than a sock drawer on laundry day.</p>
            <Link to="/shop" className="btn btn-yellow btn-lg">
              shop socks
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b-2 border-black px-5 py-4">
              <FreeShippingBar subtotal={subtotal} />
            </div>
            <ul data-lenis-prevent className="flex-1 divide-y-2 divide-black/15 overflow-y-auto overscroll-contain px-5">
              {items.map((item) => (
                <CartLine key={item.key} item={item} />
              ))}
            </ul>
            <footer className="space-y-4 border-t-2 border-black px-5 pb-6 pt-4">
              <GiftPackToggle compact checked={giftPack} onChange={setGiftPack} />
              <CartSummary items={items} giftPack={giftPack} />
              <div className="flex flex-col gap-3">
                <Link to="/checkout" className="btn btn-pink btn-lg w-full">
                  checkout
                </Link>
                <Link to="/cart" className="self-center text-sm font-extrabold lowercase underline decoration-2 underline-offset-4">
                  view full cart
                </Link>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  )
}
