import { cx } from '../lib/cx'
import { Flower } from './art/Doodles'

/*
  Endless scrolling strip. Content is rendered twice and the track moves -50%,
  so the loop is seamless. Hover pauses it; reduced-motion stops it.
*/
export default function Marquee({
  items = ['THRIFTED', 'AESTHETIC', 'ONE OF A KIND'],
  className = '',
  textClassName = 'text-yellow',
  reverse = false,
  duration = 28,
  flower = '#ff52a1',
}) {
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {[...items, ...items].map((item, i) => (
        <li key={i} className="flex items-center">
          <span className={cx('giant px-5 text-display md:px-8', textClassName)}>{item}</span>
          <Flower fill={flower} center="#000" className="h-8 w-8 shrink-0 md:h-12 md:w-12" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className={cx('group relative overflow-hidden py-4 md:py-6', className)}>
      <p className="sr-only">{items.join(' · ')}</p>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ '--marquee-duration': `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
        aria-hidden="true"
      >
        {row(true)}
        {row(true)}
      </div>
    </div>
  )
}
