// HwangnidanMap.jsx: 황리단길 지도 컴포넌트. 화면에 들어올 때 MapLibre + three.js 엔진(engine.js)을 동적으로 불러온다.
// 프롭: mode('3d'|'2d'), theme('dark'|'light'), showRoute, details(경로 설명 링크, 기본 끔), showConcept(후보 역을 흐리게 표시), className, onReady, lang('en'|'ko'), controls, modeToggle, themeToggle, lazy, cooperative, onModeChange, onThemeChange, forceRaster
// onReady({ recenter, setMode, setTheme, showRouteFromMe, clearMyRoute, map, fallback })
// WebGL을 쓸 수 없거나 엔진이 실패하면(컨텍스트 손실 포함) 어떤 오류도 밖으로 던지지 않고 RasterFallback(2D 래스터)으로 대체한다.
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Crosshair, LocateFixed, Minus, Moon, Plus, Sun, X } from 'lucide-react'
import { SHOP, LINE } from './shop.js'
import { loadBaked, loadRoute } from './baked.js'
import { pickText } from './i18n.js'
import { directionsLinks } from './links.js'
import { locateAndRoute } from './locate.js'
import { RouteInfoList, routeFacts } from './RouteInfo.jsx'
import { RasterFallback } from './RasterFallback.jsx'
import './map.css'

function hasWebGL2() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch { return false }
}
// 아주 낮은 사양(메모리 2GB 이하 또는 데이터 절약 모드)은 처음부터 2D 래스터로 연다.
function isLowEnd() {
  try {
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) return true
    if (navigator.connection?.saveData) return true
  } catch { /* 무시 */ }
  return false
}

const cx = (...a) => a.filter(Boolean).join(' ')

