// site.js: 웹 전체가 공유하는 사실 데이터. 사전 리서치에서 확인된 값만 둔다. 새 수치를 만들지 않는다.
import { lines } from '@urbanedge/ds'

export const SITE = {
  name: 'UrbanEdge Metrography',
  short: 'UrbanEdge',
  tagline: { ko: '렌즈 너머, 거리 속으로', en: 'Beyond the Lens, Into the Streets' },
  taglineEn: 'Beyond the Lens, Into the Streets',
  slogan: 'EVERY SHOT IS A JOURNEY!',
  area: { ko: '경주 황리단길', en: 'Hwangridan-gil, Gyeongju' },
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

// 키오스크 주소. 환경변수가 없는 로컬 개발에서는 같은 호스트의 5185 포트(키오스크 개발 서버)로 연결한다.
export function kioskHref() {
  if (import.meta.env.VITE_KIOSK_URL) return import.meta.env.VITE_KIOSK_URL
  if (import.meta.env.DEV && typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:5185/`
  return SITE.kioskUrl
}

// 가격 표기(7,000원 / ₩7,000)
export const formatPrice = (lang) =>
  lang === 'ko' ? `${SITE.price.base.toLocaleString('ko-KR')}원` : `₩${SITE.price.base.toLocaleString('en-US')}`

// 노선 색 클래스. Tailwind가 클래스 이름을 정적으로 찾을 수 있게 전체 문자열로 둔다.
export const LINE_BG = { yellow: 'bg-line-yellow', red: 'bg-line-red', blue: 'bg-line-blue', green: 'bg-line-green' }
export const LINE_TEXT = { yellow: 'text-line-yellow', red: 'text-line-red', blue: 'text-line-blue', green: 'text-line-green' }
export const LINE_BORDER = { yellow: 'border-line-yellow', red: 'border-line-red', blue: 'border-line-blue', green: 'border-line-green' }

// 방 5곳. 사진은 public/img 아래 실제 파일을 쓴다. photo는 홈과 하위 페이지가 같은 대표 사진을 쓰도록 여기서 정한다.
// 사진 선택 근거: o_18 노란 좌석, o_28 갈색 타일 부스, o_32 통화 화면 거울, o_17 커튼과 나무 의자, o_23 타일 복도와 TOILET SHOT 바닥 글자.
export const ROOMS = [
  { id: 'subway', name: 'SUBWAY', code: lines[0].code, color: lines[0].color,
    title: { ko: '지하철 칸', en: 'Subway Car' },
    summary: { ko: '노란 좌석과 손잡이가 놓인 지하철 객실 세트', en: 'A subway-car set with yellow seats and hand straps' },
    photo: { src: '/img/lg/o_18.jpg', alt: { ko: '파란 타일 벽 앞에 노란 좌석 세 개가 놓인 지하철 방', en: 'Three yellow seats in front of a blue tile wall in the subway room' } } },
  { id: 'karaoke', name: 'KARAOKE SHOT', code: lines[1].code, color: lines[1].color,
    title: { ko: '노래방', en: 'Karaoke Booth' },
    summary: { ko: '마이크를 들고 찍는 노래방 부스', en: 'A karaoke booth made for mic-in-hand poses' },
    photo: { src: '/img/lg/o_28.jpg', alt: { ko: '갈색 타일과 반짝이는 벽면이 있는 노래방 방', en: 'The karaoke room with brown tiles and a glittering wall' } } },
  { id: 'phone', name: 'PUBLIC PHONE', code: lines[2].code, color: lines[2].color,
    title: { ko: '공중전화', en: 'Public Phone' },
    summary: { ko: '수화기를 든 장면을 찍는 공중전화 부스', en: 'A phone-booth set for receiver-in-hand shots' },
    photo: { src: '/img/o_32.jpg', alt: { ko: '통화 화면 모양 프레임 앞에서 거울 속 두 사람이 사진을 찍는 공중전화 방', en: 'Two people photographed in the mirror of the public phone room' } } },
  { id: 'retro', name: 'RETRO', code: lines[3].code, color: lines[3].color,
    title: { ko: '레트로', en: 'Retro' },
    summary: { ko: '커튼과 나무 의자가 있는 레트로 부스', en: 'A retro booth with a curtain and wooden stools' },
    photo: { src: '/img/lg/o_17.jpg', alt: { ko: '갈색 커튼 앞에 나무 의자 두 개가 놓인 레트로 방', en: 'Two wooden stools in front of a brown curtain in the retro room' } } },
  { id: 'toilet', name: 'TOILET', code: lines[4].code, color: lines[4].color,
    title: { ko: '화장실', en: 'Toilet' },
    summary: { ko: '타일 벽 앞에서 찍는 화장실 세트', en: 'A tiled restroom set' },
    photo: { src: '/img/lg/o_23.jpg', alt: { ko: '파란 타일 벽과 바닥의 검은 선이 이어지는 복도', en: 'A tiled corridor with a black guide line running along the floor' } } },
]

export const NAV = [
  { to: '/', label: { ko: '홈', en: 'Home' } },
  { to: '/rooms', label: { ko: '포토 룸', en: 'Rooms' } },
  { to: '/guide', label: { ko: '이용 안내', en: 'How to' } },
  { to: '/visit', label: { ko: '오시는 길', en: 'Visit' } },
  { to: '/gallery', label: { ko: '갤러리', en: 'Gallery' } },
]

// 홈 갤러리 띠에 쓰는 사진. 결과물과 공간 사진을 섞는다. ratio는 가로/세로 비율(CSS aspect-ratio 값)이다.
export const HOME_GALLERY = [
  { src: '/img/lg/o_26.jpg', ratio: '3 / 4', alt: { ko: '손에 든 포토 스트립 두 장', en: 'Two photo strips held in a hand' } },
  { src: '/img/lg/o_52.jpg', ratio: '4 / 5', alt: { ko: '지하철 방에서 찍은 4컷 인화물', en: 'A four-cut print taken in the subway room' } },
  { src: '/img/lg/o_22.jpg', ratio: '3 / 4', alt: { ko: '파란 타일 문틀 너머로 이어지는 복도', en: 'A corridor seen through a blue-tiled doorway' } },
  { src: '/img/o_37.jpg', ratio: '2 / 3', alt: { ko: '지하철 문 앞에서 찍은 4컷 사진', en: 'A four-cut photo shot in front of subway doors' } },
  { src: '/img/lg/o_30.jpg', ratio: '3 / 4', alt: { ko: '바닥에 RETRO SHOT 글자가 있는 복도', en: 'A corridor with RETRO SHOT lettering on the floor' } },
  { src: '/img/o_25.jpg', ratio: '2 / 3', alt: { ko: '붉은 띠를 두른 두 사람의 4컷 사진', en: 'A four-cut photo of two people with red sashes' } },
  { src: '/img/lg/o_24.jpg', ratio: '3 / 4', alt: { ko: '빨간 테두리 볼록 거울과 체커 바닥', en: 'Round red-rimmed mirrors reflecting a checkered floor' } },
  { src: '/img/o_14.jpg', ratio: '4 / 3', alt: { ko: '인화물이 빼곡히 붙은 파란 타일 벽', en: 'A blue tile wall covered with printed photos' } },
]
