import { useParallax } from '../hooks/useParallax'
import { cx } from '../lib/cx'

/*
  Die-cut sticker wrapper. Layers (outer → inner):
    position (className) → parallax (scroll) → float (CSS loop) → sticker outline → rotation
  Put any SVG / cutout image inside. Decorative by default (aria-hidden).

  <Sticker className="absolute right-4 top-10 w-32" rotate={-12} parallax={0.15}>
    <Flower />
  </Sticker>
*/
export default function Sticker({
  children,
  className = '',
  rotate = 0,
  parallax = 0,
  float = true,
  duration = 7,
  delay = 0,
  outline = true,
  decorative = true,
  style,
}) {
  const parallaxRef = useParallax(parallax)
  return (
    <div
      className={cx('pointer-events-none select-none', className)}
      style={style}
      aria-hidden={decorative || undefined}
    >
      <div ref={parallaxRef} className="will-change-transform">
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
  )
}
