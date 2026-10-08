import { lines } from '@urbanedge/ds'
import { ROOM_COPY } from './copy.js'

// rooms.js: 방 5곳. 노선 코드와 색은 디자인시스템 lines에서 가져온다.
const NAMES = { subway: 'SUBWAY', karaoke: 'KARAOKE SHOT', phone: 'PUBLIC PHONE', retro: 'RETRO', toilet: 'TOILET' }
// 방 소개 카드에 쓰는 브랜드 포스터와 패턴 이미지(방 사진이 아니다)
const IMAGES = {
  subway: '/img/biz_07.jpg',
  karaoke: '/img/biz_04.jpg',
  phone: '/img/cr_phone.jpg',
  retro: '/img/cr_checker.jpg',
  toilet: '/img/biz_05.jpg',
}

export const ROOMS = lines.map((l) => ({
  id: l.id,
  name: NAMES[l.id],
  code: l.code,
  color: l.color,
  img: IMAGES[l.id],
  copy: ROOM_COPY[l.id],
}))

export const roomById = (id) => ROOMS.find((r) => r.id === id) || ROOMS[0]

// 노선 색 클래스. Tailwind가 정적 문자열을 읽도록 전부 적어 둔다.
export const LINE_BG = {
  yellow: 'bg-line-yellow',
  red: 'bg-line-red',
  blue: 'bg-line-blue',
  green: 'bg-line-green',
}
export const LINE_TEXT = {
  yellow: 'text-line-yellow',
  red: 'text-line-red',
  blue: 'text-line-blue',
  green: 'text-line-green',
}
export const LINE_BORDER = {
  yellow: 'border-line-yellow',
  red: 'border-line-red',
  blue: 'border-line-blue',
  green: 'border-line-green',
}
