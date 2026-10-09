import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../store/cart'

/** "added to cart" sticker toast with the next step (shown instead of popping the drawer open). */
export default function CartToast() {
  const lastAdded = useCart((s) => s.lastAdded)
  const dismiss = useCart((s) => s.dismissToast)
  const openCart = useCart((s) => s.openCart)
  const [visible, setVisible] = useState(false)
  const [held, setHeld] = useState(false) // pointer over it or focus inside: don't time out
  const ref = useRef(null)

  useEffect(() => {
    if (lastAdded) setVisible(true)
  }, [lastAdded])
  useEffect(() => {
    if (!visible || held) return
    const t = setTimeout(() => setVisible(false), 4200)
    return () => clearTimeout(t)
  }, [visible, held, lastAdded])

  // closing with focus inside would drop it on <body> — hand it to the cart tab instead
  function hide() {
    if (ref.current?.contains(document.activeElement)) document.querySelector('[data-cart-target]')?.focus({ preventScroll: true })
    setHeld(false)
    setVisible(false)
  }

  if (!lastAdded) return null
  const { added, requested = added } = lastAdded
  const lead = added === 0 ? 'that’s every pair we’ve got — ' : added > 1 ? `added ${added}! ` : 'added! '
  return (
    <div
      ref={ref}
      className="cart-toast"
      data-visible={visible || undefined}
      onTransitionEnd={() => !visible && dismiss()}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(ref.current?.contains(document.activeElement) ?? false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !ref.current?.contains(e.relatedTarget) && setHeld(false)}
    >
      <p className="text-[0.95rem] font-black leading-tight">
        {lead}
        <span className="font-bold">
          {lastAdded.name.toLowerCase()} · size {lastAdded.size}
          {lastAdded.label}
        </span>
      </p>
      {added > 0 && added < requested && (
        <p className="mt-1 text-sm font-bold">only {added} left, so that’s every pair we’ve got.</p>
      )}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          className="text-sm font-extrabold lowercase underline decoration-2 underline-offset-4"
          onClick={() => {
            setHeld(false)
            setVisible(false)
            openCart()
          }}
        >
          view cart
        </button>
        <Link to="/checkout" className="btn btn-sm btn-pink" onClick={hide}>
          checkout →
        </Link>
        <button type="button" className="ml-auto px-1 text-lg font-black leading-none" aria-label="dismiss" onClick={hide}>
          ×
        </button>
      </div>
    </div>
  )
}
