// ops/history.js: '지난 기록 불러오기'가 만드는 올해 1월 1일부터 어제까지의 거래.
// 부스 비율은 운영사 인터뷰의 말(지하철이 가장 많고 노래방이 가장 적다)에 맞춘 값이고, 시간대와 요일도 일반적인 모양(낮 늦게부터 저녁, 주말 많음)으로 만든다.
import { BOOTHS, METHODS } from './store.js'

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

const BOOTH_W = { retro: 0.3, karaoke: 0.17, subway: 0.53 }
// 10시~23시 (영업 10:00~24:00)
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const HOUR_W = [3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 12, 10, 7, 4]
const METHOD_W = { card: 0.62, samsungpay: 0.2, cash: 0.1, coupon: 0.08 }

export function makeHistoryTx({ products, now = Date.now(), seed = 20261009 } = {}) {
  const r = rng(seed)
  const list = products.filter((p) => p.enabled)
  const today = new Date(now)
  const start = new Date(today.getFullYear(), 0, 1)
  const rows = []
  let n = 0
  for (let d = new Date(start); d < new Date(today.getFullYear(), today.getMonth(), today.getDate()); d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    const base = dow === 0 || dow === 6 ? 16 : dow === 5 ? 12 : 8
    const count = Math.max(2, Math.round(base * (0.6 + r() * 0.8)))
    for (let i = 0; i < count; i++) {
      const hour = pick(r, HOURS, HOUR_W)
      const ts = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, Math.floor(r() * 60), Math.floor(r() * 60)).getTime()
      const booth = pick(r, BOOTHS.map((b) => b.id), BOOTHS.map((b) => BOOTH_W[b.id]))
      const method = pick(r, METHODS, METHODS.map((m) => METHOD_W[m]))
      const product = pick(r, list, list.map((p) => (p.cuts === 4 ? 1.4 : 1)))
      const coupon = method === 'coupon'
      rows.push({
        id: `h-${n++}`,
        booth,
        ts,
        method,
        amount: coupon ? 0 : product.price,
        discount: coupon ? product.price : 0,
        coupon: coupon ? 'UE-WEB' : null,
        cuts: product.cuts,
        frameId: null,
        product: product.id,
        status: r() < 0.015 ? 'refunded' : 'paid',
      })
    }
  }
  return rows
}
