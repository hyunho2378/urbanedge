// story.js: 어반엣지 브랜드 서사와 방문 여정 문구. 출처는 사용자가 준 브랜딩 문서(2026-10-09)이고, 새 사실을 더하지 않았다.
// 시대 태그(era)와 승강장 순서는 data/site.js의 ROOMS가 가진다. 여기에는 방마다 붙는 개념 한 줄과 경험 문장만 둔다.

export const SLOGAN = {
  ko: '시간을 싣고 달리는 열차, 철길 따라 흐르는 우리의 기억',
  en: 'A Time-Traveling Train Ride Through Our Memories',
}

export const BRAND_TITLE = { en: 'UrbanEdge', ko: '어반엣지' }

// 브랜드 정체성 두 가지
export const IDENTITY = [
  {
    id: 'platform',
    title: { en: 'Time-Traveling Platform', ko: '시간여행 플랫폼' },
    body: {
      en: 'More than a place to take photos. The moment you open the door, you board into the history and memories of Korean railways.',
      ko: '단순히 사진을 찍는 공간이 아니다. 문을 열고 들어서는 순간 한국 철도의 역사와 추억 속으로 승차하는 공간 경험이다.',
    },
  },
  {
    id: 'journey',
    title: { en: 'Chronological Journey', ko: '시공간의 압축' },
    body: {
      en: 'From the analog feel of 1968 to the romance of 2008 and the modern 2000s, you experience how Korean trains and subways evolved, and the youth of each era, with your whole body.',
      ko: '1968년의 아날로그 감성부터 2008년의 낭만, 2000년대 현대에 이르기까지 한국 전철과 지하철의 진화와 각 시대의 청춘을 온몸으로 체험한다.',
    },
  },
]

// 시간의 승강장
export const TIME_PLATFORM = {
  title: { en: 'Time Platform', ko: '시간의 승강장' },
  lead: {
    en: 'The deeper you go inside, the more time moves from past to present: a time-travel boarding experience.',
    ko: '안쪽으로 깊숙이 들어갈수록 과거에서 현재로 시간이 이동한다. 시간 이동형 탑승 경험이다.',
  },
  short: {
    en: 'Walk in and time moves from 1968 toward today.',
    ko: '들어갈수록 1968년에서 지금으로 시간이 흐른다.',
  },
}

// 방 id별 문구. year는 큰 글자로 쓰는 연도, line은 호선 이름이다.
export const ERA = {
  retro: {
    year: { en: '1968', ko: '1968' },
    line: { en: 'Platform 1', ko: '1호선 플랫폼' },
    concept: { en: 'The start of analog, and its romance', ko: '아날로그의 시작과 낭만' },
    experience: {
      en: 'The nostalgia of Gyeongju’s first station and early Korean railways. Warm-toned light and vintage train props make it feel like going back in time.',
      ko: '최초의 경주역과 한국 초기 철도의 향수를 담았다. 따뜻한 웜톤 조명과 빈티지한 전철 소품이 시대를 거슬러 올라간 듯한 인상을 준다.',
    },
  },
  karaoke: {
    year: { en: '2008', ko: '2008' },
    line: { en: 'Platform 2', ko: '2호선 플랫폼' },
    concept: { en: 'Feelings and memories, amplified', ko: '감성과 추억의 증폭' },
    experience: {
      en: 'It summons the familiar warmth of the mid and late 2000s. Karaoke melodies and visuals anyone can relate to sit between the retro and the modern.',
      ko: '익숙하고 정겨운 2000년대 중후반의 감성을 불러낸다. 레트로와 현대 사이에서 누구나 공감할 노래방 멜로디와 시각 요소를 결합했다.',
    },
  },
  subway: {
    year: { en: '2000s', ko: '2000년대' },
    line: { en: 'Platform 3', ko: '3호선 플랫폼' },
    concept: { en: 'Refined daily life, clear records', ko: '세련된 일상과 선명한 기록' },
    experience: {
      en: 'Modeled on the cleanest, most trend-setting subway of today. Metallic materials and clear signage give you a sharp, well-finished souvenir photo.',
      ko: '가장 트렌디하고 깔끔한 지금의 지하철을 모티브로 했다. 세련된 메탈릭 소재와 직관적인 사인물 속에서 선명하고 완성도 높은 기념사진을 남길 수 있다.',
    },
  },
}

// 방문 여정 다섯 단계. 키오스크 조작이 아니라 와서 사진을 받아 가기까지다.
// 사진은 public/img의 실제 파일이다. 대체 텍스트는 사진을 확인한 설명(components/pages/content.js의 RAW)을 따른다.
export const JOURNEY = [
  {
    id: 'get-here',
    title: { en: 'Get here', ko: '찾아오기' },
    short: { en: 'Get here', ko: '찾아오기' },
    body: {
      en: 'Find us on Poseok-ro 1079beon-gil in Hwangridan-gil. Look for the black front and the checkerboard step.',
      ko: '황리단길 포석로1079번길에서 찾는다. 검은 외관과 체커보드 문턱이 보이면 된다.',
    },
    photo: {
      src: '/img/o_21.jpg',
      alt: { en: 'The storefront: black front, UrbanEdge sign, checkerboard step', ko: '검은 외관과 UrbanEdge 간판, 체커보드 문턱이 보이는 매장 외관' },
    },
  },
  {
    id: 'arrive',
    title: { en: 'Arrive', ko: '도착하기' },
    short: { en: 'Arrive', ko: '도착하기' },
    body: {
      en: 'Black cones, yellow tape and a checkerboard floor mean you are in the right place.',
      ko: '검은 고깔과 노란 테이프, 체커보드 바닥이 보이면 제대로 찾아온 것이다.',
    },
    photo: {
      src: '/img/o_20.jpg',
      alt: { en: 'A caution-taped shutter with two cones and a checkerboard floor', ko: '경고 테이프를 두른 셔터와 라바콘, 체커보드 바닥' },
    },
  },
  {
    id: 'choose-pay',
    title: { en: 'Choose and pay', ko: '고르고 결제하기' },
    short: { en: 'Choose and pay', ko: '고르고 결제' },
    body: {
      en: 'Pick a room and pay at the kiosk.',
      ko: '촬영 방을 고르고 키오스크에서 결제한다.',
    },
    photo: {
      src: '/img/o_10.jpg',
      alt: { en: 'The KARAOKE SHOT sign beside a white kiosk', ko: 'KARAOKE SHOT 간판 옆의 흰색 키오스크' },
    },
  },
  {
    id: 'shoot',
    title: { en: 'Shoot', ko: '촬영하기' },
    short: { en: 'Shoot', ko: '촬영하기' },
    body: {
      en: 'Take your shots in the room you chose.',
      ko: '고른 방에서 촬영한다.',
    },
    photo: {
      src: '/img/o_29.jpg',
      alt: { en: 'Subway room: hand-strap rail, steel doors, benches on both sides', ko: '손잡이 봉과 스테인리스 문, 양옆 벤치가 있는 지하철 방' },
    },
  },
  {
    id: 'prints',
    title: { en: 'Get your prints and photos', ko: '인화물과 사진 받기' },
    short: { en: 'Prints and photos', ko: '인화물과 사진' },
    body: {
      en: 'Take your prints from the tray and scan the QR code for your photos.',
      ko: '트레이에서 인화물을 가져가고 QR 코드로 사진을 받는다.',
    },
    photo: {
      src: '/img/o_26.jpg',
      alt: { en: 'Two four-cut prints held up against brown tile', ko: '갈색 타일 벽 앞에서 들어 보인 네 칸 인화물 두 장' },
    },
  },
]
