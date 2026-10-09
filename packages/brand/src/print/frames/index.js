import { classicWhite, classicBlack, classicBlue, reel, signature } from './baseline.js'
import { transitTicket, nightTicket, pill } from './ticket.js'
import { poster, crosswalk, layer, stack, crossroad } from './poster.js'
import { route, tape, train } from './strip.js'
import { TONES } from '../palette.js'

const LIST = [
  classicWhite,
  classicBlack,
  classicBlue,
  signature,
  transitTicket,
  nightTicket,
  pill,
  poster,
  route,
  crosswalk,
  reel,
  layer,
  train,
  tape,
  crossroad,
  stack,
]

const PAPER = { full: { w: 1200, h: 1800 }, twin: { w: 600, h: 1800 } }

// FRAMES 항목: { id, name:{en,ko}, blurb:{en,ko}, cuts: 4|8, slots, tone:'white'|'black'|'yellow'|'blue',
//   layout:'twin'(2x6인치 스트립 두 장을 한 용지에) | 'full'(4x6 한 장), paper:{w,h}(한 디자인의 캔버스 크기), mockup, draw(p) }
// cuts는 촬영 장수, slots는 인화되는 사진 수(고른 컷). slots 이하의 사진이 오면 순환해서 채운다.
export const FRAMES = LIST.map((f) => ({ ...f, paper: PAPER[f.layout], sheet: { w: 1200, h: 1800 }, mockup: `/img/frames/${f.id}.jpg` }))

// 운영 화면에서 만든 프레임: 기존 프레임(base)의 배치를 그대로 쓰고 종이색과 글자색만 바꾼다. 같은 id로 다시 부르면 갱신한다.
export function registerFrame({ id, name, bg, fg, cuts, base }) {
  const b = getFrame(base)
  const tone = { ...TONES_FOR(b.tone), name: 'custom', bg, ink: fg, sub: fg, line: fg, accent: fg, onAccent: bg, photoBg: 'rgba(128,128,128,0.15)' }
  const f = { ...b, id, name: { en: name, ko: name }, blurb: { en: name, ko: name }, tone, cuts: cuts || b.cuts, custom: true, mockup: b.mockup }
  const i = FRAMES.findIndex((x) => x.id === id)
  if (i >= 0) FRAMES[i] = f
  else FRAMES.push(f)
  return f
}
const TONES_FOR = (t) => (typeof t === 'string' ? TONES[t] : t)

export const FRAME_IDS = FRAMES.map((f) => f.id)
export const getFrame = (id) => FRAMES.find((f) => f.id === id) || FRAMES[0]
