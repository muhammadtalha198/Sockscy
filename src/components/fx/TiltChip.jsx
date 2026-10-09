import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { requestTilt, tiltChoice, tiltSupported } from '../../parallax/tilt'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { useUi } from '../../store/ui'

const QUIET = ['/cart', '/checkout', '/order-placed']

/**
 * Phones, once: after the first scroll, politely offer gyroscope parallax.
 * "yes" asks for motion permission (iOS) inside the tap; "no thanks" is remembered too.
 * Denied or unsupported → the site simply stays scroll-only.
 */
export default function TiltChip() {
  const { pathname } = useLocation()
  const calm = useUi((s) => s.calm)
  const [show, setShow] = useState(false)
  const [done, setDone] = useState(() => !tiltSupported() || tiltChoice() != null || prefersReducedMotion())

  useEffect(() => {
    if (done || calm || QUIET.includes(pathname)) return
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.6) setShow(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [done, calm, pathname])

  if (done || !show || calm || QUIET.includes(pathname)) return null
  const answer = async (yes) => {
    setDone(true)
    if (yes) await requestTilt()
    else {
      try {
        localStorage.setItem('socksavvy-tilt', 'off')
      } catch {
        /* fine */
      }
    }
  }
  return (
    <div className="tilt-chip" role="dialog" aria-label="tilt mode">
      <p className="text-sm font-black leading-tight">tilt your phone to look around?</p>
      <button type="button" className="btn btn-sm btn-black" onClick={() => answer(true)}>
        yes
      </button>
      <button type="button" className="px-1 text-sm font-extrabold underline decoration-2 underline-offset-4" onClick={() => answer(false)}>
        no thanks
      </button>
    </div>
  )
}
