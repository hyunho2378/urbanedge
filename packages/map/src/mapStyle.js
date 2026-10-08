// mapStyle.js: 황리단길 지도 스타일. OpenFreeMap 벡터 타일(OpenMapTiles 스키마, 키 불필요, 저작권 OpenStreetMap 기여자)을 쓰고
// 레이어와 색은 직접 정의한다(블랙과 옐로우 브랜드). 장소 라벨과 POI는 쓰지 않는다. 가게 둘레는 baked JSON(OSM)에서 온 점과 선만 올린다.
// 테마 전환은 스타일 교체 없이 paint 속성만 바꾼다(paintTable).
import { rgb, rgba, themeColors } from './palette.js'
import { LABEL_PLACE_IDS, CONCEPT_IDS } from './shop.js'

export const TILEJSON = 'https://tiles.openfreemap.org/planet'
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'
const FONT = ['Noto Sans Regular']
const FONT_BOLD = ['Noto Sans Bold']

const zoomWidth = (w14, w19, base = 1.55) => ['interpolate', ['exponential', base], ['zoom'], 14, w14, 19, w19]

// 도로 종류별 [폭 z14, 폭 z19, 외곽 추가 폭]
const ROADS = {
  path: { classes: ['path', 'track'], w: [0.5, 3.2], extra: 1.2, color: 'roadPath' },
  service: { classes: ['service'], w: [0.7, 8], extra: 1.6, color: 'roadMinor' },
  minor: { classes: ['minor'], w: [1.2, 15], extra: 2, color: 'roadMinor' },
  major: { classes: ['tertiary', 'secondary', 'primary', 'trunk', 'motorway'], w: [2, 26], extra: 2.4, color: 'roadMajor' },
}

// 테마마다 달라지는 값을 한곳에 모은 표. buildStyle과 applyTheme이 같이 쓴다.
export function paintTable(theme) {
  const c = themeColors(theme)
  const t = {
    background: { 'background-color': rgb(c.bg) },
    landcover: { 'fill-color': rgb(c.wood), 'fill-opacity': 0.9 },
    park: { 'fill-color': rgb(c.park), 'fill-opacity': 1 },
    water: { 'fill-color': rgb(c.water) },
    waterway: { 'line-color': rgb(c.waterLine) },
    'building-2d': { 'fill-color': rgb(c.building2d), 'fill-opacity': 1 },
    'building-2d-line': { 'line-color': rgb(c.buildingLine), 'line-opacity': 0.9 },
    'road-name': { 'text-color': rgb(c.labelDim), 'text-halo-color': rgb(c.halo) },
    place: { 'text-color': rgb(c.labelDim), 'text-halo-color': rgb(c.halo) },
    'route-casing': { 'line-color': rgb(c.lineCase) },
    'route-line': { 'line-color': rgb(c.routeLine) },
    'station-dot': { 'circle-color': rgb(c.stationFill), 'circle-stroke-color': rgb(c.stationRing) },
    'shop-dot': { 'circle-color': rgb(c.yellow), 'circle-stroke-color': rgb(c.stationRing) },
    'shop-halo': { 'circle-color': rgba(c.yellow, 0.22) },
    'poi-label': { 'text-color': rgb(c.label), 'text-halo-color': rgb(c.halo) },
    'poi-dot': { 'circle-color': rgb(c.label), 'circle-stroke-color': rgb(c.halo) },
    'concept-dot': { 'circle-color': rgb(c.halo), 'circle-stroke-color': rgb(c.labelDim) },
    'concept-label': { 'text-color': rgb(c.labelDim), 'text-halo-color': rgb(c.halo) },
    'me-casing': { 'line-color': rgb(c.lineCase) },
    'me-line': { 'line-color': rgb(c.routeLine) },
    'me-glow': { 'circle-color': rgba(c.yellow, 0.35) },
    'me-head': { 'circle-color': rgb(c.yellowHi), 'circle-stroke-color': rgb(c.stationRing) },
  }
  for (const [key, r] of Object.entries(ROADS)) {
    t[`road-${key}-case`] = { 'line-color': rgb(c.roadCase) }
    t[`road-${key}`] = { 'line-color': rgb(c[r.color]) }
  }
  return t
}

// 하늘과 안개: 기울였을 때 지평선이 바탕색으로 녹아든다.
export function skyFor(theme) {
  const c = themeColors(theme)
  return {
    'sky-color': rgb(c.bg), 'horizon-color': rgb(c.bg), 'fog-color': rgb(c.bg),
    'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.7, 'fog-ground-blend': 0.35, 'atmosphere-blend': 0,
  }
}

export const EMPTY_FC = { type: 'FeatureCollection', features: [] }
export const EMPTY_LINE = { type: 'FeatureCollection', features: [] }

const roadFilter = (classes) => ['all', ['in', ['get', 'class'], ['literal', classes]], ['!=', ['get', 'brunnel'], 'tunnel']]

