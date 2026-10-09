// ops/OpsPanel.jsx: 운영 화면. 위 1/3은 카메라, 아래 2/3은 부스 상태와 대시보드/POS/쿠폰/프레임·가격 탭.
// 시뮬레이터 오른쪽 열에 열 높이를 꽉 채워 들어간다. 데이터는 ops/store.js(메모리)에서 읽는다.
import { useEffect, useState } from 'react'
import { BarChart3, ReceiptText, Ticket, Frame, Tag, Settings } from 'lucide-react'
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
        <Tabs label={L('Operations', '운영')} value={tab} onChange={setTab} items={tabs} />
        <div role="tabpanel" id={`op-panel-${tab}`} aria-labelledby={`op-tab-${tab}`} className="op-panel" tabIndex={0}>
          {tab === 'dash' && <Dashboard onGo={setTab} />}
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

