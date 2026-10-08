// poster.js: 전체 용지 포스터형 프레임(큰 사진, 횡단보도, 겹침, 교차로, 스택)
import { col } from '../palette.js'
import { grid } from './util.js'

// 큰 사진 한 컷과 작은 세 컷, 아래에 큰 워드마크와 체커 띠
export const poster = {
  id: 'poster',
  name: { en: 'Poster Cut', ko: '포스터 컷' },
  blurb: { en: 'One big cut, three small ones, checker floor.', ko: '큰 사진 1컷과 작은 3컷, 체커 바닥' },
  cuts: 4,
  slots: 4,
  tone: 'white',
  layout: 'full',
  draw(p) {
    const { W, tone } = p
    const m = 70
    p.text('BEYOND THE LENS, INTO THE STREETS', m, 100, { size: 26, weight: 600, fill: tone.ink, tracking: 3 })
    p.stationPill(W - m, 56, 62, { align: 'right', size: 30 })
    const bw = 788
    const bh = 1051
    p.photo(0, m, 150, bw, bh)
    const sw = 248
    const sh = 330
    for (let i = 0; i < 3; i++) p.photo(i + 1, m + bw + 24, 150 + i * (sh + 30.5), sw, sh)
    p.wordmark(m, 1256, W - 2 * m, tone.ink)
    p.messageLine(m, 1524, W - 2 * m, { size: 30, align: 'left' })
    p.checker(0, 1560, W, 240, 60, tone.bg, tone.ink)
    p.rrect(m, 1648, 640, 100, 0, tone.bg)
    p.meta(m + 28, 1712, { size: 28, fill: tone.ink })
    p.rect(W - m - 120, 1620, 120, 160, col.yellow())
    p.ue(W - m - 100, 1660, 80, col.ink())
    p.stampMark(m + bw - 90, 150 + bh - 90, 66)
  },
}

// 횡단보도 2x2: 검정 바탕과 사선 횡단보도, 아래 굵은 횡단보도 띠
export const crosswalk = {
  id: 'crosswalk',
  name: { en: 'Crosswalk Cut', ko: '횡단보도 컷' },
  blurb: { en: 'Black asphalt, white bars, four cuts across.', ko: '검정 아스팔트와 흰 횡단보도 줄무늬 위의 4컷' },
  cuts: 4,
  slots: 4,
  tone: 'black',
  layout: 'full',
  draw(p) {
    const { W, tone } = p
    p.bars(0, 0, W, 1800, { bar: 70, gap: 120, fill: col.white(0.07), slant: -420 })
    p.wordmark(60, 54, 380, tone.ink)
    p.stationPill(W - 60, 52, 66, { align: 'right', size: 31 })
    const w = 528
    const h = 704
    grid(p, 60, 150, 2, 2, w, h, 24, 24)
    p.bars(0, 1636, W, 164, { bar: 58, gap: 38, fill: col.white() })
    p.rrect(300, 1660, 600, 116, 0, tone.bg)
    p.ue(326, 1684, 84, tone.accent)
    p.meta(436, 1737, { size: 23, fill: tone.ink, parts: [p.date, `${p.station.code} ${p.station.name}`, p.station.pCode] })
    p.messageLine(W / 2, 1618, 900, { size: 28 })
    p.stampMark(W - 130, 1560, 62)
  },
}

// 겹침: 큰 사진 하나와 작은 사진 세 장이 비스듬히 겹치고 노랑 테이프가 붙는다
export const layer = {
  id: 'layer',
  name: { en: 'Layer Cut', ko: '레이어 컷' },
  blurb: { en: 'Four prints pinned to a black wall with yellow tape.', ko: '검정 벽에 노란 테이프로 붙인 겹침 4컷' },
  cuts: 8,
  slots: 4,
  tone: 'black',
  layout: 'full',
  draw(p) {
    const { W, tone } = p
    p.bars(0, 0, W, 1800, { bar: 4, gap: 60, fill: col.white(0.05), slant: 0 })
    p.photo(0, 70, 120, 760, 1013, { rotate: -0.04, shadow: true })
    p.photo(1, 650, 300, 380, 507, { rotate: 0.07, shadow: true })
    p.photo(2, 110, 1010, 380, 507, { rotate: -0.06, shadow: true })
    p.photo(3, 640, 1090, 380, 507, { rotate: 0.045, shadow: true })
    p.tape(10, 130, 250, 60, { rotate: -0.62, size: 28, text: 'UE' })
    p.tape(880, 300, 220, 56, { rotate: 0.62, size: 26, text: 'UE' })
    p.tape(60, 1030, 200, 52, { rotate: 0.55, size: 24, text: 'UE' })
    p.tape(830, 1100, 220, 56, { rotate: -0.6, size: 26, text: 'UE' })
    p.wordmark(70, 1650, 440, tone.ink)
    p.meta(W - 70, 1700, { align: 'right', size: 24, fill: tone.sub })
    p.ue(W - 70 - 80, 1722, 80, tone.accent)
    p.messageLine(70, 1626, 800, { size: 28, align: 'left' })
    p.stampMark(790, 220, 66)
  },
}

