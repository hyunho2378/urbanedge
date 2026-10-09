// textures.js: 캔버스로 그리는 프로시저럴 텍스처. 외부 이미지 없이 타일, 체커, 점자 블록, 역명판을 만든다.
import { CanvasTexture, DataTexture, LinearFilter, RedFormat, RepeatWrapping, SRGBColorSpace, UnsignedByteType } from 'three'
import { css, LINE, STATION } from './palette.js'

// UE 블록 심볼 경로(packages/brand의 UE_MARK_PATH와 같은 값, 380x280)
const UE_PATH = 'M0 0H80V140H100V0H180V280H0ZM200 0H380V88H290V104H380V176H290V192H380V280H200Z'
const FONT_LABEL = '"Barlow Condensed", "Pretendard Variable", Pretendard, sans-serif'
const FONT_UI = '"Pretendard Variable", Pretendard, -apple-system, sans-serif'

// 알파 마스크용 무채색(그림자, 빛 번짐). 색 토큰이 아니라 투명도만 쓴다.
const mono = (v, a) => `rgba(${v},${v},${v},${a})`

function make(w, h, draw, { repeat = false, aniso = 4 } = {}) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  draw(g, w, h)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = aniso
  if (repeat) t.wrapS = t.wrapT = RepeatWrapping
  return t
}

const roundRect = (g, x, y, w, h, r) => {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

// 지하철 타일. 캔버스 한 장이 월드 1.2 x 1.2를 덮는다(타일 0.3 x 0.15, 정렬 쌓기).
export function tileTexture(base, grout, { cols = 4, rows = 8, size = 256 } = {}) {
  return make(size, size, (g, w, h) => {
    g.fillStyle = css(grout)
    g.fillRect(0, 0, w, h)
    const tw = w / cols
    const th = h / rows
    const gap = Math.max(2, Math.round(size / 100))
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const px = x * tw + gap / 2
      const py = y * th + gap / 2
      roundRect(g, px, py, tw - gap, th - gap, 3)
      const grad = g.createLinearGradient(px, py, px + tw, py + th)
      grad.addColorStop(0, css(base.clone().multiplyScalar(1.08)))
      grad.addColorStop(0.55, css(base))
      grad.addColorStop(1, css(base.clone().multiplyScalar(0.9)))
      g.fillStyle = grad
      g.fill()
    }
  }, { repeat: true })
}

// 체커 바닥. 캔버스 한 장이 월드 1.8 x 1.8(2 x 2칸).
export function checkerTexture(a, b) {
  return make(256, 256, (g, w, h) => {
    const s = w / 2
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
      g.fillStyle = css((x + y) % 2 ? a : b)
      g.fillRect(x * s, y * s, s, s)
    }
    g.strokeStyle = css(a.clone().lerp(b, 0.5))
    g.globalAlpha = 0.25
    g.lineWidth = 2
    g.strokeRect(1, 1, w - 2, h - 2)
  }, { repeat: true, aniso: 8 })
}

// 노란 점자 블록. 캔버스 한 장이 월드 0.7 x 0.7.
export function tactileTexture(yellow, dark, hi) {
  return make(256, 256, (g, w, h) => {
    g.fillStyle = css(yellow)
    g.fillRect(0, 0, w, h)
    const n = 5
    const s = w / n
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const cx = x * s + s / 2
      const cy = y * s + s / 2
      const grad = g.createRadialGradient(cx - s * 0.12, cy - s * 0.14, 2, cx, cy, s * 0.36)
      grad.addColorStop(0, css(hi))
      grad.addColorStop(0.7, css(yellow))
      grad.addColorStop(1, css(dark))
      g.fillStyle = grad
      g.beginPath()
      g.arc(cx, cy, s * 0.34, 0, Math.PI * 2)
      g.fill()
    }
  }, { repeat: true, aniso: 8 })
}

// 선로 바닥(침목)
export function trackTexture(bed, sleeper) {
  return make(128, 128, (g, w, h) => {
    g.fillStyle = css(bed)
    g.fillRect(0, 0, w, h)
    g.fillStyle = css(sleeper)
    g.fillRect(10, 0, 26, h)
  }, { repeat: true })
}

// 부드러운 바닥 그림자(원형 방사 그라디언트, 알파만 쓴다)
export function blobTexture() {
  return make(128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2)
    grad.addColorStop(0, mono(0, 0.55))
    grad.addColorStop(0.55, mono(0, 0.22))
    grad.addColorStop(1, mono(0, 0))
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
  })
}

// 문에서 승강장으로 번지는 빛(위에서 아래로 흐려지는 흰색, 재질 색으로 물들인다)
export function spillTexture() {
  return make(64, 128, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, mono(255, 1))
    grad.addColorStop(0.5, mono(255, 0.35))
    grad.addColorStop(1, mono(255, 0))
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
  })
}

