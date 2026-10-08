// palette.js: 캔버스용 색. 값의 원천은 디자인시스템 tokens.js(RGB 3채널)이고 여기서는 CSS 문자열로만 바꾼다.
import { palette } from '@urbanedge/ds/tokens'

const rgb = (triplet, a = 1) => {
  const [r, g, b] = triplet.split(' ')
  return a === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
}

export const col = {
  ink: (a) => rgb(palette['bg-base'], a),
  white: (a) => rgb(palette.white, a),
  yellow: (a) => rgb(palette.yellow, a),
  grey: (a) => rgb(palette['text-meta'], a),
  red: (a) => rgb(palette['line-red'], a),
  // 실제 인화 프레임 파랑(인스타그램 게시물 ig-06, ig-07에서 측정한 채도 높은 파랑). 토큰에 없어 프레임 전용으로만 쓴다.
  line: { yellow: (a) => rgb(palette['line-yellow'], a), red: (a) => rgb(palette['line-red'], a), blue: (a) => rgb(palette['line-blue'], a), green: (a) => rgb(palette['line-green'], a) },
  royal: (a) => rgb('35 72 214', a),
}

// 바탕별 색 역할: bg 종이, ink 글자와 장식, accent 포인트, sub 보조 글자, line 가는 선
export const TONES = {
  white: { name: 'white', bg: col.white(), ink: col.ink(), accent: col.yellow(), onAccent: col.ink(), sub: col.ink(0.62), line: col.ink(0.18), photoBg: col.ink(0.06) },
  black: { name: 'black', bg: col.ink(), ink: col.white(), accent: col.yellow(), onAccent: col.ink(), sub: col.white(0.66), line: col.white(0.22), photoBg: col.white(0.08) },
  yellow: { name: 'yellow', bg: col.yellow(), ink: col.ink(), accent: col.ink(), onAccent: col.yellow(), sub: col.ink(0.7), line: col.ink(0.28), photoBg: col.ink(0.1) },
  blue: { name: 'blue', bg: col.royal(), ink: col.white(), accent: col.yellow(), onAccent: col.ink(), sub: col.white(0.8), line: col.white(0.3), photoBg: col.white(0.12) },
}
