// tourCopy.js: 코치마크 투어 문구. 단계마다 생각 하나(제목과 한 문장)만 둔다. 영문을 먼저 쓰고 한국어는 따로 쓴다(docs/VOICE.md).
// 모든 문구는 { en, ko } 쌍이며 화면에서는 <Bi>로 그린다.
// target은 data-tour 표식 이름이다. edge는 부품이 화면 밖(모니터 아래)에 있을 때 화면 아래 가장자리에서 가리킬 가로 위치(0에서 1).
// ctx별 단계: sim(시뮬레이터 전체), screen(/screen 새 창), embed(/screen?embed=1, 짧게), embedDevice(/?embed=1, 짧게)

export const TOUR_STEPS = {
  sim: [
    { id: 'screen', target: 'screen', interactive: true },
    { id: 'camera', target: 'camera', round: true },
    { id: 'card', target: 'card', hint: 'card', goTo: 'pay' },
    { id: 'slot', target: 'slot' },
    { id: 'panel', target: 'panel' },
  ],
  screen: [
    { id: 'screen', target: 'screen', interactive: true },
    { id: 'camera', target: 'screen', edgeOnly: true, edge: 0.5 },
    { id: 'card', target: 'screen', edgeOnly: true, edge: 0.97 },
    { id: 'slot', target: 'screen', edgeOnly: true, edge: 0.645 },
    { id: 'window', target: 'screen', center: true },
  ],
  embed: [
    { id: 'screen', target: 'screen', interactive: true },
    { id: 'camera', target: 'screen', edgeOnly: true, edge: 0.5 },
  ],
  embedDevice: [
    { id: 'screen', target: 'screen', interactive: true },
    { id: 'camera', target: 'camera', round: true },
  ],
}

export const TOUR_UI = {
  next: { en: 'Next', ko: '다음' },
  back: { en: 'Back', ko: '이전' },
  skip: { en: 'Skip tour', ko: '투어 건너뛰기' },
  finish: { en: 'Finish', ko: '마치기' },
  fullscreen: { en: 'Go full screen', ko: '전체 화면으로 보기' },
  notNow: { en: 'Not now', ko: '나중에' },
  dialog: { en: 'Kiosk tour', ko: '키오스크 사용법 안내' },
}

export const TOUR_COPY = {
  screen: {
    title: { en: 'Touch the screen', ko: '화면 터치' },
    body: { en: 'Tap anything on it, just like at the machine.', ko: '실제 기기처럼 화면 어디든 눌러 보세요.' },
  },
  camera: {
    title: { en: 'Mind the lens', ko: '렌즈 위치' },
    body: { en: 'It sits below the screen. Look there during the countdown.', ko: '카메라는 화면 바로 아래에 있으니 카운트다운 동안 이 렌즈를 보세요.' },
  },
  card: {
    title: { en: 'Pay at the terminal', ko: '카드 결제' },
    body: {
      en: 'Pay with a card or Samsung Pay at the terminal below the camera, or enter a coupon.',
      ko: '카메라 아래 단말기에서 카드나 삼성페이로 결제하거나 쿠폰을 입력합니다.',
    },
  },
  slot: {
    title: { en: 'Prints come out here', ko: '인화 출구' },
    body: { en: 'Your strip lands on the white tray.', ko: '인화물은 아래 흰 트레이에 놓입니다.' },
  },
  panel: {
    title: { en: 'Drive it from here', ko: '조작은 여기서' },
    body: { en: 'Jump to any step, or switch language.', ko: '원하는 단계로 건너뛰거나 언어를 바꿀 수 있습니다.' },
  },
  window: {
    title: { en: 'Fill the display', ko: '전체 화면' },
    body: { en: 'Full screen matches the 16:9 monitor of the real machine.', ko: '전체 화면에서는 실제 기기와 같은 16:9 모니터로 보입니다.' },
  },
}

export const TOUR_PROGRESS = {
  en: (i, n) => `Step ${i} of ${n}`,
  ko: (i, n) => `${n}단계 중 ${i}단계`,
}
