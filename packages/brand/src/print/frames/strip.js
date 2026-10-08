// strip.js: 세로 스트립 프레임(노선, 경고 테이프, 열차). 용지 하나에 스트립 두 장.
import { col } from '../palette.js'

// 노선: 왼쪽에 노랑 노선과 번호 정거장, 오른쪽에 세로로 쓴 정거장 이름
export const route = {
  id: 'route',
  name: { en: 'Route Cut', ko: '노선 컷' },
  blurb: { en: 'Four stops on a yellow line, station name set sideways.', ko: '노란 노선 위 4정거장과 세로로 쓴 정거장 이름' },
  cuts: 4,
  slots: 4,
  tone: 'black',
  layout: 'twin',
  draw(p) {
    const { W, tone } = p
    p.wordmark(36, 54, 300, tone.ink)
    p.text('GYEONGJU METRO', W - 36, 96, { size: 22, weight: 600, fill: tone.sub, align: 'right', tracking: 3 })
    const w = 264
    const h = 352
    const g = 16
    const y0 = 200
    const lineX = 78
    p.rect(lineX - 7, y0 + h / 2, 14, 3 * (h + g), tone.accent)
    for (let i = 0; i < 4; i++) {
      const y = y0 + i * (h + g)
      p.photo(i, 152, y, w, h)
      p.circle(lineX, y + h / 2, 29, tone.accent)
      p.text(String(i + 1), lineX, y + h / 2 + 11, { size: 32, weight: 700, fill: tone.onAccent, align: 'center' })
    }
    // 세로 정거장 이름(아래에서 위로 읽는다)
    p.text(p.station.shot, 540, y0 + 4 * h + 3 * g, { size: 150, weight: 700, fill: tone.accent, rotate: -Math.PI / 2, maxW: 4 * h + 3 * g, tracking: 2 })
    p.text(`${p.station.code} ${p.station.name}  ${p.station.platformText}`, 584, y0 + 4 * h + 3 * g, { size: 30, weight: 700, fill: tone.ink, rotate: -Math.PI / 2, tracking: 4 })
    p.ue(36, 1698, 88, tone.accent)
    p.meta(148, 1744, { size: 20, parts: [p.date, `${p.station.code} ${p.station.name}`, p.station.pCode] })
    p.messageLine(148, 1702, 400, { size: 22, align: 'left' })
    p.stampMark(W - 74, 1726, 46)
  },
}

// 경고 테이프: 노랑 바탕, 사선 띠, 지그재그로 계단처럼 놓인 사진 4컷
export const tape = {
  id: 'tape',
  name: { en: 'Tape Cut', ko: '테이프 컷' },
  blurb: { en: 'Caution tape on yellow, four cuts staggered like stairs.', ko: '경고 테이프 띠와 계단처럼 엇갈린 4컷' },
  cuts: 4,
  slots: 4,
  tone: 'yellow',
  layout: 'twin',
  draw(p) {
    const { W, tone } = p
    p.hazard(0, 0, W, 64, { stripe: 34, a: col.yellow(), b: col.ink() })
    p.wordmark(36, 98, 300, tone.ink)
    const w = 258
    const h = 344
    const y0 = 200
    const step = 335
    for (let i = 0; i < 4; i++) {
      const x = i % 2 === 0 ? 34 : 308
      const y = y0 + i * step
      p.photo(i, x, y, w, h)
      p.circle(i % 2 === 0 ? x + w - 6 : x + 6, y + h - 6, 30, col.ink())
      p.text(String(i + 1), i % 2 === 0 ? x + w - 6 : x + 6, y + h + 5, { size: 34, weight: 700, fill: col.yellow(), align: 'center' })
    }
    // 계단 사이 빈 칸: 정거장 코드, 이름, UE, 해시태그
    p.text(p.station.pCode, 310, y0 + 215, { size: 200, weight: 700, fill: tone.ink, tracking: -4 })
    const words = p.station.shot.split(' ')
    words.slice(0, 3).forEach((wd, k) => p.text(wd, 36, y0 + step + 130 + k * 82, { size: 76, weight: 700, fill: tone.ink, tracking: 2, maxW: 240 }))
    p.ue(330, y0 + 2 * step + 70, 224, tone.ink)
    ;['#UNIQUE', '#HIP', '#TRENDY'].forEach((t, k) => p.text(t, 40, y0 + 3 * step + 90 + k * 64, { size: 48, weight: 700, fill: tone.ink, tracking: 2 }))
    p.tape(-30, 1590, W + 60, 74, { text: 'MIND THE LENS', rotate: -0.02, size: 38, bg: col.ink(), fg: col.yellow() })
    p.meta(36, 1742, { size: 20, fill: tone.ink, parts: [p.date, `${p.station.code} ${p.station.name}`, p.station.pCode] })
    p.messageLine(36, 1702, 400, { size: 22, align: 'left' })
    p.stampMark(W - 100, 140, 52, { fill: col.ink(), shadow: false })
  },
}

