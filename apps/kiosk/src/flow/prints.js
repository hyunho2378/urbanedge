import { palette } from '@urbanedge/ds'
import { FRAMES, composeStrip, makeShareCard, ensureFrameFonts } from '@urbanedge/brand'
import { roomById } from './rooms.js'

// prints.js: 인화 프레임 어댑터. 프레임 정의와 합성은 작업 B(@urbanedge/brand)가 맡고, 이 파일은 키오스크 흐름에 맞게 감싼다.
//   FRAMES 항목의 cuts는 촬영 장수(4 또는 8), slots는 인화되는 사진 수다. slots가 cuts보다 작으면 컷을 고르는 단계가 생긴다.
export const allFrames = () => FRAMES
export const framesFor = (cuts) => FRAMES.filter((f) => f.cuts === cuts)
export const frameById = (id) => FRAMES.find((f) => f.id === id) || null
export const defaultFrameFor = (cuts) => framesFor(cuts)[0] || FRAMES[0]
export const slotCount = (frame, cuts) => (frame ? frame.slots : cuts)
export const copiesOf = (frame, mode) => (frame && frame.layout === 'twin' && mode === 'sheet' ? 2 : 1)

const rgb = (name, a) => (a == null ? `rgb(${palette[name]})` : `rgb(${palette[name]} / ${a})`)

// 칸이 비었을 때 보이는 번호 자리표시 캔버스(미리보기용). 칸 번호마다 하나씩 캐시한다.
const placeholders = new Map()
export function slotPlaceholder(n) {
  if (!placeholders.has(n)) {
    const c = document.createElement('canvas')
    c.width = 300
    c.height = 400
    const ctx = c.getContext('2d')
    ctx.fillStyle = rgb('bg-raised')
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = rgb('text-pri', 0.5)
    ctx.font = "800 150px 'Pretendard Variable', Poppins, sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(n), c.width / 2, c.height / 2)
    placeholders.set(n, c)
  }
  return placeholders.get(n)
}

// 배치된 컷으로 칸 순서대로 사진 배열을 만든다. 빈 칸은 번호 자리표시다.
export function photosFromArrangement(arrangement, shots) {
  return arrangement.map((i, slot) => (i != null && shots[i] ? shots[i].canvas : slotPlaceholder(slot + 1)))
}

// 최종 인화 시트(4x6)를 합성한다. 스트립형은 같은 스트립 두 장이 한 용지에 들어간다.
export async function composeSheet({ frameId, photos, date, roomId, message, scale = 1 }) {
  return composeStrip({ frameId, photos, date, roomId, message, mode: 'sheet', scale })
}

// 승강장 스탬프: 노랑 원판, 검정 이중 링, 승강장 번호와 이름
export function drawStamp(ctx, cx, cy, r, platform, rot = 0) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rot * Math.PI) / 180)
  const light = platform.color === 'red' || platform.color === 'blue'
  const ink = rgb(light ? 'text-pri' : 'bg-base')
  ctx.fillStyle = rgb(`line-${platform.color}`)
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = ink
  ctx.lineWidth = Math.max(3, r * 0.08)
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = Math.max(1.5, r * 0.03)
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.76, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `800 ${Math.round(r * 0.6)}px Poppins, 'Pretendard Variable', sans-serif`
  ctx.fillText(`P${platform.n}`, 0, -r * 0.1)
  const label = platform.name.replace(' SHOT', '')
  let size = r * 0.24
  ctx.font = `600 ${Math.round(size)}px 'Barlow Condensed', 'Pretendard Variable', sans-serif`
  while (ctx.measureText(label).width > r * 1.3 && size > 6) {
    size -= 1
    ctx.font = `600 ${Math.round(size)}px 'Barlow Condensed', 'Pretendard Variable', sans-serif`
  }
  ctx.fillText(label, 0, r * 0.42)
  ctx.restore()
}

// 합성 결과 위에 사용자가 올린 스탬프를 그린다. stamps: [{ room, x, y, rot }] (x, y는 한 장 안에서 0부터 1).
// copies가 2이면 두 스트립 모두에 같은 자리로 찍는다.
export function overlayStamps(canvas, stamps, copies = 1) {
  const out = document.createElement('canvas')
  out.width = canvas.width
  out.height = canvas.height
  const ctx = out.getContext('2d')
  ctx.drawImage(canvas, 0, 0)
  const w = out.width / copies
  const r = w * 0.17
  for (let c = 0; c < copies; c++) {
    stamps.forEach((s) => drawStamp(ctx, c * w + s.x * w, s.y * out.height, r, roomById(s.room), s.rot || 0))
  }
  return out
}

export const ensureFonts = () => ensureFrameFonts()

// 공유 카드(스토리 1080x1920, 피드 1080x1350)
export async function makeShare(strip, format, { roomId, date } = {}) {
  return makeShareCard({ strip, format, roomId, date })
}
