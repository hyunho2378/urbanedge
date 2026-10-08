// coupon.js: 웹사이트 스크래치 카드 쿠폰 코드. 형식 UE-XXXX-XXXX, 대문자와 숫자 8자.
// 검사 규칙(웹사이트 카드 발행기와 같은 알고리즘을 쓴다):
//   알파벳 32자 ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (I, O, 0, 1 제외)
//   앞 7자의 값(0부터 31)에 자리 가중치(1부터 7)를 곱해 모두 더하고 32로 나눈 나머지가 마지막 8번째 글자다.
// 서버가 없는 클라이언트 검사이므로 위조를 막지 않는다(오타 확인용).
export const COUPON_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const val = (c) => COUPON_ALPHABET.indexOf(c)

export function checksumChar(seven) {
  let sum = 0
  for (let i = 0; i < 7; i++) sum += val(seven[i]) * (i + 1)
  return COUPON_ALPHABET[sum % 32]
}

// 7자 입력으로 유효한 코드를 만든다(데모와 카드 발행용).
export function makeCoupon(seven) {
  const s = seven.toUpperCase().slice(0, 7)
  const full = s + checksumChar(s)
  return `UE-${full.slice(0, 4)}-${full.slice(4)}`
}

// 입력을 정리해 UE-XXXX-XXXX 모양으로 돌려준다(키패드 입력용). 앞의 UE는 자동으로 붙는다.
export function formatCoupon(raw) {
  const body = String(raw).toUpperCase().replace(/^UE/, '').replace(/[^A-Z0-9]/g, '').slice(0, 8)
  if (!body) return 'UE-'
  return body.length <= 4 ? `UE-${body}` : `UE-${body.slice(0, 4)}-${body.slice(4)}`
}

export function isCouponComplete(code) {
  return /^UE-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)
}

export function validateCoupon(code) {
  if (!isCouponComplete(code)) return false
  const body = code.replace(/^UE-/, '').replace('-', '')
  if ([...body].some((c) => val(c) < 0)) return false
  return checksumChar(body.slice(0, 7)) === body[7]
}

export const DEMO_COUPON = makeCoupon('7K2M9QX')
