import { Link, useLocation } from 'react-router'
import { Flower, SockMonster, Sparkle } from '../components/art/Doodles'
import GiantHeadline from '../components/GiantHeadline'
import Sticker from '../components/Sticker'
import { SITE } from '../lib/constants'
import { formatPKR } from '../lib/format'

/** Confirmation screen. Checkout navigates here with the order in router state. */
export default function OrderPlaced() {
  const order = useLocation().state?.order

  if (!order) {
    return (
      <section className="tone-green clip-x relative min-h-[80svh] pb-section pt-28 md:pt-36">
        <title>order placed — SOCKSAVVY</title>
        <GiantHeadline as="h1" lines={[{ text: 'ALL', className: 'pl-gutter' }, { text: 'DONE?', className: 'pl-[14vw]' }]} />
        <div className="mt-8 flex flex-col items-start gap-5 px-gutter">
          <p className="copy">looking for an order you already placed? track it with your order number.</p>
          <Link to="/orders" className="btn btn-yellow btn-lg">
            track an order
          </Link>
        </div>
      </section>
    )
  }

  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`hi socksavvy! i just placed order ${order.orderNumber}`)}`
  return (
    <section aria-labelledby="placed-title" className="tone-green clip-x relative min-h-[90svh] pb-section pt-28 md:pt-36">
      <title>order placed — SOCKSAVVY</title>
      <Sticker className="absolute right-[3%] top-[64px] z-20 w-20 md:right-[6%] md:top-[96px] md:w-40" rotate={10} parallax={0.12}>
        <SockMonster fill="#f4d500" trim="#ff52a1" />
      </Sticker>
      <Sticker className="absolute bottom-[18%] right-[30%] w-14 md:w-20" outline={false} rotate={-10}>
        <Sparkle fill="#f4d500" />
      </Sticker>
      <Sticker className="absolute left-[60%] top-[40%] hidden w-16 md:block" outline={false} rotate={18}>
        <Flower fill="#ff52a1" center="#000" />
      </Sticker>

      <GiantHeadline
        as="h1"
        id="placed-title"
        lines={[
          { text: 'ORDER', from: 'left', className: 'pl-gutter' },
          { text: 'PLACED!', from: 'right', className: 'pl-[14vw] text-offwhite' },
        ]}
      />
      <div className="mt-10 max-w-2xl space-y-3 px-gutter">
        <p className="text-label font-black uppercase">order number</p>
        <p className="giant text-huge t-display">{order.orderNumber}</p>
        <p className="copy text-lg">
          we’ll whatsapp you on {order.phone} to confirm.{' '}
          {order.payment === 'cod' ? `keep ${formatPKR(order.total)} ready for the rider.` : 'your payment went through.'}
        </p>
        <p className="copy copy-offset">your socks ship in 1–2 days and arrive in 3–5.</p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4 px-gutter">
        <Link to={`/orders?number=${encodeURIComponent(order.orderNumber)}`} className="btn btn-yellow btn-lg">
          track order
        </Link>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-offwhite btn-lg">
          whatsapp us
        </a>
        <Link to="/shop" className="self-center text-label font-extrabold lowercase underline decoration-[3px] underline-offset-[6px]">
          keep shopping
        </Link>
      </div>
    </section>
  )
}
