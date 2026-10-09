// demo/DemoPage.jsx: 경로 /demo. 화면 녹화용 자동 시연. 키오스크 한 대, 3대 동시 운영, 대시보드와 관리 순서로 진행한다.
// 조작: Space 일시정지, 왼쪽 오른쪽 화살표 이전과 다음 장, R 처음부터, H 안내 숨김.
// 주소 옵션: ?wait=5(시작 전 초) ?speed=1(0.5~3배) ?start=0(시작 장) ?hud=0(조작 안내 숨김)
// 시연에서 바꾼 값(가격, 프레임, 필터)은 끝날 때와 장을 건너뛸 때 원래대로 되돌린다.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LangContext } from '@urbanedge/ds'
import { useKioskController } from '../flow/controller.js'
import ScreenOnly from '../pages/ScreenOnly.jsx'
import Simulator from '../pages/Simulator.jsx'
import { ops } from '../ops/store.js'
import { autoRun } from '../ops/sim.js'
import { createKit, STOP } from './demoKit.js'
import { buildChapters } from './demoScript.js'

// 시연에서 만든 결제에는 내부 표시(sim)를 붙인다. 화면에는 나타나지 않는다.
const seen = new Set()
function useTagSim() {
  useEffect(() => {
    ops.get().tx.forEach((t) => seen.add(t.id))
    return ops.subscribe(() => {
      for (const t of ops.get().tx.slice(0, 8)) {
        if (seen.has(t.id)) continue
        seen.add(t.id)
        if (!t.sim) queueMicrotask(() => ops.patchTx(t.id, { sim: true }))
      }
    })
  }, [])
}

function PartA({ options, ctrlRef }) {
  const ctrl = useKioskController(options)
  ctrlRef.current = ctrl
  return (
    <LangContext.Provider value={ctrl.lang}>
      <ScreenOnly ctrl={ctrl} />
    </LangContext.Provider>
  )
}

const LINKS = [
  ['웹사이트', 'urbanedge-web.vercel.app'],
  ['키오스크와 운영 화면', 'urbanedge-kiosk.vercel.app'],
  ['운영 서버', 'urbanedge-api-fswm.onrender.com/api/health'],
]

