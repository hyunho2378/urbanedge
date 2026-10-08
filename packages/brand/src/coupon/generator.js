// generator.js: 쿠폰 코드 UE-XXXX-XXXX 생성과 검증. 순수 자바스크립트, 외부 의존 없음.
// 구성: UE- + 6자 임의 + 2자 체크섬. 글자는 헷갈리는 0, 1, I, L, O를 뺀 31자다.
// 체크섬은 서버 없이 키오스크에서 오타와 엉터리 코드를 거르는 용도다. 코드의 사용 이력과 유효 기간은 서버가 따로 확인해야 한다.
export const COUPON_PREFIX = 'UE'
export const COUPON_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const N = COUPON_ALPHABET.length

function checksum(payload) {
  let h = 2166136261
  const s = `UE:${payload}:H01`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return COUPON_ALPHABET[h % N] + COUPON_ALPHABET[Math.floor(h / N) % N]
}

const defaultRandomByte = () => {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (c?.getRandomValues) return c.getRandomValues(new Uint8Array(1))[0]
  return Math.floor(Math.random() * 256)
}

export const formatCouponCode = (chars8) => `${COUPON_PREFIX}-${chars8.slice(0, 4)}-${chars8.slice(4, 8)}`

// generateCouponCode({ rng }) -> 'UE-7K3M-Q9XB'. rng는 0에서 255 정수를 돌려주는 함수(테스트용, 기본은 crypto).
export function generateCouponCode({ rng = defaultRandomByte } = {}) {
  let payload = ''
  while (payload.length < 6) {
    const b = rng()
    if (b < N * 8) payload += COUPON_ALPHABET[b % N] // 편향 없는 선택
  }
  return formatCouponCode(payload + checksum(payload))
}

// 중복 없는 코드 n개
export function generateCoupons(n, opts) {
  const set = new Set()
  while (set.size < n) set.add(generateCouponCode(opts))
  return [...set]
}

// 입력을 대문자로 바꾸고 공백, 하이픈, 밑줄을 없앤 8자로. 접두사 UE가 있으면 뗀다. 모양이 맞지 않으면 빈 문자열.
export function normalizeCouponCode(input) {
  let s = String(input ?? '').toUpperCase().replace(/[\s\-_]/g, '')
  if (s.startsWith(COUPON_PREFIX) && s.length === 10) s = s.slice(2)
  return s.length === 8 ? formatCouponCode(s) : ''
}

// validateCouponCode(input) -> { valid, code, reason }  reason: 'empty' | 'format' | 'charset' | 'checksum' | null
export function validateCouponCode(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return { valid: false, code: '', reason: 'empty' }
  const code = normalizeCouponCode(raw)
  if (!code) return { valid: false, code: '', reason: 'format' }
  const chars = code.replace(/-/g, '').slice(2)
  if ([...chars].some((ch) => !COUPON_ALPHABET.includes(ch))) return { valid: false, code, reason: 'charset' }
  const ok = checksum(chars.slice(0, 6)) === chars.slice(6)
  return { valid: ok, code, reason: ok ? null : 'checksum' }
}
