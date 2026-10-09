// 웹사이트 스크래치 쿠폰 코드 규칙(apps/kiosk/src/flow/coupon.js와 같은 알고리즘).
// 형식 UE-XXXX-XXXX. 알파벳 32자(I, O, 0, 1 제외). 앞 7자의 값에 자리 가중치(1~7)를 곱해 더하고 32로 나눈 나머지가 8번째 글자.
import { randomInt } from 'node:crypto'

export const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const val = (c) => ALPHABET.indexOf(c)

export function checksumChar(seven) {
  let sum = 0
  for (let i = 0; i < 7; i++) sum += val(seven[i]) * (i + 1)
  return ALPHABET[sum % 32]
}

export function makeCoupon(seven) {
  const s = seven.toUpperCase().slice(0, 7)
  const full = s + checksumChar(s)
  return `UE-${full.slice(0, 4)}-${full.slice(4)}`
}

export function randomCoupon() {
  let s = ''
  for (let i = 0; i < 7; i++) s += ALPHABET[randomInt(32)]
  return makeCoupon(s)
}

export const isComplete = (code) => /^UE-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)

export function validateChecksum(code) {
  if (typeof code !== 'string' || !isComplete(code)) return false
  const body = code.replace(/^UE-/, '').replace('-', '')
  if ([...body].some((c) => val(c) < 0)) return false
  return checksumChar(body.slice(0, 7)) === body[7]
}
