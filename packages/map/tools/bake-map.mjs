// bake-map.mjs: 황리단길 지도 데이터를 한 번 구워 apps/web/public/map/*.json 으로 저장한다. 런타임에는 어떤 API도 부르지 않는다.
// 사용: node packages/map/tools/bake-map.mjs   (루트에서 실행. 네트워크가 필요하다)
// 자료 출처: OpenStreetMap 기여자(ODbL 1.0). 건물과 장소는 Overpass API(미러 순서대로 재시도), 도보 경로는 routing.openstreetmap.de(OSRM foot 프로필).
// miri(tools/bake-basemap, client/src/three/buildingBuild.js)의 방식을 따른다. 건물 윤곽을 원점 기준 미터 평면으로 바꿔 좌표를 정수 데시미터로 저장한다.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', '..', '..', 'apps', 'web', 'public', 'map')
mkdirSync(OUT, { recursive: true })

// 가게 좌표(지오코딩 결과). packages/map/src/shop.js 의 SHOP 과 같아야 한다.
const SHOP = { lat: 35.83751, lng: 129.20919 }
const RADIUS = 620 // 미터. 화면 반경 약 600m에 여유를 둔다
const UA = 'UrbanEdgeMapBuild/1.0 (student project, Hallym Univ.)'
const MIRRORS = [
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

async function overpass(query) {
  let lastErr
  for (let round = 0; round < 3; round++) {
    for (const ep of MIRRORS) {
      try {
        const res = await fetch(ep, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(query) })
        if (!res.ok) throw new Error(`${ep} ${res.status}`)
        const json = await res.json()
        if (json.elements) return json
      } catch (e) { lastErr = e; console.warn('overpass 실패, 다음 미러', String(e.message || e).slice(0, 80)) }
    }
    await new Promise((r) => setTimeout(r, 4000))
  }
  throw lastErr
}

// 위경도를 가게 기준 평면(동쪽 x, 북쪽 y)으로 바꾼다. 600m 안이라 등장방형 근사로 충분하다.
const M_LAT = 111132.92
const M_LNG = 111412.84 * Math.cos((SHOP.lat * Math.PI) / 180) - 93.5 * Math.cos((3 * SHOP.lat * Math.PI) / 180)
const toXY = (lng, lat) => [(lng - SHOP.lng) * M_LNG, (lat - SHOP.lat) * M_LAT]
const dm = (v) => Math.round(v * 10)

function inRing(x, y, r) {
  let ins = false
  for (let i = 0, k = r.length - 1; i < r.length; k = i++) {
    const [xi, yi] = r[i], [xk, yk] = r[k]
    if ((yi > y) !== (yk > y) && x < ((xk - xi) * (y - yi)) / (yk - yi) + xi) ins = !ins
  }
  return ins
}
function area(r) { let a = 0; for (let i = 0, k = r.length - 1; i < r.length; k = i++) a += (r[k][0] * r[i][1]) - (r[i][0] * r[k][1]); return a / 2 }

function distPointSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)))
  return { d: Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy)), t }
}

