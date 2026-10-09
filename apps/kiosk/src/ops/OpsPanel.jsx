// ops/OpsPanel.jsx: 운영 화면. 위 1/3은 카메라, 아래 2/3은 부스 상태와 대시보드/POS/쿠폰/프레임·가격 탭.
// 시뮬레이터 오른쪽 열에 열 높이를 꽉 채워 들어간다. 데이터는 ops/store.js(메모리)에서 읽는다.
import { useEffect, useMemo, useState } from 'react'
import { BarChart3, ReceiptText, Ticket, Frame, Tag, Settings } from 'lucide-react'
import { BOOTHS, ops, startSync, useOps } from './store.js'
import { rangeStart } from './Dashboard.jsx'
import CameraPanel from './CameraPanel.jsx'
import Dashboard from './Dashboard.jsx'
import Pos from './Pos.jsx'
import Coupons from './Coupons.jsx'
import Frames from './Frames.jsx'
import Products from './Products.jsx'
import SettingsBackup from './SettingsBackup.jsx'
import { BOOTH_COLOR, STEP_LABEL, Tabs, useL, useLangCode } from './ui.jsx'
import './ops.css'

export default function OpsPanel({ className = '', style }) {
  const L = useL()
  const [tab, setTab] = useState('dash')
  // 이 탭이 키오스크를 가진 탭이다. /dashboard 같은 다른 탭에 상태를 내보낸다.
  useEffect(() => startSync('host'), [])
  const tabs = [
    { id: 'dash', label: L('Dashboard', '대시보드'), icon: <BarChart3 size={16} aria-hidden="true" /> },
    { id: 'products', label: L('Products & prices', '상품·가격'), icon: <Tag size={16} aria-hidden="true" /> },
    { id: 'frame', label: L('Frames', '프레임'), icon: <Frame size={16} aria-hidden="true" /> },
    { id: 'coupon', label: L('Coupons', '쿠폰'), icon: <Ticket size={16} aria-hidden="true" /> },
    { id: 'pos', label: L('Sales & refunds', '거래·환불'), icon: <ReceiptText size={16} aria-hidden="true" /> },
    { id: 'settings', label: L('Backup', '설정'), icon: <Settings size={16} aria-hidden="true" /> },
  ]
  return (
    <div className={`op-root ${className}`} style={style}>
      <CameraPanel />
      <section className="op-bottom" aria-label={L('Operations', '운영')}>
        <BoothRow />
        <Tabs label={L('Operations', '운영')} value={tab} onChange={setTab} items={tabs} />
        <div role="tabpanel" id={`op-panel-${tab}`} aria-labelledby={`op-tab-${tab}`} className="op-panel" tabIndex={0}>
          {tab === 'dash' && <Dashboard />}
          {tab === 'products' && <Products />}
          {tab === 'frame' && <Frames />}
          {tab === 'coupon' && <Coupons />}
          {tab === 'pos' && <Pos />}
          {tab === 'settings' && <SettingsBackup />}
        </div>
      </section>
    </div>
  )
}

function BoothRow() {
  const L = useL()
  const lang = useLangCode()
  const booth = useOps((s) => s.booth)
  const tx = useOps((s) => s.tx)
  const sel = useOps((s) => s.selectedBooth)
  const from = rangeStart('today')
  const counts = useMemo(() => Object.fromEntries(BOOTHS.map((b) => [b.id, tx.filter((t) => t.booth === b.id && t.status === 'paid' && !t.history && t.ts >= from).length])), [tx, from])
  return (
    <ul className="op-booths" aria-label={L('Booth status', '부스 상태')}>
      {BOOTHS.map((b) => {
        const s = booth[b.id]
        const step = s.cameraActive ? L('Shooting', '촬영 중') : STEP_LABEL[s.step]?.[lang] || STEP_LABEL[s.step]?.ko || s.step
        return (
          <li key={b.id}>
            <button type="button" className="op-booth" aria-pressed={sel === b.id} onClick={() => ops.selectBooth(b.id)} style={{ '--op-booth': `rgb(${BOOTH_COLOR[b.id]})` }}>
              <span className="op-booth-bar" aria-hidden="true" />
              <span className="op-booth-name">
                <span className="op-dot" style={{ width: 8, height: 8, background: s.online ? '#3FA66B' : '#9A9A94' }} aria-hidden="true" />
                P{b.n} {b.name[lang] || b.name.ko}
              </span>
              <span className="op-booth-sub">
                {s.online ? step : L('Offline', '연결 끊김')} · {L('today', '오늘')} <span className="op-num">{counts[b.id]}</span>
                {L('', '건')}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
