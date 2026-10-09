// 결제 상세(tx.pay): VAN 승인 응답이 돌려주는 값과 같은 모양으로 저장한다.
// 카드번호는 앞 4자리와 뒤 4자리만 받는다. 전체 번호로 보이는 값은 거절한다.
export const PAY_KINDS = ['card', 'samsungpay', 'cash', 'coupon']
export const BRANDS = ['신한카드', 'KB국민카드', '삼성카드', '현대카드', '롯데카드', '하나카드', '우리카드', 'NH농협카드', 'BC카드', '해외 VISA', '해외 Mastercard']
const MASKED = /^\d{4} \*{4} \*{4} \d{4}$/
const APPROVAL = /^\d{8}$/
const COUPON = /^UE-[A-Z0-9]{4}-[A-Z0-9]{4}$/

const digitsOf = (s) => (String(s).match(/\d/g) || []).length
const longRun = (s) => /\d[\d\s-]{11,}\d/.test(String(s)) // 12자리 넘게 이어지는 숫자열은 전체 카드번호로 본다

export function cleanPay(p) {
  if (p == null) return null
  if (typeof p !== 'object' || Array.isArray(p)) throw bad('pay는 객체여야 한다.')
  for (const v of Object.values(p)) {
    if (typeof v === 'string' && longRun(v)) throw bad('전체 카드번호는 저장하지 않는다. 앞 4자리와 뒤 4자리만 보낸다.')
  }
  const out = {}
  if (!PAY_KINDS.includes(p.kind)) throw bad('pay.kind가 맞지 않다.')
  out.kind = p.kind
  if (p.kind === 'card' || p.kind === 'samsungpay') {
    if (!BRANDS.includes(p.brand)) throw bad('pay.brand가 맞지 않다.')
    out.brand = p.brand
    if (typeof p.masked !== 'string' || !MASKED.test(p.masked)) throw bad('pay.masked는 "1234 **** **** 5678" 모양이어야 한다.')
    if (digitsOf(p.masked) > 8) throw bad('카드번호는 8자리까지만 보인다.')
    out.masked = p.masked
    if (typeof p.approval !== 'string' || !APPROVAL.test(p.approval)) throw bad('pay.approval은 숫자 8자리다.')
    out.approval = p.approval
    out.installment = p.installment === undefined ? '일시불' : String(p.installment).slice(0, 12)
    if (p.vanTid != null) out.vanTid = String(p.vanTid).slice(0, 24)
  }
  if (p.kind === 'cash') {
    const rec = Number(p.received), chg = Number(p.change)
    if (!Number.isFinite(rec) || rec < 0 || !Number.isFinite(chg) || chg < 0) throw bad('pay.received와 pay.change는 0 이상의 숫자다.')
    out.received = Math.round(rec)
    out.change = Math.round(chg)
  }
  if (p.kind === 'coupon') {
    if (p.code != null) {
      if (!COUPON.test(String(p.code))) throw bad('pay.code는 UE-XXXX-XXXX 모양이어야 한다.')
      out.code = String(p.code)
    }
    if (p.channel != null) out.channel = String(p.channel).slice(0, 40)
  }
  // 카드 결제에 쿠폰을 같이 쓴 경우에도 쿠폰 코드를 남긴다.
  if (p.kind !== 'coupon' && p.code != null && COUPON.test(String(p.code))) out.code = String(p.code)
  if (p.kind !== 'coupon' && p.channel != null) out.channel = String(p.channel).slice(0, 40)
  return out
}

function bad(message) {
  return Object.assign(new Error(message), { status: 400 })
}

// 내보내기 칸: 카드사, 카드번호, 승인번호, 할부, 받은금액, 거스름돈, 쿠폰코드
export const payCols = (pay) => {
  const p = pay || {}
  return {
    카드사: p.brand || '',
    카드번호: p.masked || '',
    승인번호: p.approval || '',
    할부: p.installment || '',
    받은금액: p.received != null ? p.received : '',
    거스름돈: p.change != null ? p.change : '',
    쿠폰코드: p.code || '',
  }
}