async function bakeBuildings() {
  const q = `[out:json][timeout:90];(way["building"](around:${RADIUS},${SHOP.lat},${SHOP.lng});rel["building"](around:${RADIUS},${SHOP.lat},${SHOP.lng}););out geom tags;`
  const json = await overpass(q)
  const out = []
  let shopId = null
  const shopXY = [0, 0]
  const pushRing = (id, tags, ringLL) => {
    if (ringLL.length < 4) return
    let ring = ringLL.map((p) => toXY(p.lon, p.lat))
    if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring = ring.slice(0, -1)
    if (ring.length < 3 || Math.abs(area(ring)) < 4) return // 4㎡ 미만은 건물로 보지 않는다
    const b = { id, p: ring.flatMap(([x, y]) => [dm(x), dm(y)]) }
    const lv = parseFloat(tags['building:levels'])
    const hv = parseFloat(tags.height)
    // 높이는 OSM 태그(height, building:levels)가 있을 때만 싣는다. 없으면 클라이언트가 같은 기본값을 쓴다.
    if (Number.isFinite(hv) && hv > 0) b.h = Math.round(hv * 10) / 10
    else if (Number.isFinite(lv) && lv > 0) b.l = lv
    if (inRing(shopXY[0], shopXY[1], ring)) shopId = id
    out.push(b)
  }
  for (const e of json.elements) {
    if (e.type === 'way' && e.geometry) pushRing(e.id, e.tags || {}, e.geometry)
    else if (e.type === 'relation' && e.members) {
      // 다중 폴리곤은 닫힌 바깥 고리 하나인 경우만 쓴다(구멍은 무시)
      const outers = e.members.filter((m) => m.role === 'outer' && m.geometry)
      if (outers.length === 1) pushRing(e.id, e.tags || {}, outers[0].geometry)
    }
  }
  const tagged = out.filter((b) => b.h || b.l).length
  const file = {
    v: 1,
    origin: [SHOP.lng, SHOP.lat],
    unit: 'dm', // 정수 1 = 0.1m. x 동쪽, y 북쪽
    radiusM: RADIUS,
    osmBase: json.osm3s?.timestamp_osm_base,
    attribution: '© OpenStreetMap contributors, ODbL 1.0',
    shopBuilding: shopId,
    heightNote: '높이는 OSM 태그가 있는 건물에만 있다. 나머지는 클라이언트의 기본 높이로 그린다(예시 높이).',
    buildings: out,
  }
  writeFileSync(join(OUT, 'buildings.json'), JSON.stringify(file))
  console.log(`buildings.json ${out.length}동, 높이 태그 ${tagged}동, 가게 건물 ${shopId}`)
  return file
}

