import { useCallback, useState } from 'react'
import { ParallaxSectionContext } from '../../hooks/useParallax'
import { attachSection, createSection } from '../../parallax/engine'

/**
 * A box that its layers move around. Every <ParallaxLayer>/<ParallaxSticker>/<ParallaxText>
 * inside is anchored to this section, so they all sit exactly where they were laid out
 * when the section is centred on screen, and spread apart in depth as it scrolls past.
 *   <ParallaxSection as="section" className="tone-red …">…</ParallaxSection>
 * `innerRef` receives the element too (for ScrollTrigger etc.).
 */
export default function ParallaxSection({ as: Tag = 'section', innerRef, children, ...rest }) {
  const [section] = useState(createSection)
  const ref = useCallback(
    (el) => {
      attachSection(section, el)
      if (typeof innerRef === 'function') innerRef(el)
      else if (innerRef) innerRef.current = el
    },
    [section, innerRef],
  )
  return (
    <ParallaxSectionContext.Provider value={section}>
      <Tag ref={ref} data-parallax-section="" {...rest}>
        {children}
      </Tag>
    </ParallaxSectionContext.Provider>
  )
}
