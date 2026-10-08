// config.js: 흐름 전체의 타이밍과 한도. 화면 문구에 나오는 수치는 여기 값만 쓴다.
// secondsPerShot은 이 키오스크 화면의 설계 값이다(경쟁사 기기는 1회 촬영 시간을 화면에 명시한다).
export const FLOW = {
  secondsPerShot: 5, // 컷마다 카운트다운 초
  introMs: 2200, // 촬영 시작 전 렌즈 안내
  restMs: 1800, // 컷 사이 쉬는 시간
  doneMs: 1200, // 마지막 컷 뒤 대기
  printMs: 36000, // 인화 대기 연출 길이(연출용이며 화면에 시간 수치로 쓰지 않는다)
  flashMs: 300, // flashing 신호 길이
  messageMax: 24, // 한 줄 메시지 최대 글자 수
  idleMs: 90000, // 무입력 안내 대화상자까지
  idleGraceMs: 15000, // 안내 대화상자에서 대기 화면까지
  slots: 4, // 모든 프레임의 사진 칸 수
}

// 카메라를 켜야 하는 단계
export const CAMERA_STEPS = ['retouch', 'ready', 'shoot']
// 무입력 타이머를 멈추는 단계: 대기 화면, 촬영 중(포즈 중 입력 없음), 인화 대기
export const IDLE_OFF_STEPS = ['attract', 'shoot', 'print']
