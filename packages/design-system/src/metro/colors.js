// colors.js: 지하철 키트의 색은 전부 토큰 CSS 변수(--ue-*)로만 참조한다. hex 리터럴 없음.
export const ACCENTS = ['yellow', 'red', 'blue', 'green', 'white']

const varName = (color) => (color === 'white' ? '--ue-white' : `--ue-line-${ACCENTS.includes(color) ? color : 'yellow'}`)

// 노선 또는 방 포인트 색. a가 있으면 알파를 얹는다.
export const lineRgb = (color = 'yellow', a) => (a == null ? `rgb(var(${varName(color)}))` : `rgb(var(${varName(color)}) / ${a})`)

// 일반 토큰 색: tok('text-pri'), tok('bg-base', 0.4)
export const tok = (name, a) => (a == null ? `rgb(var(--ue-${name}))` : `rgb(var(--ue-${name}) / ${a})`)

// 노선색 위에 올리는 글자색. 네 색 모두 어두운 잉크가 대비 4.9 이상이다.
export const INK = tok('text-on-yellow')

export const hasHangul = (s = '') => /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/.test(s)
