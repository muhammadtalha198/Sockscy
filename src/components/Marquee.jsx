import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { cx } from '../lib/cx'
import { subscribeVelocity } from '../motion/velocity'
import { Flower } from './art/Doodles'

/*
  Endless strip that reacts to scrolling: it speeds up with scroll velocity and
  reverses when you scroll up. Content is rendered twice; the track wraps at half
  its width. Runs only while on screen; static with reduced motion.
*/
export default function Marquee({
  items = ['THRIFTED', 'AESTHETIC', 'ONE OF A KIND'],
  className = '',
  textClassName = 'text-yellow',
  reverse = false,
  speed = 70, // px per second at rest
  flower = '#ff52a1',
}) {
  const rootRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track || prefersReducedMotion()) return
    let x = 0
    let half = track.scrollWidth / 2
    let dir = reverse ? 1 : -1
    let boost = 0
    let raf = 0
    let last = 0
    let visible = false
    let hovering = false

    const tick = (now) => {
      const dt = Math.min(64, now - (last || now)) / 1000
      last = now
      boost *= Math.pow(0.04, dt) // decays within ~1s
      const v = (hovering ? speed * 0.25 : speed + boost) * dir
      x += v * dt
      if (x <= -half) x += half
      if (x > 0) x -= half
      track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`
      raf = visible ? requestAnimationFrame(tick) : 0
    }
    const run = () => {
      if (!raf && visible) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const unsub = subscribeVelocity((vel) => {
      if (Math.abs(vel) > 0.4) {
        const base = reverse ? 1 : -1
        dir = vel > 0 ? base : -base // scrolling up flips the direction
        boost = Math.min(1600, Math.max(boost, Math.abs(vel) * 55))
      }
    })
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) run()
    })
    io.observe(root)
    const ro = new ResizeObserver(() => (half = track.scrollWidth / 2))
    ro.observe(track)
    const enter = () => (hovering = true)
    const leave = () => (hovering = false)
    root.addEventListener('pointerenter', enter)
    root.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      unsub()
      io.disconnect()
      ro.disconnect()
      root.removeEventListener('pointerenter', enter)
      root.removeEventListener('pointerleave', leave)
    }
  }, [reverse, speed])

  const row = (key) => (
    <ul key={key} className="flex shrink-0 items-center" aria-hidden="true">
      {[...items, ...items].map((item, i) => (
        <li key={i} className="flex items-center">
          <span className={cx('giant px-5 text-display md:px-8', textClassName)}>{item}</span>
          <Flower fill={flower} center="#000" className="h-8 w-8 shrink-0 md:h-12 md:w-12" />
        </li>
      ))}
    </ul>
  )
  return (
    <div ref={rootRef} className={cx('relative overflow-hidden py-4 md:py-6', className)}>
      <p className="sr-only">{items.join(' · ')}</p>
      <div ref={trackRef} className="flex w-max will-change-transform" aria-hidden="true">
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
