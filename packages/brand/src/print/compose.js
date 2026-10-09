// compose.js: composeStrip. 프레임 정의(draw)를 캔버스에 합성한다. 사진은 서버로 보내지 않고 메모리에서만 쓴다.
import { FRAMES, getFrame } from './frames/index.js'
import { TONES } from './palette.js'
import { makePainter } from './draw.js'
import { getStation, formatShotDate } from './stations.js'

export const PAPER_SHEET = { w: 1200, h: 1800 }
export const SAMPLE_PHOTO_URLS = [1, 2, 3, 4, 5].map((n) => `/img/team/shot-${n}.jpg`)

const imageCache = new Map()

// URL, Blob, <img>, ImageBitmap, canvas를 그리기 가능한 원본으로 바꾼다.
export async function loadImage(src) {
  if (!src) return null
  if (typeof src === 'string') {
    if (imageCache.has(src)) return imageCache.get(src)
    const job = new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.decoding = 'async'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`image failed: ${src}`))
      img.src = src
    })
    imageCache.set(src, job)
    job.catch(() => imageCache.delete(src))
    return job
  }
  if (typeof Blob !== 'undefined' && src instanceof Blob) return createImageBitmap(src)
  if (src && typeof src.decode === 'function' && !src.complete) {
    try {
      await src.decode()
    } catch {
      /* 이미 로드된 이미지는 무시 */
    }
  }
  return src
}

let fontsReady = null
export function ensureFrameFonts() {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve()
  if (!fontsReady) {
    fontsReady = Promise.all(
      ['700 40px "Barlow Condensed"', '600 24px "Barlow Condensed"', '500 24px "Barlow Condensed"', '600 24px "Pretendard Variable"', '700 24px "Pretendard Variable"'].map((f) =>
        document.fonts.load(f, 'AaH03가').catch(() => null),
      ),
    ).then(() => document.fonts.ready)
  }
  return fontsReady.catch(() => null)
}

function newCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = Math.round(w)
  c.height = Math.round(h)
  return c
}

// composeStrip({ frameId, photos, date, roomId, stamp, message, mode, scale, background })
//  photos: 이미지 배열(HTMLImageElement, ImageBitmap, canvas, Blob, URL). 슬롯보다 적으면 순환, 없으면 번호 슬롯.
//  date: Date | 'YYYY-MM-DD' | 'YYYY.MM.DD' | 타임스탬프(없으면 오늘)  -> 2026.10.09 형식으로 작게 인쇄
//  roomId: 'retro'(P1) | 'karaoke'(P2) | 'subway'(P3) 또는 'P2', 2 같은 승강장 번호(예전 'toilet'은 subway로 처리)
//  stamp: 정거장 id 또는 코드(있으면 스탬프를 얹는다). message: 한 줄 메시지(40자까지)
//  mode: 'sheet'(기본, 4x6 한 장 1200x1800. 스트립형은 같은 스트립 두 장) | 'single'(스트립형은 600x1800 한 장)
//  scale: 출력 배율(기본 1). 미리보기는 0.4에서 0.6.
export async function composeStrip({ frameId, photos = [], date, roomId, stamp, message, mode = 'sheet', scale = 1, signal } = {}) {
  const frame = getFrame(frameId)
  await ensureFrameFonts()
  const srcs = (await Promise.all(photos.filter(Boolean).map((s) => loadImage(s).catch(() => null)))).filter(Boolean)
  if (signal?.aborted) throw new DOMException('aborted', 'AbortError')
  const tone = typeof frame.tone === 'string' ? TONES[frame.tone] : frame.tone
  const station = getStation(roomId)
  const stampStation = stamp ? getStation(stamp === true ? roomId : stamp) : null
  const copies = frame.layout === 'twin' && mode === 'sheet' ? 2 : 1
  const cw = frame.paper.w * copies
  const ch = frame.paper.h
  const canvas = newCanvas(cw * scale, ch * scale)
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  const dateText = formatShotDate(date)
  for (let c = 0; c < copies; c++) {
    ctx.save()
    ctx.translate(c * frame.paper.w, 0)
    ctx.beginPath()
    ctx.rect(0, 0, frame.paper.w, frame.paper.h)
    ctx.clip()
    ctx.fillStyle = tone.bg
    ctx.fillRect(0, 0, frame.paper.w, frame.paper.h)
    const p = makePainter({
      ctx,
      W: frame.paper.w,
      H: frame.paper.h,
      px: scale,
      tone,
      photos: srcs,
      date: dateText,
      station,
      stamp: stampStation,
      message: message || '',
    })
    frame.draw(p)
    ctx.restore()
  }
  return canvas
}

export function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type, quality)
  })
}

export { FRAMES }
