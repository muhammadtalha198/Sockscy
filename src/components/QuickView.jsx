import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { getProduct } from '../api/products'
import { useAsync } from '../hooks/useAsync'
import { useDialog } from '../hooks/useDialog'
import { useAddToCart } from '../hooks/useAddToCart'
import { useCart } from '../store/cart'
import { useUi } from '../store/ui'
import { TILE_BG } from '../lib/constants'
import { formatPKR, stockNote } from '../lib/format'
import { artFor, pickColorway } from '../lib/stock'
import ProductImage from './ProductImage'
import SizePicker, { firstInStockSize } from './SizePicker'

/** Quick view: opened by clicking a sock in the physics hero (bottom sheet on phones). */
export default function QuickView() {
  const id = useUi((s) => s.quickViewId)
  const close = useUi((s) => s.closeQuickView)
  if (!id) return null
  return <QuickViewDialog key={id} id={id} onClose={close} />
}

function QuickViewDialog({ id, onClose }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  // a touch tap that opened this dialog fires its click a moment later — don't let
  // that ghost click land on the backdrop and close it again
  const openedAt = useRef(performance.now())
  const onBackdrop = () => {
    if (performance.now() - openedAt.current > 400) onClose()
  }
  const addToCart = useAddToCart()
  const addRef = useRef(null)
  const { data: product, loading, error } = useAsync(({ signal }) => getProduct(id, { signal }), [id])
  const [picked, setPicked] = useState(null)
  const size = picked ?? firstInStockSize(product)
  // quick view has no swatches: add the first colourway that still has this size
  const cartItems = useCart((s) => s.items)
  const colorway = pickColorway(product, size, cartItems)
  useDialog(true, { onClose, panelRef, initialFocusRef: closeRef })

  function add() {
    if (!product || !size) return
    const source = addRef.current?.getBoundingClientRect()
    onClose()
    addToCart(product, size, 1, { colorway, source })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
      <div className="qv-overlay absolute inset-0 bg-black/60" onClick={onBackdrop} aria-hidden="true" />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qv-title"
        tabIndex={-1}
        data-lenis-prevent
        className="qv-panel tone-offwhite relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] border-2 border-black shadow-hard-lg md:rounded-[2rem]"
      >
        <button ref={closeRef} type="button" onClick={onClose} className="btn btn-sm btn-offwhite absolute right-4 top-4 z-10" aria-label="close quick view">
          close ✕
        </button>
        {loading && !product && <p className="p-10 font-bold lowercase">loading sock…</p>}
        {error && <p className="p-10 font-bold lowercase">couldn’t load this sock: {error.message}</p>}
        {product && (
          <div className="grid gap-6 p-5 md:grid-cols-2 md:p-7">
            <div className="aspect-square overflow-hidden rounded-[1.5rem] border-2 border-black" style={{ background: TILE_BG[product.tile] }}>
              <ProductImage product={{ ...product, art: artFor(product, colorway) }} view="kick" decorative artClassName="h-[90%] w-[90%]" />
            </div>
            <div className="flex flex-col gap-4">
              <p className="tag">{product.collection}</p>
              <h2 id="qv-title" className="giant -mt-2 whitespace-normal text-[clamp(2.4rem,6vw,3.6rem)] leading-[0.9] tracking-[-0.045em] t-display">
                {product.name}
              </h2>
              <p className="text-display font-black">{formatPKR(product.price)}</p>
              <p className="inline-block w-fit -rotate-1 rounded-full border-2 border-black bg-yellow px-3 py-1 text-sm font-black">{stockNote(product, size)}</p>
              {colorway && <p className="-mt-2 text-sm font-bold lowercase">colour: {colorway.label}</p>}
              <SizePicker product={product} value={size} onChange={setPicked} />
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
                <button ref={addRef} type="button" className="btn btn-pink btn-lg" disabled={!size} onClick={add} data-cursor="add">
                  {size ? 'add to cart' : 'sold out'}
                </button>
                <Link to={`/product/${product.id}`} onClick={onClose} className="font-extrabold lowercase underline decoration-[3px] underline-offset-[6px]">
                  full details →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
