import { Link } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { Heart, SockMonster, Squiggle } from '../components/art/Doodles'
import CartLine from '../components/cart/CartLine'
import CartSummary from '../components/cart/CartSummary'
import FreeShippingBar from '../components/cart/FreeShippingBar'
import GiftPackToggle from '../components/cart/GiftPackToggle'
import GiantHeadline from '../components/GiantHeadline'
import Sticker from '../components/Sticker'
import TrustStrip from '../components/TrustStrip'
import { useCart } from '../store/cart'
import { getTotals } from '../lib/pricing'

export default function Cart() {
  const { items, giftPack, setGiftPack } = useCart(
    useShallow((s) => ({ items: s.items, giftPack: s.giftPack, setGiftPack: s.setGiftPack })),
  )
  const count = items.reduce((n, i) => n + i.qty, 0)
  const discount = useCart((s) => s.discount)
  const subtotal = getTotals(items, giftPack, discount).merchandise

  return (
    <>
      <title>{`cart (${count}) — SOCKSAVVY`}</title>
      <section aria-labelledby="cart-title" className="tone-yellow clip-x relative min-h-[80svh] pb-section pt-28 md:pt-36">
        <Sticker className="absolute right-[8%] top-[90px] z-20 w-16 md:w-24" rotate={12} parallax={0.1}>
          <Heart />
        </Sticker>
        <Sticker className="absolute left-[44%] top-[120px] hidden w-20 md:block" outline={false} rotate={-14}>
          <Squiggle fill="#ff52a1" />
        </Sticker>

        <GiantHeadline
          as="h1"
          id="cart-title"
          lines={[
            { text: 'YOUR', from: 'right', className: 'pl-[22vw]' },
            { text: `CART (${count})`, from: 'left', className: 'pl-gutter' },
          ]}
        />

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-start gap-5 px-gutter">
            <Sticker className="w-28" rotate={-10}>
              <SockMonster />
            </Sticker>
            <p className="copy text-lg font-bold">your cart is emptier than a sock drawer on laundry day.</p>
            <p className="copy copy-offset">go find a pair that matches your personality (or doesn’t).</p>
            <Link to="/shop" className="btn btn-pink btn-lg">
              shop socks
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 px-gutter lg:grid-cols-12 lg:gap-14 lg:pr-24">
            <div className="lg:col-span-7">
              <FreeShippingBar subtotal={subtotal} />
              <ul className="mt-6 divide-y-2 divide-black/20 border-y-2 border-black" aria-label="items in your cart">
                {items.map((item) => (
                  <CartLine key={item.key} item={item} large />
                ))}
              </ul>
              <Link to="/shop" className="mt-6 inline-block text-label font-extrabold lowercase underline decoration-[3px] underline-offset-[6px]">
                ← keep shopping
              </Link>
            </div>

            <aside aria-labelledby="summary-title" className="lg:col-span-5">
              <div className="space-y-5 rounded-[2rem] border-2 border-black bg-offwhite p-5 shadow-hard-lg md:p-7 lg:sticky lg:top-8">
                <h2 id="summary-title" className="giant text-display">
                  summary
                </h2>
                <GiftPackToggle checked={giftPack} onChange={setGiftPack} />
                <CartSummary items={items} giftPack={giftPack} removable />
                <Link to="/checkout" className="btn btn-pink btn-lg w-full">
                  checkout
                </Link>
                <p className="text-center text-sm font-bold lowercase">cash on delivery or card · prices in pkr</p>
                <TrustStrip className="justify-center" bg="bg-yellow" />
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  )
}
