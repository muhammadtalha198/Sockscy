# PROJECT_CONTEXT — SOCKSAVVY (socksavvy.co)

Read this fully before any task. Keep it under 250 lines and up to date.

## 1. Brand
- **SOCKSAVVY** — "weird socks for weird people". Thrifted, washed, hand-picked, mostly
  one-of-one pairs. Aesthetic / skater / streetwear / Y2K vibe. Instagram-first (`@socksavvy.co`).
- Market: **Pakistan**. Prices in **PKR** (`Rs 1,250`, whole rupees). **Cash on Delivery** is the
  default payment; card goes through a gateway redirect (never raw card numbers).
- Voice: short, lowercase, playful ("your cart is emptier than a sock drawer on laundry day").

## 2. Reference inspiration (style only — never copy content or anyone's likeness)
- **Behance "Tyler the Creator" site**: giant edge-cropped Inter Black uppercase type, die-cut
  stickers overlapping the type, flat full-bleed colour sections, small lowercase staggered body
  copy, doodle flowers/stars/squiggles, rotating circular badge, black vertical side tab, diagonal
  corner ribbon, small lowercase coloured nav.
- **Pinterest sock photography**: socks on legs in the air against one flat bright colour,
  flat-lays, hands holding socks; themes = food (eggs, avocado, matcha, pizza, peach), animals,
  hearts, flowers, checkerboard, smileys, stripes, characters. Torn-paper reveal, pizza-box gift
  pack, "BE UNIQUE, BE YOU" tagline band. Mood: fried-egg socks + skateboard.
- Only original art: SVG socks, flowers, fruit, eggs, animal doodles. No real faces, no
  copyrighted characters.

## 3. Design system (source of truth: `src/styles/tokens.css`)
**Palette** (Tailwind default palette is wiped — only these exist):
| token | hex | | token | hex |
|---|---|---|---|---|
| `--color-red` | `#e63a3f` | | `--color-black` | `#000000` |
| `--color-green` | `#1c7d56` | | `--color-offwhite` | `#f5f1e8` |
| `--color-yellow` | `#f4d500` | | `--color-white` | `#ffffff` |
| `--color-pink` | `#ff52a1` | | | |

**Section tones** (`.tone-yellow|red|green|pink|black|offwhite`) set `--tone-bg`, `--tone-display`
(giant type), `--tone-ink` (body), `--tone-accent`, `--tone-focus`. Measured contrast:
- yellow: display red (2.85, giant only), ink black 14.36, accent green (bold ≥19px)
- red: display yellow (2.85, giant only), ink black 5.04, accent off-white
- green: display yellow 3.49, ink off-white 4.52, accent yellow
- pink: display yellow (2.06, giant only), ink black 6.97
- black: display yellow 14.36, ink off-white 18.63, accent pink
- offwhite: display red 3.70, ink black 18.63, accent green 4.52
Rule: body text ≥ 4.5:1. Yellow on red/pink is for giant display type only.

**Fonts**: Inter (self-hosted `@fontsource/inter`, latin, weights 500/600/700/800/900 imported in
`src/main.jsx`). Giant type = weight 900, uppercase, tight tracking, `white-space: nowrap`
(cropped by the screen edge on purpose).

**Type scale** (mobile → desktop clamps):
`--text-mega` 7rem/32vw/12.5rem (hero) · `--text-giant` 4.25rem/19vw/12.5rem (200px) ·
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

**Motion**: `--ease-snap`, `animate-float` (sticker float/rotate), `animate-spin-slow` (badge),
`animate-marquee`. Global `prefers-reduced-motion` block kills animations/transitions.

**Section colour order (Home)**: yellow hero → black marquee → red featured → green collections
→ black "BE UNIQUE, BE YOU" band → pink sock of the day → yellow why → off-white instagram →
black footer. Hard cuts, no gradients, one section = one colour.

