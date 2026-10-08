// baseline.js: 실제 기기 인화물의 문법(인스타그램 게시물 ig-04에서 ig-08, 인화 샘플 sample-strip-karaoke)을 따른 기본 프레임.
// 흰색, 검정, 파랑 바탕에 사진 슬롯, 아래에 워드마크, 작은 날짜.
import { col } from '../palette.js'
import { grid } from './util.js'

// 4컷 2x2, 4x6 전체 용지. 흰색(ig-04)과 검정(ig-05) 두 가지.
function classic2x2(p) {
  const { W, H, tone } = p
  const w = 528
  const h = 704
  const g = 24
  const x0 = (W - 2 * w - g) / 2
  grid(p, x0, 60, 2, 2, w, h, g, g)
  const wmW = 440
  p.wordmark((W - wmW) / 2, 1548, wmW, tone.ink)
  p.messageLine(W / 2, 1688, 800, { size: 30 })
  if (tone.name === 'black') {
    p.stationPill(x0, 1716, 54)
    p.text(p.date, W - x0, 1753, { size: 24, weight: 600, fill: tone.sub, align: 'right', tracking: 2.4 })
  } else {
    p.meta(W / 2, 1752, { align: 'center', size: 22 })
  }
  p.stampMark(W - 130, 1596, 64, { fill: tone.name === 'white' ? tone.ink : col.yellow(), shadow: tone.name !== 'white' })
}

export const classicWhite = {
  id: 'classic-white',
  name: { en: 'Classic White', ko: '클래식 화이트' },
  blurb: { en: 'The machine standard. Four cuts, wordmark underneath.', ko: '기기 기본 인화물과 같은 4컷 흰색 프레임' },
  cuts: 4,
  slots: 4,
  tone: 'white',
  layout: 'full',
  draw: classic2x2,
}

export const classicBlack = {
  id: 'classic-black',
  name: { en: 'Classic Black', ko: '클래식 블랙' },
  blurb: { en: 'Black paper, yellow station tag.', ko: '검정 바탕에 노란 정거장 태그가 붙은 4컷 프레임' },
  cuts: 4,
  slots: 4,
  tone: 'black',
  layout: 'full',
  draw: classic2x2,
}

// 8컷 2x4 파랑 스트립(ig-06, ig-07). 용지 하나에 같은 스트립 두 장.
export const classicBlue = {
  id: 'classic-blue',
  name: { en: 'Classic Blue', ko: '클래식 블루' },
  blurb: { en: 'Eight cuts on royal blue, two copies per sheet.', ko: '파랑 바탕 8컷 스트립, 한 장에 두 부' },
  cuts: 8,
  slots: 8,
  tone: 'blue',
  layout: 'twin',
  draw(p) {
    const { W, tone } = p
    const m = 33
    const g = 25
    const w = (W - 2 * m - g) / 2
    const h = Math.round((w * 4) / 3)
    grid(p, m, 48, 2, 4, w, h, g, g)
    const y = 48 + 4 * h + 3 * g
    p.wordmark((W - 340) / 2, y + 52, 340, tone.ink)
    p.messageLine(W / 2, y + 168, 520, { size: 26 })
    p.meta(W / 2, y + 214, { align: 'center', size: 19, parts: [p.date, `${p.station.code} ${p.station.name}`, p.station.platformText] })
    p.stampMark(W - 82, y + 70, 48)
    p.ue(W / 2 - 34, y + 236, 68, tone.accent)
  },
}

// 6컷 2x3, 검정 바탕에 체커 가장자리와 큰 정거장 코드
export const reel = {
  id: 'reel',
  name: { en: 'Reel Cut', ko: '릴 컷' },
  blurb: { en: 'Six cuts between checker rails, station code in yellow.', ko: '체커 레일 사이 6컷과 노란 정거장 코드' },
  cuts: 8,
  slots: 6,
  tone: 'black',
  layout: 'twin',
  draw(p) {
    const { W, tone } = p
    p.checker(0, 0, 26, 1800, 26, tone.bg, col.white())
    p.checker(W - 26, 0, 26, 1800, 26, tone.bg, col.white())
    p.wordmark(60, 70, 250, tone.ink)
    p.text('GYEONGJU METRO', W - 60, 106, { size: 20, weight: 600, fill: tone.sub, align: 'right', tracking: 3 })
    const g = 14
    const w = (W - 120 - g) / 2
    const h = Math.round((w * 4) / 3)
    grid(p, 60, 190, 2, 3, w, h, g, g)
    const yEnd = 190 + 3 * h + 2 * g
    p.tape(-20, yEnd + 70, W + 40, 76, { text: 'MIND THE LENS', rotate: -0.035, size: 40 })
    p.text(p.station.pCode, 56, yEnd + 400, { size: 270, weight: 700, fill: tone.accent, tracking: -6 })
    p.text(p.station.shot, 60, yEnd + 462, { size: 54, weight: 700, fill: tone.ink, tracking: 3, maxW: W - 120 })
    p.messageLine(60, yEnd + 520, W - 120, { size: 26, align: 'left' })
    p.meta(60, 1752, { size: 20, parts: [p.date, `${p.station.code} ${p.station.name}`] })
    p.ue(W - 60 - 76, 1700, 76, tone.accent)
    p.stampMark(W - 118, yEnd + 300, 66)
  },
}

// 인화 샘플(sample-strip-karaoke.jpg) 구성: 2x2 작은 컷 네 장, 워드마크, 큰 컷 한 장, 아래 UE. 용지 하나에 스트립 두 장.
export const signature = {
  id: 'signature',
  name: { en: 'Signature Cut', ko: '시그니처 컷' },
  blurb: { en: 'Four small cuts, one big one. The print the machine shipped with.', ko: '작은 4컷과 큰 1컷, 기기 샘플 인화물 구성' },
  cuts: 8,
  slots: 5,
  tone: 'white',
  layout: 'twin',
  draw(p) {
    const { W, tone } = p
    const m = 33
    const g = 25
    const w = 255
    const h = 340
    grid(p, m, 48, 2, 2, w, h, g, g)
    p.wordmark((W - 296) / 2, 780, 296, tone.ink)
    p.photo(4, m, 931, W - 2 * m, 710, { fy: 0.18 })
    p.ue(W / 2 - 48, 1684, 96, tone.ink)
    p.text(p.date, m, 1735, { size: 22, weight: 600, fill: tone.sub, tracking: 2.2 })
    p.text(`${p.station.pCode} ${p.station.shot}`, W - m, 1735, { size: 22, weight: 600, fill: tone.sub, tracking: 2.2, align: 'right', maxW: 200 })
    p.messageLine(W / 2, 910, W - 2 * m, { size: 22 })
    p.stampMark(W - 100, 1560, 54)
  },
}
