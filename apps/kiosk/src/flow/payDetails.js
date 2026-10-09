// payDetails.js: 결제 상세(tx.pay)를 만든다. 실제 VAN 승인 응답이 돌려주는 값과 같은 모양이다.
//   승인번호 8자리, 카드사, 마스킹된 카드번호(앞 4자리와 뒤 4자리만), 할부, 단말기 번호(TID)
// 전체 카드번호는 만들지도 저장하지도 않는다.
const DOMESTIC = [
  ['신한카드', ['4579', '4049', '5409']],
  ['KB국민카드', ['9490', '5461', '4592']],
  ['삼성카드', ['5365', '4619', '9410']],
  ['현대카드', ['5481', '4311', '9446']],
  ['롯데카드', ['4896', '5430', '9460']],
  ['하나카드', ['5410', '4070', '9490']],
  ['우리카드', ['4003', '5290', '9430']],
  ['NH농협카드', ['5412', '4906', '9420']],
  ['BC카드', ['9445', '4150', '5461']],
]
const FOREIGN = [
  ['해외 VISA', ['4532', '4916', '4024']],
  ['해외 Mastercard', ['5555', '5105', '2221']],
]
// 부스별 단말기 번호. 1 지하철, 2 노래방, 3 레트로.
const TID = { subway: 'UE-K1-0001', karaoke: 'UE-K2-0001', retro: 'UE-K3-0001' }

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')

// kind: 'card' 또는 'samsungpay'. lang이 en이면 가끔 해외 카드가 나온다.
export function makeCardPay({ kind = 'card', booth, lang = 'ko', code = null, channel = null }) {
  const foreign = lang === 'en' && kind === 'card' && Math.random() < 0.45
  const [brand, bins] = pick(foreign ? FOREIGN : DOMESTIC)
  const pay = {
    kind,
    brand,
    masked: `${pick(bins)} **** **** ${digits(4)}`,
    approval: digits(8),
    installment: '일시불',
    vanTid: TID[booth] || 'UE-K0-0001',
  }
  if (code) pay.code = code
  if (channel) pay.channel = channel
  return pay
}

// 현금: 넣은 지폐 합계와 거스름돈.
export function makeCashPay({ received, due }) {
  const r = Math.max(0, Math.round(received))
  return { kind: 'cash', received: r, change: Math.max(0, r - Math.max(0, Math.round(due))) }
}

export function makeCouponPay({ code, channel = null }) {
  const pay = { kind: 'coupon' }
  if (code) pay.code = code
  if (channel) pay.channel = channel
  return pay
}

// 화면에 보이는 영어 이름
export const brandLabel = (brand, lang) => (lang === 'en' && brand && brand.startsWith('해외 ') ? `${brand.slice(3)} (overseas)` : brand)
export const installmentLabel = (v, lang) => (lang === 'en' && v === '일시불' ? 'Lump sum' : v)