// 객실 유리: 어두운 면에 비스듬한 반사 두 줄
export function glassTexture(base, hi) {
  return make(128, 128, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, css(base.clone().lerp(hi, 0.18)))
    grad.addColorStop(1, css(base))
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
    g.globalAlpha = 0.16
    g.fillStyle = css(hi)
    g.beginPath(); g.moveTo(w * 0.18, 0); g.lineTo(w * 0.34, 0); g.lineTo(w * 0.08, h); g.lineTo(0, h); g.closePath(); g.fill()
    g.globalAlpha = 0.09
    g.beginPath(); g.moveTo(w * 0.5, 0); g.lineTo(w * 0.58, 0); g.lineTo(w * 0.32, h); g.lineTo(w * 0.24, h); g.closePath(); g.fill()
  }, { repeat: true })
}

// 벽 아래쪽 어두운 접촉 그림자(구운 AO). 아래가 진하고 위로 사라진다.
export function aoTexture() {
  return make(8, 128, (g, w, h) => {
    const grad = g.createLinearGradient(0, h, 0, 0)
    grad.addColorStop(0, mono(0, 0.5))
    grad.addColorStop(0.5, mono(0, 0.12))
    grad.addColorStop(1, mono(0, 0))
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
  })
}

// 문 안쪽의 깊이감: 가장자리가 어두운 사각 비네트
export function recessTexture() {
  return make(64, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    const gx = g.createLinearGradient(0, 0, w, 0)
    gx.addColorStop(0, mono(0, 0.38)); gx.addColorStop(0.22, mono(0, 0)); gx.addColorStop(0.78, mono(0, 0)); gx.addColorStop(1, mono(0, 0.38))
    g.fillStyle = gx; g.fillRect(0, 0, w, h)
    const gy = g.createLinearGradient(0, 0, 0, h)
    gy.addColorStop(0, mono(0, 0.34)); gy.addColorStop(0.25, mono(0, 0)); gy.addColorStop(1, mono(0, 0))
    g.fillStyle = gy; g.fillRect(0, 0, w, h)
  })
}

// 검정 UE 블록 심볼(차체 옆면, 서울교통공사 S 로고 자리). 배경은 투명.
export function markTexture(ink) {
  return make(256, 192, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    const k = Math.min(w / 380, h / 280) * 0.92
    g.translate((w - 380 * k) / 2, (h - 280 * k) / 2)
    g.scale(k, k)
    g.fillStyle = css(ink)
    g.fill(new Path2D(UE_PATH), 'evenodd')
  })
}

// 호선 원형 배지 'H'
function drawLineBadge(g, cx, cy, r, P, ink) {
  g.fillStyle = css(P.yellow)
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill()
  g.fillStyle = css(ink)
  g.font = `800 ${Math.round(r * 1.0)}px ${FONT_LABEL}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(LINE.code, cx, cy + r * 0.06)
}

// 행선지 전광판. phase 0 접근, 1 도착 중, 2 승차. boarding/next는 승강장 객체({ platform, name }).
export function drawBoard(tex, P, { phase, boarding, next, blink = 1 }) {
  const c = tex.image
  const g = c.getContext('2d')
  const w = c.width
  const h = c.height
  g.clearRect(0, 0, w, h)
  g.fillStyle = css(P['bg-base'])
  g.fillRect(0, 0, w, h)
  g.fillStyle = css(P['bg-panel'])
  g.fillRect(0, 0, w, h * 0.36)
  drawLineBadge(g, h * 0.18, h * 0.18, h * 0.12, P, P['bg-base'])
  g.fillStyle = css(P['text-pri'])
  g.font = `700 ${h * 0.17}px ${FONT_LABEL}`
  g.textAlign = 'left'
  g.textBaseline = 'middle'
  g.fillText(`${STATION.no} ${STATION.name.toUpperCase()}`, h * 0.36, h * 0.19)
  g.textAlign = 'right'
  g.fillStyle = css(P.yellow)
  g.fillText(phase === 2 ? 'DOORS OPEN' : phase === 1 ? 'ARRIVING' : 'NEXT TRAIN', w - h * 0.14, h * 0.19)
  g.textAlign = 'left'
  const row = (y, label, name, tag, strong) => {
    g.fillStyle = css(strong ? P.yellow : P['text-meta'])
    g.font = `700 ${h * 0.13}px ${FONT_LABEL}`
    g.fillText(label.toUpperCase(), h * 0.14, y)
    g.fillStyle = css(strong ? P.yellow : P['text-pri'])
    g.font = `800 ${h * (strong ? 0.19 : 0.16)}px ${FONT_UI}`
    g.fillText(name, h * 0.92, y)
    if (tag) {
      g.textAlign = 'right'
      g.font = `700 ${h * 0.14}px ${FONT_LABEL}`
      g.fillStyle = css(strong ? P.yellow : P['text-meta'])
      g.fillText(tag, w - h * 0.14, y)
      g.textAlign = 'left'
    }
  }
  if (phase === 2) {
    row(h * 0.55, 'Now boarding', boarding.name, `PLATFORM ${boarding.platform}`, true)
    if (blink) {
      g.fillStyle = css(P.yellow)
      g.beginPath(); g.moveTo(h * 0.03, h * 0.55 - h * 0.07); g.lineTo(h * 0.03, h * 0.55 + h * 0.07); g.lineTo(h * 0.11, h * 0.55); g.closePath(); g.fill()
    }
    row(h * 0.83, 'Next', next.name, `PLATFORM ${next.platform}`, false)
  } else {
    row(h * 0.55, phase === 1 ? 'Arriving' : 'Stand by', 'Gyeongju Metro', '', true)
    row(h * 0.83, 'Next', 'Platform 1 Retro Shot', '', false)
  }
  tex.needsUpdate = true
}

export function boardTexture(P) {
  return make(1024, 280, (g, w, h) => { g.fillStyle = css(P['bg-base']); g.fillRect(0, 0, w, h) })
}

// 역명판 알약: 호선 배지 + 역 이름 + 역 번호
export function namePillTexture(P, { no, name, accent, ink, line = true, sub }) {
  return make(768, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    roundRect(g, 6, 6, w - 12, h - 12, (h - 12) / 2)
    g.fillStyle = css(P.white)
    g.fill()
    g.lineWidth = 8
    g.strokeStyle = css(P['bg-base'])
    g.stroke()
    // 왼쪽 호선 원
    const r = h * 0.33
    g.fillStyle = css(accent)
    g.beginPath(); g.arc(h * 0.5, h / 2, r, 0, Math.PI * 2); g.fill()
    g.fillStyle = css(ink)
    g.font = `800 ${Math.round(r * 1.05)}px ${FONT_LABEL}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(LINE.code, h * 0.5, h / 2 + r * 0.06)
    g.textAlign = 'left'
    g.fillStyle = css(P['bg-base'])
    g.font = `800 ${h * 0.34}px ${FONT_UI}`
    g.fillText(name, h * 0.98, h * (line ? 0.43 : 0.52))
    if (line) {
      g.fillStyle = css(P['bg-raised'])
      g.font = `700 ${h * 0.155}px ${FONT_LABEL}`
      g.fillText(sub || `${no}  ${LINE.name.toUpperCase()}`, h * 0.98, h * 0.74)
    }
  })
}

