// Convert product photos to responsive WebP.
//
//   npm i -D sharp                      (one-time)
//   npm run images                      photos/raw → public/products
//   npm run images -- photos/cutouts public/cutouts
//
// Each input "Sunny Side Up 1.jpg" becomes:
//   public/products/sunny-side-up-1.webp      (1200px wide)
//   public/products/sunny-side-up-1-600.webp  (600px wide)
// Transparent PNG cutouts keep their transparency (great for hero stickers).

import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const [src = 'photos/raw', out = 'public/products'] = process.argv.slice(2)

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('✕ sharp is not installed. Run: npm i -D sharp')
  process.exit(1)
}

let files
try {
  files = (await readdir(src)).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f))
} catch {
  console.error(`✕ couldn't read ${src}/ — put your photos there first.`)
  process.exit(1)
}
if (!files.length) {
  console.log(`no images found in ${src}/`)
  process.exit(0)
}

await mkdir(out, { recursive: true })
const publicBase = '/' + path.relative('public', out).split(path.sep).join('/')

for (const file of files) {
  const name = path
    .parse(file)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  for (const [width, suffix] of [
    [1200, ''],
    [600, '-600'],
  ]) {
    await sharp(path.join(src, file))
      .rotate() // respect phone EXIF orientation
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(out, `${name}${suffix}.webp`))
  }
  console.log(`✓ ${file}`)
  console.log(`    "src": "${publicBase}/${name}.webp",`)
  console.log(`    "srcSet": "${publicBase}/${name}-600.webp 600w, ${publicBase}/${name}.webp 1200w",`)
}
