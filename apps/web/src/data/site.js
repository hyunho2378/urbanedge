// site.js: 웹 전체가 공유하는 사실 데이터. 사전 리서치와 사용자가 확인한 값만 둔다. 새 수치를 만들지 않는다.
// 서사(docs/NAMING.md): 경주에는 지하철이 없다. 어반엣지는 "Gyeongju Metro, Powered by UrbanEdge"라는 가상의 지하철 관광 경험을 만든다.
// 실제 역은 GY-01 UrbanEdge(황리단길) 하나이고 유료 촬영 방 3곳(지하철, 노래방, 레트로)이 그 역의 승강장 1부터 3이다. 놀이로 만든 브랜드 설정이며 실제 대중교통이 아니다.

export const SITE = {
  name: 'UrbanEdge Metrography',
  short: 'UrbanEdge',
  tagline: { en: 'Beyond the Lens, Into the Streets', ko: '렌즈 너머, 거리 속으로' },
  taglineEn: 'Beyond the Lens, Into the Streets',
  slogan: 'EVERY SHOT IS A JOURNEY!',
  area: { en: 'Hwangridan-gil, Gyeongju', ko: '경주 황리단길' },
  address: {
    en: '6, Poseok-ro 1079beon-gil, Gyeongju-si, Gyeongbuk',
    ko: '경북 경주시 포석로1079번길 6',
  },
  hours: { open: '10:00', close: '24:00' },
  price: { base: 7000, prints: 2 },
  instagram: { handle: '@__urbanedge', url: 'https://www.instagram.com/__urbanedge/' },
  naverPlace: 'https://m.place.naver.com/place/1432247982',
  maps: {
    naver: 'https://map.naver.com/p/search/%EC%96%B4%EB%B0%98%EC%97%A3%EC%A7%80%20%EA%B2%BD%EC%A3%BC',
    google: 'https://www.google.com/maps/search/?api=1&query=UrbanEdge+Metrography+Gyeongju',
  },
  kioskUrl: import.meta.env.VITE_KIOSK_URL || 'https://urbanedge-kiosk.vercel.app/',
  // 공유 뒤 열리는 스크래치 쿠폰. 코드는 키오스크가 받아 주는 값으로 매장과 확정해야 한다(혜택 금액은 정하지 않았다).
  coupon: { code: 'GY01-SHARE' },
}

// 시스템과 첫 역. 노선 코드는 GY(Gyeongju), 첫 역은 GY-01 UrbanEdge다.
export const LINE = { id: 'gyeongju-metro', code: 'GY', color: 'yellow', name: { en: 'Gyeongju Metro', ko: '경주 메트로' } }
export const STATION = {
  id: 'gy-01',
  code: 'GY-01',
  name: { en: 'UrbanEdge', ko: '어반엣지' },
  nameKo: '어반엣지역',
  area: { en: 'Hwangridan-gil', ko: '황리단길' },
}
export const MOTTO = { en: 'Explore Gyeongju, One Station at a Time.', ko: '한 정거장씩 경주를 탐험한다' }
// 가상 서사 고지. 화면에 눈에 띄게 둔다(docs/NAMING.md).
export const DISCLAIMER = {
  en: 'Imaginary Metro · Travel Experience',
  ko: 'Imaginary Metro · Travel Experience (가상의 지하철 관광 경험)',
}

