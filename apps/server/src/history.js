// history.js: '지난 기록 불러오기'가 넣는 과거 거래를 만든다(origin='history').
// 부스 비율은 운영사 인터뷰(지하철 가장 많고 노래방 가장 적다), 시간대는 낮 늦게부터 저녁, 주말이 많은 모양이다.
// 같은 기간을 다시 불러오면 같은 값이 나오도록 날짜로 시드를 정한다.
import { randomUUID } from 'node:crypto'

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}
const pick = (r, items, weights) => {
  const total = weights.reduce((a, b) => a + b, 0)
  let x = r() * total
  for (let i = 0; i < items.length; i++) {
    x -= weights[i]
    if (x <= 0) return items[i]
  }
  return items[items.length - 1]
}

const BOOTHS = ['retro', 'karaoke', 'subway']
const BOOTH_W = [0.3, 0.17, 0.53]
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const HOUR_W = [3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 12, 10, 7, 4]
const METHODS = ['card', 'samsungpay', 'cash', 'coupon']
const METHOD_W = [0.62, 0.2, 0.1, 0.08]
const pad = (n) => String(n).padStart(2, '0')

// 'YYYY-MM-DD' 두 날짜(포함) 사이의 거래를 만든다. 시각은 한국 시간(+09:00)으로 만든다.
export function makeHistory({ from, to, products }) {
  const list = products.filter((p) => p.enabled)
  if (!list.length) return []
  const rows = []
  const end = new Date(`${to}T00:00:00Z`)
  for (let d = new Date(`${from}T00:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10)
    const r = rng(Number(iso.replace(/-/g, '')))
    const dow = d.getUTCDay()
    const base = dow === 0 || dow === 6 ? 16 : dow === 5 ? 12 : 8
    const count = Math.max(2, Math.round(base * (0.6 + r() * 0.8)))
    for (let i = 0; i < count; i++) {
      const hour = pick(r, HOURS, HOUR_W)
      const ts = new Date(`${iso}T${pad(hour)}:${pad(Math.floor(r() * 60))}:${pad(Math.floor(r() * 60))}+09:00`)
      const booth = pick(r, BOOTHS, BOOTH_W)
      const method = pick(r, METHODS, METHOD_W)
      const product = pick(r, list, list.map((p) => (p.cuts === 4 ? 1.4 : 1)))
      const coupon = method === 'coupon'
      rows.push({
        id: randomUUID(),
        booth,
        ts,
        method,
        product: product.id,
        amount: coupon ? 0 : product.price,
        discount: coupon ? product.price : 0,
        coupon: coupon ? 'UE-WEB' : null,
        cuts: product.cuts,
        status: r() < 0.015 ? 'refunded' : 'paid',
      })
    }
  }
  return rows
}
