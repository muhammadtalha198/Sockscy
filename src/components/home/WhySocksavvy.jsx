import { cx } from '../../lib/cx'
import { Flower, FriedEgg, Heart } from '../art/Doodles'
import PizzaBox from '../art/PizzaBox'
import GiantHeadline from '../GiantHeadline'
import Sticker from '../Sticker'

const REASONS = [
  {
    n: '01',
    title: 'thrifted, not tired',
    text: 'we dig through bales, markets and closets so you don’t have to. every pair is washed and checked by hand.',
  },
  {
    n: '02',
    title: 'one of one',
    text: 'most pairs exist once. when they’re gone, they’re gone — no restocks, no reprints, no twins at the party.',
  },
  {
    n: '03',
    title: 'cash on delivery',
    text: 'pay the rider when your socks arrive, anywhere in pakistan. cards work too.',
  },
  {
    n: '04',
    title: 'packed like a pizza',
    text: 'add the gift pack and your socks show up folded like a hot slice in a pizza box. unboxing content, sorted.',
  },
]

/** Yellow section — short staggered lowercase blocks */
export default function WhySocksavvy() {
  return (
    <section aria-labelledby="why-title" className="tone-yellow clip-x relative py-section">
      <Sticker className="absolute right-[6%] top-[6%] z-20 w-24 md:w-36" rotate={12} parallax={0.12}>
        <FriedEgg />
      </Sticker>
      <Sticker className="absolute left-[4%] top-[2%] z-0 w-12 md:w-16" outline={false} rotate={-8}>
        <Flower petals={4} fill="#1c7d56" center="#f4d500" />
      </Sticker>

      <GiantHeadline
        id="why-title"
        lines={[
          { text: 'WHY', from: 'right', className: 'pl-[32vw]' },
          { text: 'SOCKSAVVY?', from: 'left', className: 'pl-gutter' },
        ]}
      />

      <div className="relative mt-12 grid gap-y-12 px-gutter md:grid-cols-2 md:gap-x-16 lg:pr-28">
        {REASONS.map((r, i) => (
          <article key={r.n} className={cx('max-w-md', i % 2 === 1 && 'ml-[14vw] md:ml-0 md:mt-28')}>
            <p className="tag">{r.n}</p>
            <h3 className="giant mt-2 whitespace-normal text-display">{r.title}</h3>
            <p className="copy mt-3">{r.text}</p>
          </article>
        ))}
        <Sticker className="-mt-4 w-28 justify-self-end md:absolute md:right-[8%] md:top-[46%] md:mt-0 md:w-44" rotate={-8} parallax={0.1}>
          <PizzaBox />
        </Sticker>
        <Sticker className="absolute bottom-[38%] left-[40%] hidden w-16 md:block" rotate={14} parallax={-0.12}>
          <Heart />
        </Sticker>
      </div>
    </section>
  )
}
