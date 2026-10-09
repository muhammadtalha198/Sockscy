import { useParallax } from '../../hooks/useParallax'

/**
 * One plane of depth. Moves with scroll, the desktop pointer and phone tilt.
 *   <ParallaxLayer depth="back" className="absolute inset-0">…</ParallaxLayer>
 * depth: back | far | mid | near | front | number   axis: y | x
 * scale / rotate: extra scale / degrees per viewport of scroll distance
 * Decorative by default (aria-hidden); pass decorative={false} for real content.
 */
export default function ParallaxLayer({
  as: Tag = 'div',
  depth = 'near',
  axis,
  pin,
  scale,
  rotate,
  pointer,
  own,
  decorative = true,
  children,
  ...rest
}) {
  const ref = useParallax({ depth, axis, pin, scale, rotate, pointer, own })
  return (
    <Tag ref={ref} aria-hidden={decorative || undefined} {...rest}>
      {children}
    </Tag>
  )
}
