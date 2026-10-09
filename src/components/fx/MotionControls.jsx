import { useRef } from 'react'
import { useTuckOnScroll } from '../../hooks/useTuckOnScroll'
import CalmToggle from './CalmToggle'
import SoundToggle from './SoundToggle'
import TiltToggle from './TiltToggle'

/** Bottom-right sticker cluster: [tilt (phones)] · calm mode · sound. Tucks away together. */
export default function MotionControls() {
  const ref = useRef(null)
  const tucked = useTuckOnScroll(ref)
  return (
    <div
      ref={ref}
      role="group"
      aria-label="motion and sound"
      data-tucked={tucked || undefined}
      className="motion-controls fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 z-40 md:bottom-6 md:right-6"
    >
      <TiltToggle />
      <CalmToggle />
      <SoundToggle />
    </div>
  )
}