export function HwangnidanMap({
  mode: modeProp = '3d',
  theme: themeProp = 'dark',
  showRoute = true,
  showConcept = false,
  className = '',
  onReady,
  lang = 'en',
  controls = true,
  modeToggle = false,
  themeToggle = false,
  details = false,
  lazy = true,
  cooperative = true,
  onModeChange,
  onThemeChange,
  forceRaster = false,
}) {
  const t = pickText(lang)
  const rootRef = useRef(null)
  const boxRef = useRef(null)
  const engineRef = useRef(null)
  const live = useRef({})
  const aliveRef = useRef(true)
  const busy = useRef(false)
  const panelId = useId()
  const noteId = useId()
  const [mode, setMode] = useState(modeProp === '2d' ? '2d' : '3d')
  const [theme, setTheme] = useState(themeProp === 'light' ? 'light' : 'dark')
  const [phase, setPhase] = useState('idle') // idle | loading | ready | fallback
  const [pack, setPack] = useState(null) // { route, places, concept }
  const [open, setOpen] = useState(false)
  const [me, setMe] = useState(null) // null | { status, kind, distanceM, durationS, line }
  const [recenterTick, setRecenterTick] = useState(0)
  live.current = { mode, theme, lang, showRoute, showConcept, cooperative, onReady, forceRaster, t }

  useEffect(() => { setMode(modeProp === '2d' ? '2d' : '3d') }, [modeProp])
  useEffect(() => { setTheme(themeProp === 'light' ? 'light' : 'dark') }, [themeProp])

  // 경로 요약과 후보 역 자료. 엔진과 별개로 먼저 받아 안내 문구를 채운다.
  useEffect(() => {
    let alive = true
    Promise.all([loadRoute(), loadBaked('concept').catch(() => ({ stops: [] }))])
      .then(([[route, places], concept]) => { if (alive) setPack({ route, places, concept }) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // 내 위치 경로: 위치를 한 번 읽고 경로를 구해 지도에 그린다. 어떤 실패도 던지지 않고 상태 문구로 바꾼다.
  const showRouteFromMe = useCallback(async () => {
    if (busy.current) return null
    busy.current = true
    setMe({ status: 'locating' })
    let res
    try { res = await locateAndRoute() } catch { res = { status: 'unavailable' } }
    busy.current = false
    if (!aliveRef.current) return res
    setMe(res)
    if (res.status === 'ok' && engineRef.current) engineRef.current.showMeRoute(res, { you: live.current.t.youAreHere })
    return { status: res.status, kind: res.kind, distanceM: res.distanceM, durationS: res.durationS }
  }, [])
  const clearMyRoute = useCallback(() => {
    engineRef.current?.clearMeRoute()
    setMe(null)
  }, [])

  // 지연 로딩과 엔진 생성
  useEffect(() => {
    aliveRef.current = true
    let alive = true
    let eng = null
    let io = null
    let vis = null
    let mq = null
    let onMq = null
    const handle = (fallback) => ({
      recenter: () => (engineRef.current ? engineRef.current.recenter() : setRecenterTick((n) => n + 1)),
      setMode: (m) => setMode(m),
      setTheme: (th) => setTheme(th),
      showRouteFromMe,
      clearMyRoute,
      map: engineRef.current?.map || null,
      fallback,
    })
    const fail = (err) => {
      if (!alive) return
      if (err) console.info('[HwangnidanMap] 래스터 지도로 대체한다:', err?.message || err)
      const wasReady = !!engineRef.current
      eng?.destroy(); eng = null; engineRef.current = null
      setPhase('fallback')
      if (!wasReady) live.current.onReady?.(handle(true))
    }
    const run = async () => {
      setPhase('loading')
      const L = live.current
      if (L.forceRaster || isLowEnd() || !hasWebGL2()) { fail(); return }
      try {
        const { createEngine } = await import('./engine.js')
        if (!alive) return
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')
        eng = await createEngine({
          container: boxRef.current,
          theme: L.theme, mode: L.mode, lang: L.lang, showRoute: L.showRoute, showConcept: L.showConcept, cooperative: L.cooperative,
          reducedMotion: !!reduced?.matches,
          onFatal: fail,
        })
        if (!alive) { eng.destroy(); eng = null; return }
        engineRef.current = eng
        onMq = (e) => eng?.setReducedMotion(e.matches)
        mq = reduced; mq?.addEventListener?.('change', onMq)
        vis = new IntersectionObserver(([e]) => eng?.setActive(e.isIntersecting))
        vis.observe(rootRef.current)
        await eng.ready
        if (!alive || !engineRef.current) return
        setPhase('ready')
        live.current.onReady?.(handle(false))
      } catch (err) { fail(err) }
    }
    if (!lazy || typeof IntersectionObserver === 'undefined') run()
    else {
      io = new IntersectionObserver((ents) => { if (ents.some((e) => e.isIntersecting)) { io.disconnect(); run() } }, { rootMargin: '300px' })
      io.observe(rootRef.current)
    }
    return () => {
      alive = false
      aliveRef.current = false
      io?.disconnect(); vis?.disconnect()
      mq?.removeEventListener?.('change', onMq)
      eng?.destroy(); engineRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 프롭과 내부 상태를 엔진에 반영
  useEffect(() => { engineRef.current?.setMode(mode) }, [mode])
  useEffect(() => { engineRef.current?.setTheme(theme) }, [theme])
  useEffect(() => { engineRef.current?.setLang(lang) }, [lang])
  useEffect(() => { engineRef.current?.setShowRoute(showRoute) }, [showRoute])
  useEffect(() => { engineRef.current?.setShowConcept(showConcept) }, [showConcept])

  // Esc로 경로 설명 닫기
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const pickMode = useCallback((m) => { setMode(m); onModeChange?.(m) }, [onModeChange])
  const toggleTheme = useCallback(() => { const th = live.current.theme === 'dark' ? 'light' : 'dark'; setTheme(th); onThemeChange?.(th) }, [onThemeChange])
  const recenter = () => (engineRef.current ? engineRef.current.recenter() : setRecenterTick((n) => n + 1))

  const raster = phase === 'fallback'
  const ready = phase === 'ready'
  const f = pack ? routeFacts(pack.route) : null
  const links = directionsLinks({ lang })
  const meActive = me?.status === 'ok'
  const meMsg = !me ? null
    : me.status === 'locating' ? t.locating
    : me.status === 'ok' ? (me.kind === 'walk' ? t.meWalk(me.distanceM, Math.max(1, Math.round(me.durationS / 60))) : t.meStraight(me.distanceM))
    : me.status === 'far' ? t.meFar(me.distanceM)
    : t[me.status] || t.unavailable
  const meNeedsLinks = me && ['far', 'denied', 'unavailable', 'timeout', 'unsupported'].includes(me.status)

  return (
    <div
      ref={rootRef}
      className={cx('uemap', className)}
      data-theme={theme}
      data-phase={phase}
      aria-busy={phase === 'loading'}
    >
      <div ref={boxRef} className="uemap__canvas" aria-hidden={ready ? undefined : 'true'} />

      {raster && pack && (
        <RasterFallback theme={theme} lang={lang} showRoute={showRoute} showConcept={showConcept} concept={pack.concept} route={pack.route} places={pack.places} me={meActive ? me : null} recenterTick={recenterTick} hint={t.noWebgl} />
      )}

      {!ready && !raster && (
        <div className="uemap-poster">
          <svg className="uemap-poster__art" viewBox="0 0 320 200" aria-hidden="true" focusable="false">
            <path className="uemap-poster__line" d="M40 40 H150 L210 100 V150 H280" />
            <circle className="uemap-poster__dot" cx="40" cy="40" r="7" />
            <circle className="uemap-poster__dot" cx="210" cy="100" r="7" />
            <circle className="uemap-poster__shop" cx="280" cy="150" r="11" />
          </svg>
          <p className="uemap-poster__title"><span className="uemap-badge" aria-hidden="true">{LINE.code}</span>{lang === 'ko' ? LINE.nameKo : LINE.name}</p>
          <p className="uemap-poster__text">{phase === 'loading' ? t.loading : t.poster}</p>
          <p className="uemap-poster__addr" lang="ko">{SHOP.address}</p>
        </div>
      )}

      {controls && (ready || raster) && (
        <>
          <button
            type="button"
            className={cx('uemap-mebtn', meActive && 'uemap-mebtn--on')}
            aria-describedby={noteId}
            aria-pressed={meActive}
            disabled={me?.status === 'locating'}
            onClick={meActive ? clearMyRoute : showRouteFromMe}
          >
            {meActive ? <X size={18} aria-hidden="true" /> : <LocateFixed size={18} aria-hidden="true" />}
            <span>{me?.status === 'locating' ? t.locatingShort : meActive ? t.hideMyRoute : t.useMyLocation}</span>
          </button>

          {!raster && (modeToggle || themeToggle) && (
            <div className="uemap-pill" role="toolbar" aria-label={t.toolsLabel}>
              {modeToggle && (
                <div className="uemap-seg" role="group" aria-label={t.modeGroup}>
                  <button type="button" className="uemap-btn" aria-pressed={mode === '2d'} aria-label={t.mode2dLabel} onClick={() => pickMode('2d')}>{t.mode2d}</button>
                  <button type="button" className="uemap-btn" aria-pressed={mode === '3d'} aria-label={t.mode3dLabel} onClick={() => pickMode('3d')}>{t.mode3d}</button>
                </div>
              )}
              {themeToggle && (
                <button type="button" className="uemap-btn uemap-btn--icon" aria-label={theme === 'dark' ? t.toLight : t.toDark} onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                </button>
              )}
            </div>
          )}

          <div className={cx('uemap-zoom', (modeToggle || themeToggle) && !raster && 'uemap-zoom--low')} role="group" aria-label={t.toolsLabel}>
            {!raster && <button type="button" className="uemap-fab" onClick={() => engineRef.current?.zoomIn()} aria-label={t.zoomIn}><Plus size={18} aria-hidden="true" /></button>}
            {!raster && <button type="button" className="uemap-fab" onClick={() => engineRef.current?.zoomOut()} aria-label={t.zoomOut}><Minus size={18} aria-hidden="true" /></button>}
            <button type="button" className="uemap-fab" onClick={recenter} aria-label={t.recenter}><Crosshair size={18} aria-hidden="true" /></button>
          </div>
        </>
      )}

      {(ready || raster) && pack && (
        <div className="uemap-foot">
          {details && open && <RouteInfoList id={panelId} route={pack.route} places={pack.places} concept={pack.concept} showConcept={showConcept} lang={lang} />}
          {details && (
            <p className="uemap-links-row">
              <button type="button" className="uemap-link" aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={() => setOpen((v) => !v)}>
                {open ? t.routeClose : t.routeToggle}
              </button>
              {showConcept && !raster && (
                <button type="button" className="uemap-link" onClick={() => engineRef.current?.fitConcept()}>{t.allStops}</button>
              )}
            </p>
          )}
          <span id={noteId} className="uemap-sr">{t.privacy}</span>
          <p className={cx('uemap-status', meMsg && 'uemap-status--box', me && me.status !== 'ok' && me.status !== 'locating' && 'uemap-status--err')} role="status" aria-live="polite">
            {meMsg && <span>{meMsg}</span>}
            {meNeedsLinks && (
              <span className="uemap-status__links">
                {' '}
                <a href={links.naver} target="_blank" rel="noopener noreferrer">{t.naverMap}</a>
                {' '}
                <a href={links.google} target="_blank" rel="noopener noreferrer">{t.googleMaps}</a>
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
