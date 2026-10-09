import { Link } from 'react-router'
import { getProducts } from '../../api/products'
import { useAsync } from '../../hooks/useAsync'
import { useInView } from '../../hooks/useInView'
import { useParallax } from '../../hooks/useParallax'
import { wordDrift } from '../GiantHeadline'
import ParallaxSection from '../parallax/ParallaxSection'
import { COLLECTIONS } from '../../lib/constants'
import { cx } from '../../lib/cx'
import SockArt from '../art/SockArt'
import { Sparkle } from '../art/Doodles'
import Sticker from '../Sticker'

const ART = {
  eggs: { pattern: 'eggs', base: '#111111', trim: '#f4d500' },
  fruits: { pattern: 'avocado', base: '#b9d77a', trim: '#1c7d56' },
  hearts: { pattern: 'hearts', base: '#ff52a1', trim: '#e63a3f' },
  checkers: { pattern: 'checker', base: '#ffffff', trim: '#111111' },
  creatures: { pattern: 'blobs', base: '#f4d500', trim: '#ff52a1' },
}
// staggered left offsets so words crop at different points
const OFFSET = ['pl-gutter', 'pl-[20vw]', 'pl-[7vw]', 'pl-[30vw]', 'pl-gutter']

function CollectionWord({ c, index, count }) {
  const [ref, inView] = useInView()
  useParallax({ ref, depth: 'far', axis: 'x', drift: wordDrift(), dir: index % 2 ? 1 : -1, skew: true, pointer: false, own: true })
  return (
    <Link
      ref={ref}
      to={`/shop?collection=${c.id}`}
      aria-label={`${c.label} collection${count != null ? `, ${count} pairs` : ''}`}
      className={cx(
        'group giant relative block text-giant t-display hover:text-offwhite focus-visible:text-offwhite',
        inView && 'is-in',
      )}
    >
      <span className={cx('slide-line', OFFSET[index])} data-from={index % 2 ? 'right' : 'left'}>
        {c.label}
        {count != null && <sup className="ml-1 hidden align-top text-[0.2em] tracking-normal md:inline">{count}</sup>}
        <span className="sticker ml-3 hidden w-[0.62em] -rotate-12 align-middle group-hover:inline-block group-focus-visible:inline-block">
          <SockArt art={ART[c.id]} view="single" />
        </span>
      </span>
    </Link>
  )
}

/** Green section — giant collection words, each linking to a filtered shop */
export default function Collections() {
  const { data } = useAsync(({ signal }) => getProducts({}, { signal }), [])
  const counts = data?.reduce((acc, p) => ({ ...acc, [p.collection]: (acc[p.collection] || 0) + 1 }), {})

  return (
    <ParallaxSection id="collections" aria-labelledby="collections-title" className="tone-green clip-x relative py-section">
      <Sticker className="absolute right-[8%] top-10 w-14 md:w-20" outline={false} rotate={10}>
        <Sparkle fill="#f4d500" />
      </Sticker>
      <div className="flex flex-wrap items-end justify-between gap-4 px-gutter lg:pr-28">
        <h2 id="collections-title" className="tag">
          collections ↓
        </h2>
        <p className="copy max-w-[30ch]">pick your poison. every word below is a door to a different drawer.</p>
      </div>
      <ul className="mt-8 md:mt-12">
        {COLLECTIONS.map((c, i) => (
          <li key={c.id}>
            <CollectionWord c={c} index={i} count={counts?.[c.id]} />
          </li>
        ))}
      </ul>
    </ParallaxSection>
  )
}
