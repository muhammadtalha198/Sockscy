import { Link } from 'react-router'
import { getFeatured } from '../../api/products'
import { useAsync } from '../../hooks/useAsync'
import { Flower, Star } from '../art/Doodles'
import GiantHeadline from '../GiantHeadline'
import ProductGrid from '../ProductGrid'
import Sticker from '../Sticker'

/** Red section — 4 featured products */
export default function FeaturedDrop() {
  const { data, loading, error } = useAsync(({ signal }) => getFeatured(4, { signal }), [])

  return (
    <section id="featured" aria-labelledby="featured-title" className="tone-red clip-x relative py-section">
      {/* scattered tags, like the reference's "PROVOCATION" */}
      <span aria-hidden="true" className="tag absolute left-[6%] top-8 text-yellow">thrifted</span>
      <span aria-hidden="true" className="tag absolute right-[14%] top-8 text-yellow md:top-16">one of one</span>
      <span aria-hidden="true" className="tag absolute right-[30%] top-[170px] hidden text-yellow lg:block">thrifted</span>

      <Sticker className="absolute right-[4%] top-[3.25rem] z-20 w-16 md:right-[5%] md:top-[14%] md:w-32" rotate={14} parallax={0.12}>
        <Flower fill="#ff52a1" center="#f4d500" />
      </Sticker>
      <Sticker className="absolute left-[38%] top-[6%] z-20 hidden w-20 md:block" rotate={-10} parallax={0.2} outline={false}>
        <Star fill="#ffc6dd" />
      </Sticker>

      <GiantHeadline
        id="featured-title"
        lines={[
          { text: 'FRESH', from: 'left', className: 'pl-gutter' },
          { text: 'DROP', from: 'right', className: 'pl-[26vw] text-offwhite' },
        ]}
      />

      <div className="mt-8 grid gap-6 px-gutter md:mt-12 md:grid-cols-12 lg:pr-24">
        <p className="giant whitespace-normal text-display text-offwhite md:col-span-7">
          four pairs. picked this week. gone when they’re gone.
        </p>
        <div className="md:col-span-5">
          <p className="copy">every pair is thrifted, washed and checked by hand before it gets a sticker.</p>
          <p className="copy copy-offset mt-2">no restocks, no reprints. if you like it, grab it.</p>
        </div>
      </div>

      <div className="mt-12 px-gutter lg:pr-24">
        {error ? (
          <p className="copy font-bold">couldn’t load the drop: {error.message}</p>
        ) : (
          <ProductGrid products={data} loading={loading} skeletons={4} />
        )}
      </div>

      <div className="mt-12 px-gutter">
        <Link to="/shop" className="btn btn-yellow btn-lg">
          see all socks
        </Link>
      </div>
    </section>
  )
}
