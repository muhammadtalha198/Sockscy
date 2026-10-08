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

Checkout sends only `{id, size, qty}` for each item. The server must re-price the order.

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

- **Motion:** stickers float and move with scroll (parallax). Headlines slide in from the side. Turning on "reduce motion" in the OS switches all of this off.
- **Text contrast:** body text passes 4.5:1 on every background: black on yellow, red and pink, off-white on green. Yellow is used only for giant display type on red and pink.
- **Deploying:** this is a single-page app, so the host must send every path to `index.html`. On Netlify, add a `_redirects` file containing `/* /index.html 200`. On Vercel, add a rewrite for all paths to `/`.
