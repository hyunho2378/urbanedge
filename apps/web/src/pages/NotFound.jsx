import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Home } from 'lucide-react'
import { Button, Container, RouteRibbon } from '@urbanedge/ds'
import { usePick } from '../i18n/index.jsx'
import { ROOM_LIST } from '../components/pages/content.js'
import { RouteMap } from '../components/pages/RouteMap.jsx'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const T = {
  title: { ko: '페이지를 찾을 수 없음', en: 'Page not found' },
  label: { ko: '지도에 없는 주소', en: 'OFF THE MAP' },
  h1: { ko: '이 역은 노선도에 없다', en: 'This stop is not on the map' },
  desc: {
    ko: '주소가 바뀌었거나 잘못 입력되었을 수 있으며, 아래 정거장에서 다시 출발할 수 있다.',
    en: 'The address may have changed or been mistyped. You can restart from any of the stations below.',
  },
  asked: { ko: '요청한 경로', en: 'Requested path' },
  home: { ko: '홈으로', en: 'Back to home' },
  rooms: { ko: '포토 룸 보기', en: 'Browse rooms' },
  map: { ko: '노선도', en: 'Route map' },
  tailName: { ko: '404', en: '404' },
  tailTitle: { ko: '이 주소', en: 'This address' },
  tailBody: { ko: '노선이 닿지 않는 곳', en: 'No line reaches here' },
}

export default function NotFound() {
  const pick = usePick()
  const { pathname } = useLocation()
  usePageTitle(pick(T.title))
  return (
    <section aria-labelledby="page-title" className="relative overflow-hidden break-keep break-words">
      <Container className="pb-72 lg:pb-120 4xl:max-w-screen-4xl" style={{ paddingTop: 'clamp(48px, 8vw, 144px)' }}>
        <p className="ue-label flex items-baseline gap-16 text-label 4xl:text-bodySm text-text-sec">
          <span className="text-yellow">404</span>
          <span>{pick(T.label)}</span>
        </p>
        <div className="mt-16 h-px w-full max-w-read bg-hairline" />

        <h1 id="page-title" className="mt-32 font-display text-display-l font-black leading-tight tracking-tightest text-text-pri text-balance">
          {pick(T.h1)}
        </h1>
        <p className="mt-24 max-w-read text-lead text-text-sec text-pretty 4xl:text-h3">{pick(T.desc)}</p>
        <p className="mt-24 flex flex-wrap items-center gap-12 text-bodySm 4xl:text-body text-text-meta">
          <span>{pick(T.asked)}</span>
          <code className="max-w-full break-all rounded-sm border border-hairlineStrong bg-bg-panel px-10 py-4 font-ui text-text-pri">{pathname}</code>
        </p>

        <div className="mt-56 lg:mt-80">
          <RouteMap
            rooms={ROOM_LIST}
            label={pick(T.map)}
            compact
            tail={{ name: pick(T.tailName), title: pick(T.tailTitle), body: pick(T.tailBody) }}
          />
        </div>

        <div className="mt-56 flex flex-wrap gap-16 lg:mt-72">
          <Button as={Link} to="/" size="lg">
            <Home size={20} aria-hidden="true" />
            {pick(T.home)}
          </Button>
          <Button as={Link} to="/rooms" variant="outline" size="lg">
            {pick(T.rooms)}
            <ArrowRight size={20} aria-hidden="true" />
          </Button>
        </div>
      </Container>
      <RouteRibbon />
    </section>
  )
}
