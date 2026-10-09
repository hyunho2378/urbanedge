import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/index.jsx'
import { makeKit, SKIP } from './kit.js'
import { buildScenes, TOTAL } from './script.js'
import './demo.css'

// /demo 로 들어오면 카운트다운 뒤 사이트를 자동으로 시연한다. 화면 녹화용이다.
// 주소 옵션: site=ko(사이트 화면 한국어, 기본 영어) cap=en(영어 자막, 기본 한국어) speed=0.5~1.5(배속) wait=3(시작 전 초) cap=0(자막 끄기)
// 조작: Space 일시정지, 좌우 방향키 장면 이동, R 처음부터, H 자막 숨김, Esc 종료
let armed = typeof window !== 'undefined' && window.location.pathname === '/demo'

export default function DemoRoot() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { setLang } = useLang()
  const [on, setOn] = useState(armed)
  const [count, setCount] = useState(null)
  const [cap, setCap] = useState(null)
  const [end, setEnd] = useState(false)
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(false)
  const cursorRef = useRef(null)
  const ringRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!armed) return undefined
    const q = new URLSearchParams(window.location.search)
    // 사이트 화면 언어(기본 영어)와 자막 언어(기본 한국어)를 따로 둔다. ?site=ko, ?cap=en, ?cap=0(자막 끄기)
    const site = q.get('site') === 'ko' ? 'ko' : 'en'
    const capLang = q.get('cap') === 'en' || q.get('lang') === 'en' ? 'en' : 'ko'
    const speed = Math.max(0.5, Math.min(1.5, Number(q.get('speed')) || 1))
    const wait = q.get('wait') !== null && Number(q.get('wait')) >= 0 ? Number(q.get('wait')) : 3
    const showCap = q.get('cap') !== '0'
    const S = { gen: 0, stop: false, paused: false, speed, idx: 0, target: null, ringEl: null, cx: 0, cy: 0, cursor: cursorRef.current, layer: layerRef.current, hidden: false }
    S.setCap = (c) => setCap(showCap ? c : null)
    S.setEnd = setEnd
    const t = (ko, en) => (capLang === 'ko' ? ko : en)
    window.__demoLog = []
    setLang(site)
    if (pathname === '/demo') navigate('/' + window.location.search, { replace: true })

    const go = (i) => { S.target = Math.max(0, Math.min(TOTAL, i)); S.gen += 1 }
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      if (e.key === ' ') { e.preventDefault(); S.paused = !S.paused; setPaused(S.paused) }
      else if (e.key === 'ArrowRight') go(S.idx + 1)
      else if (e.key === 'ArrowLeft') go(S.idx - 1)
      else if (e.key === 'r' || e.key === 'R') go(0)
      else if (e.key === 'h' || e.key === 'H') { S.hidden = !S.hidden; setHidden(S.hidden) }
      else if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) { S.stop = true; S.gen += 1; armed = false; setOn(false) }
    }
    window.addEventListener('keydown', onKey, true)

    // 강조 링이 대상 요소를 따라가게 한다
    let raf = 0
    const follow = () => {
      const ring = ringRef.current
      const el = S.ringEl
      if (ring) {
        if (el && el.isConnected) {
          const r = el.getBoundingClientRect()
          const pad = 8
          ring.style.opacity = '1'
          ring.style.transform = `translate(${r.left - pad}px, ${r.top - pad}px)`
          ring.style.width = `${r.width + pad * 2}px`
          ring.style.height = `${r.height + pad * 2}px`
        } else ring.style.opacity = '0'
      }
      raf = requestAnimationFrame(follow)
    }
    raf = requestAnimationFrame(follow)
    window.__demoState = S

    ;(async () => {
      const real = (ms) => new Promise((r) => setTimeout(r, ms))
      S.cursor.style.transform = `translate(${window.innerWidth * 0.5}px, ${window.innerHeight * 0.8}px)`
      for (let i = wait; i > 0 && !S.stop; i--) { setCount(i); await real(1000) }
      setCount(null)
      const scenes = buildScenes({ t, navigate, lang: site, setSite: setLang, S })
      let i = 0
      while (!S.stop) {
        const gen = S.gen
        S.idx = i
        setEnd(false)
        const kit = makeKit(S, gen)
        const t0 = Math.round(performance.now())
        const sc = scenes[i]
        const rec = { n: i + 1, name: sc.name, start: t0, ok: true }
        window.__demoLog.push(rec)
        try {
          await sc.run(kit)
          rec.ms = Math.round(performance.now()) - t0
          i = Math.min(i + 1, scenes.length - 1)
        } catch (e) {
          rec.ms = Math.round(performance.now()) - t0
          if (e === SKIP) {
            rec.ok = 'skipped'
            if (S.stop) break
            i = S.target ?? i
            S.target = null
          } else {
            rec.ok = false
            rec.err = String(e && e.message ? e.message : e)
            console.warn('[demo] 장면 건너뜀', sc.name, e)
            i = Math.min(i + 1, scenes.length - 1)
            if (i === S.idx) await real(500)
          }
        }
      }
    })()

    return () => { S.stop = true; S.gen += 1; cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey, true) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!on) return null
  return (
    <div ref={layerRef} className="demo-layer" aria-hidden="true" data-demo>
      <div ref={ringRef} className="demo-ring" />
      <div ref={cursorRef} className="demo-cursor">
        <svg width="34" height="34" viewBox="0 0 24 24">
          <path d="M4 2 L4 20 L8.5 15.8 L11.6 22.4 L14.2 21.2 L11.1 14.8 L17.5 14.8 Z" fill="#000" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
      {count !== null && (
        <div className="demo-count">
          <b>{count}</b>
          <span>{new URLSearchParams(window.location.search).get('cap') === 'en' ? 'Demo starts soon' : '시연이 곧 시작된다'}</span>
        </div>
      )}
      {cap && !hidden && (
        <div key={`${cap.n}${cap.text}`} className="demo-cap">
          <span className="demo-chip">{cap.n}/{TOTAL}</span>
          <span className="demo-label">{cap.label}</span>
          <span className="demo-text">{cap.text}</span>
        </div>
      )}
      {paused && <div className="demo-paused">{new URLSearchParams(window.location.search).get('cap') === 'en' ? 'Paused' : '일시정지'}</div>}
      {end && (
        <div className="demo-end">
          <p className="demo-end-kicker">UrbanEdge</p>
          <p className="demo-end-url">urbanedge-web.vercel.app</p>
          <p className="demo-end-sub">{new URLSearchParams(window.location.search).get('site') !== 'ko' ? 'A Time-Traveling Train Ride Through Our Memories' : '시간을 싣고 달리는 열차, 철길 따라 흐르는 우리의 기억'}</p>
        </div>
      )}
    </div>
  )
}
