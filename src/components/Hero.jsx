import { Link } from 'react-router'
import { FREE_SHIPPING_THRESHOLD } from '../lib/constants'
import { formatPKR } from '../lib/format'
import { Flower, Sparkle, SockMonster, Squiggle, Star } from './art/Doodles'
import SockArt from './art/SockArt'
import Badge from './Badge'
import GiantHeadline from './GiantHeadline'
import Ribbon from './Ribbon'
import Sticker from './Sticker'
import { useUi } from '../store/ui'

// Hero cutouts — swap these for transparent product cutouts (WebP/PNG) when you have photos:
//   <Sticker …><img src="/cutouts/egg-legs.webp" alt="" loading="eager" /></Sticker>
const EGG = { pattern: 'eggs', base: '#111111', trim: '#f4d500' }
const HEART = { pattern: 'hearts', base: '#ff52a1', trim: '#e63a3f' }
const CHECK = { pattern: 'checker', base: '#ffffff', trim: '#111111' }

export default function Hero() {
  const introDone = useUi((s) => s.introDone)
  return (
    <section className="tone-yellow clip-x relative min-h-[100svh] pb-20 pt-28 md:pt-32" aria-labelledby="hero-title">
      <Ribbon side="left" className="top-24 lg:hidden" />
      <Ribbon side="right" className="top-0 hidden lg:block" />

      <GiantHeadline
        as="h1"
        id="hero-title"
        size="mega"
        ready={introDone}
        className="z-10"
        lines={[
          { text: 'SOCK', from: 'right', className: 'text-right -mr-[0.16em]' },
          { text: 'SAVVY', from: 'left', className: 'pl-gutter', style: { fontSize: 'min(29vw, 12.5rem)' } },
        ]}
      />

      {/* sock cutouts + stickers overlapping the type */}
      <Sticker className="absolute right-[16%] top-[58px] z-20 w-24 md:w-32 lg:left-[36%] lg:right-auto lg:top-[92px] lg:w-36" rotate={22} parallax={0.1} duration={6}>
        <SockArt art={HEART} view="single" />
      </Sticker>

      <Sticker
        className="absolute -right-[6%] top-[318px] z-20 w-[44vw] md:top-[300px] md:w-[38vw] lg:right-[5%] lg:top-[190px] lg:w-[30vw] lg:max-w-[470px]"
        rotate={-6}
        parallax={0.14}
        duration={8}
        delay={-2}
      >
        <SockArt art={EGG} view="kick" />
      </Sticker>

      <Sticker className="absolute left-[10%] top-[250px] z-20 hidden w-44 lg:block" rotate={-16} parallax={0.18} duration={7} delay={-1}>
        <SockArt art={CHECK} view="single" />
      </Sticker>

      <Sticker className="absolute bottom-6 left-[3%] z-20 w-32 md:w-44 lg:bottom-[6%] lg:left-[4%] lg:w-56" rotate={-8} parallax={-0.1} duration={9}>
        <SockMonster />
      </Sticker>

      <Sticker className="absolute left-[24%] top-[86px] z-0 hidden w-14 lg:block" outline={false} rotate={10} duration={10}>
        <Flower fill="#ff52a1" center="#f4d500" />
      </Sticker>
      <Sticker className="absolute left-[50%] top-[20%] z-20 hidden w-16 lg:block" outline={false} rotate={-12} duration={8} delay={-3}>
        <Star fill="#f5f1e8" />
      </Sticker>
      <Sticker className="absolute right-[40%] top-[292px] z-0 w-10 md:w-14 lg:left-[53%] lg:right-auto lg:top-[40%]" outline={false} duration={6} delay={-4}>
        <Sparkle fill="#ff52a1" />
      </Sticker>
      <Sticker className="absolute bottom-[10%] left-[30%] z-0 hidden w-24 lg:block" outline={false} rotate={8} duration={9}>
        <Squiggle fill="#ff52a1" />
      </Sticker>

      {/* staggered lowercase copy + CTA */}
      <div className="relative z-10 mt-8 px-gutter lg:ml-[31%] lg:mt-10 lg:px-0">
        <p className="copy max-w-[58%] font-bold md:max-w-[34ch]">
          weird socks for weird people. thrifted, washed & hand-picked pairs you won’t see on anyone else.
        </p>
        <p className="copy mt-2 ml-[11vw] max-w-[47%] md:ml-[clamp(2.5rem,22vw,16rem)] md:max-w-[28ch]">
          cash on delivery anywhere in pakistan. free shipping over {formatPKR(FREE_SHIPPING_THRESHOLD)}.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link to="/shop" className="btn btn-pink btn-lg">
            shop socks
          </Link>
          <a href="#sock-of-the-day" className="text-label font-extrabold lowercase underline decoration-[3px] underline-offset-[6px] hover:decoration-wavy">
            sock of the day ↓
          </a>
        </div>
      </div>

      <Badge
        text="FRESH DROP ✦ SOCKS OF THE DAY ✦ "
        bg="var(--color-black)"
        ink="var(--color-yellow)"
        center={<Flower fill="#ff52a1" center="#f4d500" className="h-full w-full" />}
        className="absolute bottom-6 right-[6%] z-30 w-28 md:w-36 lg:bottom-[8%] lg:right-[28%] lg:w-40"
      />
    </section>
  )
}
