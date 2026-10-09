import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { loadScrollKit } from '../../motion/scroll'
import { useParallax } from '../../hooks/useParallax'
import { wordDrift } from '../GiantHeadline'
import { SOCK_PATH } from '../art/SockArt'
import { FriedEgg, Sparkle, Squiggle, Star } from '../art/Doodles'
import ParallaxSection from '../parallax/ParallaxSection'
import Sticker from '../Sticker'

/*
  Pinned "sock factory": a CSS-sticky stage inside a tall section; GSAP ScrollTrigger
  scrubs a timeline as you scroll — the sock is sketched, dyed, printed with fried
  eggs, stitched and finally becomes a die-cut sticker. The giant step word swaps
  with a hard cut. Reduced motion (or no JS kit): the finished sock, static.
*/
const STEPS = [
  { word: 'SKETCH', label: 'sketch', text: 'every weird sock starts as a doodle in the back of a notebook.' },
  { word: 'DYE', label: 'dye', text: 'then someone picks a colour nobody asked for. hot pink, obviously.' },
  { word: 'PRINT', label: 'print', text: 'add fried eggs. it’s always fried eggs.' },
  { word: 'STITCH', label: 'stitch', text: 'cuff, heel, toe. every seam gets checked by hand.' },
  { word: 'STICKER', label: 'sticker', text: 'peel, stick, ship: washed, thrifted, one of one.' },
]
const EGGS = [
  [66, 30], [104, 56], [68, 90], [108, 116], [66, 148], [104, 174],
  [74, 208], [124, 212], [158, 220], [188, 226], [100, 238], [142, 240],
]

