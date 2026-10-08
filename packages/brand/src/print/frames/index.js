import { classicWhite, classicBlack, classicBlue, reel, signature } from './baseline.js'
import { transitTicket, nightTicket, pill } from './ticket.js'
import { poster, crosswalk, layer, stack, crossroad } from './poster.js'
import { route, tape, train } from './strip.js'

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

export const FRAME_IDS = FRAMES.map((f) => f.id)
export const getFrame = (id) => FRAMES.find((f) => f.id === id) || FRAMES[0]
