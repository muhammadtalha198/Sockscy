import { useId } from 'react'
import { cx } from '../lib/cx'
import { Flower } from './art/Doodles'

/*
  Rotating circular badge — text runs around a ring, the centre stays still.
  className positions and sizes it (e.g. "absolute bottom-6 right-6 w-32").
  <Badge text="FRESH DROP ✦ SOCKS OF THE DAY ✦" bg="var(--color-pink)" ink="#000" />
*/
export default function Badge({
  text = 'FRESH DROP ✦ SOCKS OF THE DAY ✦ ',
  bg = 'var(--color-pink)',
  ink = '#000',
  center,
  className = '',
}) {
  const pathId = `badge${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const circumference = 2 * Math.PI * 70
  return (
    <div className={cx('select-none', className)} role="img" aria-label={text.replace(/✦/g, ' ').replace(/\s+/g, ' ').trim()}>
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="100" cy="100" r="96" fill={bg} stroke="#000" strokeWidth="4" />
        </svg>
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden="true">
          <defs>
            <path id={pathId} d="M100 100m-70 0a70 70 0 1 1 140 0a70 70 0 1 1-140 0" />
          </defs>
          <text fontSize="21" fontWeight="900" fill={ink} letterSpacing="1">
            <textPath href={`#${pathId}`} textLength={circumference - 6} lengthAdjust="spacing">
              {text}
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-[30%] grid place-items-center" aria-hidden="true">
          {center || <Flower fill="#f4d500" center="#000" className="h-full w-full" />}
        </div>
      </div>
    </div>
  )
}