// 열차: 흰 차체에 노란 띠, 창문이 사진, 가운데 문
export const train = {
  id: 'train',
  name: { en: 'Train Cut', ko: '열차 컷' },
  blurb: { en: 'A Gyeongju Metro car: four windows and a door.', ko: '경주 메트로 객차 한 칸, 창문 4개와 문 하나' },
  cuts: 4,
  slots: 4,
  tone: 'black',
  layout: 'twin',
  draw(p) {
    const { W, tone } = p
    // 레일 장식
    p.rect(14, 0, 8, 1800, col.white(0.28))
    p.rect(W - 22, 0, 8, 1800, col.white(0.28))
    // 차체
    const bx = 40
    const by = 96
    const bw = W - 80
    const bh = 1604
    p.rrect(bx, by, bw, bh, 90, col.white())
    p.ctx.save()
    p.ctx.beginPath()
    p.ctx.roundRect ? p.ctx.roundRect(bx, by, bw, bh, 90) : p.ctx.rect(bx, by, bw, bh)
    p.ctx.clip()
    p.rect(bx, by, 52, bh, col.yellow())
    p.rect(bx + 52, by, 8, bh, col.ink())
    p.ctx.restore()
    // 창문 4개와 문
    const w = 240
    const h = 320
    const x = 206
    const gap = 24
    const doorH = 200
    let y = by + 22
    const ys = []
    ;[0, 1].forEach((k) => {
      ys.push(y)
      y += h + gap
    })
    const doorY = y
    y += doorH + gap
    ;[2, 3].forEach(() => {
      ys.push(y)
      y += h + gap
    })
    ys.forEach((yy, i) => p.photo(i, x, yy, w, h, { r: 22 }))
    // 문
    p.rrect(x, doorY, w, doorH, 14, col.ink(0.1))
    p.rect(x + w / 2 - 3, doorY + 8, 6, doorH - 16, col.ink())
    p.rrect(x, doorY, w, doorH, 14, null, col.ink(), 6)
    p.lineCircle(x + w / 2, doorY + doorH / 2, 56, { bg: col.yellow(), fg: col.ink(), ring: col.ink() })
    // 세로 글자
    p.text(p.station.shot, 166, by + bh - 40, { size: 96, weight: 700, fill: col.ink(), rotate: -Math.PI / 2, maxW: bh - 80, tracking: 2 })
    p.text(`${p.date}`, 520, by + bh - 40, { size: 22, weight: 600, fill: col.ink(0.7), rotate: -Math.PI / 2, tracking: 3 })
    p.text('GYEONGJU METRO', 520, by + 40 + 300, { size: 22, weight: 600, fill: col.ink(0.7), rotate: -Math.PI / 2, tracking: 3 })
    p.wordmark(W / 2 - 100, 28, 200, tone.ink)
    p.ue(W / 2 - 34, 1722, 68, tone.accent)
    p.messageLine(W / 2, 1796, 460, { size: 20 })
    p.stampMark(W - 105, by + 140, 46, { fill: col.ink(), shadow: false })
  },
}
