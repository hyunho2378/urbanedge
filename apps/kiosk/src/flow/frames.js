import { palette } from '@urbanedge/ds'

// frames.js: 프레임 정의와 canvas 합성. 모든 좌표는 프레임 설계 단위(px)이고, 그릴 때 scale로 줄인다.
// 프레임은 사진 칸 4개를 가진다. 4컷은 4장 전부, 8컷은 8장 중 고른 4장이 들어간다.
// 색은 디자인시스템 palette 채널값에서 만든다.

export const rgb = (name, a) => (a == null ? `rgb(${palette[name]})` : `rgb(${palette[name]} / ${a})`)

const LINE_NAME = { yellow: 'line-yellow', red: 'line-red', blue: 'line-blue', green: 'line-green' }
// 노선 배지와 같은 글자색 규칙(LineBadge)
const LINE_TEXT = { yellow: 'text-on-yellow', red: 'text-pri', blue: 'text-pri', green: 'text-on-yellow' }

const FONT_BRAND = "700 {n}px Poppins, 'Pretendard Variable', Pretendard, sans-serif"
const FONT_LABEL = "600 {n}px 'Barlow Condensed', 'Pretendard Variable', Pretendard, sans-serif"
const FONT_TEXT = "700 {n}px 'Pretendard Variable', Pretendard, -apple-system, sans-serif"
const font = (tpl, n) => tpl.replace('{n}', String(Math.round(n)))

// ---------- 프레임 정의 ----------

function make(id, family, variant, cuts, tone, pattern, w, h, brandH, areaFn) {
  const m = 44
  const band = 28
  const bandY = h - m - band
  const brand = { x: m, y: bandY - 16 - brandH, w: w - 2 * m, h: brandH }
  const area = { x: m, y: m, w: w - 2 * m, h: brand.y - 24 - m }
  return { id, family, variant, cuts, tone, pattern, w, h, brand, band: { x: m, y: bandY, w: w - 2 * m, h: band }, slots: areaFn(area) }
}

const grid = (cols, rows, gap) => (a) => {
  const cw = (a.w - gap * (cols - 1)) / cols
  const ch = (a.h - gap * (rows - 1)) / rows
  const out = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: a.x + c * (cw + gap), y: a.y + r * (ch + gap), w: cw, h: ch })
  return out
}

// 큰 사진 하나 위, 작은 사진 셋 아래
const heroTop = (gap) => (a) => {
  const hh = Math.round(a.h * 0.56)
  const sw = (a.w - gap * 2) / 3
  const sh = a.h - hh - gap
  return [
    { x: a.x, y: a.y, w: a.w, h: hh },
    ...[0, 1, 2].map((i) => ({ x: a.x + i * (sw + gap), y: a.y + hh + gap, w: sw, h: sh })),
  ]
}

// 큰 사진 왼쪽, 작은 사진 셋 오른쪽 세로 배열
const heroSide = (gap) => (a) => {
  const hw = Math.round(a.w * 0.56)
  const rw = a.w - hw - gap
  const sh = (a.h - gap * 2) / 3
  return [
    { x: a.x, y: a.y, w: hw, h: a.h },
    ...[0, 1, 2].map((i) => ({ x: a.x + hw + gap, y: a.y + i * (sh + gap), w: rw, h: sh })),
  ]
}

export const FRAMES = [
  make('sig-strip', 'signature', 'strip', [4, 8], 'black', 'crosswalk', 600, 1800, 290, grid(1, 4, 20)),
  make('sig-grid', 'signature', 'grid', [4, 8], 'white', 'ribbon', 1200, 1600, 250, grid(2, 2, 24)),
  make('layer-hero', 'layer', 'hero', [4, 8], 'yellow', 'checker', 1200, 1800, 260, heroTop(24)),
  make('layer-side', 'layer', 'side', [8], 'black', 'checker', 1200, 1500, 230, heroSide(24)),
]

export const frameById = (id) => FRAMES.find((f) => f.id === id) || null
export const framesFor = (cuts) => FRAMES.filter((f) => f.cuts.includes(cuts || 4))
export const defaultFrameFor = (cuts) => framesFor(cuts)[0]

// ---------- 그리기 도구 ----------

