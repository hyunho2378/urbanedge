// locate.js: 내 위치에서 가게까지의 경로. 브라우저 위치 정보(사용자가 허용할 때만, 한 번 읽고 추적하지 않는다)를 받아 도보 경로를 구한다.
// 개인정보: 위치는 저장하지 않고 우리 서버로 보내지 않는다. 도보 경로를 그리려면 출발 좌표(소수 4자리, 약 11m로 줄여서)가 OpenStreetMap 공개 라우팅 서버(routing.openstreetmap.de)로 간다. 화면 문구에도 그렇게 적는다.
// 거리 규칙: 직선 3km 이하 도보 경로(실패하면 직선), 3km 초과 15km 이하 직선과 길찾기 링크, 15km 초과 그리지 않고 링크만.
import { SHOP } from './shop.js'

export const WALK_MAX_M = 3000
export const DRAW_MAX_M = 15000

const R = 6371008.8
const rad = (d) => (d * Math.PI) / 180
export function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
export function bearingDeg(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat))
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

// 위치 읽기. 실패 사유: unsupported, denied, unavailable, timeout
export function getPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { reject({ reason: 'unsupported' }); return }
    try {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lng: p.coords.longitude, lat: p.coords.latitude, accuracy: p.coords.accuracy }),
        (e) => reject({ reason: e.code === 1 ? 'denied' : e.code === 3 ? 'timeout' : 'unavailable' }),
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
      )
    } catch { reject({ reason: 'unsupported' }) }
  })
}

const straightLine = (from, n = 28) => {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    pts.push([from.lng + (SHOP.lng - from.lng) * t, from.lat + (SHOP.lat - from.lat) * t])
  }
  return pts
}

// 경로 계산. 항상 resolve한다(실패는 직선으로 대체). kind: walk | straight | far
export async function routeToShop(from, { signal } = {}) {
  const straightM = haversine(from, SHOP)
  if (straightM > DRAW_MAX_M) return { kind: 'far', from, line: null, distanceM: Math.round(straightM), straightM }
  if (straightM > WALK_MAX_M) return { kind: 'straight', from, line: straightLine(from), distanceM: Math.round(straightM), straightM }
  const r4 = (v) => Math.round(v * 1e4) / 1e4
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 8000)
    if (signal) signal.addEventListener('abort', () => ctl.abort(), { once: true })
    const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${r4(from.lng)},${r4(from.lat)};${SHOP.lng},${SHOP.lat}?overview=full&geometries=geojson`
    const res = await fetch(url, { signal: ctl.signal, referrerPolicy: 'no-referrer', credentials: 'omit' })
    clearTimeout(timer)
    if (!res.ok) throw new Error(String(res.status))
    const j = await res.json()
    const rt = j.routes?.[0]
    if (j.code !== 'Ok' || !rt || rt.distance > WALK_MAX_M * 1.7) throw new Error('route')
    const line = [[from.lng, from.lat], ...rt.geometry.coordinates, [SHOP.lng, SHOP.lat]].filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1])
    return { kind: 'walk', from, line, distanceM: Math.round(rt.distance), durationS: Math.round(rt.duration), straightM }
  } catch {
    return { kind: 'straight', from, line: straightLine(from), distanceM: Math.round(straightM), straightM, routed: false }
  }
}

// 위치 읽기에서 경로까지 한 번에. 반환: { status: 'ok'|'denied'|'unavailable'|'timeout'|'unsupported'|'far', ...route }
export async function locateAndRoute(opts) {
  let pos
  try { pos = await getPosition() } catch (e) { return { status: e.reason || 'unavailable' } }
  const rt = await routeToShop(pos, opts)
  return { status: rt.kind === 'far' ? 'far' : 'ok', ...rt }
}
