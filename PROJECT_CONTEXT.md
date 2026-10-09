# PROJECT_CONTEXT — SOCKSAVVY (socksavvy.co)

Read this fully before any task. Keep it under 250 lines and up to date.

## 1. Brand
- **SOCKSAVVY** — "weird socks for weird people". Thrifted, washed, hand-picked, mostly
  one-of-one pairs. Aesthetic / skater / streetwear / Y2K vibe. Instagram-first (`@socksavvy.co`).
- Market: **Pakistan**. Prices in **PKR** (`Rs 1,250`, whole rupees). **Cash on Delivery** is the
  default payment; card goes through a gateway redirect (never raw card numbers).
- Voice: short, lowercase, playful ("your cart is emptier than a sock drawer on laundry day").

## 2. Reference inspiration (style only — never copy content or anyone's likeness)
- Behance "Tyler the Creator" site: giant edge-cropped Inter Black type, die-cut stickers over
  the type, flat full-bleed colour sections, small lowercase staggered copy, doodles, rotating
  badge, black side tab, corner ribbon. Pinterest sock photography: socks on legs against one
  flat colour, food/animal/heart/checker themes, torn paper, pizza-box gift pack.
- Only original art: SVG socks, flowers, fruit, eggs, animal doodles. No real faces/characters.

## 3. Design system (source of truth: `src/styles/tokens.css`)
**Palette** (Tailwind default palette is wiped — only these exist): red `#e63a3f` · green
`#1c7d56` · yellow `#f4d500` · pink `#ff52a1` · black `#000000` · offwhite `#f5f1e8` · white `#ffffff`
(`--color-*`).

**Section tones** (`.tone-yellow|red|green|pink|black|offwhite`) set `--tone-bg`, `--tone-display`
(giant type), `--tone-ink` (body), `--tone-accent`, `--tone-focus`. Contrast (display / ink):
yellow red 2.85 giant-only / black 14.36 · red yellow 2.85 giant-only / black 5.04 · green yellow
3.49 / offwhite 4.52 · pink yellow 2.06 giant-only / black 6.97 · black yellow 14.36 / offwhite
18.63 · offwhite red 3.70 / black 18.63. Rule: body text ≥ 4.5:1. Yellow on red/pink is for giant display type only.

**Fonts**: Inter (self-hosted `@fontsource/inter`, latin, weights 500/600/700/800/900 imported in
`src/main.jsx`). Giant type = weight 900, uppercase, tight tracking, `white-space: nowrap`
(cropped by the screen edge on purpose).

**Type scale** (mobile → desktop clamps): `--text-mega` 7rem/32vw/12.5rem (hero) · `--text-giant` 4.25rem/19vw/12.5rem (200px) ·
`--text-huge` 3.25rem/13vw/7.5rem (120px) · `--text-display` 1.75rem/5.5vw/3.75rem ·
`--text-label` 1.1875rem (19px bold) · `--text-body` 1.0625rem · `--text-small` .875rem.

**Spacing**: `--spacing-gutter` clamp(1rem,3vw,2.5rem) (16px side gutter on mobile) ·
`--spacing-section` clamp(4rem,11vw,9rem). **Shadows**: `--shadow-hard` 4px 4px 0 #000,
`--shadow-hard-lg` 8px.

**Classes**: `.giant`, `.copy` (lowercase 17px, max 36ch, margin-right 1.75rem to clear the side
tab), `.copy-offset` (staggered second paragraph), `.tag` (19px 900 uppercase accent),
`.sticker` (die-cut: four 4–6px white drop-shadows + soft shadow), `.btn` (pill, 2px black
border, hard 4px shadow, shifts 4px on hover) + `.btn-yellow|pink|red|green|black|offwhite`,
`.btn-lg|sm`, `.field` / `.field-label` / `.field-error`, `.slide-line` + `.is-in` (slide-in).

**Motion**: `--ease-snap|spring|overshoot`, `--dur-*`, `animate-float|spin-slow|marquee`; global
`prefers-reduced-motion` block kills animations/transitions. Depth tokens: §14.

**Section colour order (Home)**: yellow hero → black marquee → red featured → green collections
→ black "BE UNIQUE, BE YOU" band → pink sock of the day → yellow why → off-white instagram →
black footer. Hard cuts, no gradients, one section = one colour.