// 노선도의 정거장. GY-01만 실제 부스가 있다. 나머지는 컨셉 설명용 후보 관광지(Concept stop)이며 열렸다고 말하지 않는다.
export const METRO_STOPS = [
  {
    id: 'gy-01', code: 'GY-01', real: true, name: STATION.name, nameKo: STATION.nameKo, area: STATION.area,
    summary: {
      en: 'A self-service photo studio with three rooms, open 10:00 to 24:00.',
      ko: '촬영 방 세 곳이 있는 셀프 사진관이다. 10:00부터 24:00까지 운영한다.',
    },
    photo: { src: '/img/place/naver-15.jpg', alt: { en: 'The UrbanEdge storefront on the corner of the street', ko: '골목 모퉁이의 어반엣지 매장 외관' } },
  },
  { id: 'gy-02', code: 'GY-02', real: false, name: { en: 'Daereungwon', ko: '대릉원' }, nameKo: '대릉원역', area: { en: 'Tomb complex', ko: '고분군' } },
  { id: 'gy-03', code: 'GY-03', real: false, name: { en: 'Cheomseongdae', ko: '첨성대' }, nameKo: '첨성대역', area: { en: 'Observatory', ko: '천문대' } },
  { id: 'gy-04', code: 'GY-04', real: false, name: { en: 'Donggung and Wolji', ko: '동궁과 월지' }, nameKo: '동궁과 월지역', area: { en: 'Palace and pond', ko: '궁궐과 연못' } },
].map((st) =>
  st.real
    ? st
    : {
        ...st,
        summary: {
          en: 'A sight on the Gyeongju Metro map.',
          ko: '경주 메트로 노선도에 그려 넣은 관광지.',
        },
      },
)
export const stopById = (id) => METRO_STOPS.find((s) => s.id === id)

