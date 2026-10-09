import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Flower, SockMonster, Sparkle } from '../components/art/Doodles'
import GiantHeadline from '../components/GiantHeadline'
import ParallaxSection from '../components/parallax/ParallaxSection'
import Sticker from '../components/Sticker'
import { SITE } from '../lib/constants'
import { formatPKR } from '../lib/format'
import { play } from '../fx/sound'
import { useCart } from '../store/cart'

/** Confirmation screen. Checkout navigates here with the order in router state. */
export default function OrderPlaced() {
  const order = useLocation().state?.order
  const [shareNote, setShareNote] = useState('')

  // the order is placed: empty the cart now that this page has replaced checkout
  useEffect(() => {
    if (order) useCart.getState().clear()
  }, [order])

  // it's a party: sock confetti rains once the page curtain has wiped off
  useEffect(() => {
    if (!order) return
    const t = setTimeout(() => {
      play('win')
      import('../fx/confetti').then(({ rain }) => rain({ duration: 3400, perFrame: 1.6, shapes: ['sock', 'sock', 'flower', 'star'] }))
    }, 650)
    return () => clearTimeout(t)
  }, [order])

  async function share() {
    const text = `just got my weird socks from ${SITE.instagramHandle} 🧦 #socksavvy`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SOCKSAVVY', text, url: `https://${SITE.domain}` })
        return
      } catch (e) {
        if (e?.name === 'AbortError') return
      }
    }
    // desktop: copy a caption and open our instagram
    try {
      await navigator.clipboard.writeText(text)
      setShareNote(`caption copied — paste it in your story and tag ${SITE.instagramHandle}`)
    } catch {
      setShareNote(`tag ${SITE.instagramHandle} in your story so we can repost you`)
    }
    window.open(SITE.instagram, '_blank', 'noopener,noreferrer')
  }

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
    // v2: the confetti socks fall at three depths (src/fx/confetti.js); the stickers sit on
    // their planes and separate as the page scrolls — the order details never move
    <ParallaxSection rest="top" aria-labelledby="placed-title" className="tone-green clip-x relative min-h-[90svh] pb-section pt-28 md:pt-36">
      <title>order placed — SOCKSAVVY</title>
      <Sticker className="absolute right-[3%] top-[64px] z-20 w-20 md:right-[6%] md:top-[96px] md:w-40" rotate={10} depth="near">
        <SockMonster fill="#f4d500" trim="#ff52a1" />
      </Sticker>
      <Sticker className="absolute bottom-[18%] right-[30%] w-14 md:w-20" outline={false} rotate={-10} depth="back">
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
      <div className="relative mt-12 max-w-xl px-gutter">
        <div className="-rotate-1 rounded-[1.75rem] border-2 border-black bg-offwhite p-5 text-black shadow-hard-lg md:p-6">
          <p className="text-[1.6rem] font-black leading-none">show off your pair</p>
          <p className="copy mt-2">post your socks and tag {SITE.instagramHandle} — we repost our favourites.</p>
          <button type="button" onClick={share} className="btn btn-pink mt-4">
            share on instagram {SITE.instagramHandle}
          </button>
          <p className="mt-2 text-sm font-bold" role="status" aria-live="polite">
            {shareNote}
          </p>
        </div>
      </div>
    </ParallaxSection>
  )
}
