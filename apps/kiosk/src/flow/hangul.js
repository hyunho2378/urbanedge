// hangul.js: 한글 두벌식 조합기. 입력 문자열의 마지막 글자를 분해해 자모를 이어 붙인다.
// 상태를 따로 두지 않고 문자열만으로 조합하므로 어느 시점에서 영문으로 바꿔도 안전하다.

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

const V_COMP = { ㅗㅏ: 'ㅘ', ㅗㅐ: 'ㅙ', ㅗㅣ: 'ㅚ', ㅜㅓ: 'ㅝ', ㅜㅔ: 'ㅞ', ㅜㅣ: 'ㅟ', ㅡㅣ: 'ㅢ' }
const V_SPLIT = Object.fromEntries(Object.entries(V_COMP).map(([k, v]) => [v, [k[0], k[1]]]))
const J_COMP = { ㄱㅅ: 'ㄳ', ㄴㅈ: 'ㄵ', ㄴㅎ: 'ㄶ', ㄹㄱ: 'ㄺ', ㄹㅁ: 'ㄻ', ㄹㅂ: 'ㄼ', ㄹㅅ: 'ㄽ', ㄹㅌ: 'ㄾ', ㄹㅍ: 'ㄿ', ㄹㅎ: 'ㅀ', ㅂㅅ: 'ㅄ' }
const J_SPLIT = Object.fromEntries(Object.entries(J_COMP).map(([k, v]) => [v, [k[0], k[1]]]))

export const SHIFT_KO = { ㅂ: 'ㅃ', ㅈ: 'ㅉ', ㄷ: 'ㄸ', ㄱ: 'ㄲ', ㅅ: 'ㅆ', ㅐ: 'ㅒ', ㅔ: 'ㅖ' }

const isVowel = (j) => JUNG.includes(j)
const isCho = (j) => CHO.includes(j)

function decompose(ch) {
  if (!ch) return null
  const code = ch.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171) return null
  return { cho: CHO[Math.floor(code / 588)], jung: JUNG[Math.floor((code % 588) / 28)], jong: JONG[code % 28] }
}

function compose(cho, jung, jong = '') {
  return String.fromCharCode(0xac00 + CHO.indexOf(cho) * 588 + JUNG.indexOf(jung) * 28 + JONG.indexOf(jong))
}

export function typeJamo(text, j) {
  const last = text.slice(-1)
  const head = text.slice(0, -1)
  const d = decompose(last)
  if (isVowel(j)) {
    if (d) {
      if (d.jong) {
        const parts = J_SPLIT[d.jong]
        const keep = parts ? parts[0] : ''
        const move = parts ? parts[1] : d.jong
        if (isCho(move)) return head + compose(d.cho, d.jung, keep) + compose(move, j)
      } else {
        const comp = V_COMP[d.jung + j]
        if (comp) return head + compose(d.cho, comp, '')
      }
      return text + j
    }
    if (last && isVowel(last) && V_COMP[last + j]) return head + V_COMP[last + j]
    if (last && isCho(last)) return head + compose(last, j)
    return text + j
  }
  if (d) {
    if (!d.jong) {
      if (JONG.indexOf(j) > 0) return head + compose(d.cho, d.jung, j)
    } else {
      const comp = J_COMP[d.jong + j]
      if (comp) return head + compose(d.cho, d.jung, comp)
    }
  }
  return text + j
}

export function backspace(text) {
  if (!text) return text
  const last = text.slice(-1)
  const head = text.slice(0, -1)
  const d = decompose(last)
  if (d) {
    if (d.jong) {
      const parts = J_SPLIT[d.jong]
      return head + compose(d.cho, d.jung, parts ? parts[0] : '')
    }
    const vs = V_SPLIT[d.jung]
    if (vs) return head + compose(d.cho, vs[0], '')
    return head + d.cho
  }
  return head
}

export const glyphCount = (s) => Array.from(s).length
