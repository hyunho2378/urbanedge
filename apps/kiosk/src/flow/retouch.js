import { palette } from '@urbanedge/ds'

// retouch.js: 보정 값과 canvas 적용. 미리보기와 촬영 결과가 같은 함수를 쓴다.
//   skin    0 꺼짐, 1 약, 2 보통, 3 강 (원본 위에 흐린 사본을 얹는 방식)
//   bright  0 어둡게, 1 기본, 2 밝게
//   filter  original | mono | film | flash
export const DEFAULT_RETOUCH = { skin: 2, bright: 1, filter: 'original' }
export const FILTER_IDS = ['original', 'mono', 'film', 'flash']

const BRIGHT = [0.88, 1, 1.14]
const SKIN_ALPHA = [0, 0.3, 0.45, 0.6]
const SKIN_BLUR = [0, 1.6, 2.6, 4.2]
const FILTER_CSS = {
  original: '',
  mono: 'grayscale(1) contrast(1.1)',
  film: 'sepia(0.28) contrast(1.1) saturate(0.82)',
  flash: 'contrast(1.06) saturate(1.12)',
}

export const cssFilterOf = (r) => `brightness(${BRIGHT[r.bright]}) ${FILTER_CSS[r.filter] || ''}`.trim()

const col = (name, a) => `rgb(${palette[name]} / ${a})`

// draw()는 현재 ctx에 원본을 한 번 그리는 함수다.
export function paintRetouched(ctx, draw, w, h, r) {
  const f = cssFilterOf(r)
  ctx.save()
  ctx.filter = f
  draw()
  if (r.skin > 0) {
    ctx.globalAlpha = SKIN_ALPHA[r.skin]
    ctx.filter = `${f} blur(${(SKIN_BLUR[r.skin] * w) / 1280}px)`
    draw()
  }
  ctx.restore()
  if (r.filter === 'film') {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.95)
    g.addColorStop(0, col('black', 0))
    g.addColorStop(1, col('black', 0.5))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  if (r.filter === 'flash') {
    ctx.save()
    ctx.globalCompositeOperation = 'soft-light'
    ctx.fillStyle = col('yellow', 0.55)
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }
}
