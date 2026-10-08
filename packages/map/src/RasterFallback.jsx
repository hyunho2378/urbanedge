// RasterFallback.jsx: WebGL을 쓸 수 없을 때의 2D 래스터 지도. OSM 표준 타일(tile.openstreetmap.org)을 <img>로 깔고 경로와 가게 핀을 SVG와 DOM으로 올린다.
// 끌어서 이동, 방향키 이동, +와 - 확대 축소, 재중심을 지원한다. 3D는 없다. 출처 표기(© OpenStreetMap contributors)를 항상 보인다.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { SHOP, STATION, LINE, LABEL_PLACE_IDS } from './shop.js'
import { pickText } from './i18n.js'

const TILE = 256
const lngToX = (lng, z) => ((lng + 180) / 360) * TILE * 2 ** z
const latToY = (lat, z) => {
  const r = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TILE * 2 ** z
}
const Z_MAX = 18

export function RasterFallback({ theme, lang, showRoute, showConcept, concept, route, places, me, recenterTick, hint }) {
  const Z_MIN = showConcept ? 14 : 16
  const t = pickText(lang)
  const box = useRef(null)
  const drag = useRef(null)
  const [z, setZ] = useState(17)
  const [off, setOff] = useState({ x: 0, y: 0 }) // 가게 기준 이동량(월드 픽셀)
  const [size, setSize] = useState({ w: 640, h: 480 })

  useEffect(() => {
    if (!box.current) return undefined
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])

  // 내 경로가 생기면 두 점이 다 보이는 가장 큰 줌으로 맞춘다
  useEffect(() => {
    if (!me?.line) return
    const a = me.from
    for (let zz = Z_MAX; zz >= Z_MIN; zz--) {
      const dx = Math.abs(lngToX(a.lng, zz) - lngToX(SHOP.lng, zz)), dy = Math.abs(latToY(a.lat, zz) - latToY(SHOP.lat, zz))
      if (dx < size.w * 0.38 && dy < size.h * 0.38) {
        setZ(zz)
        setOff({ x: (lngToX(a.lng, zz) - lngToX(SHOP.lng, zz)) / 2, y: (latToY(a.lat, zz) - latToY(SHOP.lat, zz)) / 2 })
        return
      }
      if (zz === Z_MIN) { setZ(Z_MIN); setOff({ x: (lngToX(a.lng, Z_MIN) - lngToX(SHOP.lng, Z_MIN)) / 2, y: (latToY(a.lat, Z_MIN) - latToY(SHOP.lat, Z_MIN)) / 2 }) }
    }
  }, [me]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (recenterTick) { setOff({ x: 0, y: 0 }); setZ(17) } }, [recenterTick])

  const cx = lngToX(SHOP.lng, z) + off.x
  const cy = latToY(SHOP.lat, z) + off.y
  const left = cx - size.w / 2
  const top = cy - size.h / 2
  const tiles = useMemo(() => {
    const out = []
    const n = 2 ** z
    const x0 = Math.floor(left / TILE), x1 = Math.floor((left + size.w) / TILE)
    const y0 = Math.floor(top / TILE), y1 = Math.floor((top + size.h) / TILE)
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (y >= 0 && y < n) out.push({ x: ((x % n) + n) % n, y, px: x * TILE - left, py: y * TILE - top })
    return out
  }, [left, top, size.w, size.h, z])

  const toPx = (lng, lat) => [lngToX(lng, z) - left, latToY(lat, z) - top]
  const pts = route.line.map(([lng, lat]) => toPx(lng, lat).map((v) => v.toFixed(1)).join(',')).join(' ')
  const shopPx = toPx(SHOP.lng, SHOP.lat)
  const startPx = toPx(route.from.lng, route.from.lat)
  const labels = LABEL_PLACE_IDS.map((osm) => places.places.find((p) => p.osm === osm)).filter(Boolean).map((p) => ({ p, xy: toPx(p.lng, p.lat) }))

  const recenter = () => { setOff({ x: 0, y: 0 }); setZ(17) }
  const pan = (dx, dy) => setOff((o) => ({ x: Math.max(-700, Math.min(700, o.x + dx)), y: Math.max(-700, Math.min(700, o.y + dy)) }))
  const zoom = (dz) => { setZ((v) => Math.max(Z_MIN, Math.min(Z_MAX, v + dz))); setOff({ x: 0, y: 0 }) }

  const onKey = (e) => {
    const step = 80
    if (e.key === 'ArrowLeft') pan(-step, 0)
    else if (e.key === 'ArrowRight') pan(step, 0)
    else if (e.key === 'ArrowUp') pan(0, -step)
    else if (e.key === 'ArrowDown') pan(0, step)
    else if (e.key === '+' || e.key === '=') zoom(1)
    else if (e.key === '-' || e.key === '_') zoom(-1)
    else return
    e.preventDefault()
  }
  const onDown = (e) => {
    if (e.target.closest('button')) return
    drag.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    if (!drag.current) return
    pan(drag.current.x - e.clientX, drag.current.y - e.clientY)
    drag.current = { x: e.clientX, y: e.clientY }
  }
  const onUp = () => { drag.current = null }

  return (
    <div className="uemap-raster" data-theme={theme}>
      <div
        ref={box}
        className="uemap-raster__view"
        role="application"
        aria-label={t.region}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="uemap-raster__tiles" aria-hidden="true">
          {tiles.map((tl) => (
            <img
              key={`${z}/${tl.x}/${tl.y}/${tl.px}`}
              className="uemap-raster__tile"
              src={`https://tile.openstreetmap.org/${z}/${tl.x}/${tl.y}.png`}
              alt=""
              width={TILE}
              height={TILE}
              loading="lazy"
              decoding="async"
              draggable="false"
              style={{ transform: `translate(${tl.px}px, ${tl.py}px)` }}
            />
          ))}
        </div>
        {showRoute && (
          <svg className="uemap-raster__svg" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
            <polyline points={pts} className="uemap-r-casing" />
            <polyline points={pts} className="uemap-r-line" />
            <circle cx={startPx[0]} cy={startPx[1]} r="6" className="uemap-r-dot" />
            {labels.map(({ p, xy }) => <circle key={p.osm} cx={xy[0]} cy={xy[1]} r="3.5" className="uemap-r-poi" />)}
            {me?.line && <polyline points={me.line.map(([lng, lat]) => toPx(lng, lat).map((v) => v.toFixed(1)).join(',')).join(' ')} className="uemap-r-casing" />}
            {me?.line && <polyline points={me.line.map(([lng, lat]) => toPx(lng, lat).map((v) => v.toFixed(1)).join(',')).join(' ')} className="uemap-r-line" />}
            {me?.line && <circle cx={toPx(me.from.lng, me.from.lat)[0]} cy={toPx(me.from.lng, me.from.lat)[1]} r="7" className="uemap-r-me" />}
            <circle cx={shopPx[0]} cy={shopPx[1]} r="8" className="uemap-r-shop" />
          </svg>
        )}
        {showConcept && concept?.stops?.map((st) => {
          const xy = toPx(st.lng, st.lat)
          return (
            <span key={st.osm} className="uemap-r-label uemap-r-label--concept" aria-hidden="true" style={{ transform: `translate(${xy[0]}px, ${xy[1]}px) translate(-50%, -50%)` }}>
              <small>{t.conceptTag}</small>{lang === 'ko' ? st.name : st.nameEn || st.name}
            </span>
          )
        })}
        {showRoute && labels.filter(({ p }) => !showConcept || p.osm === 'node/13786652501').map(({ p, xy }) => (
          <span key={p.osm} className="uemap-r-label" aria-hidden="true" style={{ transform: `translate(${xy[0]}px, ${xy[1] + 8}px) translateX(-50%)` }}>
            {lang === 'ko' ? p.name : p.nameEn || p.name}
          </span>
        ))}
        <div className="uemap-pin-wrap uemap-r-pin" style={{ transform: `translate(${shopPx[0]}px, ${shopPx[1] - 12}px) translate(-50%, -100%)` }}>
          <button type="button" className="uemap-pin" onClick={recenter} aria-label={`${STATION.code} ${lang === 'ko' ? STATION.fullKo : STATION.full}. ${t.recenter}`}>
            <span className="uemap-pin__badge" aria-hidden="true">{LINE.code}</span>
            <span className="uemap-pin__text"><span className="uemap-pin__code">{STATION.code}</span><span className="uemap-pin__name">{t.station}</span></span>
          </button>
        </div>
      </div>
      <div className="uemap-zoom" role="group" aria-label={t.toolsLabel}>
        <button type="button" className="uemap-fab" onClick={() => zoom(1)} disabled={z >= Z_MAX} aria-label={t.zoomIn}><Plus size={18} aria-hidden="true" /></button>
        <button type="button" className="uemap-fab" onClick={() => zoom(-1)} disabled={z <= Z_MIN} aria-label={t.zoomOut}><Minus size={18} aria-hidden="true" /></button>
      </div>
      {hint && <p className="uemap-hint" role="status">{hint}</p>}
      <a className="uemap-r-attrib" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{t.attribution}</a>
    </div>
  )
}