## 4. Stack
React 19 · Vite 8 · Tailwind CSS 4 (`@tailwindcss/vite`, CSS-first `@theme`) · React Router 7
(declarative `BrowserRouter`) · Zustand 5 (+persist) · @fontsource/inter · lazy: gsap 3.15.0 +
ScrollTrigger, lenis 1.3.26, matter-js, howler (all pinned exactly). Dev: @playwright/test,
lighthouse. Scripts: `npm run dev | build | preview | images | test:visual | lighthouse`
(`test:visual` = Playwright 390/768/1440: errors, overflow, scroll stalls, reduced motion on
every page, calm toggle, checkout; `lighthouse -- --label=x [--base=] [--pages=]` = median of 3).

## 5. Folder map
```
src/
  main.jsx            fonts + BrowserRouter
  App.jsx             routes (Home eager, other pages React.lazy)
  styles/tokens.css   design tokens (above)        styles/index.css  base + utilities
  api/                client.js (VITE_API_URL, mock switch, ApiError, toQuery)
                      products.js, orders.js, contact.js (mock + real, contracts in comments)
  store/cart.js       Zustand cart (persist key "socksavvy-cart")
  hooks/              useAsync, useInView, useParallax, useReducedMotion, useDialog, useTuckOnScroll
  parallax/           engine.js (depth engine), tilt.js (gyro), ParallaxRoot.jsx — see §14
  components/parallax ParallaxSection/Layer/Text/Sticker, TiltCard, StoryBlock, SoftBackdrop
  motion/             scroll.js (lazy gsap + Lenis + ScrollTrigger kit), velocity.js
  lib/                constants (SITE, collections, sizes, prices, cities, tiles), format
                      (formatPKR, phone/email validation, stockNote), pricing (getTotals), cx
  data/products.json  12 products
  components/         see §6
  pages/              Home, Shop, Product, Cart, Checkout, OrderPlaced, About, Contact, NotFound
scripts/  optimize-images.mjs, make-sounds.mjs, lighthouse.mjs   tests/visual.spec.js
docs/version-2/  CHANGES.md (per page + assets to add), TOOLS.md, INSPIRATION.md, before/ after/
```

