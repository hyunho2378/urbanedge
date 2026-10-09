// content.js: W2 하위 페이지가 공유하는 데이터와 문구.
// 영문은 영어로 먼저 쓰고, 한국어는 따로 쓴다(docs/VOICE.md). 사실은 data/site.js와 현장 사진에서 확인된 것만 쓴다.
// 시스템은 Gyeongju Metro(GY)이고 역은 GY-01 UrbanEdge 하나다. 유료 촬영 방 세 곳이 승강장 1부터 3이고 시간을 거슬러 가는 순서(1 Subway 2000년대, 2 Karaoke 2008, 3 Retro 1968)다. 가상의 관광 경험이며 공공 교통이 아니다.

// 시스템은 Gyeongju Metro(코드 GY)이고, 실제 역은 GY-01 UrbanEdge(황리단길) 하나다. 방 네 곳이 역 안의 승강장 1부터 4다.
// 가상의 관광 경험이며 실제 교통시설이나 공식 역이 아니다. 화면에는 항상 "Imaginary Metro · Travel Experience" 고지를 둔다.
import { ROOM_NETWORK } from '@urbanedge/ds'

export const METRO = { code: 'GY', name: 'Gyeongju Metro', nameKo: '경주 메트로' }
export const STATION = { code: 'GY-01', name: 'UrbanEdge', nameKo: '어반엣지', area: { en: 'Hwangridan-gil', ko: '황리단길' } }
export const NOTICE = { en: 'Imaginary Metro \u00b7 Travel Experience', ko: '가상의 지하철 관광 경험입니다' }
// 승강장 포인트색: 노랑, 빨강, 파랑, 초록
export const ACCENT = {
  yellow: { bg: 'bg-yellow', fg: 'text-text-onYellow', text: 'text-yellow', stroke: 'stroke-yellow' },
  red: { bg: 'bg-line-red', fg: 'text-text-pri', text: 'text-line-red', stroke: 'stroke-line-red' },
  blue: { bg: 'bg-line-blue', fg: 'text-text-pri', text: 'text-line-blue', stroke: 'stroke-line-blue' },
  green: { bg: 'bg-line-green', fg: 'text-text-onYellow', text: 'text-line-green', stroke: 'stroke-line-green' },
  white: { bg: 'bg-white', fg: 'text-black', text: 'text-text-pri', stroke: 'stroke-white' },
}

// 사용자가 준 실제 링크
export const NAVER_PLACE = 'https://m.place.naver.com/place/1432247982'
export const INSTAGRAM = 'https://www.instagram.com/__urbanedge/'

// ---------------------------------------------------------------------------
// 사진
// ---------------------------------------------------------------------------
// public/img/lg 에 큰 원본이 있는 파일
const LARGE = new Set([
  'o_01', 'o_02', 'o_04', 'o_05', 'o_17', 'o_18', 'o_19', 'o_20', 'o_21', 'o_22', 'o_23', 'o_24',
  'o_26', 'o_27', 'o_28', 'o_29', 'o_30', 'o_31', 'o_52', 'biz_00', 'biz_02', 'biz_07', 'biz_09',
])

