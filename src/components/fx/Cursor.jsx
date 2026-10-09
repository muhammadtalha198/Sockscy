import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { clamp } from '../../lib/motion'

/*
  Custom cursor (desktop with a fine pointer only; native cursor with reduced motion).
  - a die-cut flower that follows with a spring, squishes along its motion and spins with speed
  - grows on links/buttons; turns into a pill on [data-cursor] targets:
      view (product cards, physics socks) · add (add-to-cart) · grab / grabbing (stickers) · drop
  - a short trail of tiny flowers/stars behind fast movement
  - magnetic .btn: buttons lean toward the cursor (CSS vars --mx/--my) and spring back
*/

const LABELS = { view: 'view', add: 'add +', grab: 'grab', grabbing: 'whee!', drop: 'drop more' }
const TRAIL = 14

const flower = (
  <svg viewBox="-60 -60 120 120" className="cursor-flower" aria-hidden="true">
    {/* white die-cut outline, then the flower */}
    <g stroke="#fff" strokeWidth="22" strokeLinejoin="round" fill="#fff">
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M0-6C-24-18-21-47 0-47 21-47 24-18 0-6Z" transform={`rotate(${a})`} />
      ))}
    </g>
    <g stroke="#000" strokeWidth="7" strokeLinejoin="round" fill="#ff52a1">
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M0-6C-24-18-21-47 0-47 21-47 24-18 0-6Z" transform={`rotate(${a})`} />
      ))}
    </g>
    <g fill="#ff52a1">
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M0-6C-24-18-21-47 0-47 21-47 24-18 0-6Z" transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r="12" fill="#f4d500" stroke="#000" strokeWidth="5" />
  </svg>
)

const trailShapes = [
  <svg key="f" viewBox="-12 -12 24 24" aria-hidden="true">
    <g fill="#ff52a1" stroke="#000" strokeWidth="1.6">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cy="-5.5" rx="3.6" ry="5.5" transform={`rotate(${a})`} />
      ))}
    </g>
    <circle r="2.6" fill="#f4d500" stroke="#000" strokeWidth="1.2" />
  </svg>,
  <svg key="s" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 1 14.6 8.6 22.6 8.6 16.2 13.4 18.6 21 12 16.4 5.4 21 7.8 13.4 1.4 8.6 9.4 8.6Z" fill="#f4d500" stroke="#000" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>,
]

export default function Cursor() {
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setEnabled(mq.matches && !reduced)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [reduced])

  return enabled ? <CursorImpl /> : null
}

function resolveState(target) {
  if (!target?.closest) return 'idle'
  const tagged = target.closest('[data-cursor]')
  if (tagged) return tagged.dataset.cursor
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return 'text'
  if (target.closest('a[href], button, [role="button"], label, summary')) return 'link'
  return 'idle'
}

