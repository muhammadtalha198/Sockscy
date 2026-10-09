import { SITE, TILE_BG } from '../../lib/constants'
import SockArt from '../art/SockArt'
import GiantHeadline from '../GiantHeadline'
import ParallaxLayer from '../parallax/ParallaxLayer'
import ParallaxSection from '../parallax/ParallaxSection'

// REAL PHOTOS: swap each tile's <SockArt> for
//   <img src="/instagram/1.webp" alt="…" loading="lazy" decoding="async" className="h-full w-full object-cover" />
const TILES = [
  { tile: 'yellow', view: 'kick', art: { pattern: 'eggs', base: '#111111', trim: '#f4d500' } },
  { tile: 'pink', view: 'pair', art: { pattern: 'checker', base: '#ffffff', trim: '#111111' } },
  { tile: 'green', view: 'single', art: { pattern: 'hearts', base: '#ff52a1', trim: '#e63a3f' } },
  { tile: 'red', view: 'kick', art: { pattern: 'smiley', base: '#111111', trim: '#f4d500' } },
  { tile: 'yellow', view: 'pair', art: { pattern: 'flowers', base: '#e8962e', trim: '#f4d500' } },
  { tile: 'pink', view: 'single', art: { pattern: 'stripes', base: '#f5f1e8', trim: '#111111' } },
]

/** Off-white section — 6 square tiles linking to Instagram */
export default function InstagramStrip() {
  return (
    <ParallaxSection aria-labelledby="ig-title" className="tone-offwhite clip-x relative py-section">
      <GiantHeadline id="ig-title" size="huge" lines={[{ text: '@socksavvy.co', from: 'left', className: 'pl-gutter' }]} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 px-gutter lg:pr-28">
        <p className="copy">tag us in your weirdest fit. we repost the best ones every friday.</p>
        <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-black">
          follow on instagram ↗
        </a>
      </div>
      <ul className="mt-10 grid grid-cols-3 gap-2 px-gutter md:grid-cols-6 md:gap-4 lg:pr-24">
        {TILES.map((t, i) => (
          // masonry: columns sit on two planes (by column, so stacked tiles on the 3-column
          // phone grid never collide), the grid breathes and realigns at rest
          // (links: scroll only, they never chase the pointer)
          <ParallaxLayer as="li" key={i} depth={i % 3 === 1 ? 0.12 : -0.06} pointer={false} decorative={false}>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`instagram post ${i + 1} on ${SITE.instagramHandle} (opens in a new tab)`}
              className="group block aspect-square overflow-hidden rounded-2xl border-2 border-black"
              style={{ background: TILE_BG[t.tile] }}
            >
              <div className="grid h-full w-full place-items-center transition-transform duration-300 ease-snap group-hover:rotate-6 group-hover:scale-110">
                <SockArt art={t.art} view={t.view} className="h-[86%] w-[86%]" />
              </div>
            </a>
          </ParallaxLayer>
        ))}
      </ul>
    </ParallaxSection>
  )
}
