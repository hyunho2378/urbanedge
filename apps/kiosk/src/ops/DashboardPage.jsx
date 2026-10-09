// ops/DashboardPage.jsx: /dashboard. 대시보드만 전체 화면으로 보여 준다(TV, 모니터용).
// 키오스크가 있는 운영 데모 탭이 열려 있으면 그 탭의 상태를 BroadcastChannel로 받아 실시간으로 보여 준다.
// 나가기 버튼, F, Esc가 모두 운영 화면(/)으로 돌아간다.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LangContext } from '@urbanedge/ds'
import { startSync, useOps } from './store.js'
import Dashboard from './Dashboard.jsx'
import './ops.css'

export default function DashboardPage() {
  const lang = new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'ko'
  const navigate = useNavigate()
  useEffect(() => startSync('viewer'), [])
  const synced = useOps((s) => s.synced)
  return (
    <LangContext.Provider value={lang}>
      <div className="op-root op-page">
        <Dashboard tv connected={!!synced} onExit={() => navigate('/')} />
      </div>
    </LangContext.Provider>
  )
}
