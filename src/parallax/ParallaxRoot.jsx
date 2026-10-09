import { useEffect } from 'react'
import { useUi } from '../store/ui'
import { setCalm } from './engine'
import { resumeTilt, stopTilt, tiltChoice } from './tilt'

/** Keeps the engine in step with the UI: calm mode, and tilt for visitors who said yes before. */
export default function ParallaxRoot() {
  const calm = useUi((s) => s.calm)
  useEffect(() => {
    setCalm(calm)
    if (calm) stopTiltQuietly()
    else resumeTilt()
  }, [calm])
  return null
}

// calm mode pauses tilt without forgetting the visitor's "yes"
function stopTiltQuietly() {
  const choice = tiltChoice()
  stopTilt()
  if (choice === 'on') {
    try {
      localStorage.setItem('socksavvy-tilt', 'on')
    } catch {
      /* fine */
    }
  }
}
