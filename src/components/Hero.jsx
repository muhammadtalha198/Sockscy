import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { FREE_SHIPPING_THRESHOLD } from '../lib/constants'
import { formatPKR } from '../lib/format'
import { whenIdle } from '../lib/motion'
import { useUi } from '../store/ui'
import { Flower, Sparkle, SockMonster, Squiggle, Star } from './art/Doodles'
import SockArt from './art/SockArt'
import Badge from './Badge'
import GiantHeadline from './GiantHeadline'
import PhysicsLayer from './hero/PhysicsLayer'
import Ribbon from './Ribbon'
import Sticker from './Sticker'

// Static cutouts: shown before physics loads and for reduced motion. With physics on,
// they hand over to falling, throwable stickers (src/physics/heroWorld.jsx).
// Real photo cutouts: add "cutout": "/cutouts/<id>.webp" to a product in products.json.
const EGG = { pattern: 'eggs', base: '#111111', trim: '#f4d500' }
const HEART = { pattern: 'hearts', base: '#ff52a1', trim: '#e63a3f' }
const CHECK = { pattern: 'checker', base: '#ffffff', trim: '#111111' }

const BADGE = {
  text: 'FRESH DROP ✦ SOCKS OF THE DAY ✦ ',
  bg: 'var(--color-black)',
  ink: 'var(--color-yellow)',
  center: <Flower fill="#ff52a1" center="#f4d500" className="h-full w-full" />,
}

const canTilt = () =>
  typeof window !== 'undefined' &&
  'DeviceOrientationEvent' in window &&
  window.matchMedia('(pointer: coarse)').matches

