import { Suspense, useEffect, useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NAV, SITE } from '../data/site.js'
import { useLang, usePick } from '../i18n/index.jsx'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import RouteBoundary from './RouteBoundary.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import SkipLink from './SkipLink.jsx'

function PageFallback() {
  const pick = usePick()
  return (
    <div role="status" aria-live="polite" className="grid min-h-dvh place-items-center px-page">
      <p className="ue-label animate-pulse-soft text-label text-text-meta">{pick({ ko: '불러오는 중', en: 'Loading' })}</p>
    </div>
  )
}

// 경로별 기본 문서 제목. 하위 페이지가 useEffect로 제목을 정하면 그 값이 우선한다(레이아웃 이펙트가 먼저 실행된다).
function useRouteTitle() {
  const { pathname } = useLocation()
  const { lang } = useLang()
  const pick = usePick()
  useLayoutEffect(() => {
    const seg = '/' + (pathname.split('/')[1] || '')
    const item = NAV.find((n) => n.to === seg)
    const area = pick(SITE.area)
    document.title =
      pathname === '/'
        ? `${SITE.name} | ${pick({ ko: `${area} 무인 셀프 사진관`, en: `Self-service photo studio in ${area}` })}`
        : `${item ? pick(item.label) : '404'} | ${SITE.name}`
  }, [pathname, lang, pick])
}

export default function Layout() {
  const { pathname } = useLocation()
  const { ensureLangParam } = useLang()
  const isHome = pathname === '/'
  useRouteTitle()

  // 라우터 이동 뒤에도 선택한 언어가 주소에 남도록 한다.
  useEffect(() => {
    ensureLangParam()
  }, [pathname, ensureLangParam])

  return (
    <div className="flex min-h-dvh flex-col break-words" style={{ wordBreak: 'keep-all' }}>
      <SkipLink />
      <ScrollToTop />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none" style={isHome ? undefined : { paddingTop: 'var(--ue-header-h)' }}>
        <RouteBoundary resetKey={pathname}>
          <Suspense fallback={<PageFallback />}>
            <div key={pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </Suspense>
        </RouteBoundary>
      </main>
      <Footer />
    </div>
  )
}
