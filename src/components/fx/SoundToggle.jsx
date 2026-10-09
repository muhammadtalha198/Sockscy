import { play, preloadSounds } from '../../fx/sound'
import { useUi } from '../../store/ui'

/** Speaker sticker (in the bottom-right MotionControls cluster). Sound is OFF until turned on. */
export default function SoundToggle() {
  const soundOn = useUi((s) => s.soundOn)
  const setSound = useUi((s) => s.setSound)

  function toggle() {
    if (soundOn) {
      setSound(false)
      return
    }
    setSound(true)
    preloadSounds().then(() => play('pop'))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={soundOn}
      aria-label="sound"
      title="sound effects"
      data-on={soundOn || undefined}
      data-cursor="add"
      className="ctl sound-toggle"
    >
      <span className="sticker block w-10 md:w-14">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" fill={soundOn ? '#f4d500' : '#f5f1e8'} stroke="#000" strokeWidth="3" />
          <path d="M15 26h8l11-9v30l-11-9h-8z" fill="#000" strokeLinejoin="round" />
          {soundOn ? (
            <g fill="none" stroke="#000" strokeWidth="3.2" strokeLinecap="round">
              <path className="sound-wave" d="M40 25q5 7 0 14" />
              <path className="sound-wave sound-wave-2" d="M45 20q9 12 0 24" />
            </g>
          ) : (
            <path d="M40 26l11 12M51 26 40 38" stroke="#e63a3f" strokeWidth="4" strokeLinecap="round" />
          )}
        </svg>
      </span>
      <span className="ctl-tag" aria-hidden="true">
        sound
      </span>
    </button>
  )
}
