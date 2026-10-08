import { useEffect, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { cx } from '../lib/cx'

// jagged tear line: x-position (%) at every 5% down the paper
const TEAR = [50, 46, 53, 47, 55, 48, 52, 45, 54, 49, 56, 47, 51, 44, 53, 48, 55, 46, 52, 49, 50]
const points = TEAR.map((x, i) => `${x}% ${i * 5}%`)
const LEFT = `polygon(0 0, ${points.join(', ')}, 0 100%)`
const RIGHT = `polygon(${points[0]}, 100% 0, 100% 100%, ${[...points].reverse().slice(0, -1).join(', ')})`

/*
  Torn-paper reveal: an off-white paper sheet covers the product and rips
  apart (left half / right half) when it scrolls into view.
*/
export default function TornReveal({ children, className = '', label = 'rip here' }) {
  const [ref, inView] = useInView({ rootMargin: '0px 0px -30% 0px' })
  const [ripped, setRipped] = useState(false)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setRipped(true), 250)
    return () => clearTimeout(t)
  }, [inView])

  const half = 'absolute inset-0 bg-offwhite transition-transform duration-[1100ms] ease-snap'
  const paperText = (
    <span className="absolute inset-0 grid place-items-center">
      <span className="giant text-center text-[clamp(2.5rem,10vw,5rem)] leading-[0.85] text-black">
        sock of
        <br />
        the day
        <span className="mt-3 block text-base font-extrabold lowercase tracking-normal">✂ {label}</span>
      </span>
    </span>
  )

  return (
    <div ref={ref} className={cx('relative', className)}>
      {children}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-1 z-10">
        <div className="absolute inset-0 drop-shadow-[0_8px_10px_rgb(0_0_0/0.3)]">
          <div className={half} style={{ clipPath: LEFT, transform: ripped ? 'translate3d(-115%, 6%, 0) rotate(-14deg)' : undefined }}>
            {paperText}
          </div>
        </div>
        <div className="absolute inset-0 drop-shadow-[0_8px_10px_rgb(0_0_0/0.3)]">
          <div className={half} style={{ clipPath: RIGHT, transform: ripped ? 'translate3d(115%, -4%, 0) rotate(12deg)' : undefined }}>
            {paperText}
          </div>
        </div>
      </div>
    </div>
  )
}
