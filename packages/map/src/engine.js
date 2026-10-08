// engine.js: MapLibre 지도 본체. 이 파일만 maplibre-gl과 three를 불러오고, HwangnidanMap이 화면에 들어올 때 동적으로 불러온다.
// miri의 MapCanvas.jsx와 barsLayer.js 방식: 스타일 JSON 위에 three.js 사용자 정의 레이어를 얹고, 마커와 컨트롤은 DOM으로 둔다.
// 어떤 기기에서도 던지지 않는 것이 원칙이다: 사용자 정의 레이어와 컨텍스트 손실은 onFatal로 올려 보내 래스터 지도로 대체한다.
import { Map as MlMap, Marker, MercatorCoordinate, setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { SHOP, STATION, LINE } from './shop.js'
import { loadBaked } from './baked.js'
import { buildOverlayData, buildStyle, paintTable, skyFor, EMPTY_FC } from './mapStyle.js'
import { createBuildingsLayer } from './buildingsLayer.js'
import { bearingDeg } from './locate.js'
import { pickText } from './i18n.js'

setWorkerUrl(workerUrl)

const PITCH_3D = 60
const BEARING_3D = -24
const MAX_PITCH = 68
const ZOOM_MAX = 19.6
const easeOutCubic = (t) => 1 - (1 - t) ** 3

// 화면 크기에서 픽셀 비율을 정한다. 모바일은 1.5, 그 밖에는 2를 넘기지 않고, 캔버스가 너무 크면 더 낮춘다(약 400만 픽셀 상한).
export function pickPixelRatio(w, h) {
  const dpr = window.devicePixelRatio || 1
  const coarse = window.matchMedia?.('(pointer: coarse)').matches || w <= 768
  let pr = Math.min(dpr, coarse ? 1.5 : 2)
  const px = w * h * pr * pr
  if (px > 4e6) pr = Math.max(1, Math.sqrt(4e6 / (w * h)))
  return pr
}

const lineBounds = (line) => {
  let w0 = Infinity, e0 = -Infinity, s0 = Infinity, n0 = -Infinity
  for (const [lng, la] of line) { w0 = Math.min(w0, lng); e0 = Math.max(e0, lng); s0 = Math.min(s0, la); n0 = Math.max(n0, la) }
  return [[w0, s0], [e0, n0]]
}

export async function createEngine({ container, theme, mode, lang, showRoute, showConcept = false, reducedMotion, cooperative = true, onFatal }) {
  const [route, places, buildings, concept] = await Promise.all([loadBaked('route'), loadBaked('places'), loadBaked('buildings'), loadBaked('concept').catch(() => ({ stops: [] }))])
  const t = pickText(lang)
  const state = { theme, mode, lang, showRoute, showConcept, reduced: !!reducedMotion, active: true, meOn: false }
  const w = container.clientWidth || 800
  const h = container.clientHeight || 600
  const data = buildOverlayData({ route, places, concept, shop: SHOP, lang, t, showConcept })
  const style = buildStyle({ theme, lang, ...data })

  // MapLibre 줌은 512px 타일 기준이라 줌 0의 m/px가 78271.517이다(표준 256px 줌보다 1 낮다).
  const mpp0 = 78271.517 * Math.cos((SHOP.lat * Math.PI) / 180)
  // 한 번에 보이는 범위가 약 2km를 넘지 않게 최소 줌을 정한다(구운 건물 반경 620m 바깥이 드러나는 것을 막는다)
  const baseMinZoom = Math.min(17, Math.max(14.8, Math.log2((mpp0 * Math.max(w, h)) / 2000)))
  const BASE_BOUNDS = [[SHOP.lng - 0.011, SHOP.lat - 0.0085], [SHOP.lng + 0.011, SHOP.lat + 0.0085]]
  // 후보 역까지 보일 때는 동궁과 월지(동쪽 약 1.7km)까지 열어 둔다
  const conceptBounds = () => {
    const b = lineBounds([[SHOP.lng, SHOP.lat], ...(concept.stops || []).map((s) => [s.lng, s.lat])])
    return [[Math.min(BASE_BOUNDS[0][0], b[0][0] - 0.004), Math.min(BASE_BOUNDS[0][1], b[0][1] - 0.004)], [Math.max(BASE_BOUNDS[1][0], b[1][0] + 0.004), Math.max(BASE_BOUNDS[1][1], b[1][1] + 0.004)]]
  }
  const curBounds = () => (state.showConcept ? conceptBounds() : BASE_BOUNDS)
  const curMinZoom = () => (state.showConcept ? Math.max(12.8, baseMinZoom - 1.7) : baseMinZoom)

  const map = new MlMap({
    container,
    style,
    center: [SHOP.lng, SHOP.lat],
    zoom: 17,
    minZoom: curMinZoom(),
    maxZoom: ZOOM_MAX,
    pitch: mode === '3d' ? PITCH_3D : 0,
    bearing: mode === '3d' ? BEARING_3D : 0,
    maxPitch: mode === '3d' ? MAX_PITCH : 0,
    maxBounds: curBounds(),
    renderWorldCopies: false,
    pixelRatio: pickPixelRatio(w, h),
    fadeDuration: state.reduced ? 0 : 200,
    cooperativeGestures: !!cooperative,
    attributionControl: { compact: true },
    canvasContextAttributes: { antialias: (window.devicePixelRatio || 1) < 2, powerPreference: 'high-performance' },
    localIdeographFontFamily: "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    locale: {
      'Map.Title': t.region,
      'CooperativeGesturesHandler.WindowsHelpText': lang === 'ko' ? 'Ctrl 키를 누른 채 스크롤하면 지도가 확대된다' : 'Use Ctrl + scroll to zoom the map',
      'CooperativeGesturesHandler.MacHelpText': lang === 'ko' ? '⌘ 키를 누른 채 스크롤하면 지도가 확대된다' : 'Use ⌘ + scroll to zoom the map',
      'CooperativeGesturesHandler.MobileHelpText': lang === 'ko' ? '두 손가락으로 지도를 움직인다' : 'Use two fingers to move the map',
    },
    dragRotate: true,
    touchPitch: true,
  })
  const canvas = map.getCanvas()
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onFatal?.(new Error('webglcontextlost')) })
  map.on('error', (e) => {
    const msg = String(e?.error?.message || '')
    if (/WebGL|webgl|context/i.test(msg)) onFatal?.(e.error)
  })

  // ---- 카메라 ----
  const routeBounds = () => {
    const b = lineBounds([...route.line, [SHOP.lng, SHOP.lat]])
    return [[b[0][0] - 0.00012, b[0][1] - 0.0001], [b[1][0] + 0.00012, b[1][1] + 0.0001]]
  }
  const homeCamera = (md) => {
    const cw = container.clientWidth || w, ch = container.clientHeight || h
    // 3D 핀(약 200px 폭)이 가장자리에 잘리지 않도록 좁은 화면에서는 좌우 여백을 더 둔다.
    const sidePad = md === '3d' && cw < 640 ? 88 : Math.round(Math.min(48, cw * 0.1))
    const cam = map.cameraForBounds(routeBounds(), {
      padding: { top: md === '3d' ? Math.min(190, ch * 0.3) : Math.min(72, ch * 0.14), bottom: Math.min(80, ch * 0.16), left: sidePad, right: sidePad },
      bearing: md === '3d' ? BEARING_3D : 0,
      maxZoom: md === '3d' ? 17.8 : 18.4,
    })
    // 기울인 화면은 세로가 cos(pitch)로 줄어 같은 경로가 더 작게 보이므로 조금 더 확대한다.
    const zoom = (cam?.zoom ?? 17) + (md === '3d' ? 0.15 : 0)
    const c = cam?.center ?? { lng: SHOP.lng, lat: SHOP.lat }
    return { center: [c.lng, c.lat], zoom: Math.max(map.getMinZoom(), zoom), pitch: md === '3d' ? PITCH_3D : 0, bearing: md === '3d' ? BEARING_3D : 0 }
  }
  const go = (opts, ms = 700) => {
    if (state.reduced || ms === 0) map.jumpTo(opts)
    else map.easeTo({ ...opts, duration: ms, essential: false })
  }

  // ---- 가게 핀(GY-01 UrbanEdge) ----
  const pin = document.createElement('button')
  pin.type = 'button'
  pin.className = 'uemap-pin'
  const badge = document.createElement('span'); badge.className = 'uemap-pin__badge'; badge.setAttribute('aria-hidden', 'true'); badge.textContent = LINE.code
  const tx = document.createElement('span'); tx.className = 'uemap-pin__text'
  const code = document.createElement('span'); code.className = 'uemap-pin__code'
  const name = document.createElement('span'); name.className = 'uemap-pin__name'
  tx.append(code, name); pin.append(badge, tx)
  const wrap = document.createElement('div')
  wrap.className = 'uemap-pin-wrap'
  wrap.appendChild(pin)
  const setPinText = () => {
    const tt = pickText(state.lang)
    code.textContent = STATION.code
    name.textContent = tt.station
    pin.setAttribute('aria-label', `${STATION.code} ${tt.stationFull}. ${tt.recenter}`)
  }
  setPinText()
  const marker = new Marker({ element: wrap, anchor: 'bottom', offset: [0, -8] }).setLngLat([SHOP.lng, SHOP.lat]).addTo(map)
  pin.addEventListener('click', () => go(homeCamera(state.mode), 700))

  // ---- 3D 건물 레이어 ----
  const bl = createBuildingsLayer({
    id: 'buildings-3d',
    MercatorCoordinate,
    origin: [buildings.origin[0], buildings.origin[1]],
    data: buildings,
    route: { line: route.line, stations: data.stations.features.map((f) => f.geometry.coordinates) },
    theme,
    reducedMotion: state.reduced,
    onFrame: (off, _g, base) => {
      // 3D에서 핀을 빛기둥 꼭대기 위로 올린다(화면 위로 벗어나면 위쪽 가장자리 안으로 붙인다). 2D이면 가게 점 위에 둔다.
      if (off && state.mode === '3d') {
        const narrow = (container.clientWidth || w) < 560
        const minY = base ? (narrow ? 124 : 62) - base[1] : -1e5 // 핀 아래 끝이 컨트롤 줄 아래(좁은 화면은 한 줄 더 아래)에 오도록
        marker.setOffset([off[0], Math.max(off[1], minY) - 8])
      } else marker.setOffset([0, -14])
    },
  })
  // 어떤 기기에서도 던지지 않도록 사용자 정의 레이어의 모든 진입점을 감싼다.
  const guard = (fn) => (...a) => { try { return fn(...a) } catch (err) { onFatal?.(err); return undefined } }
  bl.layer.onAdd = guard(bl.layer.onAdd)
  bl.layer.render = guard(bl.layer.render)

  let styleReady = false
  const ready = new Promise((resolve) => {
    let done = false
    const finish = () => { if (!done) { done = true; resolve() } }
    map.on('style.load', () => {
      try {
        if (!map.getLayer('buildings-3d')) map.addLayer(bl.layer, 'route-casing')
      } catch (err) { onFatal?.(err); finish(); return }
      styleReady = true
      bl.setGrow(state.mode === '3d' ? 1 : 0)
      applyShowRoute()
      applyShowConcept()
      go(homeCamera(state.mode), 0)
    })
    map.once('load', () => {
      // 좁은 화면에서는 출처 표기를 "i" 버튼 뒤로 접는다(MapLibre 기본은 펼친 채로 시작한다). 버튼은 항상 보인다.
      const at = container.querySelector('.maplibregl-ctrl-attrib')
      if (at && at.classList.contains('maplibregl-compact')) { at.classList.remove('maplibregl-compact-show'); at.removeAttribute('open') }
      finish()
    })
    setTimeout(finish, 9000) // 타일 서버가 느려도 컨트롤을 막지 않는다
  })

  // 2D에서는 MapLibre 선과 점, 3D에서는 three 리본이 경로를 그린다(건물에 가려지지 않게). 이름표와 장소 점은 항상 MapLibre.
  const FLAT_ROUTE = ['route-casing', 'route-line', 'station-dot']
  const ALWAYS_ROUTE = ['poi-dot', 'poi-label']
  const ME_FLAT = ['me-casing', 'me-line', 'me-glow', 'me-head']
  const vis = (id, on) => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none') }
  function applyShowRoute() {
    const flat = state.showRoute && state.mode === '2d'
    for (const id of FLAT_ROUTE) vis(id, flat)
    for (const id of ALWAYS_ROUTE) vis(id, state.showRoute)
    bl.setRoute(state.showRoute)
    const meFlat = state.meOn && state.mode === '2d'
    for (const id of ME_FLAT) vis(id, meFlat)
    bl.setMeVisible(state.meOn && state.mode === '3d')
  }
  function applyShowConcept() {
    vis('concept-dot', state.showConcept)
    vis('concept-label', state.showConcept)
  }

  // ---- 내 위치 경로: 사용자 점에서 가게까지 노란 선이 뻗어 나가고 끝에 신호탑이 켜진다 ----
  let meMarker = null
  let meRaf = 0
  const stopMe = () => { if (meRaf) cancelAnimationFrame(meRaf); meRaf = 0 }
  const lineAt = (line, cum, d) => {
    // 시작점에서 거리 d(미터 아닌 경위도 누적 길이 비율)까지의 부분선과 머리 점
    const total = cum[cum.length - 1]
    const target = Math.min(1, d) * total
    const out = [line[0]]
    let head = line[0]
    for (let i = 1; i < line.length; i++) {
      if (cum[i] <= target) { out.push(line[i]); head = line[i]; continue }
      const seg = cum[i] - cum[i - 1] || 1
      const f = (target - cum[i - 1]) / seg
      head = [line[i - 1][0] + (line[i][0] - line[i - 1][0]) * f, line[i - 1][1] + (line[i][1] - line[i - 1][1]) * f]
      out.push(head)
      break
    }
    return { out, head }
  }
  function playMe(res, labels) {
    stopMe()
    clearMeLayers()
    const line = res.line
    if (!line || line.length < 2) return
    state.meOn = true
    // 사용자 점 표식
    const el = document.createElement('div')
    el.className = 'uemap-me'
    el.setAttribute('role', 'img')
    el.setAttribute('aria-label', labels?.you || 'Your location')
    const dot = document.createElement('span'); dot.className = 'uemap-me__dot'
    el.append(dot)
    meMarker = new Marker({ element: el, anchor: 'center' }).setLngLat(line[0]).addTo(map)
    // 지도 범위를 사용자 위치까지 연다
    const b = lineBounds(line)
    const pad = 0.004
    map.setMinZoom(10)
    map.setMaxBounds([[Math.min(curBounds()[0][0], b[0][0] - pad), Math.min(curBounds()[0][1], b[0][1] - pad)], [Math.max(curBounds()[1][0], b[1][0] + pad), Math.max(curBounds()[1][1], b[1][1] + pad)]])
    bl.setMeRoute(line)
    bl.setMeProgress(0)
    applyShowRoute()
    // 누적 길이(경위도 기준 상대값으로 충분하다)
    const cum = [0]
    const kx = Math.cos((SHOP.lat * Math.PI) / 180)
    for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + Math.hypot((line[i][0] - line[i - 1][0]) * kx, line[i][1] - line[i - 1][1]))
    // 카메라: 두 점이 다 보이게. 3D는 진행 방향이 화면 위쪽이 되도록 돌린다.
    const from = { lng: line[0][0], lat: line[0][1] }
    const brg = bearingDeg(from, SHOP)
    const cw = container.clientWidth || w, ch = container.clientHeight || h
    const padPx = { top: state.mode === '3d' ? Math.min(150, ch * 0.28) : 70, bottom: 70, left: Math.min(60, cw * 0.12), right: Math.min(60, cw * 0.12) }
    // 평면에서 맞춘 줌을 구한 뒤, 기울인 화면은 더 멀리 잡는다(기울이면 아래쪽 점이 화면 밖으로 밀린다).
    const cam = map.cameraForBounds(b, { padding: padPx, bearing: state.mode === '3d' ? brg : 0, maxZoom: 18 })
    if (cam) {
      const opts = { center: cam.center, zoom: Math.max(map.getMinZoom(), cam.zoom - (state.mode === '3d' ? 0.75 : 0)), pitch: state.mode === '3d' ? PITCH_3D : 0, bearing: state.mode === '3d' ? brg : 0 }
      go(opts, 1100)
    }
    const dur = state.reduced ? 0 : 1500
    const t0 = performance.now() + (state.reduced ? 0 : 250)
    const draw = (now) => {
      const p = dur === 0 ? 1 : Math.max(0, Math.min(1, (now - t0) / dur))
      const e = easeOutCubic(p)
      bl.setMeProgress(e)
      const { out, head } = lineAt(line, cum, e)
      const src = map.getSource('me'); const hs = map.getSource('mehead')
      if (src && hs) {
        src.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: out.length > 1 ? out : [out[0], out[0]] } }] })
        hs.setData(p >= 1 ? EMPTY_FC : { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: head } }] })
      }
      if (p < 1) meRaf = requestAnimationFrame(draw)
      else {
        meRaf = 0
        bl.flare()
        wrap.classList.add('uemap-pin-wrap--lit')
        setTimeout(() => wrap.classList.remove('uemap-pin-wrap--lit'), 1800)
      }
    }
    meRaf = requestAnimationFrame(draw)
  }
  function clearMeLayers() {
    stopMe()
    meMarker?.remove(); meMarker = null
    map.getSource('me')?.setData(EMPTY_FC)
    map.getSource('mehead')?.setData(EMPTY_FC)
    bl.setMeRoute(null)
  }
  function clearMe() {
    clearMeLayers()
    state.meOn = false
    applyShowRoute()
    map.setMaxBounds(curBounds())
    map.setMinZoom(curMinZoom())
    go(homeCamera(state.mode), 700)
  }

  // ---- 외부로 내보내는 동작 ----
  const api = {
    map,
    ready,
    recenter() { go(homeCamera(state.mode), 700) },
    zoomIn() { map.zoomIn({ duration: state.reduced ? 0 : 250 }) },
    zoomOut() { map.zoomOut({ duration: state.reduced ? 0 : 250 }) },
    resetNorth() { map.resetNorth({ duration: state.reduced ? 0 : 400 }) },
    showMeRoute: guard((res, labels) => playMe(res, labels)),
    clearMeRoute: guard(() => clearMe()),
    fitConcept: guard(() => {
      const b = lineBounds([[SHOP.lng, SHOP.lat], ...(concept.stops || []).map((s) => [s.lng, s.lat])])
      map.fitBounds(b, { padding: { top: 90, bottom: 80, left: 130, right: 60 }, maxZoom: 16, pitch: 0, bearing: 0, duration: state.reduced ? 0 : 900, essential: false })
    }),
    setMode(md) {
      if (md === state.mode) return
      state.mode = md
      applyShowRoute()
      if (md === '3d') {
        map.setMaxPitch(MAX_PITCH)
        bl.setGrow(1)
        go({ pitch: PITCH_3D, bearing: BEARING_3D, zoom: Math.min(map.getZoom(), 18.1) - 0.2 }, 800)
      } else {
        bl.setGrow(0)
        go({ pitch: 0, bearing: 0, zoom: map.getZoom() + 0.2 }, 700)
        const lock = () => map.setMaxPitch(0)
        if (state.reduced) lock(); else map.once('moveend', lock)
      }
    },
    setTheme(th) {
      state.theme = th
      const table = paintTable(th)
      for (const [id, props] of Object.entries(table)) {
        if (!map.getLayer(id)) continue
        for (const [k, v] of Object.entries(props)) map.setPaintProperty(id, k, v)
      }
      map.setSky(skyFor(th))
      bl.setTheme(th)
    },
    setLang(lg) {
      state.lang = lg
      const tt = pickText(lg)
      const d = buildOverlayData({ route, places, concept, shop: SHOP, lang: lg, t: tt, showConcept: state.showConcept })
      map.getSource('places')?.setData(d.places)
      map.getSource('concept')?.setData(d.concept)
      const field = lg === 'ko' ? ['coalesce', ['get', 'name:ko'], ['get', 'name']] : ['coalesce', ['get', 'name:en'], ['get', 'name']]
      for (const id of ['road-name', 'place']) if (map.getLayer(id)) map.setLayoutProperty(id, 'text-field', field)
      setPinText()
    },
    setShowRoute(v) { state.showRoute = !!v; if (styleReady) applyShowRoute() },
    setShowConcept(v) {
      state.showConcept = !!v
      const tt = pickText(state.lang)
      const d = buildOverlayData({ route, places, concept, shop: SHOP, lang: state.lang, t: tt, showConcept: state.showConcept })
      map.getSource('places')?.setData(d.places)
      if (!state.meOn) { map.setMaxBounds(curBounds()); map.setMinZoom(curMinZoom()) }
      if (styleReady) applyShowConcept()
    },
    setActive(v) { state.active = v; bl.setActive(v) },
    setReducedMotion(v) { state.reduced = !!v; bl.setReduced(v) },
    resize() { map.resize() },
    destroy() {
      stopMe()
      try { meMarker?.remove() } catch { /* 이미 제거됨 */ }
      try { marker.remove() } catch { /* 이미 제거됨 */ }
      try { map.remove() } catch { /* 이미 제거됨 */ }
    },
  }
  return api
}
