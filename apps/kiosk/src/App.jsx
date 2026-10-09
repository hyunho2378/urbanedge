// App.jsx: 라우팅. /는 운영 데모(키오스크 1대 또는 3대와 운영 화면), /screen은 키오스크 화면 한 대다.
// 언어 전환은 페이지를 다시 마운트하지 않고 컨트롤러의 lang만 바꾼다. 영문이 기본이다.
// DS의 LangContext에 ctrl.lang을 내려 주므로 <Bi>와 useLangValue()가 기기, 투어, 패널, 화면 안에서 같은 값을 쓴다.
// 문서 언어(html lang)는 en으로 고정한다. 바꾸면 :lang(ko) 행간 규칙이 영문 칸까지 바꿔 한영 전환 때 레이아웃이 움직인다.
// 한글 칸은 Bi가 붙이는 lang="ko"로 keep-all 줄바꿈을 받는다.
// 시작 상태 쿼리: ?step=shoot&lang=ko&speed=0.2&room=retro&camera=sample
// 화면 모드 쿼리: ?embed=1(웹 iframe용 크롬 없는 모드), ?tour=0(코치마크 끔)
import { lazy, Suspense, useMemo } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LangContext } from '@urbanedge/ds'
import { useKioskController } from './flow/controller.js'
import DeviceLab from './pages/DeviceLab.jsx'

const Simulator = lazy(() => import('./pages/Simulator.jsx'))
const ScreenOnly = lazy(() => import('./pages/ScreenOnly.jsx'))
const DashboardPage = lazy(() => import('./ops/DashboardPage.jsx'))
const DemoPage = lazy(() => import('./demo/DemoPage.jsx'))

function readOptions() {
  const q = new URLSearchParams(window.location.search)
  const o = { lang: 'en' }
  if (q.get('step')) o.step = q.get('step')
  if (q.get('lang') === 'en' || q.get('lang') === 'ko') o.lang = q.get('lang')
  if (q.get('room')) o.room = q.get('room')
  if (q.get('camera') === 'live' || q.get('camera') === 'sample') o.cameraMode = q.get('camera')
  const speed = Number(q.get('speed'))
  if (speed > 0) o.speed = speed
  return o
}

// /screen은 키오스크 한 대를 위한 컨트롤러를 만든다. /(운영 데모)는 기기마다 자기 컨트롤러를 만든다(Simulator.jsx).
function ScreenRoute({ options }) {
  const ctrl = useKioskController(options)
  return (
    <LangContext.Provider value={ctrl.lang}>
      <ScreenOnly ctrl={ctrl} />
    </LangContext.Provider>
  )
}

export default function App() {
  const options = useMemo(readOptions, [])
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg-base" aria-busy="true" />}>
      <Routes>
        <Route path="/" element={<Simulator options={options} />} />
        <Route path="/screen" element={<ScreenRoute options={options} />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/device" element={<DeviceLab />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