async function bakeRoute() {
  // 출발점: OSM 노드 "황리단길"(버스 정류장, n3756798918). 가게: SHOP.
  const q = `[out:json][timeout:60];node(3756798918);out body;`
  const j = await overpass(q)
  const stop = j.elements[0]
  if (!stop || stop.tags?.name !== '황리단길') throw new Error('출발 노드 확인 실패')
  const from = [stop.lon, stop.lat]
  const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${from[0]},${from[1]};${SHOP.lng},${SHOP.lat}?overview=full&geometries=geojson&steps=true`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  const r = await res.json()
  if (r.code !== 'Ok') throw new Error('OSRM 실패 ' + r.code)
  const route = r.routes[0]
  // 선: 정류장 점에서 시작해 도로에 붙은 경로를 따르고 가게 점에서 끝낸다.
  const line = [from, ...route.geometry.coordinates, [SHOP.lng, SHOP.lat]].filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1])
  const xy = line.map(([lng, lat]) => toXY(lng, lat))
  const cum = [0]
  for (let i = 1; i < xy.length; i++) cum.push(cum[i - 1] + Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]))
  const total = cum[cum.length - 1]
  const along = (p) => {
    let best = { d: Infinity, s: 0 }
    for (let i = 1; i < xy.length; i++) {
      const { d, t } = distPointSeg(p, xy[i - 1], xy[i])
      if (d < best.d) best = { d, s: cum[i - 1] + t * (cum[i] - cum[i - 1]) }
    }
    return best
  }
  // 경로 둘레(60m 안)의 OSM 장소. 공공과 문화 장소만 쓴다(상점은 쓰지 않는다).
  const around = await overpass(`[out:json][timeout:60];(nwr["name"]["tourism"~"attraction|museum"](around:260,${SHOP.lat},${SHOP.lng});nwr["name"]["historic"](around:260,${SHOP.lat},${SHOP.lng}););out center tags;`)
  const near = []
  for (const e of around.elements) {
    const c = e.center || { lat: e.lat, lon: e.lon }
    const p = toXY(c.lon, c.lat)
    const a = along(p)
    if (a.d <= 70) near.push({ osm: `${e.type}/${e.id}`, name: e.tags.name, nameEn: e.tags['name:en'] || null, tags: pick(e.tags), lng: c.lon, lat: c.lat, distToRouteM: Math.round(a.d), s: Math.round(a.s) })
  }
  // 교차점: 경로 안에서 길 이름이 바뀌는 지점(steps)
  const steps = route.legs[0].steps.filter((s) => s.name)
  const streets = steps.map((s) => ({ name: s.name, distanceM: Math.round(s.distance) }))
  const file = {
    v: 1,
    profile: 'foot',
    source: 'OSRM(routing.openstreetmap.de, foot 프로필), 도로 데이터 © OpenStreetMap contributors, ODbL 1.0',
    osmBase: j.osm3s?.timestamp_osm_base,
    from: { osm: 'node/3756798918', name: stop.tags.name, tags: pick(stop.tags), lng: from[0], lat: from[1] },
    distanceM: Math.round(total),
    durationS: Math.round(route.duration),
    line: line.map(([lng, lat]) => [Math.round(lng * 1e6) / 1e6, Math.round(lat * 1e6) / 1e6]),
    streets,
    nearRoute: near.sort((a, b) => a.s - b.s),
  }
  writeFileSync(join(OUT, 'route.json'), JSON.stringify(file))
  console.log(`route.json ${Math.round(total)}m, ${line.length}점, 둘레 장소 ${near.length}곳`, streets.map((s) => s.name).join(' > '))
  return file
}

const pick = (t) => Object.fromEntries(Object.entries(t).filter(([k]) => ['name', 'name:en', 'name:ko', 'tourism', 'historic', 'highway', 'public_transport', 'amenity'].includes(k)))

async function bakePlaces() {
  // 600m 안의 공공과 문화 장소(이름이 있는 것). 지도 라벨 후보다.
  const q = `[out:json][timeout:60];(
    nwr["name"]["tourism"~"attraction|museum"](around:${RADIUS},${SHOP.lat},${SHOP.lng});
    nwr["name"]["historic"~"tomb|archaeological_site|monument"](around:${RADIUS},${SHOP.lat},${SHOP.lng});
    node["name"="황리단길"]["highway"="bus_stop"](around:${RADIUS},${SHOP.lat},${SHOP.lng});
  );out center tags;`
  const j = await overpass(q)
  const places = j.elements.map((e) => {
    const c = e.center || { lat: e.lat, lon: e.lon }
    return { osm: `${e.type}/${e.id}`, name: e.tags.name, nameEn: e.tags['name:en'] || null, tags: pick(e.tags), lng: c.lon, lat: c.lat, d: Math.round(Math.hypot(...toXY(c.lon, c.lat))) }
  }).sort((a, b) => a.d - b.d)
  const file = { v: 1, osmBase: j.osm3s?.timestamp_osm_base, attribution: '© OpenStreetMap contributors, ODbL 1.0', places }
  writeFileSync(join(OUT, 'places.json'), JSON.stringify(file))
  console.log(`places.json ${places.length}곳`)
}

async function bakeConcept() {
  // 후보 역(Concept stop): 대릉원, 첨성대, 동궁과 월지. 실제 부스가 아니므로 이름과 좌표만 싣는다(거리와 시간은 싣지 않는다).
  const q = `[out:json][timeout:60];(way(42435919);way(382132601);way(477417220););out center tags;`
  const j = await overpass(q)
  const stops = j.elements.map((e) => ({ osm: `${e.type}/${e.id}`, name: e.tags.name, nameEn: e.tags['name:en'] || null, tags: pick(e.tags), lng: e.center.lon, lat: e.center.lat }))
  writeFileSync(join(OUT, 'concept.json'), JSON.stringify({ v: 1, osmBase: j.osm3s?.timestamp_osm_base, attribution: '© OpenStreetMap contributors, ODbL 1.0', stops }))
  console.log(`concept.json ${stops.length}곳`, stops.map((x) => x.nameEn || x.name).join(', '))
}

await bakeBuildings()
await bakeRoute()
await bakePlaces()
await bakeConcept()
console.log('완료:', OUT)
