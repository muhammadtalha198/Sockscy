import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../store/cart'

/** "added to cart" sticker toast with the next step (shown instead of popping the drawer open). */
export default function CartToast() {
  const lastAdded = useCart((s) => s.lastAdded)
  const dismiss = useCart((s) => s.dismissToast)
  const openCart = useCart((s) => s.openCart)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!lastAdded) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 4200)
    return () => clearTimeout(t)
  }, [lastAdded])

  if (!lastAdded) return null
  const ok = lastAdded.added > 0
  return (
    <div className="cart-toast" data-visible={visible || undefined} onTransitionEnd={() => !visible && dismiss()}>
      <p className="text-[0.95rem] font-black leading-tight">
        {ok ? 'added! ' : 'that’s every pair we’ve got — '}
        <span className="font-bold">
          {lastAdded.name.toLowerCase()} · size {lastAdded.size}
          {lastAdded.label}
        </span>
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          className="text-sm font-extrabold lowercase underline decoration-2 underline-offset-4"
          onClick={() => {
            setVisible(false)
            openCart()
          }}
        >
          view cart
        </button>
        <Link to="/checkout" className="btn btn-sm btn-pink" onClick={() => setVisible(false)}>
          checkout →
        </Link>
        <button type="button" className="ml-auto px-1 text-lg font-black leading-none" aria-label="dismiss" onClick={() => setVisible(false)}>
          ×
        </button>
      </div>
    </div>
  )
}
