import { useParallax } from '../../hooks/useParallax'
import Sticker from '../Sticker'
import ParallaxLayer from './ParallaxLayer'

/**
 * Quiet depth for pages where the form matters (cart, checkout): three soft tone-on-tone
 * paper sheets far behind the content. Each sheet is anchored to itself, so on a long
 * page there is always one sliding slowly past behind the fields — scroll only, they never
 * follow the pointer or phone tilt (nothing moves while someone types).
 * The section needs `isolate` (the backdrop sits at z −10 inside it).
 */
export default function SoftBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
      <ParallaxLayer depth="back" own pointer={false} className="absolute -left-[18%] top-[3%] w-[78vw] md:-left-[6%] md:w-[40vw]">
        <div className="soft-sheet soft-sheet-dark -rotate-6" />
      </ParallaxLayer>
      <ParallaxLayer depth="far" own pointer={false} className="absolute -right-[22%] top-[38%] w-[70vw] md:-right-[8%] md:w-[34vw]">
        <div className="soft-sheet soft-sheet-light rotate-[7deg]" />
      </ParallaxLayer>
      <ParallaxLayer depth="back" own pointer={false} className="absolute -left-[14%] top-[72%] w-[64vw] md:left-[22%] md:w-[30vw]">
        <div className="soft-sheet soft-sheet-dark rotate-3" />
      </ParallaxLayer>
    </div>
  )
}

/**
 * A sticker that drifts slowly sideways (far plane). Inside a <ParallaxSection rest="top">
 * it sits still on first paint and drifts `drift` px (dir −1 = left) as the header leaves.
 * Position it with className; the rest are <Sticker> props.
 */
export function DriftSticker({ className, drift = 140, dir = -1, children, ...sticker }) {
  const ref = useParallax({ depth: 'far', drift, dir, pointer: false })
  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <Sticker parallax={0} {...sticker}>
        {children}
      </Sticker>
    </div>
  )
}