export default function SockFactory() {
  const rootRef = useRef(null)
  const wordRef = useRef(null)
  // the step word is the back plane: it slides across as you move through the pinned scene
  useParallax({ ref: wordRef, depth: 'back', axis: 'x', pin: true, drift: wordDrift() * 1.4, dir: -1, skew: true, pointer: false })

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    let ctx = null
    let cancelled = false
    loadScrollKit().then((kit) => {
      if (!kit || cancelled) return
      const { gsap } = kit
      root.dataset.live = ''
      ctx = gsap.context(() => {
        const q = gsap.utils.selector(root)
        const sketch = q('.f-sketch')[0]
        const len = sketch.getTotalLength()
        let step = -1
        gsap.set(sketch, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 })
        gsap.set(q('.f-dye'), { scaleY: 0, transformOrigin: '50% 100%' })
        gsap.set(q('.f-egg'), { scale: 0, transformOrigin: '50% 50%' })
        gsap.set(q('.f-trim, .f-stitch, .f-outline'), { opacity: 0 })
        gsap.set(q('.f-cut'), { opacity: 0, attr: { 'stroke-width': 0 } })
        gsap.set(q('.f-stamp'), { scale: 0, rotate: -40, transformOrigin: '50% 50%' })
        gsap.set(q('.f-cta'), { autoAlpha: 0, scale: 0.4 })

        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.6,
              onUpdate: (self) => {
                const i = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length * 0.999))
                if (i !== step) {
                  step = i
                  root.dataset.step = String(i)
                }
              },
            },
          })
          .to(sketch, { strokeDashoffset: 0, duration: 1 })
          .to(q('.f-dye'), { scaleY: 1, duration: 1, ease: 'power1.inOut' })
          .to(q('.f-egg'), { scale: 1, duration: 0.25, stagger: 0.06, ease: 'back.out(2.2)' })
          .to(q('.f-trim'), { opacity: 1, duration: 0.35 }, 3)
          .to(q('.f-stitch'), { opacity: 1, duration: 0.35 }, 3.25)
          .to(q('.f-outline'), { opacity: 1, duration: 0.3 }, 3.5)
          .to(sketch, { opacity: 0, duration: 0.3 }, 3.5)
          .to(q('.f-cut'), { opacity: 1, attr: { 'stroke-width': 22 }, duration: 0.45, ease: 'back.out(2)' }, 4)
          .to(q('.f-stamp'), { scale: 1, rotate: -12, duration: 0.35, ease: 'back.out(3)' }, 4.3)
          .to(q('.f-cta'), { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, 4.55)
          .to({}, { duration: 0.2 })
      }, root)
    })
    return () => {
      cancelled = true
      ctx?.revert()
      delete root.dataset.live
      root.dataset.step = String(STEPS.length - 1)
    }
  }, [])

  return (
    <ParallaxSection innerRef={rootRef} id="factory" className="factory tone-black relative clip-x" data-step={STEPS.length - 1} aria-labelledby="factory-title">
      <div className="factory-pin sticky top-0 flex h-[100svh] flex-col overflow-hidden px-gutter pb-6 pt-16 md:pb-10 md:pt-20 lg:pr-24">
        {/* depth inside the pinned stage (driven by progress through the scene):
            back — doodles sinking slowly · mid — the sock being made · near — loose fried
            eggs that float in at the PRINT step and rise past faster */}
        <Sticker pin depth="back" outline={false} flyIn={false} className="absolute left-[8%] top-[22%] z-0 w-10 md:w-16" rotate={-12}>
          <Star fill="#ff52a1" />
        </Sticker>
        <Sticker pin depth="back" outline={false} flyIn={false} className="absolute right-[10%] top-[64%] z-0 hidden w-24 md:block" rotate={14} delay={-3}>
          <Squiggle fill="#f4d500" />
        </Sticker>
        <Sticker pin depth="far" outline={false} flyIn={false} className="absolute right-[24%] top-[14%] z-0 w-8 md:w-12" delay={-1}>
          <Sparkle fill="#f4d500" />
        </Sticker>
        <Sticker pin depth="near" flyIn={false} className="f-float absolute left-[14%] top-[58%] z-30 w-16 md:left-[30%] md:w-24" rotate={-14}>
          <FriedEgg />
        </Sticker>
        <Sticker pin depth="front" flyIn={false} className="f-float absolute right-[8%] top-[30%] z-30 w-14 md:right-[30%] md:w-20" rotate={18} delay={-2}>
          <FriedEgg />
        </Sticker>
        <Sticker pin depth="near" flyIn={false} className="f-float absolute right-[18%] bottom-[16%] z-30 hidden w-14 md:block" rotate={-30} delay={-4}>
          <FriedEgg />
        </Sticker>
        <h2 id="factory-title" className="tag relative z-20">
          the sock factory ↓<span className="sr-only"> — how a weird sock comes together, in five steps</span>
        </h2>

        <div className="pointer-events-none absolute inset-x-0 top-[16%] z-0 flex justify-center md:top-[12%]" aria-hidden="true">
          <p ref={wordRef} className="factory-words giant t-display shrink-0 text-[clamp(5rem,25vw,22rem)] leading-[0.8]">
            {STEPS.map((s, i) => (
              <span key={s.word} className="f-word" data-i={i}>
                {s.word}
              </span>
            ))}
          </p>
        </div>

        <div className="relative z-10 grid flex-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-10">
          <ol className="factory-steps hidden self-end pb-4 md:block" aria-label="steps">
            {STEPS.map((s, i) => (
              <li key={s.word} data-i={i} className="flex items-baseline gap-3 py-1 text-[1.6rem] font-black lowercase lg:text-[2rem]">
                <span className="text-base text-pink">0{i + 1}</span>
                {s.label}
              </li>
            ))}
          </ol>

          <svg
            className="factory-sock mx-auto h-[44svh] w-auto md:h-[60svh]"
            viewBox="26 -8 192 272"
            role="img"
            aria-label="a sock being sketched, dyed hot pink, printed with fried eggs, stitched and turned into a sticker"
          >
            <defs>
              <clipPath id="factory-clip">
                <path d={SOCK_PATH} />
              </clipPath>
            </defs>
            <path className="f-cut" d={SOCK_PATH} fill="#fff" stroke="#fff" strokeWidth="22" strokeLinejoin="round" />
            <g clipPath="url(#factory-clip)">
              <rect className="f-dye" x="30" y="0" width="190" height="260" fill="#ff52a1" />
              {EGGS.map(([x, y]) => (
                <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(1.35)`}>
                  <g className="f-egg">
                    <path d="M-1-12C9-14 15-6 14 1 13 9 5 14-4 13-12 12-15 4-13-3-11-10-7-11-1-12Z" fill="#fff" stroke="#000" strokeWidth="1.6" />
                    <circle cx="1" r="5.2" fill="#f4d500" stroke="#000" strokeWidth="1.6" />
                  </g>
                </g>
              ))}
              <g className="f-trim">
                <rect x="40" y="8" width="92" height="38" fill="#f4d500" />
                {[58, 67, 76, 85, 94, 103, 112].map((x) => (
                  <line key={x} x1={x} y1="14" x2={x} y2="42" stroke="#000" strokeOpacity="0.22" strokeWidth="2" />
                ))}
                <line x1="40" y1="46" x2="132" y2="46" stroke="#000" strokeWidth="3" />
                <circle cx="50" cy="244" r="36" fill="#f4d500" stroke="#000" strokeWidth="3" />
                <circle cx="198" cy="214" r="34" fill="#f4d500" stroke="#000" strokeWidth="3" />
              </g>
              <path
                className="f-stitch"
                d={SOCK_PATH}
                fill="none"
                stroke="#000"
                strokeWidth="1.8"
                strokeDasharray="6 6"
                transform="translate(110 128) scale(0.9) translate(-110 -128)"
              />
            </g>
            <path className="f-outline" d={SOCK_PATH} fill="none" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
            <path className="f-sketch" d={SOCK_PATH} fill="none" stroke="#f4d500" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <g transform="translate(160 54)">
              <g className="f-stamp">
                <circle r="30" fill="#e63a3f" stroke="#000" strokeWidth="3" />
                <circle r="24" fill="none" stroke="#f5f1e8" strokeWidth="1.5" strokeDasharray="3 3" />
                <text y="6" textAnchor="middle" fontSize="16" fontWeight="900" fill="#f5f1e8" letterSpacing="-0.5">
                  FRESH
                </text>
              </g>
            </g>
          </svg>

          <div className="factory-captions relative min-h-[7.5rem] md:min-h-0 md:self-end md:pb-4">
            {STEPS.map((s, i) => (
              <p key={s.word} data-i={i} className="f-caption copy">
                <span className="tag mr-2 md:hidden">0{i + 1}</span>
                {s.text}
              </p>
            ))}
            <Link to="/shop?collection=eggs" className="f-cta btn btn-yellow mt-5">
              shop the eggs
            </Link>
          </div>
        </div>
      </div>
    </ParallaxSection>
  )
}
