// ops/OpsPanel.jsx: 운영 화면. 위 1/3은 카메라, 아래 2/3은 대시보드, 상품과 가격, 프레임, 쿠폰, 거래와 환불, 설정 탭.
// 시뮬레이터 오른쪽 열에 열 높이를 꽉 채워 들어간다. 데이터는 ops/store.js(메모리)에서 읽는다.
import { useCallback, useEffect, useRef, useState } from 'react'
import { BarChart3, ChevronDown, ReceiptText, Ticket, Frame, Tag, Settings } from 'lucide-react'
import { startSync } from './store.js'
import CameraPanel from './CameraPanel.jsx'
import Dashboard from './Dashboard.jsx'
import Pos from './Pos.jsx'
import Coupons from './Coupons.jsx'
import Frames from './Frames.jsx'
import Products from './Products.jsx'
import SettingsBackup from './SettingsBackup.jsx'
import { Tabs, useL } from './ui.jsx'
import './ops.css'

// 아래에 더 있음 표시와 첫 방문 코치마크. 코치마크는 이 세션에서 한 번만 보인다(메모리에만 기록).
let coachSeen = false
function ScrollHint({ panelRef, dep }) {
  const [more, setMore] = useState(false)
  const [coach, setCoach] = useState(false)
  const check = useCallback(() => {
    const el = panelRef.current
    if (!el) return
    setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 24)
  }, [panelRef])
  useEffect(() => {
    const el = panelRef.current
    if (!el) return undefined
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    el.addEventListener('scroll', check, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', check)
    }
  }, [panelRef, check, dep])
  useEffect(() => {
    if (dep === 'dash' && more && !coachSeen) {
      const t = setTimeout(() => setCoach(true), 700)
      return () => clearTimeout(t)
    }
    return undefined
  }, [dep, more])
  const close = useCallback(() => {
    coachSeen = true
    setCoach(false)
  }, [])
  useEffect(() => {
    if (!coach) return undefined
    const el = panelRef.current
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', close, { once: true })
    el?.addEventListener('scroll', close, { passive: true, once: true })
    el?.addEventListener('wheel', close, { passive: true, once: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', close)
      el?.removeEventListener('scroll', close)
      el?.removeEventListener('wheel', close)
    }
  }, [coach, close, panelRef])
  return (
    <>
      {coach ? (
        <button type="button" className="op-coach" onClick={close} aria-label="안내 닫기">
          <span className="op-coach-box">
            <strong>아래로 내리면 판매 분석과 거래 내역</strong>
            <ChevronDown size={22} aria-hidden="true" />
          </span>
        </button>
      ) : null}
      {more && !coach ? (
        <button type="button" className="op-more-pill" onClick={() => panelRef.current?.scrollBy({ top: panelRef.current.clientHeight * 0.8, behavior: 'smooth' })}>
          아래에 더 있음
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      ) : null}
    </>
  )
}

export default function OpsPanel({ className = '', style }) {
  const L = useL()
  const [tab, setTab] = useState('dash')
  const panelRef = useRef(null)
  // 이 탭이 키오스크를 가진 탭이다. /dashboard 같은 다른 탭에 상태를 내보낸다.
  useEffect(() => startSync('host'), [])
  const tabs = [
    { id: 'dash', label: L('Dashboard', '대시보드'), icon: <BarChart3 size={16} aria-hidden="true" /> },
    { id: 'products', label: L('Products & prices', '상품과 가격'), icon: <Tag size={16} aria-hidden="true" /> },
    { id: 'frame', label: L('Frames', '프레임'), icon: <Frame size={16} aria-hidden="true" /> },
    { id: 'coupon', label: L('Coupons', '쿠폰'), icon: <Ticket size={16} aria-hidden="true" /> },
    { id: 'pos', label: L('Sales & refunds', '거래와 환불'), icon: <ReceiptText size={16} aria-hidden="true" /> },
    { id: 'settings', label: L('Backup', '설정'), icon: <Settings size={16} aria-hidden="true" /> },
  ]
  return (
    <div className={`op-root ${className}`} style={style}>
      <CameraPanel />
      <section className="op-bottom" aria-label={L('Operations', '운영')}>
        <Tabs label={L('Operations', '운영')} value={tab} onChange={setTab} items={tabs} />
        <div className="op-panel-wrap">
        <div ref={panelRef} role="tabpanel" id={`op-panel-${tab}`} aria-labelledby={`op-tab-${tab}`} className="op-panel" tabIndex={0}>
          {tab === 'dash' && <Dashboard onGo={setTab} />}
          {tab === 'products' && <Products />}
          {tab === 'frame' && <Frames />}
          {tab === 'coupon' && <Coupons />}
          {tab === 'pos' && <Pos />}
          {tab === 'settings' && <SettingsBackup />}
        </div>
        <ScrollHint panelRef={panelRef} dep={tab} />
        </div>
      </section>
    </div>
  )
}

