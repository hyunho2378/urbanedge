import { palette } from '@urbanedge/ds'

// retouch.js: 보정 값과 canvas 적용. 미리보기와 촬영 결과가 같은 함수를 쓴다.
//   skin    0부터 1: 원본 위에 흐린 사본을 얹는 정도(슬라이더)
//   bright  0부터 1: 0.5가 기본 밝기(슬라이더)
//   filter  original | mono | film | flash
export const DEFAULT_RETOUCH = { skin: 0.45, bright: 0.5, filter: 'original' }
export const FILTER_IDS = ['original', 'mono', 'film', 'flash']

const FILTER_CSS = {
  original: '',
  mono: 'grayscale(1) contrast(1.1)',
  film: 'sepia(0.28) contrast(1.1) saturate(0.82)',
  flash: 'contrast(1.06) saturate(1.12)',
}
export const brightnessOf = (b) => 0.82 + b * 0.36
export const cssFilterOf = (r) => `brightness(${brightnessOf(r.bright)}) ${FILTER_CSS[r.filter] || ''}`.trim()

const col = (name, a) => `rgb(${palette[name]} / ${a})`

export function paintRetouched(ctx, draw, w, h, r) {
  const f = cssFilterOf(r)
  ctx.save()
  ctx.filter = f
  draw()
  if (r.skin > 0.02) {
    ctx.globalAlpha = r.skin * 0.6
    ctx.filter = `${f} blur(${(r.skin * 4.2 * w) / 960}px)`
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