// [너비, 높이, 분류, 영문 대체 텍스트, 한국어 대체 텍스트]
const RAW = {
  o_21: [1100, 825, 'space', 'The storefront: black front, UrbanEdge sign, checkerboard step', '검은 외관과 UrbanEdge 간판, 체커보드 문턱이 보이는 매장 외관'],
  o_34: [825, 1100, 'space', 'The alley view of the entrance with its checkerboard floor', '골목에서 본 입구와 체커보드 바닥'],
  o_24: [825, 1100, 'space', 'A wall of round red mirrors reflecting the checkerboard floor', '체커보드 바닥이 비치는 둥근 빨간 거울 벽'],
  o_43: [825, 1100, 'space', 'Round red-rimmed mirrors above the checkerboard floor', '체커보드 바닥 위에 걸린 빨간 테두리의 둥근 거울'],
  o_18: [1100, 825, 'space', 'Yellow seats in front of blue and white tiled walls', '파란 타일과 하얀 타일 벽 앞의 노란 의자'],
  o_36: [825, 1100, 'space', 'Three yellow seats under a blue tile band', '파란 타일 띠 아래 놓인 노란 의자 세 개'],
  o_35: [825, 1100, 'space', 'Traffic cones on a checkerboard floor in front of a caution-taped shutter', '경고 테이프를 두른 셔터 앞 체커보드 바닥의 라바콘'],
  o_20: [825, 1100, 'space', 'A caution-taped shutter with two cones and a checkerboard floor', '경고 테이프를 두른 셔터와 라바콘, 체커보드 바닥'],
  o_44: [825, 1100, 'space', 'A blue tiled wall covered in a route-map poster and guest prints', '노선도 포스터와 손님 인화물이 가득 붙은 파란 타일 벽'],
  o_17: [825, 1100, 'room', 'Retro room: brown curtain, two wooden stools and a crate', '갈색 커튼과 나무 의자 두 개, 나무 상자가 있는 레트로 방'],
  o_39: [825, 1100, 'room', 'A brown curtain with two round wooden stools', '갈색 커튼과 둥근 나무 의자 두 개'],
  o_29: [825, 1100, 'room', 'Subway room: hand-strap rail, steel doors, benches on both sides', '손잡이 봉과 스테인리스 문, 양옆 벤치가 있는 지하철 방'],
  o_27: [825, 1100, 'room', 'A steel door frame opening onto the subway car doors', '스테인리스 문틀 너머로 지하철 문이 보이는 방'],
  o_19: [825, 1100, 'room', 'Steel subway doors with windows and prints taped above', '창이 달린 스테인리스 지하철 문과 문 위에 붙은 인화물'],
  o_41: [825, 1100, 'room', 'Steel subway doors with white hand straps', '하얀 손잡이가 걸린 스테인리스 지하철 문'],
  o_28: [825, 1100, 'room', 'Karaoke room: brown tile, sequin curtain, mirror ball, white bench', '갈색 타일과 장식 커튼, 미러볼, 흰 벤치가 있는 노래방'],
  o_10: [900, 506, 'room', 'The KARAOKE SHOT sign beside a white kiosk', 'KARAOKE SHOT 간판 옆의 흰색 키오스크'],
  o_31: [825, 1100, 'room', 'A pegboard shelf with a gold mic, tambourine and heart props', '금색 마이크와 탬버린, 하트 소품이 놓인 타공판 선반'],
  o_40: [825, 1100, 'room', 'Brown tile, a song list board and a white bench', '갈색 타일 벽과 노래 목록판, 흰 벤치'],
  o_30: [825, 1100, 'room', 'A booth window under the PUBLIC PHONE sign, wall covered in prints', 'PUBLIC PHONE 간판 아래 창구와 인화물로 덮인 벽'],
  o_49: [900, 676, 'room', 'The call-screen decoration above the steel door frame', '스테인리스 문틀 위에 떠 있는 수신 화면 장식'],
  o_26: [825, 1100, 'print', 'Two four-cut prints held up against brown tile', '갈색 타일 벽 앞에서 들어 보인 네 칸 인화물 두 장'],
  o_52: [880, 1100, 'print', 'A four-cut print held up in front of the taped shutter', '경고 테이프 셔터 앞에서 들어 보인 네 칸 인화물'],
  o_37: [733, 1100, 'print', 'A four-cut print shot at the subway doors', '지하철 문 앞에서 찍은 네 칸 인화물'],
  o_25: [733, 1100, 'print', 'A four-cut print shot against brown tile', '갈색 타일 벽 앞에서 찍은 네 칸 인화물'],
  biz_02: [779, 1100, 'poster', 'Poster: UrbanEdge logo over an aerial crosswalk', '횡단보도 항공 사진 위에 UrbanEdge 로고를 올린 포스터'],
  biz_07: [780, 1100, 'poster', 'Yellow poster with the UrbanEdge logo', '노란 바탕에 UrbanEdge 로고를 올린 포스터'],
}