// 문 위 역 번호 배지 (H03 + 역 이름)
export function doorBadgeTexture(P, { no, name, accent, ink }) {
  return make(512, 192, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    roundRect(g, 4, 4, w - 8, h * 0.52, h * 0.26)
    g.fillStyle = css(accent)
    g.fill()
    g.lineWidth = 6
    g.strokeStyle = css(P['bg-base'])
    g.stroke()
    g.fillStyle = css(ink)
    g.font = `800 ${h * 0.4}px ${FONT_LABEL}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(`PLATFORM ${no}`, w / 2, h * 0.3)
    g.fillStyle = css(P['bg-base'])
    g.font = `800 ${h * 0.25}px ${FONT_UI}`
    g.fillText(name, w / 2, h * 0.79)
  })
}

export function convexMirrorTexture(P) {
  return make(128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(w * 0.38, h * 0.34, 4, w / 2, h / 2, w / 2)
    grad.addColorStop(0, css(P['text-pri']))
    grad.addColorStop(0.35, css(P['text-meta']))
    grad.addColorStop(1, css(P['bg-raised']))
    g.fillStyle = grad
    g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); g.fill()
  })
}

// 툰 셰이딩 그라디언트 맵(4단, 선형 보간으로 부드러운 경계)
export function toonGradient() {
  const t = new DataTexture(new Uint8Array([120, 170, 220, 255]), 4, 1, RedFormat, UnsignedByteType)
  t.minFilter = t.magFilter = LinearFilter
  t.generateMipmaps = false
  t.needsUpdate = true
  return t
}

export function withRepeat(tex, rx, ry) {
  const t = tex.clone()
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(rx, ry)
  t.needsUpdate = true
  return t
}

// 문짝: 스테인리스 면에 둥근 직사각형 창을 구워 넣는다(한 번에 그리기 위해)
export function leafTexture(steel, glass, hi) {
  return make(64, 128, (g, w, h) => {
    g.fillStyle = css(steel)
    g.fillRect(0, 0, w, h)
    const grad = g.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, css(steel.clone().multiplyScalar(1.08)))
    grad.addColorStop(1, css(steel.clone().multiplyScalar(0.86)))
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
    roundRect(g, w * 0.2, h * 0.14, w * 0.6, h * 0.38, 7)
    const gg = g.createLinearGradient(0, h * 0.14, 0, h * 0.52)
    gg.addColorStop(0, css(glass.clone().lerp(hi, 0.18)))
    gg.addColorStop(1, css(glass))
    g.fillStyle = gg
    g.fill()
    g.globalAlpha = 0.18
    g.fillStyle = css(hi)
    g.beginPath(); g.moveTo(w * 0.3, h * 0.14); g.lineTo(w * 0.46, h * 0.14); g.lineTo(w * 0.26, h * 0.52); g.lineTo(w * 0.2, h * 0.52); g.closePath(); g.fill()
  })
}
