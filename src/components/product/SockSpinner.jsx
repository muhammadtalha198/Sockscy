import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'
import SockArt, { SOCK_PATH } from '../art/SockArt'

/*
  Drag-to-spin pseudo-3D sock. Layered CSS 3D: front art, back art and five white
  "sticker thickness" slices, all in one preserve-3d body rotated on Y.
  - drag (mouse/touch) with inertia, arrow keys, slow idle spin
  - changing `art` (colourway) splashes the new colour and swaps the sock mid-splash
  Real photos later: pass `frames` (array of image URLs, a 360° sequence) to use them instead.
*/

// a paint splat (closed polygon, generated once)
const SPLAT = (() => {
  const pts = []
  const n = 46
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = 42 + 6 * Math.sin(a * 5 + 1) + 4 * Math.sin(a * 11) + (i % 7 === 0 ? 9 : 0)
    pts.push(`${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`)
  }
  return pts.join(' ')
})()

const EDGES = [-5.5, -2.75, 0, 2.75, 5.5]

export default function SockSpinner({ art, label, frames }) {
  const stageRef = useRef(null)
  const bodyRef = useRef(null)
  const shadowRef = useRef(null)
  const frameImgRef = useRef(null)
  const [shown, setShown] = useState(art)
  const [splash, setSplash] = useState(null)
  const first = useRef(true)
  // idle spin: one turn from -24° that eases to rest facing front, then the loop stops
  const st = useRef({ angle: -24, vel: 0, drag: false, lastX: 0, auto: true, autoLeft: 384, raf: 0, visible: true })
  const reducedMotion = useReducedMotion()

  // colourway change → splash + swap
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (prefersReducedMotion()) {
      setShown(art)
      return
    }
    setSplash({ color: art.base, id: Date.now() })
    const t = setTimeout(() => setShown(art), 170)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [art.base, art.trim, art.pattern])

  useEffect(() => {
    const s = st.current
    const stage = stageRef.current
    const reduced = reducedMotion
    if (reduced) {
      s.auto = false
      s.angle = 0
    }

    const apply = () => {
      const rad = (s.angle * Math.PI) / 180
      if (frames?.length && frameImgRef.current) {
        const i = ((Math.round((s.angle / 360) * frames.length) % frames.length) + frames.length) % frames.length
        frameImgRef.current.src = frames[i]
      } else if (bodyRef.current) {
        bodyRef.current.style.transform = `rotateY(${s.angle.toFixed(2)}deg)`
      }
      if (shadowRef.current) shadowRef.current.style.transform = `translateX(-50%) scaleX(${(0.35 + 0.65 * Math.abs(Math.cos(rad))).toFixed(3)})`
    }

    const loop = () => {
      s.raf = 0
      if (!s.visible) return
      if (!s.drag) {
        if (Math.abs(s.vel) > 0.03) {
          s.angle += s.vel
          s.vel *= 0.94
        } else if (s.auto) {
          const step = Math.min(0.35, Math.max(0.03, s.autoLeft * 0.025))
          s.angle += step
          s.autoLeft -= step
          if (s.autoLeft <= 0.01) s.auto = false
        } else {
          apply()
          return
        }
      }
      apply()
      s.raf = requestAnimationFrame(loop)
    }
    const kick = () => {
      if (!s.raf && !reduced) s.raf = requestAnimationFrame(loop)
    }

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      s.drag = true
      s.auto = false
      s.vel = 0
      s.lastX = e.clientX
      stage.setPointerCapture?.(e.pointerId)
      stage.dataset.dragging = ''
    }
    const onMove = (e) => {
      if (!s.drag) return
      const dx = e.clientX - s.lastX
      s.lastX = e.clientX
      s.angle += dx * 0.6
      s.vel = s.vel * 0.5 + dx * 0.6 * 0.5
      apply()
    }
    const onUp = () => {
      if (!s.drag) return
      s.drag = false
      delete stage.dataset.dragging
      kick()
    }
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      s.auto = false
      const dir = e.key === 'ArrowRight' ? 1 : -1
      if (reduced) {
        s.angle += dir * 30
        apply()
      } else {
        s.vel += dir * 3.2
        kick()
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting
      if (s.visible) kick()
    })
    io.observe(stage)
    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)
    stage.addEventListener('keydown', onKey)
    apply()
    kick()
    return () => {
      cancelAnimationFrame(s.raf)
      s.raf = 0
      io.disconnect()
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('keydown', onKey)
    }
  }, [frames, reducedMotion])

  return (
    <div
      ref={stageRef}
      className="spin-stage"
      role="img"
      aria-label={`${label}. drag or use the arrow keys to spin it.`}
      tabIndex={0}
      data-cursor="grab"
    >
      {splash && (
        <svg key={splash.id} className="spin-splash" viewBox="0 0 100 100" aria-hidden="true" onAnimationEnd={() => setSplash(null)}>
          <polygon points={SPLAT} fill={splash.color} stroke="#000" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      )}
      <span ref={shadowRef} className="spin-shadow" aria-hidden="true" />
      {frames?.length ? (
        <img ref={frameImgRef} src={frames[0]} alt="" className="spin-frames" draggable="false" />
      ) : (
        <div ref={bodyRef} className="spin-body" aria-hidden="true">
          {EDGES.map((z) => (
            <svg key={z} viewBox="40 6 164 244" className="spin-layer" style={{ transform: `translateZ(${z}px)` }}>
              <path d={SOCK_PATH} fill="#fff" stroke="#fff" strokeWidth="16" strokeLinejoin="round" />
              <path d={SOCK_PATH} fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="3" />
            </svg>
          ))}
          <div className="spin-layer spin-face sticker" style={{ transform: 'translateZ(7px)' }}>
            <SockArt art={shown} view="upright" />
          </div>
          <div className="spin-layer spin-face sticker" style={{ transform: 'rotateY(180deg) translateZ(7px)' }}>
            <SockArt art={shown} view="upright" />
          </div>
        </div>
      )}
      <span className="spin-hint" aria-hidden="true">
        ↔ drag to spin
      </span>
    </div>
  )
}
