import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { addTilter } from '../../parallax/engine'
import { cx } from '../../lib/cx'

/**
 * 3D tilt toward the pointer (mouse hover, or a finger dragging on the card), sprung in
 * the shared parallax loop. Writes CSS variables on the root:
 *   --rx / --ry   card rotation (deg)        --tx / --ty   pointer position (-1…1)
 * Children opt into depth with `data-tilt-depth="n"` (px per unit of pointer offset;
 * negative = moves against the card, positive = pops out in front) and optional
 * `style={{ '--tilt-z': 40 }}` (px toward the viewer). See .tilt-card in fx.css.
 *   <TiltCard className="…"><div data-tilt-depth="-12">sock</div><span data-tilt-depth="18">sticker</span></TiltCard>
 */
export default function TiltCard({ as: Tag = 'div', max = 11, className, children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const s = { tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0, written: '' }
    const write = () => {
      const key = `${s.x.toFixed(3)},${s.y.toFixed(3)}`
      if (key === s.written) return
      s.written = key
      el.style.setProperty('--tx', s.x.toFixed(3))
      el.style.setProperty('--ty', s.y.toFixed(3))
      el.style.setProperty('--ry', `${(s.x * max).toFixed(2)}deg`)
      el.style.setProperty('--rx', `${(-s.y * max * 0.8).toFixed(2)}deg`)
    }
    const tilter = {
      step(f) {
        // same slightly under-damped spring as the rest of the site
        const damp = Math.pow(0.78, f)
        s.vx = (s.vx + (s.tx - s.x) * 0.09 * f) * damp
        s.vy = (s.vy + (s.ty - s.y) * 0.09 * f) * damp
        s.x += s.vx * f
        s.y += s.vy * f
        const moving = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) + Math.abs(s.vx) + Math.abs(s.vy) > 0.0008
        if (!moving) {
          s.x = s.tx
          s.y = s.ty
        }
        write()
        return moving
      },
      reset() {
        s.tx = s.ty = s.x = s.y = s.vx = s.vy = 0
        write()
      },
    }
    const remove = addTilter(tilter)
    let pressed = false
    const aim = (e) => {
      if (e.pointerType !== 'mouse' && !pressed) return
      const r = el.getBoundingClientRect()
      s.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1))
      s.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
      import('../../parallax/engine').then(({ kick }) => kick())
    }
    const rest_ = () => {
      pressed = false
      s.tx = s.ty = 0
      import('../../parallax/engine').then(({ kick }) => kick())
    }
    const down = (e) => {
      if (e.pointerType === 'mouse') return
      pressed = true
      aim(e)
    }
    el.addEventListener('pointermove', aim, { passive: true })
    el.addEventListener('pointerdown', down, { passive: true })
    el.addEventListener('pointerleave', rest_)
    el.addEventListener('pointerup', rest_)
    el.addEventListener('pointercancel', rest_)
    return () => {
      remove()
      el.removeEventListener('pointermove', aim)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerleave', rest_)
      el.removeEventListener('pointerup', rest_)
      el.removeEventListener('pointercancel', rest_)
    }
  }, [max])

  return (
    <Tag ref={ref} className={cx('tilt-card', className)} {...rest}>
      {children}
    </Tag>
  )
}
