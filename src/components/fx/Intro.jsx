import { useEffect, useRef, useState } from 'react'
import { useUi } from '../../store/ui'
import { lockScroll, unlockScroll } from '../../lib/scrollLock'
import SockArt, { SOCK_PATH } from '../art/SockArt'

/*
  First-visit intro (once per session, skipped entirely with reduced motion).
    1. knit   — a sock is knitted row by row while fonts load (fake loading bar)
    2. drop   — giant letters fall, bounce and spell SOCKSAVVY; little socks land on top
    3. exit   — the yellow sheet lifts away with a torn edge, revealing the hero
  Tap / click / any key skips straight to the exit. Pure CSS animations — no libraries.
*/

const ROW_COLOURS = ['#e63a3f', '#ff52a1', '#1c7d56', '#000000', '#f5f1e8']
const ROWS = 14
const KNIT_MS = 1000
const HOLD_MS = 1950
const EXIT_MS = 650

const LETTERS = 'SOCKSAVVY'.split('')
const TOPPERS = {
  0: { pattern: 'eggs', base: '#111111', trim: '#f4d500' },
  2: { pattern: 'hearts', base: '#ff52a1', trim: '#e63a3f' },
  4: { pattern: 'checker', base: '#ffffff', trim: '#111111' },
  6: { pattern: 'smiley', base: '#111111', trim: '#f4d500' },
  8: { pattern: 'avocado', base: '#b9d77a', trim: '#1c7d56' },
}

export default function Intro() {
  const finishIntro = useUi((s) => s.finishIntro)
  const [show] = useState(() => !useUi.getState().introDone)
  const [phase, setPhase] = useState('knit')
  const [gone, setGone] = useState(false)
  const pctRef = useRef(null)
  const timers = useRef([])
  const releaseRef = useRef(null)

  // knitting progress counter + phase timeline
  useEffect(() => {
    if (!show) return
    lockScroll()
    let locked = true
    const release = () => {
      if (locked) unlockScroll()
      locked = false
    }
    releaseRef.current = release

    const t0 = performance.now()
    let raf = 0
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / KNIT_MS)
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const fontReady = document.fonts?.load ? document.fonts.load('900 100px Inter').catch(() => {}) : Promise.resolve()
    const capped = Promise.race([fontReady, new Promise((r) => setTimeout(r, 1600))])
    const minKnit = new Promise((r) => setTimeout(r, KNIT_MS))
    let cancelled = false
    Promise.all([capped, minKnit]).then(() => {
      if (cancelled) return
      setPhase((p) => (p === 'knit' ? 'drop' : p))
      timers.current.push(setTimeout(() => setPhase((p) => (p === 'drop' ? 'exit' : p)), HOLD_MS))
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      release()
      timers.current.forEach(clearTimeout)
    }
  }, [show])

  // exit: release the page, tell the hero to start, unmount after the lift
  useEffect(() => {
    if (phase !== 'exit') return
    releaseRef.current?.()
    finishIntro()
    const t = setTimeout(() => setGone(true), EXIT_MS + 50)
    return () => clearTimeout(t)
  }, [phase, finishIntro])

  // skip on any tap / click / key
  useEffect(() => {
    if (!show || phase === 'exit') return
    const skip = () => setPhase('exit')
    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('keydown', skip, { once: true })
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [show, phase])

  if (!show || gone) return null

  return (
    <div className="intro tone-yellow" data-phase={phase} role="presentation">
      <div className="intro-loader" aria-hidden="true">
        <svg viewBox="30 0 180 262" className="intro-knit">
          <defs>
            <clipPath id="intro-knit-clip">
              <path d={SOCK_PATH} />
            </clipPath>
            <pattern id="intro-stitch" width="9" height="8" patternUnits="userSpaceOnUse">
              <path d="M0.5 1.5 4.5 6 8.5 1.5" fill="none" stroke="#000" strokeOpacity="0.2" strokeWidth="1.4" />
            </pattern>
          </defs>
          <g clipPath="url(#intro-knit-clip)">
            {Array.from({ length: ROWS }, (_, i) => (
              <rect
                key={i}
                className="intro-row"
                x="30"
                y={12 + i * 16.7}
                width="190"
                height="17.4"
                fill={ROW_COLOURS[i % ROW_COLOURS.length]}
                style={{ animationDelay: `${i * 55}ms`, transformOrigin: i % 2 ? '100% 50%' : '0% 50%' }}
              />
            ))}
            <rect x="30" y="0" width="190" height="262" fill="url(#intro-stitch)" />
          </g>
          <path d={SOCK_PATH} fill="none" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
        </svg>
        <p className="intro-progress">
          knitting your socks… <span ref={pctRef}>0%</span>
        </p>
      </div>

      <p className="intro-word giant t-display" aria-hidden="true">
        {LETTERS.map((ch, i) => [
          i === 4 && <span key="br" className="intro-br" />,
          <span key={i} className="intro-letter" style={{ animationDelay: `${i * 70}ms` }}>
            {ch}
            {TOPPERS[i] && (
              <span className="intro-topper sticker" style={{ animationDelay: `${i * 70 + 520}ms`, '--tilt': `${i % 4 ? 14 : -16}deg` }}>
                <SockArt art={TOPPERS[i]} view="single" />
              </span>
            )}
          </span>,
        ])}
      </p>

      <button type="button" className="intro-skip" onClick={() => setPhase('exit')}>
        skip intro →
      </button>
      <svg className="intro-edge" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
        <polygon
          points="0,0 100,0 100,4 96,8 92,3 87,9 83,4 78,7 74,2 69,8 64,4 60,9 55,3 50,7 46,2 41,8 37,4 32,9 27,3 23,7 18,2 14,8 9,4 5,9 0,5"
          fill="var(--color-yellow)"
        />
      </svg>
    </div>
  )
}
