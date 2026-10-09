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
no automated tests, no Lighthouse run yet. **There is no `main` branch on the remote.**

## 11. Do not change (without asking the owner)
- Palette hex values, Inter Black giant type, sticker look (white outline + soft shadow),
  pill buttons with hard shadow, section tone/contrast rules.
- Cart/checkout behaviour, routes, `products.json` fields, `src/api` contracts (extend only).
- Lowercase brand voice. PKR + Cash on Delivery.

## 12. version-1 goals ("PLAYFUL CURSOR AND PHYSICS, MAXIMUM WOW")
Order: A, B, C, E, D, F, H, J, G, I, K. 60fps on a mid-range Android. Lazy-load heavy modules.
- **A** Intro: socks drop and stack to spell SOCKSAVVY; knitted-sock loading bar; skip on
  click/tap; once per session.
- **B** Physics hero (Matter.js): 12–20 cutouts (8–10 on mobile) fall, grab/throw/stack,
  cursor pushes, tilt = gravity (permission asked politely), shake drops more, letters shake on
  impact, click a sock → quick view.
- **C** Custom cursor (desktop): flower sticker that squishes/rotates with speed, grows into
  "VIEW"/"ADD" pill on cards, flower/star trail, magnetic buttons.
- **E** Cards: colour flip, 3D tilt, corner sticker peel, bouncing price, torn-paper reveal.
  Product page: drag-to-spin pseudo-3D sock, colour swatches with splash. Add to cart: sock
  flies in an arc to the side tab, tab shakes, counter pops, sound, flower confetti.
- **D** Scroll story: Lenis + GSAP ScrollTrigger, velocity skew on giant words, stickers fly in
  with springs, 3 parallax depths, velocity-reactive marquee, pinned "sock factory" scene.
- **F** "Find the Pair" game → `PAIRUP10` auto-applied, one win per visitor per day.
- **H** Torn-paper curtain page transitions in the next page's colour.
- **J** Sticky mobile add-to-cart, walking sock on free-shipping bar, urgency labels, trust
  strip (COD, easy returns, WhatsApp), order-success sock confetti + Instagram share.
- **G** Sound (off by default, toggle sticker; pop/drop/add/win < 30 KB) + easter eggs (Konami
  sock rain, 5 logo clicks remix patterns, hidden sock on 404).
- **I** Mobile/perf: touch everything, fewer bodies, capped DPR, pause when hidden, lazy load,
  Lighthouse mobile 80+, no CLS.
- **K** Polish: spring motion 0.4–0.7s, consistent stickers, ≤ 4 colours per screen, full
  reduced-motion + keyboard + aria support.