export default function Hero() {
  const introDone = useUi((s) => s.introDone)
  const reduced = useReducedMotion()
  const sectionRef = useRef(null)
  const [loadPhysics, setLoadPhysics] = useState(false)
  const [world, setWorld] = useState(null)
  const [tilt, setTilt] = useState('off')
  const [touched, setTouched] = useState(false)

  // physics is a bonus: load it once the page is idle (after the intro)
  useEffect(() => {
    if (reduced || !introDone) return
    return whenIdle(() => setLoadPhysics(true), 1200)
  }, [reduced, introDone])

  async function enableTilt() {
    if (!world) return
    setTilt((await world.enableTilt()) ? 'on' : 'denied')
  }

  const badge = (className) =>
    world ? (
      <button
        type="button"
        onClick={() => world.dropMore(4)}
        aria-label="drop more socks"
        data-physics-solid="circle"
        data-cursor="drop"
        className={`hero-badge rounded-full ${className}`}
      >
        <Badge {...BADGE} className="w-full" />
      </button>
    ) : (
      <Badge {...BADGE} className={className} />
    )

  return (
    <section
      ref={sectionRef}
      className="hero tone-yellow clip-x relative min-h-[100svh] pb-12 pt-28 md:pb-20 md:pt-32"
      aria-labelledby="hero-title"
      data-physics={world ? 'on' : 'off'}
      onPointerDown={() => !touched && world && setTouched(true)}
    >
      <Ribbon side="left" className="top-24 lg:hidden" />
      <Ribbon side="right" className="top-0 hidden lg:block" />

      <GiantHeadline
        as="h1"
        id="hero-title"
        size="mega"
        ready={introDone}
        skew={false}
        className="z-10"
        lines={[
          { text: 'SOCK', from: 'right', className: 'text-right -mr-[0.16em]', letters: true },
          { text: 'SAVVY', from: 'left', className: 'pl-gutter', style: { fontSize: 'min(29vw, 12.5rem)' }, letters: true },
        ]}
      />

      {/* shared cutout above the headline */}
      <Sticker
        className="hero-cutout absolute right-[16%] top-[58px] z-20 w-24 md:w-32 lg:left-[36%] lg:right-auto lg:top-[92px] lg:w-36"
        rotate={22}
        parallax={0.1}
        duration={6}
      >
        <SockArt art={HEART} view="single" />
      </Sticker>

      {/* MOBILE play zone: socks pile here, on top of the copy (its bottom is the floor) */}
      <div data-physics-floor className="hero-playzone relative h-[30svh] min-h-[13rem] md:hidden">
        <Sticker className="hero-cutout absolute -right-[6%] top-2 z-20 w-[42vw]" rotate={-6} parallax={0.08} duration={8} delay={-2}>
          <SockArt art={EGG} view="kick" />
        </Sticker>
        <Sticker className="hero-cutout absolute left-[2%] top-[22%] z-20 w-24" rotate={-8} duration={9}>
          <SockMonster />
        </Sticker>
        {badge('absolute bottom-2 left-[36%] z-30 w-24')}
        {world && (
          <p className="hero-hint absolute left-0 top-full z-30 mt-0.5 text-[0.8rem] font-extrabold lowercase" data-hidden={touched || undefined}>
            ↑ drag, throw &amp; stack the socks
          </p>
        )}
      </div>

      {/* DESKTOP cutouts */}
      <Sticker
        className="hero-cutout absolute top-[300px] z-20 hidden md:block md:-right-[4%] md:w-[38vw] lg:right-[5%] lg:top-[190px] lg:w-[30vw] lg:max-w-[470px]"
        rotate={-6}
        parallax={0.14}
        duration={8}
        delay={-2}
      >
        <SockArt art={EGG} view="kick" />
      </Sticker>
      <Sticker className="hero-cutout absolute left-[10%] top-[250px] z-20 hidden w-44 lg:block" rotate={-16} parallax={0.18} duration={7} delay={-1}>
        <SockArt art={CHECK} view="single" />
      </Sticker>
      <Sticker className="hero-cutout absolute bottom-6 left-[3%] z-20 hidden md:block md:w-44 lg:bottom-[6%] lg:left-[4%] lg:w-56" rotate={-8} parallax={-0.1} duration={9}>
        <SockMonster />
      </Sticker>

      {/* doodles */}
      <Sticker className="absolute left-[24%] top-[86px] z-0 hidden w-14 lg:block" outline={false} rotate={10} duration={10}>
        <Flower fill="#ff52a1" center="#f4d500" />
      </Sticker>
      <Sticker className="absolute left-[50%] top-[20%] z-0 hidden w-16 lg:block" outline={false} rotate={-12} duration={8} delay={-3}>
        <Star fill="#f5f1e8" />
      </Sticker>
      <Sticker className="absolute right-[40%] top-[292px] z-0 w-10 md:w-14 lg:left-[53%] lg:right-auto lg:top-[40%]" outline={false} duration={6} delay={-4}>
        <Sparkle fill="#ff52a1" />
      </Sticker>
      <Sticker className="absolute bottom-[10%] left-[30%] z-0 hidden w-24 lg:block" outline={false} rotate={8} duration={9}>
        <Squiggle fill="#ff52a1" />
      </Sticker>

      {/* staggered lowercase copy + CTA (solid: socks land on it) */}
      <div className="relative z-30 mt-6 px-gutter md:mt-8 lg:ml-[31%] lg:mt-10 lg:px-0">
        <p data-physics-solid className="copy max-w-[30rem] font-bold md:max-w-[34ch]">
          weird socks for weird people. thrifted, washed & hand-picked pairs you won’t see on anyone else.
        </p>
        <p data-physics-solid className="copy mt-2 ml-[11vw] md:ml-[clamp(2.5rem,22vw,16rem)] md:max-w-[28ch]">
          cash on delivery anywhere in pakistan. free shipping over {formatPKR(FREE_SHIPPING_THRESHOLD)}.
        </p>
        <div data-physics-solid className="mt-7 flex w-fit flex-wrap items-center gap-x-6 gap-y-4">
          <Link to="/shop" className="btn btn-pink btn-lg">
            shop socks
          </Link>
          <a href="#sock-of-the-day" className="text-label font-extrabold lowercase underline decoration-[3px] underline-offset-[6px] hover:decoration-wavy">
            sock of the day ↓
          </a>
        </div>
        {world && tilt !== 'on' && canTilt() && (
          <button type="button" onClick={enableTilt} className="btn btn-sm btn-offwhite mt-5" aria-label="use phone tilt to move the socks">
            {tilt === 'denied' ? 'no tilt? drag them instead' : 'tilt your phone to play'}
          </button>
        )}
        {world && (
          <p className="hero-hint mt-4 hidden text-sm font-extrabold lowercase md:block" data-hidden={touched || undefined}>
            psst — grab a sock and throw it. click one for a quick look.
          </p>
        )}
      </div>

      {/* DESKTOP badge */}
      {badge('absolute z-30 hidden md:block md:bottom-6 md:right-[6%] md:w-36 lg:bottom-[8%] lg:right-[28%] lg:w-40')}

      {loadPhysics && <PhysicsLayer sectionRef={sectionRef} onReady={setWorld} />}
    </section>
  )
}
