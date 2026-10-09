import { lazy, Suspense } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { LangProvider, usePick } from './i18n/index.jsx'
import Layout from './layout/Layout.jsx'
import Home from './pages/Home.jsx'
import DemoRoot from './demo/DemoRoot.jsx'

// W2가 만드는 하위 페이지는 pages/ 폴더의 파일명 그대로 불러온다. 파일이 아직 없으면 안내 자리표시를 보여 앱이 멈추지 않는다.
// import.meta.glob은 존재하는 파일만 모으므로 파일이 생기면 개발 서버가 자동으로 반영한다.
const modules = import.meta.glob(['./pages/*.jsx', '!./pages/Home.jsx'])

function Placeholder({ name }) {
  const pick = usePick()
  return (
    <section className="px-page section-y min-h-dvh">
      <p className="ue-label text-label text-yellow">{name}</p>
      <h1 className="mt-16 font-display text-h1 font-black tracking-tightest">{pick({ ko: '준비 중인 페이지', en: 'This page is coming soon' })}</h1>
      <Link to="/" className="mt-32 inline-block font-ui font-semibold text-yellow underline underline-offset-4">
        {pick({ ko: '홈으로', en: 'Back to home' })}
      </Link>
    </section>
  )
}

const page = (name) =>
  lazy(() => {
    const load = modules[`./pages/${name}.jsx`]
    return load ? load() : Promise.resolve({ default: () => <Placeholder name={name} /> })
  })

const Rooms = page('Rooms')
const RoomDetail = page('RoomDetail')
const Guide = page('Guide')
const Visit = page('Visit')
const Gallery = page('Gallery')
const NotFound = page('NotFound')
const Brand = page('Brand')
// 키오스크 QR 결과 페이지: Layout(헤더, 푸터) 밖의 단독 모바일 화면
const Result = lazy(() => import('./pages/Result.jsx'))

export default function App() {
  return (
    <LangProvider>
      <DemoRoot />
      <Routes>
        <Route
          path="result/:sessionId"
          element={
            <Suspense fallback={null}>
              <Result />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="demo" element={<Home />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/phone" element={<Navigate to="/rooms" replace />} />
          <Route path="rooms/:id" element={<RoomDetail />} />
          <Route path="metro" element={<Navigate to="/" replace />} />
          <Route path="station" element={<Navigate to="/" replace />} />
          <Route path="guide" element={<Guide />} />
          <Route path="visit" element={<Visit />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="brand" element={<Brand />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </LangProvider>
  )
}