const make = (id) => {
  const [w, h, kind, en, ko] = RAW[id]
  const thumb = `/img/${id}.jpg`
  return { id, thumb, full: LARGE.has(id) ? `/img/lg/${id}.jpg` : thumb, w, h, kind, alt: { en, ko } }
}
export const photo = (id) => make(id)

// 사용자 공개 인스타그램 사진(img/ig). 업주 본인 게시물이다. 640px 정사각 썸네일.
const IG = {
  'ig-04.jpg': ['SUBWAY SHOT strip: four cuts at the steel doors', 'SUBWAY SHOT 스트립, 스테인리스 문 앞에서 찍은 네 컷', 'DJBriMPJ4Kc'],
  'ig-05.jpg': ['RETRO SHOT strip: four close cuts of two friends', 'RETRO SHOT 스트립, 두 친구의 네 컷', 'DH2oxm0pzS0'],
  'ig-06.jpg': ['KARAOKE SHOT strip: four cuts in front of the brown tile', 'KARAOKE SHOT 스트립, 갈색 타일 앞 네 컷', 'DGmkVnlJheX'],
  'ig-07.jpg': ['A blue eight-cut strip from the karaoke room', '노래방에서 찍은 파란 프레임의 여덟 컷 스트립', 'DFXhlE1PA5s'],
  'ig-08.jpg': ['RETRO SHOT winter edition with a Santa hat on the title', '제목에 산타 모자를 얹은 RETRO SHOT 겨울 프레임', 'DDa7--hPePE'],
  'ig-09.jpg': ['XMAS PARTY poster with the photo zone', '포토존이 담긴 XMAS PARTY 포스터', 'DC1PxS8vQzP'],
  'ig-10.jpg': ['A black eight-cut strip, KARAOKE SHOT', '검은 프레임의 KARAOKE SHOT 여덟 컷 스트립', 'DA-AUxEPN-3'],
  'ig-11.jpg': ['A white four-cut strip, KARAOKE SHOT', '하얀 프레임의 KARAOKE SHOT 네 컷 스트립', 'DA9-Rq6vHWj'],
  'ig-12.jpg': ['A white four-cut strip, KARAOKE SHOT', '하얀 프레임의 KARAOKE SHOT 네 컷 스트립', 'DA9-Rq6vHWj'],
}
export const IG_PHOTOS = Object.entries(IG).map(([file, [en, ko, code]]) => ({
  id: file.replace('.jpg', ''),
  thumb: `/img/ig/${file}`,
  full: `/img/ig/${file}`,
  w: 640,
  h: 640,
  kind: file === 'ig-09.jpg' ? 'poster' : 'print',
  alt: { en, ko },
  source: `https://www.instagram.com/__urbanedge/p/${code}/`,
}))

// 팀 인화 사진(img/team). 키오스크 샘플로도 쓰는 실제 사진이다.
export const TEAM_PHOTOS = [1, 2, 3, 4, 5].map((n) => ({
  id: `shot-${n}`,
  thumb: `/img/team/shot-${n}.jpg`,
  full: `/img/team/shot-${n}.jpg`,
  w: n === 5 ? 1070 : 510,
  h: n === 5 ? 1420 : n >= 3 ? 676 : 678,
  kind: 'team',
  alt: {
    en: 'The team in the karaoke room with heart props, a gold mic and tinted glasses',
    ko: '하트 소품과 금색 마이크, 컬러 안경을 쓰고 노래방에서 찍은 팀 사진',
  },
}))

export const GALLERY_FILTERS = [
  { id: 'all', label: { en: 'All', ko: '전체' } },
  { id: 'rooms', label: { en: 'Rooms', ko: '포토 룸' } },
  { id: 'prints', label: { en: 'Prints', ko: '인화물' } },
  { id: 'space', label: { en: 'Space', ko: '공간' } },
]