export function buildStyle({ theme = 'dark', lang = 'en', route, stations, places, shop, concept }) {
  const P = paintTable(theme)
  const nameField = lang === 'ko' ? ['coalesce', ['get', 'name:ko'], ['get', 'name']] : ['coalesce', ['get', 'name:en'], ['get', 'name']]
  const layers = [
    { id: 'background', type: 'background', paint: P.background },
    { id: 'landcover', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', ['get', 'class'], ['literal', ['wood', 'grass', 'farmland']]], paint: P.landcover },
    { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: P.park },
    { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: P.water },
    { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway', paint: { ...P.waterway, 'line-width': zoomWidth(0.6, 5) } },
    { id: 'building-2d', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14.5, paint: P['building-2d'] },
    { id: 'building-2d-line', type: 'line', source: 'omt', 'source-layer': 'building', minzoom: 16, paint: { ...P['building-2d-line'], 'line-width': 0.7 } },
  ]
  for (const key of ['path', 'service', 'minor', 'major']) {
    const r = ROADS[key]
    const f = roadFilter(r.classes)
    const layout = { 'line-cap': 'round', 'line-join': 'round' }
    layers.push({ id: `road-${key}-case`, type: 'line', source: 'omt', 'source-layer': 'transportation', filter: f, layout, paint: { ...P[`road-${key}-case`], 'line-width': zoomWidth(r.w[0] + r.extra * 0.6, r.w[1] + r.extra * 2) } })
  }
  for (const key of ['path', 'service', 'minor', 'major']) {
    const r = ROADS[key]
    const f = roadFilter(r.classes)
    const layout = { 'line-cap': 'round', 'line-join': 'round' }
    layers.push({ id: `road-${key}`, type: 'line', source: 'omt', 'source-layer': 'transportation', filter: f, layout, paint: { ...P[`road-${key}`], 'line-width': zoomWidth(r.w[0], r.w[1]) } })
  }
  layers.push(
    // 3D 건물 사용자 정의 레이어(three.js)는 engine에서 route-casing 앞에 끼워 넣는다.
    { id: 'route-casing', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { ...P['route-casing'], 'line-width': ['interpolate', ['linear'], ['zoom'], 14, 6, 17, 13, 19.5, 26] } },
    { id: 'route-line', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { ...P['route-line'], 'line-width': ['interpolate', ['linear'], ['zoom'], 14, 3, 17, 7.5, 19.5, 15] } },
    { id: 'poi-dot', type: 'circle', source: 'places', filter: ['==', ['get', 'role'], 'landmark'], paint: { ...P['poi-dot'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 2.5, 19, 5], 'circle-stroke-width': 2 } },
    { id: 'station-dot', type: 'circle', source: 'stations', paint: { ...P['station-dot'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 4.5, 17, 7, 19.5, 11], 'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 15, 2.5, 19, 4.5] } },
    { id: 'shop-halo', type: 'circle', source: 'shop', paint: { ...P['shop-halo'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 12, 19, 40], 'circle-pitch-alignment': 'map' } },
    { id: 'shop-dot', type: 'circle', source: 'shop', paint: { ...P['shop-dot'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 15, 6, 19, 14], 'circle-stroke-width': 3.5, 'circle-pitch-alignment': 'map' } },
    { id: 'concept-dot', type: 'circle', source: 'concept', layout: { visibility: 'none' }, paint: { ...P['concept-dot'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 4, 17, 7], 'circle-stroke-width': 2, 'circle-stroke-opacity': 0.9 } },
    { id: 'me-casing', type: 'line', source: 'me', layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' }, paint: { ...P['me-casing'], 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 5, 17, 13, 19.5, 26] } },
    { id: 'me-line', type: 'line', source: 'me', layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' }, paint: { ...P['me-line'], 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2.5, 17, 7.5, 19.5, 15] } },
    { id: 'me-glow', type: 'circle', source: 'mehead', layout: { visibility: 'none' }, paint: { ...P['me-glow'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 12, 17, 24, 19.5, 44], 'circle-blur': 0.9 } },
    { id: 'me-head', type: 'circle', source: 'mehead', layout: { visibility: 'none' }, paint: { ...P['me-head'], 'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 4, 17, 7, 19.5, 11], 'circle-stroke-width': 2.5 } },
    {
      id: 'concept-label', type: 'symbol', source: 'concept', minzoom: 12, layout: {
        visibility: 'none',
        'text-field': ['format', ['get', 'tag'], { 'font-scale': 0.72, 'text-font': ['literal', FONT_BOLD] }, '\n', {}, ['get', 'title'], {}, ['get', 'sub'], { 'font-scale': 0.82 }],
        'text-font': FONT, 'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 17, 13], 'text-anchor': 'top', 'text-offset': [0, 0.9], 'text-max-width': 9, 'text-letter-spacing': 0.02,
      },
      paint: { ...P['concept-label'], 'text-halo-width': 1.8 },
    },
    {
      id: 'road-name', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 15,
      filter: ['!=', ['get', 'class'], 'rail'],
      layout: { 'symbol-placement': 'line', 'text-field': nameField, 'text-font': FONT, 'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10, 19, 13], 'text-letter-spacing': 0.02, 'text-max-angle': 35 },
      paint: { ...P['road-name'], 'text-halo-width': 1.6 },
    },
    {
      id: 'place', type: 'symbol', source: 'omt', 'source-layer': 'place', maxzoom: 16.4,
      filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'quarter']]],
      layout: { 'text-field': nameField, 'text-font': FONT_BOLD, 'text-size': 12, 'text-letter-spacing': 0.12, 'text-transform': 'uppercase' },
      paint: { ...P.place, 'text-halo-width': 1.8 },
    },
    {
      id: 'poi-label', type: 'symbol', source: 'places', minzoom: 14.5,
      layout: {
        'text-field': ['format', ['get', 'title'], {}, ['get', 'sub'], { 'font-scale': 0.82 }],
        'text-font': FONT,
        'text-size': ['interpolate', ['linear'], ['zoom'], 15, 11, 19, 14],
        'text-anchor': 'top',
        'text-offset': [0, 0.9],
        'text-max-width': 9,
        'text-padding': 4,
        'symbol-sort-key': ['get', 'rank'],
      },
      paint: { ...P['poi-label'], 'text-halo-width': 1.8 },
    },
  )
  return {
    version: 8,
    name: 'urbanedge-hwangnidan',
    glyphs: GLYPHS,
    sky: skyFor(theme),
    sources: {
      omt: { type: 'vector', url: TILEJSON },
      route: { type: 'geojson', data: route },
      stations: { type: 'geojson', data: stations },
      places: { type: 'geojson', data: places },
      shop: { type: 'geojson', data: shop },
      concept: { type: 'geojson', data: concept },
      me: { type: 'geojson', data: EMPTY_LINE },
      mehead: { type: 'geojson', data: EMPTY_FC },
    },
    layers,
  }
}

// 라벨용 GeoJSON을 만든다. 언어마다 제목과 보조 줄이 다르다. 모두 OSM 태그에서 온 이름이다(만들어 낸 이름 없음).
const feature = (lng, lat, props) => ({ type: 'Feature', properties: props, geometry: { type: 'Point', coordinates: [lng, lat] } })
const fc = (features) => ({ type: 'FeatureCollection', features })
const labelOf = (lang, ko, en) => {
  if (lang === 'ko') return { title: ko || en, sub: en && ko ? `\n${en}` : '' }
  return { title: en || ko, sub: en && ko ? `\n${ko}` : '' }
}

export function buildOverlayData({ route, places, concept, shop, lang, t, showConcept = false }) {
  const line = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.line } }
  // 정거장 점: 출발(OSM 노드 "황리단길" 버스 정류장). 가게(H01)는 shop 소스와 핀이 그린다. 지도에는 H01 하나만 노선 정거장이고, 나머지는 OSM 장소 점이다.
  const from = route.from
  const stations = [feature(from.lng, from.lat, { kind: 'start' })]
  // 라벨 점: 출발 정류장과 가까운 문화재와 전시관(허용 OSM 아이디만. 전부 baked places.json의 이름과 태그 그대로)
  const wanted = new Set(LABEL_PLACE_IDS)
  const labels = []
  labels.push(feature(from.lng, from.lat, { role: 'start', rank: 1, ...(lang === 'ko' ? { title: from.name, sub: `\n${t.busStop}` } : { title: `Hwangridan-gil ${t.busStop.toLowerCase()}`, sub: `\n${from.name}` }) }))
  for (const p of places.places) {
    if (!wanted.has(p.osm)) continue
    if (showConcept && CONCEPT_IDS.includes(p.osm)) continue // 후보 역으로 따로 그린다
    const lb = labelOf(lang, p.name, p.nameEn)
    labels.push(feature(p.lng, p.lat, { role: 'landmark', rank: 5, title: lb.title, sub: lb.sub }))
  }
  // 후보 역(Concept stop): 대릉원, 첨성대, 동궁과 월지. 이름은 OSM 태그 그대로이고 거리와 시간은 싣지 않는다.
  const conceptFc = fc((concept?.stops || []).map((st) => {
    const lb = labelOf(lang, st.name, st.nameEn)
    return feature(st.lng, st.lat, { tag: t.conceptTag.toUpperCase(), title: lb.title, sub: lb.sub })
  }))
  return {
    concept: conceptFc,
    route: fc([line]),
    stations: fc(stations),
    places: fc(labels),
    shop: fc([feature(shop.lng, shop.lat, { kind: 'shop' })]),
  }
}