// 키오스크 주소. 환경변수가 없는 로컬 개발에서는 같은 호스트의 5185 포트(키오스크 개발 서버)로 연결한다.
export function kioskHref() {
  if (import.meta.env.VITE_KIOSK_URL) return import.meta.env.VITE_KIOSK_URL
  if (import.meta.env.DEV && typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:5185/`
  return SITE.kioskUrl
}

export const formatPrice = (lang) =>
  lang === 'ko' ? `${SITE.price.base.toLocaleString('ko-KR')}원` : `₩${SITE.price.base.toLocaleString('en-US')}`

// 노선 색 클래스. Tailwind가 클래스 이름을 정적으로 찾을 수 있게 전체 문자열로 둔다.
export const LINE_BG = { yellow: 'bg-line-yellow', red: 'bg-line-red', blue: 'bg-line-blue', green: 'bg-line-green', white: 'bg-white' }
export const LINE_TEXT = { yellow: 'text-line-yellow', red: 'text-line-red', blue: 'text-line-blue', green: 'text-line-green', white: 'text-white' }
export const LINE_BORDER = { yellow: 'border-line-yellow', red: 'border-line-red', blue: 'border-line-blue', green: 'border-line-green', white: 'border-white' }
// 승강장 번호 배지에서 색 위에 올리는 글자색
export const LINE_ON = { yellow: 'text-text-onYellow', red: 'text-text-pri', blue: 'text-text-pri', green: 'text-text-onYellow', white: 'text-text-onYellow' }

// 입구. 사진관 안으로 들어가는 시작 정거장이다.
export const ENTRANCE = {
  id: 'entrance',
  title: { en: 'Entrance', ko: '입구' },
  summary: {
    en: 'Black cones, yellow tape and a checkerboard floor. If you see them, you are on the platform.',
    ko: '검은 고깔과 노란 테이프, 체커보드 바닥이 보이면 제대로 찾아온 것이다.',
  },
  concept: {
    en: 'Black cones, yellow tape and a checkerboard floor: the line starts here. If you can see them, you are at UrbanEdge Station.',
    ko: '검은 고깔과 노란 테이프, 체커보드 바닥에서 노선이 시작된다. 이것들이 보이면 어반엣지역에 제대로 도착한 것이다.',
  },
  pose: { en: 'Stand on the checkerboard between the cones and look back at the street.', ko: '고깔 사이 체커보드 바닥에 서서 길 쪽을 돌아본다.' },
  why: { en: 'Yellow tape, black cones and the black-and-white floor are the brand in one frame.', ko: '노란 테이프와 검은 고깔, 흑백 바닥이 브랜드의 색을 한 컷에 담아 준다.' },
  photo: { src: '/img/place/naver-14.jpg', alt: { en: 'Black cones, yellow caution tape and a checkerboard floor at the entrance', ko: '검은 고깔과 노란 경고 테이프, 체커보드 바닥이 놓인 입구' } },
}

// 승강장 3곳(Platform 1부터 3, GY-01 UrbanEdge 안). 사진은 public/img 아래 실제 파일이다(place는 네이버 플레이스, ig는 인스타그램 공개 사진). concept, pose, why는 사진에서 확인한 것만 쓴다.
const P = (n, alt) => ({ src: `/img/place/naver-${n}.jpg`, alt })
export const ROOMS = [
  {
    id: 'subway', platform: 1, name: 'SUBWAY SHOT', code: '1', color: 'yellow',
    title: { en: 'Subway Shot', ko: '지하철 샷' },
    summary: { en: 'Steel train doors, grab rails and an overhead strap', ko: '스테인리스 열차 문과 손잡이 봉, 천장 손잡이 줄이 있는 지하철 객실 세트' },
    concept: {
      en: 'Brushed-steel doors, a grab rail and a hanging strap: a Seoul commute without the rush. Step into the doorway and the whole shot is already framed for you.',
      ko: '스테인리스 문과 손잡이 봉, 천장의 손잡이 줄로 꾸민 지하철 객실이다. 문 앞에 서기만 해도 출근길 장면이 그대로 완성된다.',
    },
    pose: { en: 'Hold the strap with one hand and stare out the window like the train just left.', ko: '한 손으로 손잡이 줄을 잡고 방금 떠난 열차를 바라보는 표정을 짓는다.' },
    why: { en: 'Cool steel and white tile give a clean backdrop, so a coat or a bright bag does the talking.', ko: '차가운 스테인리스와 흰 타일이 배경을 깔끔하게 받쳐 줘서 외투나 가방 색이 먼저 눈에 들어온다.' },
    photo: P('23', { en: 'Steel train doors under a strap rail in the Subway Shot room', ko: '손잡이 줄 아래 스테인리스 열차 문이 있는 지하철 샷 방' }),
    photos: [
      P('13', { en: 'Steel doors with a round-cornered window', ko: '둥근 모서리 창이 달린 스테인리스 문' }),
      P('21', { en: 'The subway room seen from the doorway', ko: '문가에서 본 지하철 방' }),
      { src: '/img/ig/ig-04.jpg', alt: { en: 'A four-cut strip shot in this room', ko: '이 방에서 찍은 4컷 스트립' } },
    ],
  },
  {
    id: 'karaoke', platform: 2, name: 'KARAOKE SHOT', code: '2', color: 'red',
    title: { en: 'Karaoke Shot', ko: '노래방 샷' },
    summary: { en: 'Brown tile, glitter wall and a pegboard of props', ko: '갈색 타일과 반짝이는 벽, 소품이 걸린 페그보드가 있는 노래방 부스' },
    concept: {
      en: 'A noraebang booth with the singing removed. Brown tiles, flecks of disco light and a pegboard of props: a gold microphone, heart-shaped sunglasses, a tambourine. Grab something and the room does the rest.',
      ko: '노래는 빼고 분위기만 남긴 노래방 부스다. 갈색 타일과 반짝이는 조명 벽 앞에서 금색 마이크, 하트 선글라스, 탬버린 같은 소품을 골라 들면 된다.',
    },
    pose: { en: 'Everyone gets a prop and a verse. One person sings into the mic, the rest are backup.', ko: '모두 소품을 하나씩 들고 한 명은 마이크 앞에서 노래하고 나머지는 코러스를 맡는다.' },
    why: { en: 'Warm brown walls flatter skin tones, and the moving light flecks make every frame look slightly different.', ko: '따뜻한 갈색 벽이 피부 톤을 받쳐 주고 조명 빛이 컷마다 다르게 들어와서 사진이 단조롭지 않다.' },
    photo: P('22', { en: 'Brown tiles and a glittering wall in the Karaoke Shot room', ko: '갈색 타일과 반짝이는 벽이 있는 노래방 샷 방' }),
    photos: [
      P('06', { en: 'The prop pegboard with a gold microphone and a tambourine', ko: '금색 마이크와 탬버린이 걸린 소품 페그보드' }),
      P('09', { en: 'The KARAOKE SHOT sign beside the kiosk', ko: '키오스크 옆 KARAOKE SHOT 표지' }),
      { src: '/img/team/shot-2.jpg', alt: { en: 'The UrbanEdge team in the karaoke room', ko: '노래방에서 찍은 어반엣지 팀' } },
    ],
  },
  {
    id: 'retro', platform: 3, name: 'RETRO SHOT', code: '3', color: 'green',
    title: { en: 'Retro Shot', ko: '레트로 샷' },
    summary: { en: 'A brown curtain and two wooden stools', ko: '갈색 커튼과 나무 의자 두 개가 있는 레트로 부스' },
    concept: {
      en: 'The old photo booth, rebuilt: a heavy brown curtain and two wooden stools. Sit close, because there is no room for personal space and that is the point.',
      ko: '옛날 증명사진 부스를 다시 만든 공간이다. 갈색 커튼과 나무 의자 두 개뿐이라 서로 바싹 붙어 앉게 된다.',
    },
    pose: { en: 'Squeeze onto the stools, cheek to cheek, and look straight at the lens.', ko: '의자에 붙어 앉아 볼을 맞대고 렌즈를 정면으로 본다.' },
    why: { en: 'A plain curtain keeps all the attention on faces, which is why the close-ups from this room look so good.', ko: '배경이 단순해서 얼굴에 시선이 모이고 클로즈업 컷이 잘 나온다.' },
    photo: P('33', { en: 'Two wooden stools in front of a brown curtain in the Retro Shot room', ko: '갈색 커튼 앞에 놓인 나무 의자 두 개' }),
    photos: [
      P('11', { en: 'The curtain, the stools and a gold box', ko: '커튼과 나무 의자, 금색 상자' }),
      { src: '/img/ig/ig-05.jpg', alt: { en: 'A four-cut strip shot in this room', ko: '이 방에서 찍은 4컷 스트립' } },
    ],
  },
]

// 승강장 전체. 노선도, 출발 안내판, 역명판이 이 목록을 쓴다.
export const PLATFORMS = ROOMS
export const platformById = (id) => ROOMS.find((r) => r.id === id)

export const NAV = [
  { to: '/rooms', label: { en: 'Rooms', ko: '촬영 방' } },
  { to: '/guide', label: { en: 'How to', ko: '이용 방법' } },
  { to: '/visit', label: { en: 'Visit', ko: '오시는 길' } },
]
export const FOOT_LINKS = [
  { to: '/gallery', label: { en: 'Gallery', ko: '갤러리' } },
  { to: '/brand', label: { en: 'Brand', ko: '브랜드' } },
]

// 홈에서 쓰는 공개 사진. public/img/ig의 index.json에 출처가 있다. 업주 본인 게시물이다.
export const IG = (n) => `/img/ig/ig-${String(n).padStart(2, '0')}`
export const IG_PHOTOS = [
  { id: 'ig-04', src: '/img/ig/ig-04.jpg', ratio: '1 / 1', room: 'subway', alt: { en: 'A four-cut strip shot in the subway room', ko: '지하철 방에서 찍은 4컷 스트립' } },
  { id: 'ig-07', src: '/img/ig/ig-07.jpg', ratio: '1 / 1', room: 'karaoke', alt: { en: 'An eight-cut strip in a blue frame from the karaoke room', ko: '노래방에서 찍은 파란 프레임의 8컷 스트립' } },
  { id: 'ig-08', src: '/img/ig/ig-08.jpg', ratio: '1 / 1', room: 'retro', alt: { en: 'A holiday-themed retro strip on black', ko: '검은 바탕에 눈송이를 얹은 레트로 스트립' } },
  { id: 'ig-10', src: '/img/ig/ig-10.jpg', ratio: '1 / 1', room: 'karaoke', alt: { en: 'An eight-cut karaoke strip on a black frame', ko: '검은 프레임의 노래방 8컷 스트립' } },
  { id: 'ig-05', src: '/img/ig/ig-05.jpg', ratio: '1 / 1', room: 'retro', alt: { en: 'A four-cut retro strip in a red knit', ko: '레트로 방에서 찍은 4컷 스트립' } },
  { id: 'ig-09', src: '/img/ig/ig-09.jpg', ratio: '1 / 1', room: null, alt: { en: 'A collage of the entrance and tiled walls for the holiday season', ko: '입구와 타일 벽을 콜라주한 연말 게시물' } },
]
export const TEAM_SHOTS = [1, 2, 3, 4, 5].map((n) => `/img/team/shot-${n}.jpg`)
