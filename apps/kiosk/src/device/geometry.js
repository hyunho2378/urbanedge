// geometry.js: 어반엣지 키오스크 기기 외형의 실측 비율.
//
// 측정 방법: 현장 사진 IMG_1651(카메라가 모니터 아래인 기기)에서 모니터 모서리 4점을 잡고,
// 모니터를 16:9 직사각형으로 가정해 사진 전체를 정면으로 펴는 투시 보정(homography)을 적용했다.
// 보정 뒤 렌즈가 정원으로 나오고 본체 좌우 모서리가 수직, 문 윗선이 수평으로 나오므로 가정이 맞다.
// 보정 평면에서 본체 폭 W를 기준(100)으로 환산한 값이 아래 숫자다.
// x, w는 본체 폭 W의 %. y, h도 W의 %(W 단위)이며 본체 윗선이 y=0이다.
// 모든 사진에서 본체 아래쪽이 잘려 있어 전체 높이(RATIO)는 추정값이다. 문 손잡이(y≈125)와 트레이 아래(y≈130) 아래에
// 문이 이어지는 것까지만 확인된다.
//
// IMG_1638은 카메라가 위에 있는 다른 기기라서 CCTV 안내문 두 장의 모양과 종이 비율만 참고했다.

// 본체 높이 / 폭. 추정값(위 설명 참조).
export const RATIO = 1.7

// 본체 면 높이(W 단위). 아래 5는 하단 받침(kick plate).
export const BODY_H = 165
export const PLINTH_H = RATIO * 100 - BODY_H

// W 단위 박스를 본체 박스 기준 퍼센트 스타일로 바꾼다.
export const place = ({ x, y, w, h }) => ({
  left: `${x}%`,
  top: `${y / RATIO}%`,
  width: `${w}%`,
  height: `${h / RATIO}%`,
})

// 모니터: 16:9 박스. 여기가 1920x1080 Stage가 들어가는 자리다. 폭 62.8%에 높이 35.325는 정확히 16:9.
export const MONITOR = { x: 18.7, y: 9.5, w: 62.8, h: (62.8 * 9) / 16 }

// LED 조명바: 좌우 두 칸씩. 가운데 간격 2.
export const LEDS = [
  { id: 'l1', x: 4.1, y: 8.9, w: 6.7, h: 17.2 },
  { id: 'l2', x: 4.1, y: 28.2, w: 6.7, h: 17.3 },
  { id: 'r1', x: 89.2, y: 8.9, w: 6.7, h: 17.2 },
  { id: 'r2', x: 89.2, y: 28.2, w: 6.7, h: 17.3 },
]

// 렌즈 구멍: 모니터 아래 가운데. 지름 10.6, 중심 x 50.4 y 66.9.
export const LENS = { cx: 50.4, cy: 66.9, d: 10.6 }
LENS.box = { x: LENS.cx - LENS.d / 2, y: LENS.cy - LENS.d / 2, w: LENS.d, h: LENS.d }

// 안내 스티커(If you need help)
export const STICKER = { x: 83.1, y: 71.1, w: 8.3, h: 4.6 }

// 카드 단말기: 문 윗선 오른쪽에 얹힌 검은 상자
export const READER = { x: 76.2, y: 77.8, w: 19.6, h: 8.6 }

// 하단 캐비닛 문: 좌우 4% 안쪽
export const DOOR = { x: 4.1, y: 86.0, w: 91.8, h: 76 }

// 문 위의 검은 슬롯 판(용도 미확인)
export const SLOT_PLATE = { x: 19.1, y: 98.6, w: 11.7, h: 4.9 }

// 인화 출구 슬롯과 트레이: 윗부분 어두운 틈에서 종이가 나오고 아래 흰 선반에 놓인다.
export const TRAY = { x: 46.0, y: 108.8, w: 26.4, h: 20.7 }

// 문 손잡이(레버)
export const HANDLE = { x: 9.8, y: 122.4, w: 3.8, h: 6.1 }

