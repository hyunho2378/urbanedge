// draw.js: 인화 프레임용 캔버스 그리기 도구. 프레임 정의는 이 painter(p)만 호출한다.
import { UE_MARK_PATH } from '../logo/UEMark.jsx'
import { WORDMARK_PATH } from '../logo/wordmarkPath.js'
import { col } from './palette.js'

export const FONT_LABEL = '"Barlow Condensed", "Pretendard Variable", Pretendard, "Helvetica Neue", Arial, sans-serif'
export const FONT_UI = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Helvetica Neue", Arial, sans-serif'

const UE_PATH = typeof Path2D !== 'undefined' ? new Path2D(UE_MARK_PATH) : null
const WM_PATH = typeof Path2D !== 'undefined' ? new Path2D(WORDMARK_PATH) : null
const UE_W = 380
const UE_H = 280
const WM_X = 20
const WM_Y = 43
const WM_W = 1845
const WM_H = 356

export const UE_RATIO = UE_H / UE_W
export const WM_RATIO = WM_H / WM_W

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

const natural = (src) => ({
  w: src.naturalWidth || src.videoWidth || src.width || 1,
  h: src.naturalHeight || src.videoHeight || src.height || 1,
})

// 슬롯 비율에 맞게 원본을 자르는 영역. 3:4 원본이 3:4 슬롯에 들어가면 자르지 않는다.
export function coverRect(sw, sh, dw, dh, fx = 0.5, fy = 0.28) {
  const sr = sw / sh
  const dr = dw / dh
  let cw = sw
  let ch = sh
  if (sr > dr) cw = sh * dr
  else if (sr < dr) ch = sw / dr
  return [(sw - cw) * fx, (sh - ch) * fy, cw, ch]
}

// 절반씩 줄여 가며 축소해 앨리어싱 없이 선명하게 만든다.
function stepDown(src, rect, dwPx, dhPx) {
  let [sx, sy, sw, sh] = rect
  let cur = src
  while (sw > dwPx * 2 && sh > dhPx * 2) {
    const nw = Math.max(Math.round(sw / 2), Math.ceil(dwPx))
    const nh = Math.max(Math.round(sh / 2), Math.ceil(dhPx))
    const c = makeCanvas(nw, nh)
    const g = c.getContext('2d')
    g.imageSmoothingEnabled = true
    g.imageSmoothingQuality = 'high'
    g.drawImage(cur, sx, sy, sw, sh, 0, 0, nw, nh)
    cur = c
    sx = 0
    sy = 0
    sw = nw
    sh = nh
  }
  return [cur, sx, sy, sw, sh]
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

// 해시 기반 의사 난수(바코드 장식용). 같은 입력은 항상 같은 막대 배열이 된다.
function seeded(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 1000) / 1000
  }
}

