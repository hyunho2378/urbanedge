// geometry.js v2: 어반엣지 키오스크 기기 외형의 실측 비율과 상반신 구도.
//
// 측정: IMG_1651과 IMG_1644(둘 다 카메라가 모니터 아래인 기기)에서 모니터 모서리 4점을 잡고, 모니터를 16:9로 가정해
// 사진을 정면으로 펴는 투시 보정을 각각 적용했다. 보정 뒤 렌즈가 정원이고 본체 모서리가 수직, 문 윗선이 수평이다.
// 두 사진의 결과가 1% 안에서 일치한다(렌즈 중심 u 803~806, v 1464~1467 / 모니터 폭 1600 기준, 카드 단말기 u 1472~1475).
//
// 단위: x, w는 본체 폭 W의 %. y, h는 W의 %이며 본체 윗선이 y=0.
// 문 윗선(y=86)까지는 실측 그대로다. 사진은 모두 문 아래를 잘라 놓았으므로 그 아래는 모니터 중심의 상반신 구도로 줄였다.
//   문 윗선에서 슬롯 판, 트레이, 손잡이까지 간격을 실측의 약 80%로 압축하고, 본체 높이를 130으로 자른 뒤 아래를 바탕색으로 흐린다.
//   (v1은 높이 170까지 그려 모니터가 높이의 21%였다. v2는 27%이며 같은 화면 높이에서 모니터가 약 30% 커진다.)

// 표시 높이 / 폭
export const RATIO = 1.3

// W 단위 박스를 본체 박스 기준 퍼센트 스타일로 바꾼다.
export const place = ({ x, y, w, h }) => ({
  left: `${x}%`,
  top: `${y / RATIO}%`,
  width: `${w}%`,
  height: `${h / RATIO}%`,
})

// 모니터: 16:9 박스. 여기가 1920x1080 Stage가 들어가는 자리다. 폭 62.8에 높이 35.325는 정확히 16:9.
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

// 카드 단말기: 문 윗선 오른쪽에 얹힌 검은 상자. 카메라 아래 오른쪽.
export const READER = { x: 76.2, y: 77.8, w: 19.6, h: 8.6 }

// 하단 캐비닛 문: 좌우 4% 안쪽. 아래는 본체 높이에서 잘린다.
export const DOOR = { x: 4.1, y: 86.0, w: 91.8, h: RATIO * 100 - 86.0 }

// 문 위의 검은 슬롯 판. 사진에서 라벨과 표식이 없어 용도를 확인할 수 없다(현금 투입구로 단정하지 않는다).
export const SLOT_PLATE = { x: 19.1, y: 94.5, w: 11.7, h: 4.9 }

// 인화 출구 슬롯과 트레이: 윗부분 어두운 틈에서 종이가 나오고 아래 흰 선반에 놓인다.
export const TRAY = { x: 46.0, y: 101.5, w: 26.4, h: 20.7 }

// 문 손잡이(레버)
export const HANDLE = { x: 9.8, y: 114.8, w: 3.8, h: 6.1 }

// CCTV 안내문 두 장: 모니터 좌우 끝선에 맞춘다. 높이는 모니터 위 여백(9.5)에 들어가는 크기.
export const NOTICE_L = { x: 18.7, y: 1.6, w: 9.6, h: 5.8 }
export const NOTICE_R = { x: 75.4, y: 1.6, w: 6.1, h: 5.8 }

// 힌트 영역: 링 박스(W 단위)와 라벨이 붙는 방향
const pad = (b, p) => ({ x: b.x - p, y: b.y - p, w: b.w + p * 2, h: b.h + p * 2 })
export const ZONES = {
  camera: { box: pad(LENS.box, 2.2), round: true, side: 'left', label: { ko: '카메라 렌즈', en: 'Camera lens' } },
  card: { box: pad(READER, 1.2), round: false, side: 'left', label: { ko: '카드 단말기', en: 'Card terminal' } },
  slot: { box: pad(TRAY, 1.4), round: false, side: 'left', label: { ko: '인화물 출구', en: 'Print exit' } },
  screen: { box: pad(MONITOR, 1), round: false, side: 'below', label: { ko: '화면', en: 'Screen' } },
}

// 부품 주석: 시뮬레이터의 "부품 주석 보기"가 번호 마커와 범례로 쓴다.
export const PARTS = [
  {
    id: 'notice',
    anchor: { x: NOTICE_L.x + NOTICE_L.w, y: NOTICE_L.y },
    label: { ko: 'CCTV 안내문 2장', en: 'CCTV notices' },
    desc: { ko: '기기이동금지와 CCTV 녹화중. 모니터 윗선 양끝에 붙는다.', en: 'No-move notice and CCTV in operation, above the monitor corners.' },
  },
  {
    id: 'monitor',
    anchor: { x: MONITOR.x + MONITOR.w / 2, y: MONITOR.y + MONITOR.h },
    label: { ko: '모니터 16:9', en: 'Monitor, 16:9' },
    desc: { ko: '가로형 터치 화면이며 1920x1080 화면이 이 박스에 들어간다.', en: 'Landscape touch screen. The 1920x1080 stage lives in this box.' },
  },
  {
    id: 'led',
    anchor: { x: LEDS[0].x + LEDS[0].w / 2, y: 27.2 },
    label: { ko: 'LED 조명바', en: 'Light bars' },
    desc: { ko: '모니터 양옆에 세로 두 칸씩 있고 셔터 순간에 밝아진다.', en: 'Two vertical bars on each side. They brighten at the shutter.' },
  },
  {
    id: 'lens',
    anchor: { x: LENS.box.x, y: LENS.box.y },
    label: { ko: '렌즈', en: 'Lens' },
    desc: { ko: '카메라는 모니터 아래에 있고 켜지면 표시등이 들어온다.', en: 'The camera sits below the monitor. A small light comes on when it is live.' },
  },
  {
    id: 'card',
    anchor: { x: READER.x, y: READER.y },
    label: { ko: '카드 단말기', en: 'Card terminal' },
    desc: { ko: '카메라 아래 오른쪽에서 초록 LED가 켜진 결제 단말기.', en: 'Payment terminal below the camera, on the right, with a green light.' },
  },
  {
    id: 'door',
    anchor: { x: DOOR.x + 3, y: DOOR.y + 1.5 },
    label: { ko: '하단 캐비닛 문', en: 'Lower cabinet door' },
    desc: { ko: '손잡이, 용도를 확인하지 못한 검은 슬롯 판, 안내 스티커가 붙은 면.', en: 'Handle, a black slot plate whose use is unconfirmed, and a help sticker.' },
  },
  {
    id: 'slot',
    anchor: { x: TRAY.x + TRAY.w / 2, y: TRAY.y },
    label: { ko: '인화 출구와 트레이', en: 'Print slot and tray' },
    desc: { ko: '위쪽 틈에서 인화물이 나와 흰 트레이에 놓인다.', en: 'Prints come out of the upper slit and rest on the white tray.' },
  },
]
