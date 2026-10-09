// Bake React SVG art (or a transparent cutout image) into die-cut sticker sprites:
// thick white outline + soft drop shadow, rendered once to a canvas so physics
// and confetti can draw dozens of stickers per frame cheaply.
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'

/** Render a React element that outputs an <svg> into standalone SVG markup. */
export function svgMarkup(element, width, height) {
  const host = document.createElement('div')
  const root = createRoot(host)
  flushSync(() => root.render(element))
  const svg = host.querySelector('svg')
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  svg.removeAttribute('class')
  const markup = new XMLSerializer().serializeToString(svg)
  root.unmount()
  return markup
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

const yieldToMain = () => new Promise((r) => setTimeout(r, 0))

/**
 * @param source  SVG markup string, or an image URL (e.g. a transparent WebP cutout)
 * @returns {{ canvas, w, h, pad }}  w/h in CSS px including padding; image drawn at (pad, pad)
 */
export async function bakeSticker(source, { width, height, outline = 4, dpr = 2, shadow = true }) {
  const isMarkup = source.trimStart().startsWith('<')
  const url = isMarkup ? URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' })) : source
  let img
  try {
    img = await loadImage(url)
  } finally {
    if (isMarkup) URL.revokeObjectURL(url)
  }
  await yieldToMain()

  const pad = Math.ceil(outline + (shadow ? 16 : 2))
  const w = width + pad * 2
  const h = height + pad * 2
  const make = () => {
    const c = document.createElement('canvas')
    c.width = Math.ceil(w * dpr)
    c.height = Math.ceil(h * dpr)
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)
    return [c, ctx]
  }

  // 1. rasterize the art once (SVG → bitmap)
  const [art, artCtx] = make()
  artCtx.drawImage(img, pad, pad, width, height)

  // 2. white silhouette, dilated by `outline` (16 offset copies + source-in fill)
  const [sil, silCtx] = make()
  silCtx.setTransform(1, 0, 0, 1, 0, 0)
  const o = outline * dpr
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    silCtx.drawImage(art, Math.cos(a) * o, Math.sin(a) * o)
  }
  silCtx.globalCompositeOperation = 'source-in'
  silCtx.fillStyle = '#ffffff'
  silCtx.fillRect(0, 0, sil.width, sil.height)

  // 3. compose: shadowed silhouette, then the art on top
  const [out, ctx] = make()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)'
    ctx.shadowBlur = 10 * dpr
    ctx.shadowOffsetX = 4 * dpr
    ctx.shadowOffsetY = 8 * dpr
  }
  ctx.drawImage(sil, 0, 0)
  ctx.shadowColor = 'transparent'
  ctx.drawImage(art, 0, 0)

  return { canvas: out, w, h, pad }
}

/** Bake a React SVG element at a given CSS size. */
export function bakeElement(element, opts) {
  return bakeSticker(svgMarkup(element, opts.width, opts.height), opts)
}
