# SOCKSAVVY — socksavvy.co

Weird socks for weird people. A playful sock storefront for Pakistan: prices are in PKR, with Cash on Delivery and card payments.

React 19 + Vite + Tailwind CSS 4 + Zustand. Mobile-first: designed at 390px, then scaled up to desktop.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the build locally
```

Copy `.env.example` to `.env` to set the API URL and the WhatsApp number.
Without an API URL the site runs on a built-in mock, so everything works offline:
- products load from `src/data/products.json`
- orders are saved in localStorage
- demo order `SS-10234` can be tracked

## Where to change things

| What | Where |
| --- | --- |
| **Colours** | `src/styles/tokens.css` → `@theme` (`--color-red`, `--color-yellow`, …). Section colour rules (which text colour goes on which background) are the `.tone-*` classes in the same file. |
| **Fonts** | Font files: `src/main.jsx` (Inter weights). Font family: `--font-sans` in `tokens.css`. |
| **Type scale** | `tokens.css` → `--text-mega` (hero), `--text-giant` (200px headlines), `--text-huge` (120px), `--text-display`, `--text-body` |
| **Sticker look** | `tokens.css` → `.sticker` (white outline width + drop shadow) |
| **Buttons** | `tokens.css` → `.btn` and the `.btn-*` colour variants |
| **Products** | `src/data/products.json` (12 products: `id, name, price, sizes, colors, collection, images, stock` …) |
| **Collections, sizes, price filters, cities** | `src/lib/constants.js` |
| **Shipping fee / free-shipping threshold / gift pack price** | `src/lib/constants.js` (`SHIPPING_FEE`, `FREE_SHIPPING_THRESHOLD`, `GIFT_PACK_PRICE`) |
| **WhatsApp, Instagram, email** | `.env` (`VITE_WHATSAPP_NUMBER`) and `SITE` in `src/lib/constants.js` |
| **Copy** | Home sections: `src/components/home/*`. About story: `src/pages/About.jsx` (placeholder copy, replace with the real story). |

## Product photos (WebP + lazy loading)

Every product image is a flat-colour SVG sock for now. In development, each one shows a small "photo slot" label.

1. Put your JPG/PNG photos in `photos/raw/`.
2. Install the image tool once with `npm i -D sharp`, then run `npm run images`.
   This writes `public/products/<name>.webp` (1200px wide) and `<name>-600.webp` (600px wide), and prints the JSON to paste.
3. In `products.json`, set each image's `src` (and `srcSet`):
   ```json
   { "src": "/products/sunny-side-up-1.webp",
     "srcSet": "/products/sunny-side-up-1-600.webp 600w, /products/sunny-side-up-1.webp 1200w",
     "view": "kick", "alt": "Sunny Side Up socks worn legs-up on yellow" }
   ```
Images lazy-load, apart from the first one on each product. For hero and sticker cutouts, use transparent PNGs:
`npm run images -- photos/cutouts public/cutouts`. Swap them in where `Hero.jsx` says so.

## Version 1: the playful layer

All of it switches off with the OS "reduce motion" setting. Heavy libraries load lazily (matter-js, gsap + ScrollTrigger, lenis, howler, the game).

| Feature | Where |
| --- | --- |
| **Intro**: a knitted-sock loading bar, then letters drop to spell SOCKSAVVY. Plays once per session; tap or key to skip. | `components/fx/Intro.jsx` |
| **Physics hero**: grab, throw and stack socks; the cursor pushes them; tilt and shake on phones; tap a sock for a quick view; letters shake when hit. Drops to a lighter mode on slow phones. | `physics/heroWorld.jsx`, `components/Hero.jsx`, `components/QuickView.jsx` |
| **Custom cursor** (desktop): a flower that squishes with speed, a view/add pill, a trail, and magnetic buttons | `components/fx/Cursor.jsx` |
| **Cards + product page**: tilt, peel sticker, bouncing price, torn-paper reveal. Drag-to-spin sock, colour swatches with a splash, fly-to-cart arc, confetti and a toast. | `ProductCard.jsx`, `product/SockSpinner.jsx`, `fx/flyToCart.jsx`, `fx/confetti.js` |
| **Scroll story**: Lenis smooth scroll, velocity-skewed giant words, edge fly-in stickers with 3 parallax depths, reactive marquees, a pinned "sock factory" scene | `motion/*`, `Sticker.jsx`, `Marquee.jsx`, `home/SockFactory.jsx` |
| **Find the Pair**: find the identical pair in 20 s to win **PAIRUP10** (10% off socks), applied automatically. One win per visitor per day. | `PlayButton.jsx`, `game/FindThePair.jsx`, `lib/discount.js` |
| **Page transitions**: a torn-paper curtain in the next page's colour | `components/fx/Curtain.jsx`, `App.jsx` |
| **Conversion**: sticky add-to-cart bar on phones, walking sock on the free-shipping bar, real-stock urgency labels, trust strip, confetti + Instagram share on the order page | `pages/Product.jsx`, `cart/FreeShippingBar.jsx`, `TrustStrip.jsx`, `pages/OrderPlaced.jsx` |
| **Sound + easter eggs**: sound toggle (off by default); Konami code (↑↑↓↓←→←→BA) rains socks; tap the logo 5× to remix every sock pattern; a hidden sock on the 404 page | `fx/SoundToggle.jsx`, `fx/EasterEggs.jsx`, `fx/sound.js`, `pages/NotFound.jsx` |

## Version 2: depth (parallax)

Every page is a layered diorama on five depth planes (back · far · mid · near · front). Scroll moves them at different speeds; on desktop the pointer moves them too; on phones, tilt moves them after a tap on the "tilt" sticker. The look, cart, checkout, routes and data are unchanged. Everything is static with "reduce motion". A **calm mode** sticker (bottom right) turns motion down to 15% for anyone who wants less.

| What | Where |
| --- | --- |
| Depth tokens (plane values, strength, pointer range, tilt, calm, phone) | `src/styles/tokens.css` → `--depth-*`, `--parallax-*` |
| Engine (scroll via CSS scroll-driven animations, JS fallback for Firefox; pointer, tilt, page-transition depth) | `src/parallax/engine.js`, `src/parallax/tilt.js` |
| Components: `ParallaxSection`, `ParallaxLayer`, `ParallaxText`, `ParallaxSticker`, `TiltCard`, `StoryBlock`, `SoftBackdrop` + `DriftSticker`; hook `useParallax` | `src/components/parallax/`, `src/hooks/useParallax.js` |
| Per-page changes, before/after screenshots, the real image files to add | `docs/version-2/` (`CHANGES.md`, `before/`, `after/`) |

Checks: `npm run test:visual` (Playwright at 390/768/1440: errors, overflow, scroll stalls, reduced motion on every page, calm toggle, checkout) and `npm run lighthouse -- --label=x` (median of 3, mobile + desktop; serve the build with `npm run preview` first). Add `?parallax=js` to any URL to try the JS fallback.

**Colourways have their own stock.** In `products.json`, `colorways[].stock` is per size, and the product's `stock` must equal the sum of its colourways. The cart caps every line by colour and by size.

### Real files to add

The version 2 depth layers (hero front sock, About cutout, 404 lost sock, Instagram tiles, confetti sprites) are listed with sizes in `docs/version-2/CHANGES.md`.

| File | Size / format | Used for |
| --- | --- | --- |
| `public/cutouts/<product-id>.webp`, then set `"cutout": "/cutouts/<id>.webp"` on the product | Transparent WebP, sock only, about 600–800 px tall, under 80 KB | Physics hero socks (otherwise the SVG placeholder is used) |
| Product photos, via `npm run images` (see above) | WebP at 1200 px and 600 px wide, 4:5 | Cards, carousel, quick view |
| Optional 360° spin: `public/spin/<id>/01.webp … 24.webp`, then set `"spin": ["/spin/<id>/01.webp", …]` | 24–36 frames, 800×1000 WebP, under 40 KB each | Product page "drag to spin" (otherwise a layered SVG sock is used) |
| `public/sounds/{pop,drop,add,win}.webm` + `.mp3` | Under 30 KB each, mono, under 1 s (win: under 2 s) | Sound effects. The current ones are synthesized by `node scripts/make-sounds.mjs`. |

Placeholder copy to replace: `SITE.returns` ("easy size swaps") in `src/lib/constants.js` (shown in the trust strip), and the About story.

## Plugging in the Go backend

All network code lives in `src/api/`. Set `VITE_API_URL=https://api.socksavvy.co` and the site calls these endpoints:

| Endpoint | Used by |
| --- | --- |
| `GET /products?collection=&color=a,b&size=S,M&price=under-1000&sort=price-asc` | Shop page and filters |
| `GET /products/:id` · `/products/featured?limit=4` · `/products/sock-of-the-day` · `/products/:id/related?limit=4` | Product page, Home |
| `POST /orders` → `{ orderNumber, total, paymentUrl? }` | Checkout |
| `GET /orders/:orderNumber?phone=` → `{ …, timeline[] }` | Order tracking |
| `POST /contact`, `POST /newsletter` | Contact form, footer signup |

The exact request and response shapes are commented at the top of each `api/*.js` file.

Checkout sends only `{id, size, qty, colorway?}` for each item, plus `discountCode?` (for example `PAIRUP10`). The server must re-price the order, check stock per colourway + size, and validate the discount (one game win per visitor per day).

For card payments, return a `paymentUrl` from your gateway (PayFast, Safepay, Stripe…) and the site redirects the buyer there. Card numbers never touch this app.

## Project map

```
src/
  styles/tokens.css   design tokens: palette, type, spacing, sticker, buttons, motion
  api/                client.js, products.js, orders.js, contact.js (mock + real)
  store/cart.js       Zustand cart, persisted to localStorage ("socksavvy-cart")
  components/         Navbar, Hero, Sticker, Marquee, ProductCard, ProductGrid, CartDrawer,
                      Footer, SideTab, Badge, Ribbon, GiantHeadline, TornReveal, art/ (SVG)
  pages/              Home, Shop, Product, Cart, Checkout, OrderPlaced, About, Contact (+ /orders), NotFound
```

## Notes

- **Motion:** stickers float and move with scroll (parallax). Headlines slide in from the side. Turning on "reduce motion" in the OS switches all of this off, including the intro, physics, cursor, curtain, smooth scroll, confetti and fly-to-cart.
- **Text contrast:** body text passes 4.5:1 on every background: black on yellow, red and pink, off-white on green. Yellow display type on **red** measures 2.84:1, just under the 3:1 large-text minimum. Darkening `--color-red` from `#e63a3f` to about `#dc363c` fixes it; this is a brand-colour decision.
- **Deploying:** this is a single-page app, so the host must send every path to `index.html`. On Netlify, add a `_redirects` file containing `/* /index.html 200`. On Vercel, add a rewrite for all paths to `/`.
