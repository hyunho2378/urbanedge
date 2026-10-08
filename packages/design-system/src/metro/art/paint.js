// paint.js: 지하철 일러스트 전용 색 단계. 토큰 CSS 변수(--ue-*)를 color-mix로 섞어 명암을 만든다.
// hex와 rgb 숫자 리터럴은 쓰지 않는다. 노선색은 lineRgb, 일반 토큰은 tok에서 온다.
import { lineRgb, tok } from '../colors.js'

export const mix = (a, b, pct) => `color-mix(in srgb, ${a} ${pct}%, ${b})`
const W = tok('white')
const K = tok('black')

// 차체와 승강장에 쓰는 무채색 단계. 숫자가 클수록 밝다.
export const grey = (pct) => mix(W, K, pct)

export const PAINT = {
  body: W,
  bodyLo: grey(90),
  bodyLo2: grey(80),
  roof: grey(70),
  roofLo: grey(52),
  steel: grey(84),
  steelLo: grey(66),
  steelDark: grey(44),
  rubber: tok('bg-raised'),
  under: tok('bg-elev'),
  underLo: tok('bg-base'),
  glass: tok('bg-panel'),
  glassHi: tok('bg-raised'),
  glassDeep: tok('bg-base'),
  shine: tok('white', 0.22),
  shine2: tok('white', 0.1),
  shadow: tok('black', 0.28),
  amber: tok('yellow'),
  amberDim: tok('yellow', 0.35),
  headlight: tok('white'),
  tail: lineRgb('red'),
  // 노란 주황 좌석과 실내 조명
  seat: mix(lineRgb('yellow'), lineRgb('red'), 72),
  seatLo: mix(mix(lineRgb('yellow'), lineRgb('red'), 60), K, 78),
  warm: mix(lineRgb('yellow'), W, 38),
  warmHi: mix(lineRgb('yellow'), W, 18),
  warmLo: mix(lineRgb('yellow'), K, 62),
  tactile: lineRgb('yellow'),
}

// 노선색의 밝은 면과 어두운 면
export const lineShade = (color, pct) => mix(lineRgb(color), K, pct)
export const lineTint = (color, pct) => mix(lineRgb(color), W, pct)
