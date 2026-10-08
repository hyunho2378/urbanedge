// baked.js: 구워 둔 JSON을 한 번만 받아 캐시한다. 지도 엔진과 래스터 대체 지도가 같이 쓴다.
import { BAKED } from './shop.js'

const cache = new Map()
export function loadBaked(kind) {
  if (!cache.has(kind)) {
    const p = fetch(BAKED[kind]).then((r) => {
      if (!r.ok) throw new Error(`${kind} ${r.status}`)
      return r.json()
    })
    p.catch(() => cache.delete(kind))
    cache.set(kind, p)
  }
  return cache.get(kind)
}
export const loadRoute = () => Promise.all([loadBaked('route'), loadBaked('places')])