export default function DemoPage() {
  const loc = useLocation()
  const navigate = useNavigate()
  const q = new URLSearchParams(loc.search)
  const phase = q.get('units') === '3' ? 'S' : 'A'
  const speed = Math.max(0.5, Math.min(3, Number(q.get('speed')) || 1))
  const wait = q.get('wait') !== null && Number(q.get('wait')) >= 0 ? Number(q.get('wait')) : 5
  const startAt = Number(q.get('start')) || 0

  const ctrlRef = useRef(null)
  const cursorRef = useRef(null)
  const layerRef = useRef(null)
  const ringRef = useRef(null)
  const runRef = useRef(0)
  const pausedRef = useRef(false)
  const idxRef = useRef(startAt)
  const chaptersRef = useRef([])
  const snapRef = useRef(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const [count, setCount] = useState(null)
  const [cap, setCap] = useState(null)
  const [paused, setPaused] = useState(false)
  const [hud, setHud] = useState(q.get('hud') !== '0')
  const [title, setTitle] = useState('')
  const [ended, setEnded] = useState(false)
  useTagSim()

  const snapshot = useCallback(() => {
    if (snapRef.current) return
    const s = ops.get()
    snapRef.current = { products: s.products.map((p) => ({ ...p })), frames: s.frames.map((f) => ({ id: f.id, enabled: f.enabled })), camera: JSON.parse(JSON.stringify(s.camera)) }
  }, [])
  // 시연에서 바꾼 값을 처음 상태로 되돌린다.
  const restore = useCallback(() => {
    const snap = snapRef.current
    if (!snap) return
    const s = ops.get()
    snap.products.forEach((p) => {
      const cur = s.products.find((x) => x.id === p.id)
      if (cur && cur.price !== p.price) ops.setProduct(p.id, { price: p.price })
    })
    snap.frames.forEach((f) => {
      const cur = s.frames.find((x) => x.id === f.id)
      if (cur && cur.enabled !== f.enabled) ops.toggleFrame(f.id)
    })
    Object.entries(snap.camera).forEach(([b, c]) => ops.setCamera(b, c))
  }, [])

  const say = useCallback(({ chip, text, el }) => {
    const r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null
    const lower = r ? r.top + r.height / 2 > window.innerHeight * 0.55 : false
    setCap({ chip, text, top: lower, k: Math.random() })
  }, [])

  const start = useCallback(
    async (index) => {
      const myId = ++runRef.current
      const isStopped = () => runRef.current !== myId
      const kit = createKit({ cursor: cursorRef.current, layer: layerRef.current, ring: ringRef.current, speed, isStopped, isPaused: () => pausedRef.current })
      snapshot()
      setEnded(false)
      const nav = (url) => navigate(url, { replace: true })
      chaptersRef.current = buildChapters({ kit, say, nav, getCtrl: () => ctrlRef.current, ops, autoRun, onEnd: () => { restore(); setCap(null); setEnded(true) } })
      const chapters = chaptersRef.current
      try {
        for (let i = index; i < chapters.length; i++) {
          idxRef.current = i
          const c = chapters[i]
          setTitle(`${i + 1}/${chapters.length} ${c.title}`)
          // 장에 필요한 화면 상태로 맞춘다.
          if (c.need.phase !== phaseRef.current) {
            navigate(c.need.phase === 'S' ? '/demo?units=3' : '/demo', { replace: true })
            // eslint-disable-next-line no-await-in-loop
            await kit.waitFor(() => phaseRef.current === c.need.phase, 5000)
            // eslint-disable-next-line no-await-in-loop
            await kit.sleepReal(900)
          }
          if (c.need.phase === 'A') {
            // eslint-disable-next-line no-await-in-loop
            await kit.waitFor(() => ctrlRef.current, 5000)
            if (c.need.kstep && c.need.kstep !== 'attract' && index === i && ctrlRef.current && ctrlRef.current.step !== c.need.kstep) ctrlRef.current.goTo(c.need.kstep)
          } else {
            // eslint-disable-next-line no-await-in-loop
            await kit.waitFor(() => kit.$('.op-panel'), 8000)
            if (c.need.tab) {
              const t = kit.$(`#op-tab-${c.need.tab}`)
              if (t && t.getAttribute('aria-selected') !== 'true') t.click()
            }
          }
          // eslint-disable-next-line no-await-in-loop
          await kit.sleep(400)
          // eslint-disable-next-line no-await-in-loop
          await c.fn()
          // 다음 장으로 넘어가기 전에 바꾼 값을 되돌리지는 않는다(흐름이 이어진다). 끝 장에서 한꺼번에 되돌린다.
        }
      } catch (e) {
        if (e !== STOP) console.error('[demo]', e)
      }
    },
    [navigate, restore, say, snapshot, speed, startAt],
  )

  // 시작: 카운트다운 뒤 첫 장
  useEffect(() => {
    let alive = true
    ;(async () => {
      const tmp = createKit({ cursor: cursorRef.current, layer: layerRef.current, ring: ringRef.current, speed: 1, isStopped: () => !alive, isPaused: () => false })
      try {
        for (let i = wait; i > 0; i--) {
          setCount(i)
          // eslint-disable-next-line no-await-in-loop
          await tmp.sleepReal(1000)
        }
        setCount(null)
        if (alive) start(startAt)
      } catch (e) {
        if (e !== STOP) console.error(e)
      }
    })()
    return () => {
      alive = false
      runRef.current += 1
      autoRun.stop()
      restore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 조작 키
  useEffect(() => {
    const onKey = (e) => {
      if (e.isTrusted === false) return
      const tag = (e.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (e.code === 'Space') {
        e.preventDefault()
        pausedRef.current = !pausedRef.current
        setPaused(pausedRef.current)
      } else if (e.key === 'ArrowRight') {
        restore()
        start(Math.min(chaptersRef.current.length - 1, idxRef.current + 1))
      } else if (e.key === 'ArrowLeft') {
        restore()
        start(Math.max(0, idxRef.current - 1))
      } else if (e.key === 'r' || e.key === 'R') {
        window.location.href = '/demo?wait=2'
      } else if (e.key === 'h' || e.key === 'H') setHud((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loc.search, restore, start])

  return (
    <div className="demo-root">
      {phase === 'A' ? <PartA key="a" options={{ lang: 'ko', room: 'subway', speed: 0.8 }} ctrlRef={ctrlRef} /> : <Simulator key="s" options={{ lang: 'ko' }} />}

      <div ref={layerRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }} aria-hidden="true">
        <div ref={ringRef} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, opacity: 0, borderRadius: 18, boxShadow: '0 0 0 2px #000, 0 0 0 6px #FFD400', transition: 'opacity .2s', willChange: 'transform,width,height' }} />
        {count !== null ? (
          <div style={{ position: 'absolute', left: '50%', top: 96, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', color: '#000', borderRadius: 999, padding: '10px 22px 10px 12px', font: '700 18px Pretendard, sans-serif' }}>
            <span style={{ width: 34, height: 34, borderRadius: 999, background: '#FFD400', display: 'grid', placeItems: 'center' }}>{count}</span>
            어반엣지 시연이 곧 시작됩니다
          </div>
        ) : null}
        {cap && !ended ? (
          <div
            key={cap.k}
            style={{ position: 'absolute', left: '50%', [cap.top ? 'top' : 'bottom']: cap.top ? 64 : 36, transform: 'translateX(-50%)', maxWidth: 760, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', color: '#000', borderRadius: 20, padding: '14px 24px 14px 14px', boxShadow: '0 0 0 3px #000, 0 8px 28px rgba(0,0,0,.5)', animation: 'demoCap .3s ease-out' }}
          >
            {cap.chip ? <span style={{ background: '#FFD400', color: '#000', borderRadius: 999, padding: '6px 14px', font: '800 15px Pretendard, sans-serif', whiteSpace: 'nowrap' }}>{cap.chip}</span> : null}
            <span style={{ font: '700 20px/1.35 Pretendard, sans-serif' }}>{cap.text}</span>
          </div>
        ) : null}
        <div ref={cursorRef} style={{ position: 'absolute', left: 0, top: 0, willChange: 'transform', transform: 'translate(-100px,-100px)' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.5))' }}>
            <path d="M4 2 L4 20 L8.5 15.8 L11.6 22.4 L14.2 21.2 L11.1 14.8 L17.5 14.8 Z" fill="#000" stroke="#FFD400" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
        {hud && !ended ? (
          <div style={{ position: 'absolute', right: 12, bottom: 12, background: '#000', color: '#fff', borderRadius: 12, padding: '8px 12px', font: '600 13px Pretendard, sans-serif', boxShadow: '0 0 0 1px #fff' }}>
            {paused ? '일시정지 ' : ''}
            {title}
            <span style={{ marginLeft: 10, color: '#FFD400' }}>Space 정지, 좌우 화살표 장 이동, R 처음, H 숨김</span>
          </div>
        ) : null}
        {ended ? (
          <div style={{ position: 'absolute', inset: 0, background: '#000', color: '#fff', display: 'grid', placeItems: 'center', pointerEvents: 'auto' }}>
            <div style={{ width: 760 }}>
              <p style={{ font: '800 56px/1.1 Pretendard, sans-serif' }}>UrbanEdge</p>
              <p style={{ font: '700 24px/1.5 Pretendard, sans-serif', marginTop: 12 }}>키오스크, 카메라, 결제, 대시보드를 하나로 연결한 운영 시연</p>
              <ul style={{ marginTop: 36, display: 'grid', gap: 14 }}>
                {LINKS.map(([k, u]) => (
                  <li key={u} style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
                    <span style={{ background: '#FFD400', color: '#000', borderRadius: 999, padding: '4px 14px', font: '800 16px Pretendard, sans-serif', minWidth: 170, textAlign: 'center' }}>{k}</span>
                    <a href={`https://${u}`} style={{ font: '700 22px Pretendard, sans-serif', color: '#fff' }}>
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
      <style>{'@keyframes demoCap{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}'}</style>
    </div>
  )
}