// ---------------------------------------------------------------------------
// 정거장(방) 데이터. 영문 먼저, 한국어는 따로 쓴 문장이다.
// ---------------------------------------------------------------------------
const ALL = [
  {
    id: 'entrance',
    name: 'EXIT 1',
    title: { en: 'Exit 1', ko: '1번 출구' },
    vibe: { en: 'The checkerboard doorstep', ko: '체커보드 문턱' },
    story: {
      en: 'A black front with the UrbanEdge sign, and a checkerboard floor that works as a backdrop before you have paid for anything. Behind the glass, a wall packed with round red mirrors bends the alley into tiny fisheye copies of you. Walk straight in, the rooms are further back.',
      ko: '검은 외관에 UrbanEdge 간판이 붙어 있고 바닥은 체커보드 무늬다. 유리 너머에는 둥근 빨간 거울이 벽을 가득 채우고 있어 골목과 내 모습이 작은 어안 렌즈 화면처럼 겹쳐 보인다. 방은 이 안쪽에 이어지므로 곧장 들어가면 된다.',
    },
    why: {
      en: 'Black, white and red stay loud in any light, so even a quick phone snap here looks planned.',
      ko: '검정과 하양, 빨강의 대비가 어떤 빛에서도 또렷해서 휴대폰으로 급하게 찍어도 연출한 사진처럼 나온다.',
    },
    props: [
      { en: 'Checkerboard step', ko: '체커보드 문턱' },
      { en: 'Round red mirrors', ko: '둥근 빨간 거울' },
      { en: 'Caution-taped shutter', ko: '경고 테이프 셔터' },
    ],
    photos: ['o_21', 'o_24', 'o_34', 'o_43', 'o_35', 'o_20'],
  },
  {
    id: 'subway',
    no: 1,
    accent: 'yellow',
    era: { en: '2000s · The Present', ko: '2000년대 · 현재' },
    name: 'SUBWAY SHOT',
    title: { en: 'Subway Shot', ko: '지하철 샷' },
    vibe: { en: 'Doors closing. Hold on.', ko: '닫히는 문 앞의 승객' },
    story: {
      en: 'Steel doors with small windows, a rail of white hand straps overhead and a steel bench on each side. It is a Seoul subway car with no train attached. Stand in the doorway, grab a strap and let the lens play the platform. Prints from earlier guests are taped above the doors, so you never ride alone.',
      ko: '작은 창이 달린 스테인리스 문, 머리 위에 걸린 하얀 손잡이, 양옆으로 놓인 철제 벤치까지 서울 지하철 객실을 그대로 옮긴 방이다. 문 앞에서 손잡이를 잡으면 렌즈가 곧 승강장이 되고, 문 위에는 먼저 다녀간 손님의 인화물이 붙어 있어 혼자 타는 느낌이 들지 않는다.',
    },
    why: {
      en: 'Brushed steel bounces light back onto your face, and the straight door frame lines you up like a poster.',
      ko: '스테인리스가 빛을 얼굴 쪽으로 되돌려 주고, 문틀의 직선이 인물을 포스터처럼 가운데로 모아 준다.',
    },
    props: [
      { en: 'Steel car doors', ko: '스테인리스 객실 문' },
      { en: 'Hand straps', ko: '손잡이' },
      { en: 'Side benches', ko: '양옆 벤치' },
    ],
    photos: ['o_29', 'o_27', 'o_19', 'o_41', 'o_37'],
    poses: [
      { id: 'strap-hang', title: { en: 'Strap hang', ko: '손잡이에 매달리기' }, desc: { en: 'One hand up on a strap, eyes on the lens as if it were the window.', ko: '한 손으로 손잡이를 잡고 렌즈를 창밖처럼 바라본다.' } },
      { id: 'doors-closing', title: { en: 'Doors closing', ko: '문 사이로 뛰어들기' }, desc: { en: 'Squeeze in sideways between the doors and look startled.', ko: '문틈에 몸을 비스듬히 끼우고 놀란 표정을 짓는다.' } },
      { id: 'bench-nap', title: { en: 'Bench nap', ko: '벤치에서 졸기' }, desc: { en: 'Slump on the bench, chin down, like you missed your stop.', ko: '벤치에 기대어 고개를 떨구고 정거장을 지나친 사람처럼 앉는다.' } },
    ],
  },
  {
    id: 'karaoke',
    no: 2,
    accent: 'red',
    era: { en: '2008 · The Memory', ko: '2008 · 추억' },
    name: 'KARAOKE SHOT',
    title: { en: 'Karaoke Shot', ko: '노래방 샷' },
    vibe: { en: 'Brown tile, mirror ball, one more song', ko: '한 곡만 더 부르는 갈색 타일 방' },
    story: {
      en: 'Floor-to-ceiling brown tile, a curtain of glittering sequins and a pink mirror ball over a white bench. A song list hangs on the wall, and a shelf holds a gold mic and a tambourine, plus heart-shaped props. Grab the mic, hit the chorus and sing it straight at the lens.',
      ko: '바닥부터 천장까지 갈색 타일이 이어지고, 반짝이는 장식 커튼과 분홍색 미러볼이 흰 벤치 위에 걸려 있다. 벽에는 노래 목록판이 붙어 있고 선반에는 금색 마이크와 탬버린, 하트 모양 소품이 놓여 있으니 마이크를 들고 후렴을 부르는 얼굴로 렌즈를 향하면 된다.',
    },
    why: {
      en: 'The warm brown wall flatters skin, the sequins throw flecks of colour across faces, and one bench fits a whole group.',
      ko: '따뜻한 갈색 벽이 피부색을 부드럽게 받쳐 주고, 장식 커튼이 얼굴 위에 작은 색 점을 흩뿌리며, 벤치 하나에 일행이 모두 들어온다.',
    },
    props: [
      { en: 'Gold mic and tambourine', ko: '금색 마이크와 탬버린' },
      { en: 'Sequin curtain', ko: '장식 커튼' },
      { en: 'Mirror ball', ko: '미러볼' },
    ],
    photos: ['o_28', 'o_10', 'o_31', 'o_26', 'o_40'],
    poses: [
      { id: 'chorus-face', title: { en: 'Chorus face', ko: '후렴 부르기' }, desc: { en: 'Mic at your chin, eyes shut, give the last line everything.', ko: '마이크를 턱 가까이 대고 눈을 감은 채 마지막 소절을 온 힘으로 부른다.' } },
      { id: 'tambourine-shake', title: { en: 'Tambourine shake', ko: '탬버린 흔들기' }, desc: { en: 'Tambourine beside your ear, shoulders bouncing.', ko: '탬버린을 귀 옆에 들고 어깨를 들썩인다.' } },
      { id: 'song-queue', title: { en: 'Song queue', ko: '다음 곡 고르기' }, desc: { en: 'Sit shoulder to shoulder and point at the song list as if arguing over the next track.', ko: '벤치에 어깨를 맞대고 앉아 노래 목록판을 가리키며 다음 곡을 두고 다투는 시늉을 한다.' } },
    ],
  },
  {
    id: 'retro',
    no: 3,
    accent: 'green',
    era: { en: '1968 · The Roots', ko: '1968 · 뿌리' },
    name: 'RETRO SHOT',
    title: { en: 'Retro Shot', ko: '레트로 샷' },
    vibe: { en: 'A photo studio from some other decade', ko: '다른 시대의 사진관' },
    story: {
      en: 'A heavy brown curtain, two round wooden stools and a wooden crate against a white wall, and nothing else. That is the whole idea. Sit down, tilt your head and let the plain backdrop keep your face as the subject.',
      ko: '무거운 갈색 커튼과 둥근 나무 의자 두 개, 나무 상자 하나가 하얀 벽 앞에 놓여 있고 그게 전부다. 의자에 앉아 고개를 살짝 기울이면 단순한 배경이 얼굴을 주인공으로 남겨 준다.',
    },
    why: {
      en: 'With no clutter behind you, expressions carry the shot, which makes this the room for a straight portrait.',
      ko: '뒤에 어지러운 소품이 없어 표정이 사진을 이끌기 때문에 정직한 인물 사진을 남기기에 좋다.',
    },
    props: [
      { en: 'Brown curtain', ko: '갈색 커튼' },
      { en: 'Round wooden stools', ko: '둥근 나무 의자' },
      { en: 'Wooden crate', ko: '나무 상자' },
    ],
    photos: ['o_17', 'o_39'],
    poses: [
      { id: 'stool-sit', title: { en: 'Stool sit', ko: '의자 끝에 앉기' }, desc: { en: 'Perch on the edge of a stool, hands on knees, look straight down the lens.', ko: '의자 끝에 걸터앉아 무릎에 손을 얹고 렌즈를 곧게 바라본다.' } },
      { id: 'curtain-peek', title: { en: 'Curtain peek', ko: '커튼 사이로 내다보기' }, desc: { en: 'Pull the curtain aside and lean out with just your face.', ko: '커튼을 한쪽으로 젖히고 얼굴만 내민다.' } },
      { id: 'crate-lean', title: { en: 'Crate lean', ko: '상자에 기대기' }, desc: { en: 'Rest an elbow on the crate and put your weight on one leg.', ko: '상자에 팔꿈치를 얹고 한쪽 다리에 체중을 싣는다.' } },
    ],
  },
].map((s) => ({ ...s, photoList: s.photos.map(make) }))

