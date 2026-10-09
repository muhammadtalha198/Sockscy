import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { getSockOfTheDay } from '../../api/products'
import { useAsync } from '../../hooks/useAsync'
import { useAddToCart } from '../../hooks/useAddToCart'
import { TILE_BG } from '../../lib/constants'
import { formatPKR, stockNote } from '../../lib/format'
import { useCart } from '../../store/cart'
import { artFor, pickColorway } from '../../lib/stock'
import { Squiggle } from '../art/Doodles'
import Badge from '../Badge'
import GiantHeadline from '../GiantHeadline'
import ProductImage from '../ProductImage'
import SizePicker, { firstInStockSize } from '../SizePicker'
import Sticker from '../Sticker'
import TornReveal from '../TornReveal'
import TrustStrip from '../TrustStrip'

/** Pink section — one huge product with a torn-paper reveal + add to cart */
export default function SockOfTheDay() {
  const { data: product, loading } = useAsync(({ signal }) => getSockOfTheDay({ signal }), [])
  const [picked, setPicked] = useState(null)
  const addToCart = useAddToCart()
  const imageRef = useRef(null)
  const size = picked ?? firstInStockSize(product)
  // no swatches here: add the first colourway that still has this size
  const cartItems = useCart((s) => s.items)
  const colorway = pickColorway(product, size, cartItems)
  const tile = product?.tile === 'pink' ? 'yellow' : product?.tile || 'yellow'

  return (
    <section id="sock-of-the-day" aria-labelledby="sotd-title" className="tone-pink clip-x relative py-section">
      <Sticker className="absolute left-[46%] top-[4%] z-20 w-20 md:w-28" outline={false} rotate={-20} parallax={0.15}>
        <Squiggle />
      </Sticker>
      <Sticker className="absolute right-[4%] top-[34%] z-20 hidden w-24 md:block" outline={false} rotate={30} parallax={0.1} delay={-2}>
        <Squiggle />
      </Sticker>

      <GiantHeadline
        id="sotd-title"
        lines={[
          { text: 'SOCK OF', from: 'left', className: 'pl-gutter' },
          { text: 'THE DAY', from: 'right', className: 'pl-[14vw]' },
        ]}
      />

      <div className="mt-10 grid gap-10 px-gutter lg:grid-cols-12 lg:items-end lg:pr-24">
        <div ref={imageRef} className="relative lg:col-span-7">
          {loading || !product ? (
            <div className="aspect-square animate-pulse rounded-[2rem] border-2 border-black bg-offwhite/40" />
          ) : (
            <TornReveal className="aspect-square overflow-hidden rounded-[2rem] border-2 border-black">
              <div className="h-full w-full" style={{ background: TILE_BG[tile] }}>
                <ProductImage
                  product={{ ...product, art: artFor(product, colorway) }}
                  view="kick"
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  artClassName="h-[92%] w-[92%]"
                />
              </div>
            </TornReveal>
          )}
          <Badge
            text="SOCKS OF THE DAY ✦ SOCKS OF THE DAY ✦ "
            bg="var(--color-yellow)"
            ink="#000"
            className="absolute -right-2 -top-10 z-20 w-28 md:-right-8 md:w-40"
          />
        </div>

        {product && (
          <div className="lg:col-span-5">
            <h3 className="giant text-[clamp(2.5rem,4.6vw,4.5rem)] leading-[0.9] tracking-[-0.045em]">{product.name}</h3>
            <p className="mt-3 text-display font-black">{formatPKR(product.price)}</p>
            <p className="copy mt-5">{product.description}</p>
            <p className="copy copy-offset mt-2 font-extrabold normal-case">
              {stockNote(product, size)}
              {colorway ? ` · colour: ${colorway.label}` : ''}
            </p>

            <div className="mt-6">
              <SizePicker product={product} value={size} onChange={setPicked} />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="button"
                className="btn btn-yellow btn-lg"
                data-cursor="add"
                disabled={!size}
                onClick={() => addToCart(product, size, 1, { colorway, source: imageRef.current })}
              >
                {size ? 'add to cart' : 'sold out'}
              </button>
              <Link
                to={`/product/${product.id}`}
                className="text-label font-extrabold lowercase underline decoration-[3px] underline-offset-[6px] hover:decoration-wavy"
              >
                more details
              </Link>
            </div>
            <TrustStrip className="mt-6" />
          </div>
        )}
      </div>
    </section>
  )
}
