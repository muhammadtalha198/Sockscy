import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { getProducts } from '../api/products'
import { Flower, SockMonster, Star } from '../components/art/Doodles'
import GiantHeadline from '../components/GiantHeadline'
import ProductGrid from '../components/ProductGrid'
import Sticker from '../components/Sticker'
import { useAsync } from '../hooks/useAsync'
import { COLLECTIONS, COLORS, PRICE_RANGES, SIZES, SORTS } from '../lib/constants'
import { cx } from '../lib/cx'

const pill =
  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 border-black px-4 py-2 text-[0.95rem] font-extrabold lowercase shadow-hard transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none aria-pressed:translate-x-1 aria-pressed:translate-y-1 aria-pressed:bg-black aria-pressed:text-yellow aria-pressed:shadow-none'

const list = (v) => (v ? v.split(',').filter(Boolean) : [])

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [panelOpen, setPanelOpen] = useState(false)

  const filters = {
    collection: params.get('collection') || 'all',
    colors: list(params.get('color')),
    sizes: list(params.get('size')),
    price: params.get('price') || '',
    sort: params.get('sort') || 'featured',
  }
  const { data, loading, error } = useAsync(({ signal }) => getProducts(filters, { signal }), [params.toString()])

  function update(patch) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      const v = Array.isArray(value) ? value.join(',') : value
      if (!v || v === 'all' || (key === 'sort' && v === 'featured')) next.delete(key)
      else next.set(key, v)
    }
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const toggle = (key, current, value) =>
    update({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] })

  const activeCount = filters.colors.length + filters.sizes.length + (filters.price ? 1 : 0)
  const collection = COLLECTIONS.find((c) => c.id === filters.collection)
  const count = data?.length ?? 0

  return (
    <>
      <title>{`${collection ? `${collection.label} socks` : 'shop all socks'} — SOCKSAVVY`}</title>

      <section aria-labelledby="shop-title" className="tone-green clip-x relative pb-14 pt-28 md:pt-36">
        <Sticker className="absolute right-[6%] top-[86px] z-20 w-20 md:right-[12%] md:w-32" rotate={14} parallax={0.12}>
          <SockMonster fill="#f4d500" trim="#ff52a1" />
        </Sticker>
        <Sticker className="absolute bottom-6 right-[30%] w-12 md:w-16" outline={false} rotate={-10}>
          <Flower fill="#ff52a1" center="#000" />
        </Sticker>

        <GiantHeadline
          key={filters.collection}
          as="h1"
          id="shop-title"
          lines={
            collection
              ? [
                  { text: collection.label, from: 'left', className: 'pl-gutter' },
                  { text: 'SOCKS', from: 'right', className: 'pl-[22vw] text-offwhite' },
                ]
              : [
                  { text: 'SHOP', from: 'left', className: 'pl-gutter' },
                  { text: 'ALL SOCKS', from: 'right', className: 'pl-[12vw] text-offwhite' },
                ]
          }
        />
        <div className="mt-6 px-gutter">
          <p className="copy">{collection ? collection.blurb : 'every pair thrifted, every pair different. filter till you find your weird.'}</p>
          <p className="copy copy-offset mt-1 font-extrabold" aria-live="polite">
            {loading ? 'counting socks…' : `${count} ${count === 1 ? 'pair' : 'pairs'} found`}
          </p>
        </div>
      </section>

      <section aria-label="products" className="tone-offwhite relative pb-section">
        {/* filter bar */}
        <div className="sticky top-0 z-30 border-b-2 border-black bg-offwhite">
          <div className="flex items-center gap-3 px-gutter py-3 lg:pr-24">
            <div className="no-scrollbar -my-2 flex flex-1 gap-3 overflow-x-auto py-2 pr-2" role="group" aria-label="collection">
              <button type="button" className={cx(pill, 'bg-white')} aria-pressed={filters.collection === 'all'} onClick={() => update({ collection: 'all' })}>
                all
              </button>
              {COLLECTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={cx(pill, 'bg-white')}
                  aria-pressed={filters.collection === c.id}
                  onClick={() => update({ collection: c.id })}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={cx(pill, 'bg-yellow lg:hidden')}
              aria-expanded={panelOpen}
              aria-controls="filter-panel"
              onClick={() => setPanelOpen((o) => !o)}
            >
              filters{activeCount ? ` (${activeCount})` : ''}
            </button>
          </div>

          <div id="filter-panel" className={cx('border-t-2 border-black px-gutter py-5 lg:block lg:pr-24', panelOpen ? 'block' : 'hidden')}>
            <div className="grid gap-6 lg:grid-cols-[auto_auto_auto_1fr] lg:items-start lg:gap-10">
              <fieldset>
                <legend className="field-label">colour</legend>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={cx(pill, 'min-h-10 bg-white px-3 py-1.5 text-sm')}
                      aria-pressed={filters.colors.includes(c.id)}
                      onClick={() => toggle('color', filters.colors, c.id)}
                    >
                      <span className="h-4 w-4 rounded-full border-2 border-black" style={{ background: c.hex }} aria-hidden="true" />
                      {c.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="field-label">size (in stock)</legend>
                <div className="flex gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      title={s.fit}
                      className={cx(pill, 'min-h-10 w-12 justify-center bg-white px-0 py-1.5 font-black uppercase')}
                      aria-pressed={filters.sizes.includes(s.id)}
                      aria-label={`size ${s.label}, ${s.fit}`}
                      onClick={() => toggle('size', filters.sizes, s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="field-label">price</legend>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={cx(pill, 'min-h-10 bg-white px-3 py-1.5 text-sm')}
                      aria-pressed={filters.price === r.id}
                      onClick={() => update({ price: filters.price === r.id ? '' : r.id })}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap items-end gap-4 lg:justify-end">
                <div>
                  <label htmlFor="sort" className="field-label">
                    sort
                  </label>
                  <select
                    id="sort"
                    value={filters.sort}
                    onChange={(e) => update({ sort: e.target.value })}
                    className="field min-h-10 w-auto py-1.5 pr-10 text-sm lowercase"
                  >
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(activeCount > 0 || filters.collection !== 'all') && (
                  <button
                    type="button"
                    className="min-h-10 text-sm font-extrabold lowercase underline decoration-2 underline-offset-4"
                    onClick={() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}
                  >
                    clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-gutter pt-10 lg:pr-24">
          <h2 className="sr-only">socks</h2>
          {error ? (
            <p className="copy font-bold">couldn’t load socks: {error.message}</p>
          ) : (
            <ProductGrid
              products={data}
              loading={loading}
              skeletons={8}
              empty={
                <div className="relative grid place-items-start gap-5 py-16">
                  <Sticker className="w-28" rotate={-12}>
                    <SockMonster />
                  </Sticker>
                  <p className="giant whitespace-normal text-huge t-display">no socks match.</p>
                  <p className="copy">even weird has limits. try fewer filters.</p>
                  <button type="button" className="btn btn-yellow" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                    clear filters
                  </button>
                  <Sticker className="absolute right-[10%] top-10 w-16" outline={false} rotate={12}>
                    <Star />
                  </Sticker>
                </div>
              }
            />
          )}
        </div>
      </section>
    </>
  )
}
