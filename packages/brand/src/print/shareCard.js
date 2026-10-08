// shareCard.js: 인화물을 인스타그램 스토리(1080x1920)와 피드(1080x1350) 카드로 만든다.
import { TONES, col } from './palette.js'
import { makePainter, FONT_UI } from './draw.js'
import { getStation, formatShotDate, STATIONS, METRO_STOPS, SYSTEM } from './stations.js'
import { loadImage, ensureFrameFonts, canvasToBlob } from './compose.js'

export const SHARE_FORMATS = {
  story: { w: 1080, h: 1920 },
  feed: { w: 1080, h: 1350 },
  journey: { w: 1080, h: 1920 }, // Journey Complete: 메트로 패스 모양의 여정 완료 카드
}

async function toSource(strip) {
  if (strip && typeof strip.then === 'function') strip = await strip
  return loadImage(strip)
}

function drawSheet(ctx, src, x, y, w, rotate, shadowA = 0.55) {
  const h = (w * (src.height || src.naturalHeight)) / (src.width || src.naturalWidth)
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(rotate)
  ctx.shadowColor = col.ink(shadowA)
  ctx.shadowBlur = 48
  ctx.shadowOffsetY = 22
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, -w / 2, -h / 2, w, h)
  ctx.restore()
  return h
}

// makeShareCard({ strip, format, roomId, date, headline, handle, visited, platforms, type, quality }) => Promise<Blob>
//  strip: composeStrip 결과 canvas(권장, mode 'sheet'), 이미지, URL, Blob
//  format: 'story' | 'feed' | 'journey'. roomId와 date를 주면 승강장 알약과 날짜를 카드에 찍는다.
//  journey: Journey Complete 카드. visited(방문한 역 id 배열, 기본 ['gy-01'])와 platforms(찍은 승강장 번호 배열, 기본 [roomId의 승강장])를 메트로 패스 모양으로 그린다.
//           strip은 선택(있으면 오른쪽 아래에 승차권으로 얹는다). 후보 역은 Concept stop으로만 흐리게 그린다.
export async function makeShareCard({ strip, format = 'story', roomId, date, headline, handle = '@__urbanedge', visited, platforms, type = 'image/jpeg', quality = 0.92 } = {}) {
  const dim = SHARE_FORMATS[format] || SHARE_FORMATS.story
  await ensureFrameFonts()
  const src = strip ? await toSource(strip) : null
  const canvas = document.createElement('canvas')
  canvas.width = dim.w
  canvas.height = dim.h
  const ctx = canvas.getContext('2d')
  const story = format !== 'feed'
  const tone = story ? TONES.black : TONES.yellow
  const station = getStation(roomId)
  const p = makePainter({ ctx, W: dim.w, H: dim.h, px: 1, tone, photos: [], date: formatShotDate(date), station, stamp: null, message: '' })
  p.rect(0, 0, dim.w, dim.h, tone.bg)

  if (format === 'journey') {
    drawJourney(p, ctx, dim, src, { visited: visited || ['gy-01'], platforms: platforms || [p.station.platform], handle })
  } else if (story) {
    p.bars(0, 0, dim.w, dim.h, { bar: 90, gap: 150, fill: col.white(0.045), slant: -520 })
    p.tape(-60, 92, dim.w + 120, 92, { text: 'EVERY SHOT IS A JOURNEY', rotate: -0.04, size: 50 })
    if (src) drawSheet(ctx, src, 160, 296, 760, -0.032)
    p.tape(520, 1366, 700, 78, { text: 'MIND THE LENS', rotate: -0.3, size: 44, shadow: true })
    p.stationPill(160, 1486, 74)
    if (date != null || roomId) p.text(p.date, dim.w - 160, 1535, { size: 28, weight: 600, fill: tone.sub, align: 'right', tracking: 3 })
    const hl = headline || ['Explore Gyeongju,', 'one station at a time.']
    const lines = Array.isArray(hl) ? hl : [hl]
    lines.forEach((t, i) => p.text(t, 160, 1636 + i * 66, { size: 58, weight: 700, fill: tone.ink, family: FONT_UI, tracking: -1 }))
    p.wordmark(160, 1790, 320, tone.ink)
    p.text(handle, dim.w - 160, 1838, { size: 36, weight: 600, fill: tone.accent, align: 'right', tracking: 1.5 })
    p.text('IMAGINARY METRO · TRAVEL EXPERIENCE', 160, 1740, { size: 22, weight: 600, fill: tone.sub, tracking: 3 })
  } else {
    p.bars(0, 0, dim.w, dim.h, { bar: 70, gap: 130, fill: col.ink(0.05), slant: -400 })
    if (src) drawSheet(ctx, src, 70, 96, 650, -0.045)
    p.text(p.station.pCode, 986, 1060, { size: 280, weight: 700, fill: tone.ink, rotate: -Math.PI / 2, tracking: -6 })
    p.text(p.station.shot, 900, 1060, { size: 78, weight: 700, fill: tone.ink, rotate: -Math.PI / 2, tracking: 3, maxW: 780 })
    p.tape(300, 1010, 900, 80, { text: 'MIND THE LENS', rotate: -0.18, size: 44, bg: col.ink(), fg: col.yellow(), shadow: true })
    p.rect(0, 1176, dim.w, 174, col.ink())
    p.wordmark(70, 1222, 360, col.yellow())
    p.text(headline && !Array.isArray(headline) ? headline : 'Explore Gyeongju, one station at a time.', 70, 1316, { size: 26, weight: 600, fill: col.white(), family: FONT_UI, maxW: 700 })
    p.text(handle, dim.w - 70, 1262, { size: 34, weight: 600, fill: col.yellow(), align: 'right', tracking: 1.5 })
    p.text(p.date, dim.w - 70, 1318, { size: 24, weight: 600, fill: col.white(0.7), align: 'right', tracking: 3 })
  }
  return canvasToBlob(canvas, type, quality)
}