export const EXIT1 = ALL.find((s) => s.id === 'entrance')
// 승강장 번호는 시간을 거슬러 가는 순서(1 Subway, 2 Karaoke, 3 Retro)다. 정의 순서와 무관하게 번호 순으로 낸다.
export const PLATFORMS = ALL.filter((s) => s.id !== 'entrance').sort((a, b) => a.no - b.no)
export const STATIONS = PLATFORMS
export const findStation = (id) => PLATFORMS.find((s) => s.id === id)

// 방 노선도: 작업 M의 기본 네트워크(역 하나와 승강장 선로 네 개)에서 허브 코드와 노선 이름만 GY 체계로 바꾼다.
export const NETWORK = {
  ...ROOM_NETWORK,
  lines: ROOM_NETWORK.lines.map((ln) => ({
    ...ln,
    stations: ln.stations.map((st) => {
      if (st.id === 'urbanedge') return { ...st, code: STATION.code }
      if (st.id === 'h-start') return { ...st, label: METRO.name, labelKo: METRO.nameKo, code: METRO.code }
      return st
    }),
  })),
}

// 네이버 플레이스 공개 사진(img/place, index.json 참조). 고해상도 원본이라 확대 보기에도 쓴다.
// [너비, 높이, 분류, 영문, 한국어]
const PL = {
  'naver-28': [900, 1200, 'space', 'The alley view: black front, checkerboard step and passers-by', '지나가는 사람들과 함께 보이는 골목 쪽 입구, 검은 외관과 체커보드 문턱'],
  'naver-15': [1800, 1350, 'space', 'The storefront seen from the corner, round mirrors behind the glass', '모퉁이에서 본 매장 외관, 유리 너머로 둥근 거울이 보인다'],
  'naver-18': [1350, 1800, 'space', 'Nine round red mirrors over the checkerboard floor', '체커보드 바닥 위에 걸린 빨간 둥근 거울 아홉 개'],
  'naver-12': [1800, 1350, 'space', 'Yellow seats in front of the blue tile band', '파란 타일 띠 앞에 놓인 노란 의자'],
  'naver-19': [900, 1350, 'print', 'A four-cut print on a black frame, shot against brown tile', '갈색 타일 앞에서 찍은 검은 프레임의 네 컷 인화물'],
  'naver-20': [1350, 1800, 'print', 'Two four-cut prints held up in front of the song list', '노래 목록판 앞에서 들어 보인 네 컷 인화물 두 장'],
  'naver-23': [1350, 1800, 'room', 'The subway room from the doorway, hand straps over the doors', '문 앞에서 본 지하철 방, 문 위에 손잡이가 걸려 있다'],
  'naver-24': [1350, 1800, 'room', 'The public phone wall: booth window, prints and a mic stand', '부스 창과 인화물, 마이크 스탠드가 보이는 공중전화 벽'],
  'naver-33': [900, 1200, 'room', 'The retro room: curtain, two stools and a crate', '커튼과 의자 두 개, 나무 상자가 있는 레트로 방'],
  'naver-32': [900, 1200, 'room', 'The subway room bench and hand-strap rail seen from the side', '옆에서 본 지하철 방의 벤치와 손잡이 봉'],
  'naver-22': [1350, 1800, 'room', 'The karaoke room from the doorway, sequin curtain on the right', '문 앞에서 본 노래방, 오른쪽에 장식 커튼이 걸려 있다'],
  'naver-11': [1350, 1800, 'room', 'A brown curtain with two stools and a wooden crate', '갈색 커튼 앞의 나무 의자 두 개와 나무 상자'],
  'naver-10': [900, 506, 'space', 'The UrbanEdge sign above the glass front', '유리 외관 위에 걸린 UrbanEdge 간판'],
  'naver-21': [1350, 1800, 'space', 'A steel door frame in the hall, prints taped around it', '인화물이 붙은 복도의 스테인리스 문틀'],
  'naver-09': [900, 506, 'room', 'The KARAOKE SHOT sign beside the kiosk', 'KARAOKE SHOT 간판 옆의 키오스크'],
  'naver-34': [900, 1200, 'room', 'The karaoke room from the doorway', '문 앞에서 본 노래방'],
  'poster-02': [1275, 1800, 'poster', 'Poster: UrbanEdge logo over an aerial crosswalk', '횡단보도 항공 사진 위에 UrbanEdge 로고를 올린 포스터'],
}
const makePlace = (id) => {
  const [w, h, kind, en, ko] = PL[id]
  const src = `/img/place/${id}.jpg`
  return { id, thumb: src, full: src, w, h, kind, alt: { en, ko }, source: NAVER_PLACE }
}
export const placePhoto = makePlace