## 4. Stack
React 19 · Vite 8 · Tailwind CSS 4 (`@tailwindcss/vite`, CSS-first `@theme`) · React Router 7
(declarative `BrowserRouter`) · Zustand 5 (+persist) · @fontsource/inter. No test runner yet.
Scripts: `npm run dev | build | preview | images` (`images` = WebP converter, needs `npm i -D sharp`).

## 5. Folder map
```
src/
  main.jsx            fonts + BrowserRouter
  App.jsx             routes (Home eager, other pages React.lazy)
  styles/tokens.css   design tokens (above)        styles/index.css  base + utilities
  api/                client.js (VITE_API_URL, mock switch, ApiError, toQuery)
                      products.js, orders.js, contact.js (mock + real, contracts in comments)
  store/cart.js       Zustand cart (persist key "socksavvy-cart")
  hooks/              useAsync, useInView, useParallax (shared rAF), useReducedMotion
  lib/                constants (SITE, collections, sizes, prices, cities, tiles), format
                      (formatPKR, phone/email validation, stockNote), pricing (getTotals), cx
  data/products.json  12 products
  components/         see §6
  pages/              Home, Shop, Product, Cart, Checkout, OrderPlaced, About, Contact, NotFound
scripts/optimize-images.mjs   photos/raw → public/products/*.webp (1200 + 600)
```