## 6. Components
Layout (skip link, Navbar, main, Footer, SideTab, CartDrawer, aria-live cart announcements,
nav tone per route) · Navbar (lowercase staggered links: shop, collections, about, cart (n);
wordmark "socksavvy.co") · Hero · GiantHeadline (lines slide in on view) · Sticker (position →
parallax → float → die-cut → rotate) · Marquee · Badge (rotating ring text) · Ribbon (corner) ·
SideTab (black right-edge "Cart (n)" → opens drawer) · CartDrawer (focus trap, Esc, scroll lock) ·
ProductCard (TiltCard tile, staggered spring entrance) · ProductGrid · ProductImage (lazy img/WebP or
SVG placeholder "photo slot") · ProductCarousel (scroll-snap, arrows, thumbs) · SizePicker ·
TornReveal · NewsletterForm · Footer (giant yellow SOCKSAVVY; desktop curtain reveal from
behind `<main>` when it fits) · ScrollManager (top / #hash) · fx/MotionControls (tilt · calm · sound) ·
cart/ (CartLine, CartSummary, FreeShippingBar, GiftPackToggle, QuantityStepper) ·
form/Field (TextField, TextArea, SelectField, ErrorSummary) ·
home/ (FeaturedDrop, Collections, SockOfTheDay, WhySocksavvy, InstagramStrip) ·
art/ (SockArt — 12 SVG patterns × views single|pair|kick|detail; Doodles — Flower, Star,
Squiggle, Smiley, SockMonster, Heart, Sparkle, FriedEgg, Arrow; PizzaBox).

## 7. State
`useCart` (Zustand): `items[] {key "id:size", id, name, price, size, qty, maxQty, tile, art,
image, colorway?}`, `giftPack`, `discount`, `isOpen`, `announcement` (persist key
`socksavvy-cart` v2, `migrateCart` re-derives stock); actions `addItem(product, size,
qty)` (opens drawer, caps at stock), `setQty`, `removeItem`, `clear`, `setGiftPack`,
`openCart`, `closeCart`; `selectCount`. Totals via `lib/pricing.getTotals(items, giftPack)`:
free shipping ≥ Rs 3,000, else Rs 250; gift pack Rs 350. `useUi`: introDone, quickViewId,
soundOn + calm (persisted), remix.

## 8. Data shape (`src/data/products.json`)
`{ id, name, price, collection: eggs|fruits|hearts|checkers|creatures, colors[], sizes [S,M,L],
stock {S,M,L}, tile: yellow|red|green|pink, featured, art {pattern, base, trim}, description,
details[], images [{src|null, view: kick|pair|detail, alt}], colorways?[], cutout?, spin?[] }`.
`src: null` → SVG placeholder. Total stock 1 = "one of one". Sizes S/M/L = EU 35–38/39–42/43–46.

## 9. Pages & routes
`/` Home · `/shop` (filters in URL: `collection`, `color`, `size`, `price`, `sort`) ·
`/product/:id` · `/cart` · `/checkout` (one page, PK mobile validation, COD/card) ·
`/order-placed` (router state) · `/about` · `/contact` · `/orders?number=` (tracking) · `*` 404.
API mock when `VITE_API_URL` is empty (orders in localStorage, demo order `SS-10234`).

## 10. Status
v1 (all pages, cart → checkout → mock order → tracking, a11y, code splitting) + version-1 wow
features (§13) + version-2 depth on every page (§14). **Placeholders**: SVG socks (no photos,
cutouts or spin frames), synthesized sounds, About story, `SITE.returns`, WhatsApp number, Go
backend, payment gateway, SPA host rewrites. Asset list: `docs/version-2/CHANGES.md`.
**There is no `main` branch on the remote.** Branches: `version-1` (frozen), `version-2` (work).

## 11. Do not change (without asking the owner)
- Palette hex values, Inter Black giant type, sticker look (white outline + soft shadow),
  pill buttons with hard shadow, section tone/contrast rules.
- Cart/checkout behaviour, routes, `products.json` fields, `src/api` contracts (extend only).
- Lowercase brand voice. PKR + Cash on Delivery.

## 12–13. version-1 features ("playful cursor and physics"; all built, targets 60fps drag,
Lighthouse mobile 80+, no CLS, everything off with reduced motion)
- **A Intro** — `components/fx/Intro.jsx` + `styles/fx.css`. CSS-only, `useUi.introDone`,
  sessionStorage `socksavvy-intro`. Motion tokens `--ease-spring|overshoot`, `--dur-*`,
  JS mirror `lib/motion.js` (SPRING, OVERSHOOT, DUR, whenIdle).
- **B Physics hero** — `components/hero/PhysicsLayer.jsx` lazy-imports
  `physics/heroWorld.jsx` (matter-js) after idle; sprites baked once by `fx/sprites.js`
  (SVG → die-cut canvas). DOM hooks: `[data-physics-solid]` (rect / "circle"),
  `[data-physics-floor]` (mobile play zone), `.giant-letter` = shake sensors. Bodies: 9 mobile /
  12 tablet / 16 desktop. Tilt + shake via "tilt your phone" button (iOS permission). Badge =
  "drop more". `QuickView.jsx` (ui.quickViewId), `hooks/useDialog.js`, `lib/scrollLock.js`.
  Sound: `fx/sound.js` (howler lazy, off by default), files `public/sounds/*.webm|mp3`
  generated by `scripts/make-sounds.mjs`. Optional `product.cutout` (transparent WebP) is
  used for physics sprites when present.
- **C Cursor** — `components/fx/Cursor.jsx` (mounted in Layout; only `(hover:hover) and
  (pointer:fine)` and no reduced motion; adds `html.has-cursor`). States from
  `[data-cursor]`: `view` (ProductCard, physics socks), `add` (add-to-cart buttons), `grab`,
  `grabbing`, `drop`; links → grow; inputs → native cursor. Trail = 14 pooled WAAPI particles.
  Magnetic: `.btn` transform uses `--mx/--my` (tokens.css), set by the cursor.
- **E Cards + product + add to cart** — `ProductCard` (TiltCard, `.peel` urgency sticker
  `urgencyLabel()`, `.pcard-price` bounce, torn `.pcard-paper`). `product/SockSpinner.jsx` (CSS 3D,
  drag + inertia + arrows, optional `product.spin`) = carousel slide 1. Optional `colorways
  [{id,label,base,trim,stock}]`; `lib/stock.js`; cart caps each line at min(colour, size − other
  lines); line key `id:size[:colorway]`. `useAddToCart` → `fx/flyToCart.jsx` (arc → SideTab
  `[data-cart-target]`, 'add' sound, confetti burst) + `CartToast` (no drawer auto-open).
