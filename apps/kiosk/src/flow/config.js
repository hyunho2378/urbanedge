// config.js: 흐름 전체의 타이밍과 한도. 화면 문구에 나오는 수치는 여기 값과 site.js 사실만 쓴다.
// secondsPerShot은 이 키오스크 화면의 설계 값이다.
export const FLOW = {
  secondsPerShot: 5, // 컷마다 카운트다운 초
  introMs: 2400, // 촬영 시작 전 렌즈 안내
  restMs: 1800, // 컷 사이 쉬는 시간
  doneMs: 1200, // 마지막 컷 뒤 대기
  printMs: 36000, // 인화 대기 연출 길이(화면에 시간 수치로 쓰지 않는다)
  payMs: 1500, // 결제 시뮬레이션 처리 시간(2초 이내)
  payDoneMs: 1800, // 결제 완료 화면 유지
  flashMs: 300, // flashing 신호 길이
  messageMax: 24, // 한 줄 메시지 최대 글자 수
  idleMs: 90000, // 무입력 안내 대화상자까지
  idleGraceMs: 15000, // 안내 대화상자에서 대기 화면까지
  islandMs: 2600, // 라이브 액티비티가 펼쳐져 있는 시간
}

// 사실(apps/web/src/data/site.js와 같은 값): 기본 7,000원에 인화 2장
export const PRICE = { base: 7000, prints: 2, currency: 'KRW' }
export const INSTAGRAM = { handle: '@__urbanedge', url: 'https://www.instagram.com/__urbanedge/' }
// 완료 화면 QR 주소: 웹사이트의 모바일 결과 페이지(/result/:sessionId, apps/web/src/pages/Result.jsx). 사이트 주소는 VITE_SITE_URL, 없으면 배포 주소를 쓴다.
// 업로드 서버가 아직 없으므로 세션 id는 데모 값(RESULT_SESSION_ID)이고, 웹 쪽이 샘플 사진과 영상을 보여 준다.
const SITE = ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) || 'https://urbanedge.vercel.app').replace(/\/$/, '')
export const RESULT_SESSION_ID = 'demo'
export const resultUrl = (lang) => `${SITE}/result/${RESULT_SESSION_ID}?lang=${lang === 'ko' ? 'ko' : 'en'}`

// 카메라를 켜야 하는 단계
export const CAMERA_STEPS = ['guide', 'shoot']
// 무입력 타이머를 멈추는 단계: 대기 화면, 촬영 중, 인화 대기
export const IDLE_OFF_STEPS = ['attract', 'shoot', 'print']