function CursorImpl() {
  const rootRef = useRef(null)
  const posRef = useRef(null)
  const squishRef = useRef(null)
  const labelRef = useRef(null)
  const trailRef = useRef(null)

  useEffect(() => {
    const html = document.documentElement
    html.classList.add('has-cursor')
    const root = rootRef.current
    const pos = posRef.current
    const squish = squishRef.current
    const label = labelRef.current
    const particles = [...trailRef.current.children]

    const st = {
      x: -100, y: -100, tx: -100, ty: -100, spin: 0, press: 1, pressT: 1,
      state: '', raf: 0, last: 0, lastEmit: 0, trail: 0, magnet: null, seen: false,
    }

    const setState = (s) => {
      if (s === st.state) return
      st.state = s
      root.dataset.state = s
      if (LABELS[s]) label.textContent = LABELS[s]
    }

    const releaseMagnet = () => {
      if (!st.magnet) return
      st.magnet.style.setProperty('--mx', '0px')
      st.magnet.style.setProperty('--my', '0px')
      st.magnet = null
    }

    const magnet = (e) => {
      const el = e.target?.closest?.('.btn:not(:disabled), [data-magnetic]')
      if (el !== st.magnet) releaseMagnet()
      if (!el) return
      st.magnet = el
      const r = el.getBoundingClientRect()
      const mx = clamp((e.clientX - (r.left + r.width / 2)) * 0.3, -14, 14)
      const my = clamp((e.clientY - (r.top + r.height / 2)) * 0.4, -10, 10)
      el.style.setProperty('--mx', `${mx.toFixed(1)}px`)
      el.style.setProperty('--my', `${my.toFixed(1)}px`)
    }

    const emit = (x, y, vx, vy) => {
      const el = particles[st.trail++ % particles.length]
      el.getAnimations().forEach((a) => a.cancel())
      const r = Math.random() * 360
      const dx = -vx * 2.2 + (Math.random() - 0.5) * 26
      const dy = -vy * 2.2 + (Math.random() - 0.5) * 26 + 14
      const s = 0.7 + Math.random() * 0.6
      el.animate(
        [
          { transform: `translate3d(${x}px, ${y}px, 0) rotate(${r}deg) scale(${s})`, opacity: 1 },
          { transform: `translate3d(${x + dx}px, ${y + dy}px, 0) rotate(${r + 140}deg) scale(0)`, opacity: 0.6 },
        ],
        { duration: 620, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'both' },
      )
    }

    const loop = (now) => {
      const dt = Math.min(48, now - (st.last || now - 16))
      st.last = now
      const k = 1 - Math.pow(1 - 0.38, dt / 16.67)
      const px = st.x
      const py = st.y
      st.x += (st.tx - st.x) * k
      st.y += (st.ty - st.y) * k
      st.press += (st.pressT - st.press) * k
      const vx = st.x - px
      const vy = st.y - py
      const speed = (Math.hypot(vx, vy) * 16.67) / Math.max(dt, 1)
      const stretch = Math.min(speed / 45, 0.55)
      const ang = Math.atan2(vy, vx)
      st.spin += speed * 1.1

      pos.style.transform = `translate3d(${st.x}px, ${st.y}px, 0)`
      squish.style.transform = `rotate(${ang}rad) scale(${(1 + stretch) * st.press}, ${(1 - stretch * 0.5) * st.press}) rotate(${-ang}rad) rotate(${st.spin % 360}deg)`
      if (speed > 18 && now - st.lastEmit > 28 && st.state !== 'text') {
        st.lastEmit = now
        emit(st.x, st.y, vx, vy)
      }

      const settled = Math.abs(st.tx - st.x) < 0.15 && Math.abs(st.ty - st.y) < 0.15 && Math.abs(st.pressT - st.press) < 0.01
      st.raf = settled ? 0 : requestAnimationFrame(loop)
    }
    const start = () => {
      if (!st.raf) {
        st.last = 0
        st.raf = requestAnimationFrame(loop)
      }
    }

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
        delete root.dataset.visible
        return
      }
      st.tx = e.clientX
      st.ty = e.clientY
      if (!st.seen) {
        st.seen = true
        st.x = st.tx
        st.y = st.ty
      }
      root.dataset.visible = ''
      setState(resolveState(e.target))
      magnet(e)
      start()
    }
    const onDown = (e) => {
      if (e.pointerType !== 'mouse') return
      st.pressT = 0.72
      start()
    }
    const onUp = () => {
      st.pressT = 1
      start()
      // physics hero changes its data-cursor on release — re-read under the pointer
      requestAnimationFrame(() => setState(resolveState(document.elementFromPoint(st.tx, st.ty))))
    }
    const onLeave = () => {
      delete root.dataset.visible
      releaseMagnet()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    html.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(st.raf)
      releaseMagnet()
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      html.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div ref={rootRef} className="cursor" aria-hidden="true" data-state="idle">
      <div ref={trailRef}>
        {Array.from({ length: TRAIL }, (_, i) => (
          <span key={i} className="cursor-trail">
            {trailShapes[i % 2]}
          </span>
        ))}
      </div>
      <div ref={posRef} className="cursor-pos">
        <div className="cursor-scale">
          <div ref={squishRef} className="cursor-squish">
            {flower}
          </div>
        </div>
        <span ref={labelRef} className="cursor-label">
          view
        </span>
      </div>
    </div>
  )
}