- **D Scroll story** — `motion/scroll.js` lazy-loads gsap + ScrollTrigger + lenis after idle
  (Layout); `scrollToTarget()` cooperates with Lenis (ScrollManager uses it); scroll lock stops
  Lenis; ScrollTrigger refreshes when the page height changes. `motion/velocity.js` drives the
  JS `Marquee` (speeds up, reverses on scroll up); word drift/skew moved to the v2 engine (§14).
  `Sticker`: plane `depth` + spring fly-in from the nearest edge (measured before paint, always
  pushed away from the screen). `home/SockFactory.jsx`: 420svh section +
  sticky stage, ScrollTrigger-scrubbed timeline, steps via `data-step` hard cuts. Inner scroll
  areas need `data-lenis-prevent`.
- **F Find the Pair** — `PlayButton.jsx` (fixed bottom-left Badge, hidden on /checkout and
  /order-placed, tucks away while scrolling down on phones) lazy-loads `game/FindThePair.jsx`
  (useDialog; 10 socks on phones / 16 desktop, one identical pair + near misses, 20 s).
  Win → `cart.applyDiscount('PAIRUP10')` + `lib/discount.recordWin()` (localStorage
  `socksavvy-game`, one prize per local day). Cart store `discount {code, percent}` persists;
  `getTotals(items, giftPack, discount)` takes 10% off socks only, free shipping judged after
  discount; `CartSummary` shows it (removable on /cart); checkout sends `discountCode`; mock API
  re-validates via `lookupDiscount`. Order clears the discount.
- **H Page transitions** — `App.jsx` `<Routes location={display}>`; a pathname change shows
  `fx/Curtain.jsx` (torn, colour `toneFor(next)`), preloads the chunk, swaps while covered, wipes
  off (+ v2 depth, §14). Search/hash-only changes and reduced motion swap instantly.
- **J Conversion** — `TrustStrip.jsx` (COD / `SITE.returns` placeholder copy / WhatsApp link)
  on Product, Cart summary, Sock of the Day. `FreeShippingBar` = walking sock (last cart item's
  art) that walks to the progress, turns round on removal, jumps when free. Product page
  `StickyBuyBar` (phones, shows while the main add button is off screen; sets
  `html[data-buypage|data-buybar]` so the footer pads and the game sticker hops up).
  OrderPlaced: sock confetti `rain()` + 'win' sound, Instagram share (Web Share → else copy
  caption + open IG). Urgency = real stock only (cards, stock note, buy bar tag).
- **G Sound + easter eggs** — `fx/SoundToggle.jsx` (speaker sticker in MotionControls,
  aria-pressed, off by default; turning it on downloads howler + plays 'pop').
  `hooks/useTuckOnScroll.js` shared with PlayButton. `fx/EasterEggs.jsx`: Konami → `rain()`;
  logo (`[data-logo]`) tapped 5× in 2.5 s → `ui.remixSocks()`; `SockArt` shifts its pattern by
  `ui.remix` (prop `fixed` opts out — the game uses it) and heroWorld re-bakes its sprites.
  404: the matching sock peeks out from under the page (`.lost-sock`, section clips).
