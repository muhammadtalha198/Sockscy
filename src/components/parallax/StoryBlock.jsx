import { useInView } from '../../hooks/useInView'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { resolveDepth } from '../../parallax/engine'
import ParallaxLayer from './ParallaxLayer'

/**
 * A block of the story that enters at its own depth: on first view it springs into
 * place from where its plane would be (far blocks rise from smaller and lower, near ones
 * from larger), then keeps only a whisper of parallax — body text barely moves.
 *   <StoryBlock depth="far"><p className="copy">…</p></StoryBlock>
 * The entrance (inner element) and the parallax (outer layer) are separate elements so
 * their `translate`s never fight.
 */
export default function StoryBlock({ as: Tag = 'div', depth = 'near', className, children }) {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView({ rootMargin: '0px 0px -10% 0px' })
  const d = resolveDepth(depth)
  return (
    <ParallaxLayer depth={Math.max(-0.04, Math.min(0.04, d * 0.15))} decorative={false} pointer={false} className={className}>
      <Tag
        ref={ref}
        className="story-block"
        data-in={inView || reduced || undefined}
        style={{ '--enter-y': `${Math.round(40 + Math.abs(d) * 160)}px`, '--enter-s': (1 - d * 0.12).toFixed(3) }}
      >
        {children}
      </Tag>
    </ParallaxLayer>
  )
}
