import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { useParallax } from '../hooks/useParallax'
import { cx } from '../lib/cx'
import { springEasing } from '../lib/motion'

// v1 numeric depths map onto the site-wide planes (tokens.css --depth-*)
const DEPTH_PLANE = { 1: 'far', 2: 'near', 3: 'front' }

/*
  Die-cut sticker wrapper. Layers (outer → inner):
    position (className) → fly-in (first view) → parallax (scroll) → float (CSS loop)
    → sticker outline → rotation
  Put any SVG / cutout image inside. Decorative by default (aria-hidden).

  - depth: 'back'|'far'|'near'|'front' (or v1's 1|2|3 = far|near|front); default: outlined
    stickers near, doodles far. An explicit `parallax` number is used as the depth.
    Inside a <ParallaxSection> it moves with its section's planes (scroll, pointer, tilt).
  - the first time it scrolls into view it flies in from the nearest screen edge
    and settles with a spring (off with reduced motion or flyIn={false})

  <Sticker className="absolute right-4 top-10 w-32" rotate={-12} depth={3}>
    <Flower />
  </Sticker>
*/
export default function Sticker({
  children,
  className = '',
  rotate = 0,
  parallax,
  depth,
  float = true,
  flyIn = true,
  duration = 7,
  delay = 0,
  outline = true,
  decorative = true,
  style,
}) {
  const plane = parallax ?? (typeof depth === 'string' ? depth : DEPTH_PLANE[depth ?? (outline ? 2 : 1)])
  const parallaxRef = useParallax({ depth: plane })
  const flyRef = useRef(null)
  const [pending, setPending] = useState(() => flyIn && typeof window !== 'undefined' && !prefersReducedMotion())
  const side = useRef(-1)

  // fly in from the nearest edge — measured before paint, and always pushed *away*
  // from the screen (a sticker inside an off-screen drawer must stay off-screen)
  useLayoutEffect(() => {
    const el = flyRef.current
    if (!pending || !el?.parentElement) return
    const r = el.parentElement.getBoundingClientRect()
    side.current = r.left + r.width / 2 > window.innerWidth / 2 ? 1 : -1
    el.style.setProperty('--fly-side', String(side.current))
  }, [pending])

  useEffect(() => {
    const el = flyRef.current
    if (!pending || !el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const dir = side.current
        const anim = el.animate(
          [
            { transform: `translate3d(${dir * 60}vw, ${-8 + Math.random() * 16}vh, 0) rotate(${dir * 70}deg) scale(0.6)` },
            { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)' },
          ],
          { duration: 900 + Math.random() * 250, delay: Math.random() * 180, easing: springEasing(), fill: 'backwards' },
        )
        setPending(false)
        anim.onfinish = () => anim.cancel()
      },
      { rootMargin: '0px 0px -5% 0px' },
    )
    io.observe(el.parentElement || el)
    return () => io.disconnect()
  }, [pending])

  return (
    <div
      className={cx('pointer-events-none select-none', className)}
      style={style}
      aria-hidden={decorative || undefined}
    >
      <div ref={flyRef} className={pending ? 'sticker-fly-pending' : undefined}>
        <div ref={parallaxRef}>
          <div
            className={float ? 'animate-float' : undefined}
            style={{ '--float-duration': `${duration}s`, '--float-delay': `${delay}s` }}
          >
            <div className={outline ? 'sticker' : undefined}>
              <div style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