const TONES = {
  black: { bg: 'bg-base', fg: 'text-pri', sub: 'text-meta', slot: 'bg-raised', ink: 'yellow' },
  white: { bg: 'white', fg: 'bg-base', sub: 'bg-raised', slot: 'text-sec', ink: 'bg-base' },
  yellow: { bg: 'yellow', fg: 'bg-base', sub: 'bg-raised', slot: 'yellow-pressed', ink: 'bg-base' },
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const srcSize = (s) => [s.naturalWidth || s.videoWidth || s.width || 0, s.naturalHeight || s.videoHeight || s.height || 0]

// 원본을 칸에 가득 채워 그린다(cover). fx, fy는 잘라낼 때의 초점 비율.
export function drawCover(ctx, src, x, y, w, h, fx = 0.5, fy = 0.5) {
  const [sw, sh] = srcSize(src)
  if (!sw || !sh) return
  const k = Math.max(w / sw, h / sh)
  const cw = w / k
  const ch = h / k
  const sx = (sw - cw) * fx
  const sy = (sh - ch) * fy
  ctx.drawImage(src, sx, sy, cw, ch, x, y, w, h)
}

function setSpacing(ctx, px) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`
}

// 방 스탬프: 노선 색 이중 링과 노선 코드
export function drawStamp(ctx, cx, cy, r, room, tone, rot = 0) {
  const t = TONES[tone] || TONES.black
  let ink = rgb(LINE_NAME[room.color])
  if (tone !== 'black' && room.color === 'yellow') ink = rgb(t.fg)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rot * Math.PI) / 180)
  ctx.strokeStyle = ink
  ctx.fillStyle = ink
  ctx.lineWidth = Math.max(2, r * 0.1)
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = Math.max(1, r * 0.04)
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2)
  ctx.stroke()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = font(FONT_BRAND, r * 0.62)
  ctx.fillText(room.code, 0, -r * 0.12)
  const ns = fitText(ctx, room.name, FONT_LABEL, r * 0.28, r * 1.3)
  ctx.font = font(FONT_LABEL, ns)
  ctx.fillText(room.name, 0, r * 0.42)
  ctx.restore()
}

function drawBand(ctx, f, tone) {
  const { x, y, w, h } = f.band
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  if (f.pattern === 'crosswalk') {
    ctx.fillStyle = rgb('text-pri')
    for (let bx = x; bx < x + w; bx += 44) ctx.fillRect(bx, y, 24, h)
  } else if (f.pattern === 'ribbon') {
    const cols = ['line-yellow', 'line-red', 'line-blue', 'line-green']
    cols.forEach((c, i) => {
      ctx.fillStyle = rgb(c)
      ctx.fillRect(x + (w / 4) * i, y, w / 4 + 1, h)
    })
  } else {
    const s = h / 2
    ctx.fillStyle = rgb(tone === 'yellow' ? 'bg-base' : 'text-pri')
    for (let r = 0; r < 2; r++) for (let bx = 0; bx * s < w; bx++) if ((bx + r) % 2 === 0) ctx.fillRect(x + bx * s, y + r * s, s, s)
  }
  ctx.restore()
}

function fitText(ctx, text, tplFont, size, maxW) {
  let s = size
  const min = Math.max(6, size * 0.4)
  ctx.font = font(tplFont, s)
  while (ctx.measureText(text).width > maxW && s > min) {
    s -= 2
    ctx.font = font(tplFont, s)
  }
  return s
}

function drawBrand(ctx, f, o) {
  const t = TONES[f.tone]
  const { x, y, w, h } = f.brand
  const room = o.room
  const fg = rgb(t.fg)
  ctx.textBaseline = 'alphabetic'
  // 1행: 워드마크와 노선 배지
  const fs = Math.min(h * 0.22, w * 0.085)
  ctx.fillStyle = fg
  ctx.textAlign = 'left'
  ctx.font = font(FONT_BRAND, fs)
  ctx.fillText('UrbanEdge', x, y + fs)
  ctx.font = font(FONT_LABEL, fs * 0.4)
  ctx.fillStyle = rgb(t.sub)
  setSpacing(ctx, fs * 0.12)
  ctx.fillText('METROGRAPHY', x + 2, y + fs + fs * 0.48)
  setSpacing(ctx, 0)
  const bd = fs * 1.15
  const bx = x + w - bd / 2
  const by = y + bd / 2
  ctx.beginPath()
  ctx.arc(bx, by, bd / 2, 0, Math.PI * 2)
  ctx.fillStyle = rgb(LINE_NAME[room.color])
  ctx.fill()
  if (f.tone !== 'black') {
    ctx.lineWidth = Math.max(2, bd * 0.06)
    ctx.strokeStyle = rgb(t.fg)
    ctx.stroke()
  }
  ctx.fillStyle = rgb(LINE_TEXT[room.color])
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = font(FONT_LABEL, bd * 0.5)
  ctx.fillText(room.code, bx, by + bd * 0.03)
  // 2행: 한 줄 메시지 또는 슬로건
  const my = y + h * 0.58
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const msg = (o.message || '').trim()
  if (msg) {
    const s = fitText(ctx, msg, FONT_TEXT, h * 0.17, w - 8)
    ctx.font = font(FONT_TEXT, s)
    ctx.fillStyle = fg
    ctx.fillText(msg, x + w / 2, my)
  } else {
    const s = Math.min(h * 0.1, w * 0.04)
    ctx.font = font(FONT_LABEL, s)
    setSpacing(ctx, s * 0.22)
    ctx.fillStyle = rgb(t.sub)
    ctx.fillText('EVERY SHOT IS A JOURNEY!', x + w / 2, my)
    setSpacing(ctx, 0)
  }
  // 3행: 스탬프
  const stamps = o.stamps || []
  if (stamps.length) {
    const sy = y + h * 0.86
    const r = Math.min(h * 0.15, w / (stamps.length * 2 + 1.2))
    const gap = r * 2.5
    const x0 = x + w / 2 - (gap * (stamps.length - 1)) / 2
    const rots = [-8, 5, -4, 7, -6]
    stamps.forEach((room2, i) => drawStamp(ctx, x0 + gap * i, sy, r, room2, f.tone, rots[i % rots.length]))
  }
}

// 프레임 전체를 그린다. photos[i]는 { src, fx, fy } 또는 그릴 수 있는 원본이다.
export function drawFrame(ctx, f, o = {}) {
  const t = TONES[f.tone]
  ctx.save()
  ctx.fillStyle = rgb(t.bg)
  ctx.fillRect(0, 0, f.w, f.h)
  f.slots.forEach((s, i) => {
    ctx.save()
    roundRect(ctx, s.x, s.y, s.w, s.h, 8)
    ctx.clip()
    ctx.fillStyle = rgb(t.slot)
    ctx.fillRect(s.x, s.y, s.w, s.h)
    const p = o.photos && o.photos[i]
    if (p) {
      const src = p.src || p
      drawCover(ctx, src, s.x, s.y, s.w, s.h, p.fx ?? 0.5, p.fy ?? 0.5)
    } else {
      ctx.fillStyle = rgb(f.tone === 'black' ? 'text-pri' : 'bg-base', 0.5)
      ctx.font = font(FONT_LABEL, Math.min(s.w, s.h) * 0.4)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(i + 1), s.x + s.w / 2, s.y + s.h / 2)
    }
    ctx.restore()
  })
  drawBrand(ctx, f, { room: o.room, stamps: o.stamps, message: o.message })
  drawBand(ctx, f, f.tone)
  ctx.restore()
}

// 인화용 최종 이미지를 만든다. 반환값은 canvas.
export function renderPrint(f, o = {}) {
  const c = document.createElement('canvas')
  c.width = f.w
  c.height = f.h
  drawFrame(c.getContext('2d'), f, o)
  return c
}

// 글꼴이 준비된 뒤 합성하도록 기다린다(실패해도 진행).
export async function ensureFonts() {
  if (!document.fonts || !document.fonts.load) return
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load("700 48px Poppins"),
        document.fonts.load("600 32px 'Barlow Condensed'"),
        document.fonts.load("700 32px 'Pretendard Variable'"),
      ]),
      new Promise((res) => setTimeout(res, 2500)),
    ])
  } catch {
    // 글꼴이 없어도 대체 글꼴로 그린다
  }
}