// CCTV 안내문 두 장: 모니터 좌우 끝선에 맞춘다. 높이는 모니터 위 여백(9.5)에 들어가는 크기.
export const NOTICE_L = { x: 18.7, y: 1.6, w: 9.6, h: 5.8 }
export const NOTICE_R = { x: 75.4, y: 1.6, w: 6.1, h: 5.8 }

// 힌트 영역: 링 박스(W 단위)와 라벨이 붙는 방향
const pad = (b, p) => ({ x: b.x - p, y: b.y - p, w: b.w + p * 2, h: b.h + p * 2 })
export const ZONES = {
  camera: { box: pad(LENS.box, 2.2), round: true, side: 'left', label: { ko: '카메라 렌즈', en: 'Camera lens' } },
  card: { box: pad(READER, 1.2), round: false, side: 'left', label: { ko: '카드 단말기', en: 'Card reader' } },
  slot: { box: pad(TRAY, 1.4), round: false, side: 'below', label: { ko: '인화물 출구', en: 'Print exit' } },
  screen: { box: pad(MONITOR, 1), round: false, side: 'below', label: { ko: '화면', en: 'Screen' } },
}

// 부품 주석: 시뮬레이터의 "부품 주석 보기"가 번호 마커와 범례로 쓴다.
export const PARTS = [
  {
    id: 'notice',
    anchor: { x: NOTICE_L.x + NOTICE_L.w, y: NOTICE_L.y },
    label: { ko: 'CCTV 안내문 2장', en: 'CCTV notices (2)' },
    desc: { ko: '기기이동금지와 CCTV 녹화중. 모니터 윗선 양끝', en: 'No-move notice and CCTV in operation, above the monitor corners' },
  },
  {
    id: 'monitor',
    anchor: { x: MONITOR.x + MONITOR.w / 2, y: MONITOR.y + MONITOR.h },
    label: { ko: '모니터 16:9', en: 'Monitor 16:9' },
    desc: { ko: '가로형 터치 화면. 1920x1080 화면이 이 박스에 들어간다', en: 'Landscape touch screen that hosts the 1920x1080 stage' },
  },
  {
    id: 'led',
    anchor: { x: LEDS[0].x + LEDS[0].w / 2, y: 27.2 },
    label: { ko: 'LED 조명바', en: 'LED light bars' },
    desc: { ko: '모니터 양옆 세로 2칸씩. 촬영 순간에 밝아진다', en: 'Two vertical bars on each side. They brighten at the shutter moment' },
  },
  {
    id: 'lens',
    anchor: { x: LENS.box.x, y: LENS.box.y },
    label: { ko: '렌즈', en: 'Lens' },
    desc: { ko: '카메라는 모니터 아래에 있다. 표시등은 카메라가 켜지면 점등', en: 'The camera sits below the monitor. The indicator lights when the camera is on' },
  },
  {
    id: 'card',
    anchor: { x: READER.x, y: READER.y },
    label: { ko: '카드 단말기', en: 'Card reader' },
    desc: { ko: '초록 LED가 켜진 결제 단말기. 결제 화면은 구현 범위 밖', en: 'Payment terminal with a green LED. The payment flow is out of scope' },
  },
  {
    id: 'door',
    anchor: { x: DOOR.x + 3, y: DOOR.y + 1.5 },
    label: { ko: '하단 캐비닛 문', en: 'Lower cabinet door' },
    desc: { ko: '문 손잡이, 검은 슬롯 판, 안내 스티커가 붙은 면', en: 'Door with a handle, a black slot plate and a help sticker' },
  },
  {
    id: 'slot',
    anchor: { x: TRAY.x + TRAY.w / 2, y: TRAY.y },
    label: { ko: '인화 출구와 트레이', en: 'Print slot and tray' },
    desc: { ko: '위 틈에서 인화물이 나와 흰 트레이에 놓인다', en: 'Prints come out of the upper slit and rest on the white tray' },
  },
]