## 6. Components
Layout (skip link, Navbar, main, Footer, SideTab, CartDrawer, aria-live cart announcements,
nav tone per route) · Navbar (lowercase staggered links: shop, collections, about, cart (n);
wordmark "socksavvy.co") · Hero · GiantHeadline (lines slide in on view) · Sticker (position →
parallax → float → die-cut → rotate) · Marquee · Badge (rotating ring text) · Ribbon (corner) ·
SideTab (black right-edge "Cart (n)" → opens drawer) · CartDrawer (focus trap, Esc, scroll lock) ·
ProductCard (flat tile, hover colour flip + tilt) · ProductGrid · ProductImage (lazy img/WebP or
SVG placeholder "photo slot") · ProductCarousel (scroll-snap, arrows, thumbs) · SizePicker ·
TornReveal · NewsletterForm · Footer (giant yellow SOCKSAVVY) · ScrollManager (top / #hash) ·
cart/ (CartLine, CartSummary, FreeShippingBar, GiftPackToggle, QuantityStepper) ·
form/Field (TextField, TextArea, SelectField, ErrorSummary) ·
home/ (FeaturedDrop, Collections, SockOfTheDay, WhySocksavvy, InstagramStrip) ·
art/ (SockArt — 12 SVG patterns × views single|pair|kick|detail; Doodles — Flower, Star,
Squiggle, Smiley, SockMonster, Heart, Sparkle, FriedEgg, Arrow; PizzaBox).

## 7. State
`useCart` (Zustand): `items[] {key "id:size", id, name, price, size, qty, maxQty, tile, art,
image}`, `giftPack`, `isOpen`, `announcement` (only `items` + `giftPack` persist, key
`socksavvy-cart` v1); actions `addItem(product, size,
qty)` (opens drawer, caps at stock), `setQty`, `removeItem`, `clear`, `setGiftPack`,
`openCart`, `closeCart`; `selectCount`. Totals via `lib/pricing.getTotals(items, giftPack)`:
free shipping ≥ Rs 3,000, else Rs 250; gift pack Rs 350.

## 8. Data shape (`src/data/products.json`)
```json
{ "id": "sunny-side-up", "name": "Sunny Side Up", "price": 1250,
  "collection": "eggs|fruits|hearts|checkers|creatures",
  "colors": ["black","yellow","white"], "sizes": ["S","M","L"],
  "stock": { "S": 1, "M": 2, "L": 0 }, "tile": "yellow|red|green|pink",
  "featured": false, "art": { "pattern": "eggs", "base": "#111111", "trim": "#f4d500" },
  "description": "…", "details": ["…"],
  "images": [{ "src": null, "view": "kick|pair|detail", "alt": "…" }] }
```
`src: null` → SVG placeholder. Total stock 1 = "one of one". Sizes S/M/L = EU 35–38/39–42/43–46.

## 9. Pages & routes
`/` Home · `/shop` (filters in URL: `collection`, `color`, `size`, `price`, `sort`) ·
`/product/:id` · `/cart` · `/checkout` (one page, PK mobile validation, COD/card) ·
`/order-placed` (router state) · `/about` · `/contact` · `/orders?number=` (tracking) · `*` 404.
API mock when `VITE_API_URL` is empty (orders in localStorage, demo order `SS-10234`).

## 10. Status (before version-1)
**Done**: all pages above, cart drawer + page, checkout → mock order → tracking timeline,
filters, URL state, a11y (skip link, focus rings, dialogs, labels, reduced motion), code
splitting, WebP pipeline, README.
**Not done / placeholder**: real product photos (SVG stand-ins), real About story copy, real
WhatsApp number (`VITE_WHATSAPP_NUMBER`), Go backend, payment gateway, SPA host rewrites,
no automated tests. **There is no `main` branch on the remote.**

## 11. Do not change (without asking the owner)
- Palette hex values, Inter Black giant type, sticker look (white outline + soft shadow),
  pill buttons with hard shadow, section tone/contrast rules.
- Cart/checkout behaviour, routes, `products.json` fields, `src/api` contracts (extend only).
- Lowercase brand voice. PKR + Cash on Delivery.

## 12. version-1 goals ("PLAYFUL CURSOR AND PHYSICS, MAXIMUM WOW")
Order built: A, B, C, E, D, F, H, J, G, I, K — all built; details per feature in §13.
Targets: 60fps drag, Lighthouse mobile 80+, no CLS, everything off with reduced motion.

## 13. version-1 progress (update per feature)
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
- **E Cards + product page + add to cart** — `ProductCard` (pointer 3D tilt via `--rx/--ry`,
  `.peel` corner sticker with urgency label `urgencyLabel()`, `.pcard-price` bounce, torn
  paper `.pcard-paper` on first view/img load). `product/SockSpinner.jsx` (layered CSS 3D,
  drag + inertia + arrows, optional `product.spin` frame URLs) is slide 1 of
  `ProductCarousel`. **Data**: optional `colorways: [{id,label,base,trim,stock:{S,M,L}}]` (10 products);
  product `stock` = sum of its colourways; `lib/stock.js` (stockFor/artFor/pickColorway). Cart caps
  each line at min(colour stock, size stock − other lines); mock API checks both;
  cart line key `id:size[:colorway]`, checkout sends `colorway`. `hooks/useAddToCart.js` →
  `fx/flyToCart.jsx` (WAAPI arc → `[data-cart-target]` SideTab shakes, count pops, 'add'
  sound, `fx/confetti.js` burst) + `CartToast` (drawer no longer auto-opens from these).
- **D Scroll story** — `motion/scroll.js` lazy-loads gsap + ScrollTrigger + lenis after idle
  (Layout); `scrollToTarget()` cooperates with Lenis (ScrollManager uses it); scroll lock stops
  Lenis; ScrollTrigger refreshes when the page height changes. `motion/velocity.js` (shared
  scroll-velocity loop) drives `motion/useScrollSkew.js` (GiantHeadline + collection words drift
  and skew; hero opts out with `skew={false}`) and the JS `Marquee` (speeds up, reverses on
  scroll up). `Sticker`: `depth` 1|2|3 parallax + spring fly-in from the nearest edge (measured
  before paint, always pushed away from the screen). `home/SockFactory.jsx`: 420svh section +
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
- **H Page transitions** — `App.jsx` renders `<Routes location={display}>`; on a pathname
  change it shows `fx/Curtain.jsx` (torn edges, colour = `toneFor(next)` from `lib/routes.js`),
  preloads the page chunk (`loaderFor`), swaps `display` while covered, then wipes off.
  Search/hash/state-only changes and reduced motion swap instantly. `useLocation()` inside
  the tree returns the *displayed* location.
- **J Conversion** — `TrustStrip.jsx` (COD / `SITE.returns` placeholder copy / WhatsApp link)
  on Product, Cart summary, Sock of the Day. `FreeShippingBar` = walking sock (last cart item's
  art) that walks to the progress, turns round on removal, jumps when free. Product page
  `StickyBuyBar` (phones, shows while the main add button is off screen; sets
  `html[data-buypage|data-buybar]` so the footer pads and the game sticker hops up).
  OrderPlaced: sock confetti `rain()` + 'win' sound, Instagram share (Web Share → else copy
  caption + open IG). Urgency = real stock only (cards, stock note, buy bar tag).
- **G Sound + easter eggs** — `fx/SoundToggle.jsx` (fixed bottom-right speaker sticker,
  aria-pressed, off by default; turning it on downloads howler + plays 'pop').
  `hooks/useTuckOnScroll.js` shared with PlayButton. `fx/EasterEggs.jsx`: Konami → `rain()`;
  logo (`[data-logo]`) tapped 5× in 2.5 s → `ui.remixSocks()`; `SockArt` shifts its pattern by
  `ui.remix` (prop `fixed` opts out — the game uses it) and heroWorld re-bakes its sprites.
  404: the matching sock peeks out from behind the footer (`.lost-sock`).
- **I Performance** — Home mounts its below-fold sections one per idle slot
  (`useStagedMount`; a #hash or the first scroll mounts all). heroWorld `watchFrameBudget`:
  ~40 frames over 26 ms → `html[data-lite]` (canvas DPR 1, decorative float/spin loops paused).
  Never put `filter` on a parent of an infinite animation (re-rasterises every frame).
  `public/robots.txt`. Lighthouse mobile (vite preview): home 88–89, product 87, shop 88.
- **K Polish** — focus moves to `<main>` after client-side navigation (ScrollManager);
  hash landings re-pin for ~1 s; floating stickers tuck when a `.btn-lg`/`[data-avoid-float]`
  sits under them on phones; skeletons match card height. Known gap: yellow on red is 2.84:1.

## 14. HANDOFF — read this first in the next session (state at commit 1d87f72)
**Stopped mid final review** (owner asked to stop). Confirmed bugs, NOT fixed yet:
1. HIGH `App.jsx` curtain sticks (covers site, blocks clicks) when a 2nd navigation within
   460 ms lands on the displayed pathname (Back, logo, filter). Fix: in the same-pathname /
   reduced-motion branch also `setCurtain(c => c ? {...c, phase:'out'} : c)` (null if reduced).
2. `FindThePair.jsx` + `PlayButton.jsx` say "PAIRUP10 in your cart" from `hasWonToday()` even
   after it was removed/used. Base messages on `useCart(s => s.discount?.code)`; record use on
   order (add `markUsed`/`usedToday` in `lib/discount.js`); re-apply a removed, unused win.
3. `FindThePair.jsx` board regenerates when width crosses 640px mid-round; freeze `count` in
   `start()` state, `useMemo(..., [round])`.
4. `store/cart.js` persist v1 carts from before colourway stock keep impossible lines → bump
   to version 2 with `migrate` re-deriving `sizeStock/lineStock` from products.json, clamp qty.
5. `Checkout.jsx` calls `clear()` before navigate → "NOTHING TO PAY" flashes under the
   curtain. Clear the cart in `OrderPlaced` on mount (when `state.order` exists) instead.
**Still to do:** re-run review lenses a11y / perf / completeness against the A–K brief
(§12/§13; read-only reviewers, Playwright at
`/opt/node22/lib/node_modules/playwright`, preview on :4173 with sessionStorage
`socksavvy-intro=1`); final Lighthouse on home/shop/product/cart/checkout/404; final report.
**Owner decision pending:** yellow on red = 2.84:1 (< 3:1 large text). Suggested fix: red
`#e63a3f` → `#dc363c` in tokens.css — do NOT change without asking (§11).
**Placeholders:** SVG socks (no photos/cutouts/spin frames), synthesized sounds,
`SITE.returns` copy, About story, WhatsApp number. Asset list: README "Real files to add".

