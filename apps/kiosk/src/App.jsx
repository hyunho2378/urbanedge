// App.jsx: 라우팅. 컨트롤러는 앱 최상단에서 한 번만 만들어 두 경로가 같은 상태를 쓴다.
// 언어 전환은 페이지를 다시 마운트하지 않고 컨트롤러의 lang만 바꾼다.
// 확인용 쿼리: ?step=shoot&lang=en&speed=0.2&room=retro&camera=sample 처럼 시작 상태를 지정할 수 있다.
import { lazy, Suspense, useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useKioskController } from './flow/controller.js'
import DeviceLab from './pages/DeviceLab.jsx'

const Simulator = lazy(() => import('./pages/Simulator.jsx'))
const ScreenOnly = lazy(() => import('./pages/ScreenOnly.jsx'))

function readOptions() {
  const q = new URLSearchParams(window.location.search)
  const o = {}
  if (q.get('step')) o.step = q.get('step')
  if (q.get('lang') === 'en' || q.get('lang') === 'ko') o.lang = q.get('lang')
  if (q.get('room')) o.room = q.get('room')
  if (q.get('camera') === 'live' || q.get('camera') === 'sample') o.cameraMode = q.get('camera')
  const speed = Number(q.get('speed'))
  if (speed > 0) o.speed = speed
  return o
}

export default function App() {
  const options = useMemo(readOptions, [])
  const ctrl = useKioskController(options)
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg-base" aria-busy="true" />}>
      <Routes>
        <Route path="/" element={<Simulator ctrl={ctrl} />} />
        <Route path="/screen" element={<ScreenOnly ctrl={ctrl} />} />
        <Route path="/device" element={<DeviceLab />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
