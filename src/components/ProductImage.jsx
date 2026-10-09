import { cx } from '../lib/cx'
import SockArt from './art/SockArt'

/*
  Product image with lazy-loading + WebP.

  ▸ REAL PHOTOS GO HERE ◂
  In src/data/products.json set each image's "src" (and optionally "srcSet"),
  e.g. { "src": "/products/sunny-side-up-1.webp",
         "srcSet": "/products/sunny-side-up-1-600.webp 600w, /products/sunny-side-up-1.webp 1200w",
         "view": "kick", "alt": "…" }
  `npm run images` converts photos/raw/*.jpg|png into those WebP files.
  While "src" is null, a flat-colour SVG sock placeholder is drawn instead.
*/
export default function ProductImage({
  product,
  image,
  view,
  priority = false,
  decorative = false,
  onLoad,
  sizes = '(min-width: 1024px) 25vw, 50vw',
  className = '',
  artClassName = 'h-[82%] w-[82%]',
}) {
  const img = image ?? product?.images?.[0]
  // decorative: the surrounding link/heading already names the product
  const alt = decorative ? '' : img?.alt || product?.name || 'sock'

  if (img?.src) {
    return (
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes={img.srcSet ? sizes : undefined}
        alt={alt}
        width={img.width || 1200}
        height={img.height || 1500}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={onLoad}
        onError={onLoad}
        className={cx('h-full w-full object-cover', className)}
      />
    )
  }

  return (
    <div data-photo-slot className={cx('relative grid h-full w-full place-items-center', className)}>
      <SockArt art={product?.art} view={view || img?.view || 'single'} title={alt || undefined} className={artClassName} />
      {import.meta.env.DEV && (
        <span className="absolute bottom-2 left-2 rounded-full border border-black bg-offwhite px-2 py-0.5 text-[10px] font-extrabold lowercase text-black">
          photo slot
        </span>
      )}
    </div>
  )
}