// 체크 표시(방문한 역)
function check(ctx, cx, cy, r, fill) {
  ctx.save()
  ctx.strokeStyle = fill
  ctx.lineWidth = r * 0.28
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.42, cy + r * 0.02)
  ctx.lineTo(cx - r * 0.1, cy + r * 0.34)
  ctx.lineTo(cx + r * 0.46, cy - r * 0.32)
  ctx.stroke()
  ctx.restore()
}

// Journey Complete: 검정 배경 위에 메트로 패스. 방문한 역은 노랑으로 채우고 후보 역은 점선 윤곽과 Concept stop으로 흐리게 둔다.
function drawJourney(p, ctx, dim, src, { visited, platforms, handle }) {
  const { tone } = p
  const W = dim.w
  p.bars(0, 0, W, dim.h, { bar: 90, gap: 150, fill: col.white(0.045), slant: -520 })
  p.tape(-60, 88, W + 120, 88, { text: 'GYEONGJU METRO', rotate: -0.03, size: 48 })
  // 제목
  p.text('JOURNEY', 100, 470, { size: 250, weight: 700, fill: tone.accent, tracking: -4, maxW: W - 200 })
  p.text('COMPLETE', 100, 690, { size: 250, weight: 700, fill: tone.ink, tracking: -4, maxW: W - 200 })
  p.text(SYSTEM.tagline.en, 104, 770, { size: 40, weight: 600, fill: tone.sub, family: FONT_UI, tracking: -0.5 })

  // 메트로 패스 카드
  const x = 100
  const y = 836
  const w = W - 200
  const h = 800
  ctx.save()
  ctx.shadowColor = col.ink(0.6)
  ctx.shadowBlur = 50
  ctx.shadowOffsetY = 22
  p.rrect(x, y, w, h, 40, col.ink(1))
  ctx.restore()
  p.rrect(x, y, w, h, 40, col.white(0.07))
  ctx.save()
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(x, y, w, h, 40) : ctx.rect(x, y, w, h)
  ctx.clip()
  p.rect(x, y, w, 124, col.yellow())
  ctx.restore()
  p.ue(x + 40, y + 28, 100, col.ink())
  p.text('METRO PASS', x + 170, y + 88, { size: 74, weight: 700, fill: col.ink(), tracking: 3 })
  p.lineCircle(x + w - 80, y + 62, 40, { bg: col.ink(), fg: col.yellow(), code: 'GY' })

  // 노선: 정거장 4개(실제 1, 후보 3)
  const lx = x + 86
  const y0 = y + 210
  const gap = 108
  p.rect(lx - 6, y0, 12, gap * (METRO_STOPS.length - 1), col.white(0.28))
  const doneCount = METRO_STOPS.filter((s) => visited.includes(s.id)).length
  if (doneCount > 1) p.rect(lx - 6, y0, 12, gap * (doneCount - 1), col.yellow())
  METRO_STOPS.forEach((st, i) => {
    const cy = y0 + i * gap
    const done = visited.includes(st.id)
    const concept = st.status === 'concept'
    if (done) {
      p.circle(lx, cy, 34, col.yellow())
      check(ctx, lx, cy, 34, col.ink())
    } else {
      ctx.save()
      ctx.setLineDash([8, 8])
      p.circle(lx, cy, 32, col.ink(1), col.white(0.5), 5)
      ctx.restore()
    }
    const cw = p.text(st.code, lx + 80, cy - 8, { size: 32, weight: 600, fill: done ? tone.accent : tone.sub, tracking: 3 })
    if (concept) p.text('CONCEPT STOP', lx + 80 + cw + 22, cy - 8, { size: 24, weight: 600, fill: col.white(0.45), tracking: 3 })
    p.text(st.name.en, lx + 80, cy + 40, { size: 50, weight: 700, fill: done ? tone.ink : col.white(0.5), family: FONT_UI, tracking: -1 })
  })
  // 승강장 스탬프 4개
  const py = y + h - 110
  p.text('PLATFORMS', x + 60, py - 40, { size: 26, weight: 600, fill: tone.sub, tracking: 4 })
  STATIONS.forEach((s, i) => {
    const cx = x + 90 + i * 112
    const got = platforms.includes(s.platform)
    if (got) p.circle(cx, py + 18, 42, col.line[s.color]())
    else {
      ctx.save()
      ctx.setLineDash([7, 7])
      p.circle(cx, py + 18, 40, null, col.white(0.4), 4)
      ctx.restore()
    }
    p.text(s.pCode, cx, py + 32, { size: 40, weight: 700, fill: got ? col.ink() : col.white(0.45), align: 'center' })
  })
  p.text(p.date, x + w - 60, py + 32, { size: 36, weight: 600, fill: tone.ink, align: 'right', tracking: 3 })
  p.text('VISIT DATE', x + w - 60, py - 18, { size: 22, weight: 600, fill: tone.sub, align: 'right', tracking: 4 })

  // 선택: 인화물을 승차권처럼 얹는다
  if (src) {
    const sw = 230
    const sh = (sw * (src.height || src.naturalHeight)) / (src.width || src.naturalWidth)
    ctx.save()
    ctx.translate(x + w - 150, y + 400)
    ctx.rotate(0.1)
    ctx.shadowColor = col.ink(0.55)
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 12
    ctx.drawImage(src, -sw / 2, -sh / 2, sw, sh)
    ctx.restore()
  }
  p.text('IMAGINARY METRO · TRAVEL EXPERIENCE', 100, 1690, { size: 28, weight: 600, fill: tone.sub, tracking: 3 })
  p.wordmark(100, 1750, 340, tone.ink)
  p.text(handle, W - 100, 1800, { size: 38, weight: 600, fill: tone.accent, align: 'right', tracking: 1.5 })
}
