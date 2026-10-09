import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { getState, subscribe } from '../../parallax/engine'
import { requestTilt, stopTilt, tiltSupported } from '../../parallax/tilt'
import { useUi } from '../../store/ui'

/** Phones only: turn gyroscope parallax on/off (asks for motion permission where needed). */
export default function TiltToggle() {
  const [on, setOn] = useState(() => getState().tilt)
  const [supported] = useState(tiltSupported)
  const calm = useUi((s) => s.calm)
  // reduced motion: the planes never move, so a tilt switch (and its permission prompt) would lie
  const reduced = useReducedMotion()
  useEffect(() => subscribe((s) => setOn(s.tilt)), [])
  if (!supported || calm || reduced) return null
  return (
    <button
      type="button"
      onClick={() => (on ? stopTilt() : requestTilt())}
      aria-pressed={on}
      aria-label="tilt"
      title="tilt your phone to move the layers"
      className="ctl"
    >
      <span className="sticker block w-9">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" fill={on ? '#ff52a1' : '#f5f1e8'} stroke="#000" strokeWidth="3" />
          <rect x="23" y="15" width="18" height="32" rx="4" fill="#fff" stroke="#000" strokeWidth="3" transform="rotate(-16 32 31)" />
          <path d="M14 46q-3-8 2-14M50 18q3 8-2 14" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      <span className="ctl-tag" aria-hidden="true">
        tilt
      </span>
    </button>
  )
}