// env: { ctx, W, H, px(캔버스 픽셀 배율), tone, photos[], date, station, stamp(station|null), message }
export function makePainter(env) {
  const { ctx } = env
  const p = { ...env }

  p.rect = (x, y, w, h, fill) => {
    ctx.fillStyle = fill
    ctx.fillRect(x, y, w, h)
  }
  p.rrect = (x, y, w, h, r, fill, stroke, lw = 2) => {
    roundRectPath(ctx, x, y, w, h, r)
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = lw
      ctx.stroke()
    }
  }
  p.circle = (cx, cy, r, fill, stroke, lw = 2) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = lw
      ctx.stroke()
    }
  }
  p.line = (x1, y1, x2, y2, stroke, lw = 2, dash) => {
    ctx.save()
    ctx.strokeStyle = stroke
    ctx.lineWidth = lw
    if (dash) ctx.setLineDash(dash)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.restore()
  }

  p.measure = (str, { size = 24, weight = 600, family = FONT_LABEL, tracking = 0 } = {}) => {
    ctx.save()
    ctx.font = `${weight} ${size}px ${family}`
    const w = tracking ? [...str].reduce((a, ch) => a + ctx.measureText(ch).width + tracking, -tracking) : ctx.measureText(str).width
    ctx.restore()
    return w
  }

  // 글자: 굵기 400 이상만 쓴다. maxW를 넘으면 글자 크기를 줄여 맞춘다.
  p.text = (str, x, y, o = {}) => {
    const { size = 24, weight = 600, fill = p.tone.ink, align = 'left', tracking = 0, family = FONT_LABEL, maxW, rotate = 0, upper = false, baseline = 'alphabetic', alpha = 1 } = o
    const s = upper ? String(str).toUpperCase() : String(str)
    let fs = size
    let w = p.measure(s, { size: fs, weight, family, tracking })
    if (maxW && w > maxW) {
      fs = (size * maxW) / w
      w = maxW
    }
    ctx.save()
    ctx.translate(x, y)
    if (rotate) ctx.rotate(rotate)
    ctx.globalAlpha = alpha
    ctx.font = `${Math.max(weight, 400)} ${fs}px ${family}`
    ctx.fillStyle = fill
    ctx.textBaseline = baseline
    ctx.textAlign = 'left'
    const ox = align === 'center' ? -w / 2 : align === 'right' ? -w : 0
    if (tracking) {
      let cx = ox
      for (const ch of s) {
        ctx.fillText(ch, cx, 0)
        cx += ctx.measureText(ch).width + tracking * (fs / size)
      }
    } else {
      ctx.fillText(s, ox, 0)
    }
    ctx.restore()
    return w
  }

  p.ue = (x, y, w, fill = p.tone.ink, o = {}) => {
    if (!UE_PATH) return
    ctx.save()
    ctx.translate(x, y)
    if (o.rotate) {
      ctx.translate(w / 2, (w * UE_RATIO) / 2)
      ctx.rotate(o.rotate)
      ctx.translate(-w / 2, -(w * UE_RATIO) / 2)
    }
    ctx.scale(w / UE_W, w / UE_W)
    ctx.fillStyle = fill
    ctx.fill(UE_PATH, 'evenodd')
    ctx.restore()
    return w * UE_RATIO
  }

  p.wordmark = (x, y, w, fill = p.tone.ink, o = {}) => {
    if (!WM_PATH) return
    ctx.save()
    ctx.translate(x, y)
    if (o.rotate) {
      ctx.translate(w / 2, (w * WM_RATIO) / 2)
      ctx.rotate(o.rotate)
      ctx.translate(-w / 2, -(w * WM_RATIO) / 2)
    }
    const s = w / WM_W
    ctx.scale(s, s)
    ctx.translate(-WM_X, -WM_Y)
    ctx.fillStyle = fill
    ctx.fill(WM_PATH, 'evenodd')
    ctx.restore()
    return w * WM_RATIO
  }

  // 이중 십자 ‡ (포스터의 구분 기호). 단위 64 좌표를 s로 맞춘다.
  p.cross = (cx, cy, s, fill = p.tone.ink) => {
    const k = s / 64
    ctx.fillStyle = fill
    ctx.fillRect(cx - 3 * k, cy - 22 * k, 6 * k, 44 * k)
    ctx.fillRect(cx - 13 * k, cy - 13 * k, 26 * k, 6 * k)
    ctx.fillRect(cx - 13 * k, cy + 7 * k, 26 * k, 6 * k)
  }

  p.checker = (x, y, w, h, s, c1, c2) => {
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    if (c1) p.rect(x, y, w, h, c1)
    ctx.fillStyle = c2
    for (let j = 0; j * s < h; j++) for (let i = 0; i * s < w; i++) if ((i + j) % 2 === 0) ctx.fillRect(x + i * s, y + j * s, s, s)
    ctx.restore()
  }

  // 경고 테이프 사선 띠. 대각 45도.
  p.hazard = (x, y, w, h, o = {}) => {
    const { stripe = h * 0.7, a = col.yellow(), b = col.ink() } = o
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    p.rect(x, y, w, h, a)
    ctx.fillStyle = b
    for (let i = -h; i < w + h; i += stripe * 2) {
      ctx.beginPath()
      ctx.moveTo(x + i, y + h)
      ctx.lineTo(x + i + stripe, y + h)
      ctx.lineTo(x + i + stripe + h, y)
      ctx.lineTo(x + i + h, y)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

  // 글자가 인쇄된 노랑 테이프(실제 현장 테이프 느낌). rotate는 중심 기준 회전.
  p.tape = (x, y, w, h, o = {}) => {
    const { text = 'URBANEDGE', bg = col.yellow(), fg = col.ink(), rotate = 0, size = h * 0.5, shadow = false, gap = 36 } = o
    ctx.save()
    ctx.translate(x + w / 2, y + h / 2)
    if (rotate) ctx.rotate(rotate)
    ctx.translate(-w / 2, -h / 2)
    if (shadow) {
      ctx.shadowColor = col.ink(0.35)
      ctx.shadowBlur = 18
      ctx.shadowOffsetY = 6
    }
    p.rect(0, 0, w, h, bg)
    ctx.shadowColor = 'transparent'
    ctx.beginPath()
    ctx.rect(0, 0, w, h)
    ctx.clip()
    p.rect(0, h * 0.12, w, 2, fg)
    p.rect(0, h * 0.88 - 2, w, 2, fg)
    const unit = p.measure(text, { size, weight: 700, tracking: size * 0.08 }) + gap * 2 + size * 0.5
    let cx = 10
    while (cx < w + unit) {
      p.text(text, cx, h / 2 + size * 0.34, { size, weight: 700, fill: fg, tracking: size * 0.08 })
      p.cross(cx + unit - gap - size * 0.25, h / 2, size * 0.8, fg)
      cx += unit
    }
    ctx.restore()
  }

  p.bars = (x, y, w, h, o = {}) => {
    const { bar = 40, gap = 30, fill = p.tone.ink, slant = 0 } = o
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    ctx.fillStyle = fill
    for (let i = -Math.abs(slant); i < w + Math.abs(slant); i += bar + gap) {
      ctx.beginPath()
      ctx.moveTo(x + i, y + h)
      ctx.lineTo(x + i + bar, y + h)
      ctx.lineTo(x + i + bar + slant, y)
      ctx.lineTo(x + i + slant, y)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

  // 사진 한 컷. 테두리 없이 슬롯을 채운다. 원본이 슬롯 비율과 같으면 자르지 않는다.
  p.photo = (i, x, y, w, h, o = {}) => {
    const { r = 0, rotate = 0, shadow = false, fx = 0.5, fy = 0.28, fit = 'cover' } = o
    const src = p.photos.length ? p.photos[i % p.photos.length] : null
    ctx.save()
    if (rotate) {
      ctx.translate(x + w / 2, y + h / 2)
      ctx.rotate(rotate)
      ctx.translate(-w / 2, -h / 2)
    } else {
      ctx.translate(x, y)
    }
    if (shadow) {
      ctx.shadowColor = col.ink(0.45)
      ctx.shadowBlur = 28
      ctx.shadowOffsetY = 10
      roundRectPath(ctx, 0, 0, w, h, r)
      ctx.fillStyle = p.tone.photoBg
      ctx.fill()
      ctx.shadowColor = 'transparent'
    }
    roundRectPath(ctx, 0, 0, w, h, r)
    ctx.clip()
    if (!src) {
      p.rect(0, 0, w, h, p.tone.photoBg)
      p.bars(0, 0, w, h, { bar: 8, gap: 36, fill: p.tone.line, slant: h })
      p.text(String(i + 1), w / 2, h / 2 + 24, { size: 72, weight: 700, fill: p.tone.sub, align: 'center' })
    } else {
      const n = natural(src)
      const rect = coverRect(n.w, n.h, w, h, fx, fy)
      const k = p.px * (p.k || 1)
      const [img, sx, sy, sw, sh] = stepDown(src, rect, w * k, h * k)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
    }
    ctx.restore()
  }

  // 날짜와 정거장 한 줄. 날짜는 작게. 구분은 이중 십자.
  p.meta = (x, y, o = {}) => {
    const { size = 24, fill = p.tone.sub, align = 'left', parts, weight = 600, tracking = 2.2 } = o
    const items = parts || [p.date, `${p.station.code} ${p.station.name}`, p.station.platformText]
    const sep = size * 1.1
    const widths = items.map((t) => p.measure(t, { size, weight, tracking }))
    const total = widths.reduce((a, b) => a + b, 0) + sep * (items.length - 1)
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
    items.forEach((t, i) => {
      p.text(t, cx, y, { size, weight, fill, tracking })
      cx += widths[i]
      if (i < items.length - 1) {
        p.cross(cx + sep / 2, y - size * 0.33, size * 0.62, fill)
        cx += sep
      }
    })
    return total
  }

  // 정거장 원형 배지(서울 지하철 노선 원 방식). 원 안에 코드.
  p.lineCircle = (cx, cy, r, o = {}) => {
    const { bg = col.yellow(), fg = col.ink(), code = p.station.code, ring } = o
    p.circle(cx, cy, r, bg, ring, r * 0.12)
    p.text(code, cx, cy + r * 0.3, { size: r * 0.92, weight: 700, fill: fg, align: 'center', maxW: r * 1.6 })
  }

  // 정거장 알약: [원형 코드] 정거장 이름. align 'right'이면 x가 오른쪽 끝. 폭을 돌려준다.
  p.stationPill = (x0, y, h, o = {}) => {
    const { bg = col.yellow(), fg = col.ink(), circleBg = col.ink(), circleFg = col.yellow(), name = p.station.shot, code = p.station.code, size = h * 0.5, align = 'left' } = o
    const nameW = p.measure(name, { size, weight: 700, tracking: size * 0.06 })
    const w = h + nameW + h * 0.45
    const x = align === 'right' ? x0 - w : x0
    p.rrect(x, y, w, h, h / 2, bg)
    p.lineCircle(x + h / 2, y + h / 2, h * 0.43, { bg: circleBg, fg: circleFg, code })
    p.text(name, x + h + h * 0.05, y + h / 2 + size * 0.34, { size, weight: 700, fill: fg, tracking: size * 0.06 })
    return w
  }

  p.barcode = (x, y, w, h, fill = p.tone.ink, seedStr = `${p.date}${p.station.code}`) => {
    const rnd = seeded(seedStr)
    let cx = x
    ctx.fillStyle = fill
    while (cx < x + w) {
      const bw = 2 + Math.floor(rnd() * 5)
      if (cx + bw > x + w) break
      ctx.fillRect(cx, y, bw, h)
      cx += bw + 2 + Math.floor(rnd() * 4)
    }
  }

  p.perforation = (x1, x2, y, o = {}) => {
    const { stroke = p.tone.line, notch = 22, notchFill = p.tone.bg } = o
    p.line(x1, y, x2, y, stroke, 3, [10, 10])
    if (notch) {
      p.circle(x1, y, notch, notchFill, stroke, 3)
      p.circle(x2, y, notch, notchFill, stroke, 3)
    }
  }

  // 원호를 따라 글자를 쓴다(스탬프용)
  p.arcText = (str, cx, cy, r, mid, o = {}) => {
    const { size = 20, weight = 700, fill = p.tone.ink, tracking = 3, family = FONT_LABEL } = o
    const chars = [...str]
    ctx.save()
    ctx.font = `${weight} ${size}px ${family}`
    ctx.fillStyle = fill
    const adv = chars.map((c) => ctx.measureText(c).width + tracking)
    const total = adv.reduce((a, b) => a + b, 0)
    let a = mid - total / 2 / r
    chars.forEach((c, i) => {
      const th = a + adv[i] / 2 / r
      ctx.save()
      ctx.translate(cx + Math.cos(th) * r, cy + Math.sin(th) * r)
      ctx.rotate(th + Math.PI / 2)
      ctx.fillText(c, -adv[i] / 2 + tracking / 2, 0)
      ctx.restore()
      a += adv[i] / r
    })
    ctx.restore()
  }

  // 고객이 고른 정거장 스탬프. 선택하지 않으면 아무것도 그리지 않는다.
  p.stampMark = (cx, cy, r, o = {}) => {
    if (!p.stamp) return
    const { fill = col.yellow(), rotate = -0.2, shadow = true } = o
    const st = p.stamp
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotate)
    ctx.globalAlpha = 0.95
    if (shadow) {
      ctx.shadowColor = col.ink(0.7)
      ctx.shadowBlur = r * 0.12
      ctx.shadowOffsetY = r * 0.03
    }
    p.circle(0, 0, r, null, fill, r * 0.07)
    p.circle(0, 0, r * 0.82, null, fill, r * 0.025)
    p.text(st.pCode, 0, r * 0.2, { size: r * 0.72, weight: 700, fill, align: 'center', maxW: r * 1.3 })
    p.arcText(st.shot, 0, 0, r * 0.6, -Math.PI / 2, { size: r * 0.17, fill, tracking: r * 0.02 })
    p.arcText(`${st.code} ${st.name}`, 0, 0, r * 0.66, Math.PI / 2, { size: r * 0.15, fill, tracking: r * 0.02 })
    ctx.restore()
  }

  // 한 줄 메시지(고객 입력). 길면 글자 크기를 줄인다.
  p.messageLine = (x, y, maxW, o = {}) => {
    if (!p.message) return
    const { size = 30, fill = p.tone.ink, align = 'center', weight = 600 } = o
    const msg = String(p.message).replace(/\s+/g, ' ').trim().slice(0, 40)
    if (msg) p.text(msg, x, y, { size, weight, fill, align, maxW, family: FONT_UI })
  }

  p.clipRect = (x, y, w, h) => {
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
  }

  return p
}
