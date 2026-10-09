// ops/DashboardPage.jsx: /dashboard. 대시보드만 전체 화면으로 보여 준다(TV, 모니터용).
// 키오스크가 있는 운영 데모 탭이 열려 있으면 그 탭의 상태를 BroadcastChannel로 받아 실시간으로 보여 준다.
import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LangContext } from '@urbanedge/ds'
import { startSync, useOps } from './store.js'
import Dashboard from './Dashboard.jsx'
import './ops.css'

export default function DashboardPage() {
  const lang = new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ko'
  useEffect(() => startSync('viewer'), [])
  const synced = useOps((s) => s.synced)
  return (
    <LangContext.Provider value={lang}>
      <div className="op-root op-page">
        <Link to="/" className="op-back">
          <ArrowLeft size={16} aria-hidden="true" />
          {lang === 'ko' ? '운영 화면' : 'Ops screen'}
        </Link>
        <Dashboard tv connected={!!synced} />
      </div>
    </LangContext.Provider>
  )
}
