import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getProduct, getRelated } from '../api/products'
import { Flower, Sparkle } from '../components/art/Doodles'
import PizzaBox from '../components/art/PizzaBox'
import QuantityStepper from '../components/cart/QuantityStepper'
import GiantHeadline from '../components/GiantHeadline'
import ProductCarousel from '../components/ProductCarousel'
import ProductGrid from '../components/ProductGrid'
import SizePicker, { firstInStockSize } from '../components/SizePicker'
import Sticker from '../components/Sticker'
import { useAsync } from '../hooks/useAsync'
import { useAddToCart } from '../hooks/useAddToCart'
import { COLLECTIONS, FREE_SHIPPING_THRESHOLD, GIFT_PACK_PRICE } from '../lib/constants'
import { cx } from '../lib/cx'
import { formatPKR, stockNote, totalStock } from '../lib/format'
import { artFor, colorwayTotal, pickColorway, stockFor } from '../lib/stock'
import { useCart } from '../store/cart'
import NotFound from './NotFound'

export default function Product() {
  const { id } = useParams()
  const { data: product, loading, error } = useAsync(({ signal }) => getProduct(id, { signal }), [id])

  if (error?.status === 404) return <NotFound />
  if (error) {
    return (
      <section className="tone-offwhite px-gutter pb-section pt-36">
        <p className="copy font-bold">couldn’t load this sock: {error.message}</p>
      </section>
    )
  }
  if (loading || !product || product.id !== id) {
    return (
      <section className="tone-offwhite grid gap-10 px-gutter pb-section pt-28 md:pt-36 lg:grid-cols-12" aria-busy="true" aria-label="loading product">
        <div className="aspect-[4/5] animate-pulse rounded-[2rem] border-2 border-black bg-black/10 md:aspect-square lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <div className="h-24 w-3/4 animate-pulse rounded-2xl bg-black/10" />
          <div className="h-10 w-1/3 animate-pulse rounded-2xl bg-black/10" />
        </div>
      </section>
    )
  }
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }) {
  const colorways = product.colorways || []
  const [colorwayId, setColorwayId] = useState(() => pickColorway(product, null)?.id ?? null)
  const colorway = colorways.find((c) => c.id === colorwayId) || null
  // the size picker + stock note follow the chosen colourway's own stock
  const view = useMemo(() => (colorway ? { ...product, stock: stockFor(product, colorway) } : product), [product, colorway])
  const [size, setSize] = useState(() => firstInStockSize(view))
  const [qty, setQty] = useState(1)
  const art = useMemo(() => artFor(product, colorway), [product, colorway])
  const addToCart = useAddToCart()
  const buttonRef = useRef(null)
  const related = useAsync(({ signal }) => getRelated(product.id, 4, { signal }), [product.id])

  // what's left to add = this colour's stock in this size, minus what's already in the cart
  const cwId = colorway?.id ?? null
  const inLine = useCart(
    (s) => s.items.find((i) => i.id === product.id && i.size === size && (i.colorway?.id ?? null) === cwId)?.qty ?? 0,
  )
  const inSize = useCart((s) =>
    s.items.filter((i) => i.id === product.id && i.size === size).reduce((n, i) => n + i.qty, 0),
  )
  const sizeStock = product.stock?.[size] ?? 0
  const lineStock = Math.min(sizeStock, view.stock?.[size] ?? 0)
  const available = Math.max(0, Math.min(lineStock - inLine, sizeStock - inSize))
  const amount = Math.max(1, Math.min(qty, available))
  const soldOut = totalStock(product) === 0
  const oneOfOne = totalStock(product) === 1
  const collection = COLLECTIONS.find((c) => c.id === product.collection)

  function chooseColorway(c) {
    setColorwayId(c.id)
    // keep the size if this colour has it, otherwise jump to one it does have
    if ((c.stock?.[size] ?? 0) === 0) setSize(firstInStockSize({ ...product, stock: c.stock }) ?? size)
  }

  function onSubmit(e) {
    e.preventDefault()
    if (size && available > 0) addToCart(product, size, amount, { colorway, source: buttonRef.current })
  }

  const buttonLabel = soldOut
    ? 'sold out'
    : available > 0
      ? 'add to cart'
      : inLine > 0
        ? 'all in your cart'
        : 'sold out in this size'

  return (
    <>
      <title>{`${product.name} — SOCKSAVVY`}</title>

      <section className="tone-offwhite clip-x relative pb-section pt-28 md:pt-36">
        <nav aria-label="breadcrumb" className="px-gutter text-sm font-bold lowercase">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link to="/shop" className="underline underline-offset-4">shop</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to={`/shop?collection=${product.collection}`} className="underline underline-offset-4">
                {collection?.label || product.collection}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{product.name.toLowerCase()}</li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 px-gutter lg:grid-cols-12 lg:gap-12 lg:pr-24">
          <div className="lg:col-span-7">
            <ProductCarousel
              product={product}
              art={art}
              spinKey={colorwayId}
              badge={
                (oneOfOne || soldOut) && (
                  <span className="absolute left-4 top-4 -rotate-6 rounded-full border-2 border-black bg-offwhite px-4 py-1.5 text-sm font-black uppercase shadow-hard">
                    {soldOut ? 'sold out' : 'one of one'}
                  </span>
                )
              }
            />
          </div>

          <div className="relative lg:col-span-5">
            <Sticker className="absolute right-[4%] top-2 z-20 w-16 md:w-20 lg:-top-8" rotate={14} parallax={0.1}>
              <Flower fill="#f4d500" center="#e63a3f" />
            </Sticker>

            <GiantHeadline as="h1" size="huge" lines={product.name.toUpperCase().split(' ')} />

            <p className="mt-4 text-display font-black">{formatPKR(product.price)}</p>
            <p className="mt-2 inline-block -rotate-1 rounded-full border-2 border-black bg-yellow px-3 py-1 text-sm font-black">
              {stockNote(view, size)}
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              {colorways.length > 1 && (
                <fieldset>
                  <legend className="field-label">
                    colour: <span className="font-black">{colorway?.label}</span>
                  </legend>
                  <div className="flex flex-wrap gap-3">
                    {colorways.map((c) => {
                      const out = colorwayTotal(c) === 0
                      return (
                        <label key={c.id} className={cx('swatch relative', out ? 'is-out' : 'cursor-pointer')}>
                          <input
                            type="radio"
                            name="colorway"
                            value={c.id}
                            checked={colorwayId === c.id}
                            disabled={out}
                            onChange={() => chooseColorway(c)}
                            className="peer sr-only"
                          />
                          <span
                            className="swatch-dot peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-(--tone-focus)"
                            style={{ '--base': c.base, '--trim': c.trim }}
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            {c.label}
                            {out ? ' (sold out)' : ''}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}
              <SizePicker product={view} value={size} onChange={setSize} />
              <div>
                <span className="field-label" id="qty-label">
                  quantity
                </span>
                <QuantityStepper value={amount} max={Math.max(1, available)} onChange={setQty} label="quantity" />
                {inLine > 0 ? (
                  <p className="mt-2 text-sm font-bold">
                    {inLine} already in your cart{available > 0 ? ` — ${available} more left` : ' — that’s every pair'}.
                  </p>
                ) : (
                  lineStock > 0 &&
                  lineStock <= 2 && (
                    <p className="mt-2 text-sm font-bold">
                      max {lineStock} — that’s every {colorway ? `${colorway.label} ` : ''}pair we’ve got in {size}.
                    </p>
                  )
                )}
              </div>
              <button ref={buttonRef} type="submit" data-cursor="add" className="btn btn-pink btn-lg w-full md:w-auto md:min-w-[18rem]" disabled={!size || available === 0}>
                {buttonLabel}
              </button>
            </form>

            <div className="mt-10 space-y-2">
              <p className="copy">{product.description}</p>
              {product.details?.length > 0 && (
                <ul className="copy copy-offset list-['✦_'] pl-5">
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
            </div>

            <ul className="mt-8 space-y-1 border-t-2 border-black pt-4 text-sm font-bold lowercase">
              <li>✦ cash on delivery anywhere in pakistan</li>
              <li>✦ free shipping over {formatPKR(FREE_SHIPPING_THRESHOLD)}</li>
              <li>✦ ships in 1–2 days, arrives in 3–5</li>
            </ul>

            <div className="mt-6 flex items-center gap-4 rounded-2xl border-2 border-black bg-yellow p-4 shadow-hard">
              <PizzaBox className="w-20 shrink-0" art={product.art} />
              <p className="text-sm font-bold lowercase">
                gifting? add the <span className="font-black">pizza-box gift pack</span> in your cart for +{formatPKR(GIFT_PACK_PRICE)}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="related-title" className="tone-red clip-x relative py-section">
        <Sticker className="absolute right-[8%] top-10 w-14 md:w-20" outline={false} rotate={-8}>
          <Sparkle fill="#f4d500" />
        </Sticker>
        <GiantHeadline
          id="related-title"
          lines={[
            { text: 'YOU MIGHT', from: 'left', className: 'pl-gutter' },
            { text: 'ALSO LIKE', from: 'right', className: 'pl-[16vw] text-offwhite' },
          ]}
        />
        <div className="mt-12 px-gutter lg:pr-24">
          <ProductGrid products={related.data} loading={related.loading} skeletons={4} />
        </div>
      </section>
    </>
  )
}
