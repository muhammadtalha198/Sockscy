import { useUi } from '../../store/ui'

/**
 * "calm mode" sticker: parallax drops to its minimum (15%), decorative loops pause,
 * phone tilt stops. Remembered per device. (prefers-reduced-motion already makes the
 * whole site static; this is for everyone else who just wants less.)
 */
export default function CalmToggle() {
  const calm = useUi((s) => s.calm)
  const setCalm = useUi((s) => s.setCalm)
  return (
    <button
      type="button"
      onClick={() => setCalm(!calm)}
      aria-pressed={calm}
      aria-label="calm mode: less motion"
      data-cursor="add"
      className="ctl"
    >
      <span className="sticker block w-11 md:w-12">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" fill={calm ? '#1c7d56' : '#f5f1e8'} stroke="#000" strokeWidth="3" />
          {calm ? (
            // still water: three flat lines
            <g stroke="#f5f1e8" strokeWidth="4.5" strokeLinecap="round">
              <path d="M18 24h28M18 32h28M18 40h28" />
            </g>
          ) : (
            // waves: depth in motion
            <g fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round">
              <path d="M16 25q4-5 8 0t8 0 8 0 8 0" />
              <path d="M16 35q4-5 8 0t8 0 8 0 8 0" />
            </g>
          )}
        </svg>
      </span>
      <span className="ctl-tag" aria-hidden="true">
        {calm ? 'calm on' : 'calm mode'}
      </span>
    </button>
  )
}
