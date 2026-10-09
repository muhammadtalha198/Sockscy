import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import SockArt from '../components/art/SockArt'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { clamp } from '../lib/motion'
import { play } from './sound'

/** Fired when a flying sock reaches the cart tab (SideTab listens to shake + pop). */
export const CART_LANDED = 'socksavvy:cart-landed'

function landed(target) {
  play('add')
  window.dispatchEvent(new CustomEvent(CART_LANDED))
  if (!target || prefersReducedMotion()) return
  const r = target.getBoundingClientRect()
  import('./confetti').then(({ burst }) =>
    burst({ x: r.left + 4, y: r.top + r.height * 0.3, count: 22, direction: Math.PI, spread: Math.PI * 0.9, power: 8 }),
  )
}

/**
 * A die-cut sock flies in an arc from `from` (element or DOMRect) into the black
 * cart side tab ([data-cart-target]), spinning and shrinking on the way.
 */
export function flyToCart({ from, art }) {
  const target = document.querySelector('[data-cart-target]')
  const a = from?.getBoundingClientRect ? from.getBoundingClientRect() : from
  if (!target || !a || prefersReducedMotion() || typeof Element.prototype.animate !== 'function') {
    landed(target)
    return
  }
  const b = target.getBoundingClientRect()
  const w = clamp(Math.min(a.width, a.height) * 0.45, 56, 120)
  const h = (w * 244) / 164

  const el = document.createElement('div')
  el.className = 'fly-sock'
  el.style.width = `${w}px`
  el.setAttribute('aria-hidden', 'true')
  const root = createRoot(el)
  flushSync(() =>
    root.render(
      <div className="sticker">
        <SockArt art={art} view="upright" />
      </div>,
    ),
  )
  document.body.appendChild(el)

  const sx = a.left + a.width / 2
  const sy = a.top + a.height / 2
  const tx = b.left + b.width / 2
  const ty = b.top + b.height * 0.3
  const cx = sx + (tx - sx) * 0.3
  const cy = Math.min(sy, ty) - Math.max(140, Math.abs(tx - sx) * 0.35)
  const frames = []
  const N = 30
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
    const u = 1 - e
    const x = u * u * sx + 2 * u * e * cx + e * e * tx
    const y = u * u * sy + 2 * u * e * cy + e * e * ty
    const rot = e * 540 - 14
    const s = 1 - e * 0.74
    frames.push({ transform: `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) rotate(${rot}deg) scale(${s})` })
  }
  const anim = el.animate(frames, { duration: 850, easing: 'linear', fill: 'forwards' })
  const finish = () => {
    root.unmount()
    el.remove()
    landed(target)
  }
  anim.onfinish = finish
  anim.oncancel = finish
}