// 입구에서 기기까지의 동선(Visit). 실제 위치를 만들지 않고, 확인된 순서만 노선으로 그린다.
export const ROUTE_STOPS = [
  { id: 'alley', code: 'EXIT 1', label: { en: 'Alley', ko: '골목' }, photo: makePlace('naver-28') },
  { id: 'door', code: 'GATE', label: { en: 'Checkerboard step', ko: '체커보드 문턱' }, photo: makePlace('naver-15') },
  { id: 'mirrors', code: 'CONCOURSE', label: { en: 'Red mirrors', ko: '빨간 거울 벽' }, photo: makePlace('naver-18') },
  { id: 'hall', code: 'CONCOURSE', label: { en: 'Yellow seats', ko: '노란 의자 구간' }, photo: makePlace('naver-12') },
  { id: 'room', code: 'PLATFORM', label: { en: 'Your platform', ko: '내 승강장' }, photo: makePlace('naver-34') },
  { id: 'slot', code: 'PRINT', label: { en: 'Print slot', ko: '인화 출구' }, photo: makePlace('naver-20') },
]

// 오시는 길의 네이버 플레이스 사진 띠
export const PLACE_STRIP = ['naver-10', 'naver-21', 'naver-09'].map(makePlace)

// 갤러리 순서: 바깥에서 안쪽으로 들어가는 순서를 따르고, 분류를 섞어 리듬을 만든다.
const G = (...list) => list
export const GALLERY = G(
  makePlace('naver-28'),
  IG_PHOTOS[0],
  make('o_29'),
  makePlace('naver-18'),
  TEAM_PHOTOS[4],
  make('o_28'),
  IG_PHOTOS[3],
  makePlace('naver-15'),
  make('o_17'),
  IG_PHOTOS[5],
  makePlace('naver-20'),
  makePlace('naver-12'),
  TEAM_PHOTOS[0],
  make('o_30'),
  IG_PHOTOS[6],
  makePlace('naver-19'),
  make('o_40'),
  IG_PHOTOS[1],
  make('o_27'),
  IG_PHOTOS[7],
  TEAM_PHOTOS[2],
  make('o_52'),
  IG_PHOTOS[2],
  make('o_19'),
  makePlace('poster-02'),
  IG_PHOTOS[4],
  make('o_37'),
  TEAM_PHOTOS[3],
  make('o_35'),
  IG_PHOTOS[8],
  make('o_31'),
  make('o_49'),
)
