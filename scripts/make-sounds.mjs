// Synthesize the four UI sounds as WAV, then encode with ffmpeg:
//   node scripts/make-sounds.mjs   → public/sounds/{pop,drop,add,win}.{webm,mp3}
// Each file is a few KB (limit 30 KB). Replace them with your own sounds any time —
// keep the same names.
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const RATE = 44100
const OUT = 'public/sounds'
mkdirSync(OUT, { recursive: true })

const env = (t, attack, decay) => (t < attack ? t / attack : Math.exp(-(t - attack) / decay))
const tri = (phase) => 2 * Math.abs(2 * (phase - Math.floor(phase + 0.5))) - 1
let seed = 7
const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1

function render(seconds, fn) {
  const n = Math.floor(seconds * RATE)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) out[i] = fn(i / RATE)
  return out
}

// phase-accurate frequency sweep helper
function sweep(seconds, f0, f1, shape, envFn) {
  let phase = 0
  return render(seconds, (t) => {
    const f = f0 + (f1 - f0) * (t / seconds)
    phase += f / RATE
    return shape(phase) * envFn(t)
  })
}

const SOUNDS = {
  // bubbly pop: fast upward sine chirp
  pop: () => sweep(0.11, 520, 1500, (p) => Math.sin(2 * Math.PI * p), (t) => env(t, 0.004, 0.035) * 0.9),
  // soft thud: falling low sine + a tiny noise tick
  drop: () => {
    const body = sweep(0.22, 190, 55, (p) => Math.sin(2 * Math.PI * p), (t) => env(t, 0.003, 0.06))
    return body.map((v, i) => v * 0.95 + noise() * env(i / RATE, 0.001, 0.008) * 0.25)
  },
  // cheerful two-note "ding-ding" for add to cart
  add: () => {
    const a = sweep(0.09, 880, 880, tri, (t) => env(t, 0.004, 0.05))
    const b = sweep(0.22, 1318.5, 1318.5, tri, (t) => env(t, 0.004, 0.09))
    const out = new Float32Array(Math.floor(0.3 * RATE))
    a.forEach((v, i) => (out[i] += v * 0.55))
    b.forEach((v, i) => (out[i + Math.floor(0.075 * RATE)] += v * 0.55))
    return out
  },
  // win: C major arpeggio + sparkle
  win: () => {
    const notes = [1046.5, 1318.5, 1568, 2093]
    const out = new Float32Array(Math.floor(0.95 * RATE))
    notes.forEach((f, k) => {
      const len = k === notes.length - 1 ? 0.55 : 0.16
      const tone = sweep(len, f, f, tri, (t) => env(t, 0.004, k === notes.length - 1 ? 0.18 : 0.07))
      const start = Math.floor(k * 0.095 * RATE)
      tone.forEach((v, i) => (out[start + i] += v * 0.4))
    })
    return out
  },
}

function wav(samples) {
  const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1
  const buf = Buffer.alloc(44 + samples.length * 2)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + samples.length * 2, 4)
  buf.write('WAVEfmt ', 8)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(RATE, 24)
  buf.writeUInt32LE(RATE * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(samples.length * 2, 40)
  samples.forEach((v, i) => buf.writeInt16LE(Math.round((v / peak) * 0.89 * 32767), 44 + i * 2))
  return buf
}

for (const [name, make] of Object.entries(SOUNDS)) {
  const tmp = path.join(OUT, `${name}.wav`)
  writeFileSync(tmp, wav(make()))
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-c:a', 'libopus', '-b:a', '40k', path.join(OUT, `${name}.webm`)])
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '64k', path.join(OUT, `${name}.mp3`)])
  rmSync(tmp)
  console.log(`✓ ${name}`)
}
