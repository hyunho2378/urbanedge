// site.js: 웹 전체가 공유하는 사실 데이터. 사전 리서치에서 확인된 값만 둔다. 새 수치를 만들지 않는다.
import { lines } from '@urbanedge/ds'

export const SITE = {
  name: 'UrbanEdge Metrography',
  short: 'UrbanEdge',
  tagline: { ko: '렌즈 너머, 거리 속으로', en: 'Beyond the Lens, Into the Streets' },
  slogan: 'EVERY SHOT IS A JOURNEY!',
  address: {
    ko: '경북 경주시 포석로1079번길 6',
    en: '6, Poseok-ro 1079beon-gil, Gyeongju-si, Gyeongbuk',
  },
  hours: { open: '10:00', close: '24:00' },
  price: { base: 7000, prints: 2 },
  instagram: { handle: '@__urbanedge', url: 'https://www.instagram.com/__urbanedge/' },
  maps: {
    naver: 'https://map.naver.com/p/search/%EC%96%B4%EB%B0%98%EC%97%A3%EC%A7%80%20%EA%B2%BD%EC%A3%BC',
    google: 'https://www.google.com/maps/search/?api=1&query=UrbanEdge+Metrography+Gyeongju',
  },
  kioskUrl: import.meta.env.VITE_KIOSK_URL || '/',
}

// 방 5곳. 사진은 public/img 아래 실제 파일을 쓴다.
export const ROOMS = [
  { id: 'subway', name: 'SUBWAY', code: lines[0].code, color: lines[0].color,
    title: { ko: '지하철 칸', en: 'Subway Car' },
    summary: { ko: '노란 좌석과 손잡이가 놓인 지하철 객실 세트', en: 'A subway-car set with yellow seats and hand straps' } },
  { id: 'karaoke', name: 'KARAOKE SHOT', code: lines[1].code, color: lines[1].color,
    title: { ko: '노래방', en: 'Karaoke Booth' },
    summary: { ko: '마이크를 들고 찍는 노래방 부스', en: 'A karaoke booth made for mic-in-hand poses' } },
  { id: 'phone', name: 'PUBLIC PHONE', code: lines[2].code, color: lines[2].color,
    title: { ko: '공중전화', en: 'Public Phone' },
    summary: { ko: '수화기를 든 장면을 찍는 공중전화 부스', en: 'A phone-booth set for receiver-in-hand shots' } },
  { id: 'retro', name: 'RETRO', code: lines[3].code, color: lines[3].color,
    title: { ko: '레트로', en: 'Retro' },
    summary: { ko: '커튼과 나무 의자가 있는 레트로 부스', en: 'A retro booth with a curtain and wooden stools' } },
  { id: 'toilet', name: 'TOILET', code: lines[4].code, color: lines[4].color,
    title: { ko: '화장실', en: 'Toilet' },
    summary: { ko: '타일 벽 앞에서 찍는 화장실 세트', en: 'A tiled restroom set' } },
]

export const NAV = [
  { to: '/', label: { ko: '홈', en: 'Home' } },
  { to: '/rooms', label: { ko: '포토 룸', en: 'Rooms' } },
  { to: '/guide', label: { ko: '이용 안내', en: 'How to' } },
  { to: '/visit', label: { ko: '오시는 길', en: 'Visit' } },
  { to: '/gallery', label: { ko: '갤러리', en: 'Gallery' } },
]