// 스택: 노랑 바탕, 위에 UE 심볼 세 개를 나란히(브랜드 포스터 biz_07 구성)
export const stack = {
  id: 'stack',
  name: { en: 'Stack Cut', ko: '스택 컷' },
  blurb: { en: 'Yellow poster stock with a row of UE marks.', ko: '노란 포스터 바탕과 UE 심볼 세 개 구성' },
  cuts: 4,
  slots: 4,
  tone: 'yellow',
  layout: 'full',
  draw(p) {
    const { W, tone } = p
    const x0 = 120
    const iw = 960
    const uw = 300
    for (let i = 0; i < 3; i++) p.ue(x0 + i * (uw + 30), 60, uw, tone.ink)
    const w = 470
    const h = 627
    grid(p, x0, 320, 2, 2, w, h, 20, 20)
    p.wordmark(x0, 1650, 380, tone.ink)
    p.messageLine(x0 + iw, 1676, 520, { size: 26, align: 'right' })
    p.meta(x0 + iw, 1740, { align: 'right', size: 24, fill: tone.ink })
    p.stampMark(x0 + iw - 60, 380, 62)
  },
}

// 교차로 3x3: 가운데 세로줄에 횡단보도, UE, 체커 타일, 양옆 사진 6컷
export const crossroad = {
  id: 'crossroad',
  name: { en: 'Crossroad Cut', ko: '교차로 컷' },
  blurb: { en: 'Six cuts around a crosswalk, a UE tile and a checker tile.', ko: '횡단보도, UE, 체커 타일을 가운데 두고 양옆 6컷' },
  cuts: 8,
  slots: 6,
  tone: 'yellow',
  layout: 'full',
  draw(p) {
    const { W, tone } = p
    const m = 48
    const g = 12
    const w = 360
    const h = 480
    const y0 = 150
    p.wordmark(m, 50, 340, tone.ink)
    p.text('GYEONGJU METRO', W - m, 100, { size: 26, weight: 600, fill: tone.ink, align: 'right', tracking: 3 })
    const cx = m + w + g
    for (let r = 0; r < 3; r++) {
      const y = y0 + r * (h + g)
      p.photo(r * 2, m, y, w, h)
      p.photo(r * 2 + 1, m + 2 * (w + g), y, w, h)
    }
    // 가운데 타일 3개
    p.rect(cx, y0, w, h, col.ink())
    p.bars(cx, y0, w, h, { bar: 44, gap: 36, fill: col.white() })
    p.rect(cx, y0 + h + g, w, h, col.ink())
    p.ue(cx + 60, y0 + h + g + (h - 240 * 0.737) / 2, 240, col.yellow())
    p.checker(cx, y0 + 2 * (h + g), w, h, 60, col.white(), col.ink())
    const yb = y0 + 3 * h + 2 * g
    p.stationPill(m, yb + 36, 70, { bg: col.ink(), fg: col.white(), circleBg: col.yellow(), circleFg: col.ink(), size: 34 })
    p.meta(W - m, yb + 82, { align: 'right', size: 24, fill: tone.ink, parts: [p.date, `${p.station.code} ${p.station.name}`, p.station.platformText] })
    p.messageLine(W / 2, yb + 138, W - 2 * m, { size: 28 })
    p.stampMark(m + 2 * (w + g) + w - 70, y0 + h - 70, 58)
  },
}