- **I Performance** — Home mounts its below-fold sections one per idle slot
  (`useStagedMount`; a #hash or the first scroll mounts all). heroWorld `watchFrameBudget`:
  ~40 frames over 26 ms → `html[data-lite]` (canvas DPR 1, decorative float/spin loops paused).
  Never put `filter` on a parent of an infinite animation (re-rasterises every frame).
  `public/robots.txt`.
- **K Polish** — focus moves to `<main>` after client-side navigation (ScrollManager);
  hash landings re-pin for ~1 s; floating stickers tuck when a `.btn-lg`/`[data-avoid-float]`
  sits under them on phones; skeletons match card height. Known gap: yellow on red is 2.84:1.

## 14. Parallax system (version-2) — read before touching any motion
**Tokens** (`tokens.css :root`): `--depth-back -0.3 · far -0.15 · mid 0 · near 0.2 · front 0.45`;
`--parallax-travel .42` (offset per px of distance × depth) · `-clamp .3` (max, × vh) ·
`-pointer 70px` · `-tilt-deg 22` · `-calm .15` · `-phone .65` (strength < 640px) · `--dof-blur 2.5px`.
**Engine** `src/parallax/engine.js`, one loop (gsap.ticker after Lenis; rAF before it loads):
- offset = (anchor centre − viewport centre) × depth × travel, clamped. Anchor = enclosing
  `ParallaxSection` (or the element, `own`). `rest:'top'` = 0 until the anchor starts to leave
  (CSS `exit` range): nothing is offset on first paint. `pin` = progress through a sticky scene
  (`contain`). `drift`/`dir` = sideways px (giant words); `skew` = lean with speed (desktop).
- Scroll = CSS scroll-driven animations on `translate` (`[data-px-scroll]`, end points
  `--px-x0/x1/y0/y1/s0/s1/r0/r1`, named timeline `--px-section`) — compositor, never trails touch
  scroll. JS lerp fallback: Firefox, `?parallax=js`, localStorage `socksavvy-parallax=js`.
  Pointer, tilt, skew and page transitions are JS on `transform` (composes with `translate`).
- Markers are data attributes (React rewrites className): `data-px-scroll|anchor|pin|rest`,
  `data-depth`, `--depth`. IntersectionObserver (25% margin) sleeps off-screen layers;
  `will-change` only while JS writes a layer. Cached geometry, no layout reads per frame.
- API: `addLayer`, `createSection/attachSection`, `setCalm`, `setTilt`, `setTransition('leave'|
  'arrive'|null)` (App curtain), `markPageReady` (Layout `PageReady` in the Suspense boundary),
  `refreshParallax`. Debug: `window.__parallax`.
- Springs: pointer/tilt ≈5% overshoot, TiltCard 0.09/0.78, arrive 0.08/0.72 (≈8%); all
  frame-rate independent.
**Tilt** `parallax/tilt.js`: only after a tap (TiltToggle, one-time TiltChip on phones, hero
button), `socksavvy-tilt` on|off|later; rest pose = 8-sample average, slow re-centre, screen
axes, dead zone, low-pass, ±22°, paused when hidden; falls back to scroll only.
**Components** (`components/parallax/`): `ParallaxSection` (`as rest innerRef`) · `ParallaxLayer`
(`depth axis pin scale rotate pointer own decorative`) · `ParallaxText` · `ParallaxSticker` ·
`TiltCard` (`--rx --ry --tx --ty`; children `data-tilt-plane`, `data-tilt-depth` + `--tilt-depth`
/`--tilt-z`) · `StoryBlock` (paragraph enters at its depth) · `SoftBackdrop` + `DriftSticker` ·
hook `useParallax(opts)`. `<Sticker depth="back|far|near|front">`. Calm: `ui.calm` → `setCalm`
→ `html[data-calm]` (15%, loops paused, tilt off); `lessMotion()`/`useLessMotion()` (hooks/
useLessMotion.js) = reduced OR calm → no curtain wipe, Lenis wheel, marquee, physics, fly-ins, trail.
**Rules**
1. A layer element owns `translate` (and `scale`/`rotate` if it asks for them): never put
   Tailwind translate/rotate/scale utilities on it — wrap a child.
2. ≤ 5–6 planes and one hero element per screen. Copy, prices, buttons, forms: mid plane or
   ≤ 0.04. Near forms: `pointer={false}` (cart/checkout backdrop is scroll-only).
3. Transform + opacity only. Never animate blur/filter; `.dof-blur` is static (off on phones/lite).
4. First screens: `rest="top"`. Overlap two copies (404 sock) instead of animating z-index.
5. prefers-reduced-motion → nothing registers (tested on every page); phones run at 65%.
6. Per page details: `docs/version-2/CHANGES.md`. Run `npm run build` + `npm run test:visual`
   before every commit.

## 15. version-2 status / handoff
Done: system + every page, transitions, perf pass (will-change policy, smaller phone controls),
a11y + regression review fixes (calm scope, footer focus, cart cleared at submit). Numbers:
`docs/version-2/lighthouse-*.md`, frame table in CHANGES.md. **Owner decision still pending:**
yellow on red = 2.84:1 (suggested red `#dc363c`; do NOT change without asking, §11).
**Check on a real phone (UNVERIFIED here, no GPU/gyro):** tilt feel on iOS + Android, 60fps on a
mid-range Android, the footer reveal + sticky buy bar on short screens.
