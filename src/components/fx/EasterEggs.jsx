import { useEffect, useState } from 'react'
import { play } from '../../fx/sound'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { useUi } from '../../store/ui'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const LOGO_TAPS = 5
const LOGO_WINDOW = 2500 // ms for all five taps

/*
  Easter eggs (mounted once in Layout):
  · Konami code (↑↑↓↓←→←→BA) → it rains socks
  · tap the "socksavvy.co" logo 5× quickly → every placeholder sock gets a new pattern
    (ui.remix; SockArt + the physics sprites follow it)
*/
export default function EasterEggs() {
  const [live, setLive] = useState('')

  useEffect(() => {
    let pos = 0
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0
      if (pos < KONAMI.length) return
      pos = 0
      play('win')
      setLive(prefersReducedMotion() ? 'konami! socks would rain now, but reduced motion is on.' : 'konami! it’s raining socks.')
      import('../../fx/confetti').then(({ rain }) => rain({ duration: 4200, perFrame: 2.2, shapes: ['sock', 'sock', 'sock', 'flower', 'star'] }))
    }

    let taps = []
    const onClick = (e) => {
      const logo = e.target.closest?.('[data-logo]')
      if (!logo) return
      const now = performance.now()
      taps = [...taps.filter((t) => now - t < LOGO_WINDOW), now]
      if (taps.length < LOGO_TAPS) return
      taps = []
      useUi.getState().remixSocks()
      play('win')
      setLive('remixed! every sock just got a new pattern.')
      const r = logo.getBoundingClientRect()
      import('../../fx/confetti').then(({ burst }) =>
        burst({ x: r.left + r.width / 2, y: r.bottom, count: 30, direction: Math.PI / 2, spread: Math.PI * 0.8, power: 8 }),
      )
    }

    window.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <p className="sr-only" role="status" aria-live="polite">
      {live}
    </p>
  )
}
