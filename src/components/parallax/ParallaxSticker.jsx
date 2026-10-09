import Sticker from '../Sticker'

/**
 * A die-cut sticker on a named depth plane.
 *   <ParallaxSticker depth="near" className="absolute right-4 top-10 w-24"><Flower /></ParallaxSticker>
 * Same props as <Sticker> (rotate, float, flyIn, outline …).
 */
export default function ParallaxSticker({ depth = 'near', ...props }) {
  return <Sticker depth={depth} {...props} />
}
