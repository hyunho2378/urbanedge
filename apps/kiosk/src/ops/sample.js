// ops/sample.js: 대시보드 시연용 샘플 거래. 모든 행에 sample: true가 붙고 화면에는 '샘플 포함' 표시가 따라붙는다.
// 실제 매출이 아니다. 부스 비율과 시간대 분포는 임의(균등에 가까운 무작위)이며 어떤 실측도 흉내 내지 않는다.
import { BOOTHS, METHODS } from './store.js'

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

// 올해 1월 1일부터 지금까지, 하루 0~14건, 영업시간 10시~24시 사이.
export function makeSampleTx({ price = 7000, now = Date.now(), seed = 20261009 } = {}) {
  const r = rng(seed)
  const end = new Date(now)
  const start = new Date(end.getFullYear(), 0, 1)
  const rows = []
  let n = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const count = Math.floor(r() * 15)
    for (let i = 0; i < count; i++) {
      const hour = 10 + Math.floor(r() * 14)
      const ts = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, Math.floor(r() * 60), Math.floor(r() * 60)).getTime()
      if (ts > now) continue
      const booth = BOOTHS[Math.floor(r() * BOOTHS.length)].id
      const method = METHODS[Math.floor(r() * METHODS.length)]
      const cuts = r() < 0.5 ? 4 : 8
      const coupon = method === 'coupon'
      const refunded = r() < 0.02
      rows.push({
        id: `sample-${n++}`,
        booth,
        ts,
        method,
        amount: coupon ? 0 : price,
        discount: coupon ? price : 0,
        coupon: coupon ? 'SAMPLE' : null,
        cuts,
        frameId: null,
        status: refunded ? 'refunded' : 'paid',
      })
    }
  }
  return rows
}
