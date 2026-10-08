// ticket.js: 승차권과 노선 알약을 모티브로 한 프레임. 어반엣지 자체 표식만 쓴다(서울교통공사, 코레일 등 기존 기관 마크를 쓰지 않는다).
// GY-01 어반엣지역은 경주 메트로의 첫 역이고, 방 4곳이 승강장(Platform 1에서 4)이다. 가상의 지하철 관광 경험이다.
import { col } from '../palette.js'
import { grid } from './util.js'
import { STATIONS } from '../stations.js'

const shortShot = (s) => s.shot.replace(/ SHOT$/, '')

// 승강장 4곳을 한 줄 노선으로 그린다. 지금 승강장이 크게 그 노선 색으로 찍힌다.
function platformLine(p, x1, x2, y, { labels = true, small = false } = {}) {
  const { tone } = p
  p.rrect(x1 - 14, y - 5, x2 - x1 + 28, 10, 5, tone.accent)
  STATIONS.forEach((s, i) => {
    const x = x1 + ((x2 - x1) * i) / (STATIONS.length - 1)
    const cur = s.id === p.station.id
    p.circle(x, y, cur ? 20 : 12, cur ? col.line[s.color]() : tone.bg, tone.ink, cur ? 6 : 4)
    if (!labels) return
    p.text(s.pCode, x, y + (small ? 44 : 54), { size: cur ? 26 : 21, weight: cur ? 700 : 500, fill: cur ? tone.ink : tone.sub, align: 'center', tracking: 1 })
    if (!small) p.text(shortShot(s), x, y + 80, { size: 14, weight: 500, fill: cur ? tone.ink : tone.sub, align: 'center', tracking: 1.2 })
  })
}

function ticket(p) {
  const { W, tone } = p
  const m = 36
  // 헤더: 노선 원과 노선 이름
  p.lineCircle(m + 34, 84, 34, { bg: tone.accent, fg: tone.onAccent, code: 'GY' })
  p.text('Gyeongju Metro', m + 86, 96, { size: 36, weight: 700, fill: tone.ink, family: '"Pretendard Variable", Pretendard, "Helvetica Neue", Arial, sans-serif' })
  p.text('METRO TICKET', W - m, 84, { size: 22, weight: 600, fill: tone.sub, align: 'right', tracking: 3 })
  // 역: GY-01 UrbanEdge
  p.lineCircle(m + 48, 188, 48, { bg: tone.ink, fg: tone.bg, code: p.station.code })
  p.text(p.station.name, m + 118, 226, { size: 104, weight: 700, fill: tone.ink, tracking: 1, maxW: W - 2 * m - 118 })
  // 승강장과 샷 이름
  const pw = p.measure(p.station.platformText, { size: 30, weight: 700, tracking: 2 })
  p.rrect(m, 262, pw + 36, 50, 25, tone.accent)
  p.text(p.station.platformText, m + 18, 297, { size: 30, weight: 700, fill: tone.onAccent, tracking: 2 })
  p.text(p.station.shot, m + pw + 58, 298, { size: 42, weight: 700, fill: tone.ink, tracking: 1.5, maxW: W - 2 * m - pw - 58 })
  platformLine(p, m + 22, W - m - 22, 372)
  p.perforation(0, W, 476, { notch: 20 })
  // 사진
  const g = 20
  const w = (W - 2 * m - g) / 2
  const h = Math.round((w * 4) / 3)
  const y0 = 520
  grid(p, m, y0, 2, 2, w, h, g, g)
  const yb = y0 + 2 * h + g
  p.stampMark(W - m - 70, yb - 76, 62)
  // 승차권 항목
  const fy = yb + 58
  const field = (x, label, value) => {
    p.text(label, x, fy, { size: 17, weight: 500, fill: tone.sub, tracking: 2.4 })
    p.text(value, x, fy + 40, { size: 34, weight: 700, fill: tone.ink, tracking: 1 })
  }
  field(m, 'VISIT DATE', p.date)
  field(m + 212, 'STATION CODE', p.station.code)
  field(m + 372, 'PLATFORM', String(p.station.platform))
  field(m + 492, 'EXIT', '1')
  p.messageLine(m, fy + 92, W - 2 * m, { size: 24, align: 'left' })
  p.perforation(0, W, fy + 120, { notch: 20 })
  // 바코드와 로고
  const by = fy + 156
  p.barcode(m, by, W - 2 * m, 96, tone.ink)
  p.text(`UE ${p.date.replace(/\./g, '')} ${p.station.code} ${p.station.pCode}`, m, by + 130, { size: 19, weight: 500, fill: tone.sub, tracking: 4 })
  p.ue(m, 1688, 80, tone.ink)
  p.wordmark(W - m - 270, 1700, 270, tone.ink)
  p.text('IMAGINARY METRO · TRAVEL EXPERIENCE', W / 2, 1782, { size: 15, weight: 500, fill: tone.sub, align: 'center', tracking: 2.4 })
}

export const transitTicket = {
  id: 'ticket',
  name: { en: 'Transit Ticket', ko: '승차권' },
  blurb: { en: 'GY-01 UrbanEdge, your platform, the visit date and a barcode. A Metro Ticket for a city with no subway.', ko: 'GY-01 어반엣지역, 승강장 번호, 방문 날짜, 바코드가 찍힌 승차권 프레임' },
  cuts: 4,
  slots: 4,
  tone: 'white',
  layout: 'twin',
  draw: ticket,
}

export const nightTicket = {
  id: 'ticket-night',
  name: { en: 'Night Ticket', ko: '야간 승차권' },
  blurb: { en: 'The same ticket after dark: black stock, yellow line.', ko: '검정 바탕에 노란 노선이 흐르는 승차권' },
  cuts: 4,
  slots: 4,
  tone: 'black',
  layout: 'twin',
  draw: ticket,
}

// 노선 알약: 노랑 알약 머리글, 둥근 사진, 아래에 승강장 4곳 노선도
export const pill = {
  id: 'pill',
  name: { en: 'Line Pill', ko: '노선 알약' },
  blurb: { en: 'A yellow line pill on top, four platforms along the bottom.', ko: '노란 노선 알약과 아래쪽 승강장 4곳 노선도' },
  cuts: 4,
  slots: 4,
  tone: 'white',
  layout: 'full',
  draw(p) {
    const { W, tone } = p
    const x0 = 108
    const w = 480
    const h = 640
    const g = 24
    const innerW = 2 * w + g
    // 머리글 알약
    p.rrect(x0, 66, innerW, 104, 52, tone.accent)
    p.lineCircle(x0 + 52, 118, 40, { bg: col.ink(), fg: col.yellow(), code: 'GY' })
    p.text('Gyeongju Metro', x0 + 112, 134, { size: 46, weight: 700, fill: tone.onAccent, family: '"Pretendard Variable", Pretendard, "Helvetica Neue", Arial, sans-serif' })
    p.stationPill(x0 + innerW - 16, 84, 68, { align: 'right', bg: col.ink(), fg: col.white(), circleBg: col.yellow(), circleFg: col.ink(), size: 30 })
    grid(p, x0, 210, 2, 2, w, h, g, g, { r: 34 })
    // 승강장 노선도
    platformLine(p, x0 + 50, x0 + innerW - 50, 1626)
    p.messageLine(W / 2, 1752, innerW, { size: 26 })
    p.meta(x0, 1782, { size: 20, parts: [p.date, `${p.station.code} ${p.station.name}`, p.station.platformText] })
    p.ue(x0 + innerW - 66, 1738, 66, tone.ink)
    p.stampMark(x0 + innerW - 70, 330, 56)
  },
}
