import { Link, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, Container, StationSign } from '@urbanedge/ds'
import { PageShell, Tx } from '../components/pages/Bilingual.jsx'
import { STATION } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const T = {
  title: { en: 'Page not found', ko: '페이지를 찾을 수 없음' },
  h1: { en: 'Page not found', ko: '페이지를 찾을 수 없다' },
  lead: {
    en: 'The address may be wrong.',
    ko: '주소가 잘못되었을 수 있다.',
  },
  asked: { en: 'You asked for', ko: '요청한 경로' },
  home: { en: 'Home', ko: '홈으로' },
  rooms: { en: 'Rooms', ko: '촬영 방' },
}

// 승강장 끝에서 선로가 끊긴 장면을 그린 SVG. 노란 점자 블록 띠와 "서지 않음" 전광판이 들어 있다.
function Platform() {
  return (
    <svg viewBox="0 0 480 220" role="img" aria-label="" aria-hidden="true" className="block h-auto w-full">
      <rect x="0" y="0" width="480" height="220" className="fill-bg-panel" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={i * 60} y="0" width="58" height="110" className="fill-bg-elev" />
      ))}
      <rect x="0" y="110" width="480" height="14" className="fill-yellow" />
      {Array.from({ length: 24 }).map((_, i) => (
        <circle key={i} cx={10 + i * 20} cy="117" r="3" className="fill-bg-base" />
      ))}
      <rect x="0" y="124" width="480" height="96" className="fill-bg-base" />
      <path d="M0 160 H480 M0 196 H480" className="stroke-text-meta" strokeWidth="3" fill="none" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={20 + i * 40} y="150" width="10" height="56" className="fill-bg-raised" />
      ))}
      <rect x="150" y="26" width="180" height="46" rx="6" className="fill-bg-base stroke-text-meta" strokeWidth="2" />
      <text x="240" y="56" textAnchor="middle" fontSize="22" fontWeight="800" letterSpacing="2" className="fill-yellow font-label">
        NOT IN SERVICE
      </text>
    </svg>
  )
}

export default function NotFound() {
  const { pathname } = useLocation()
  usePageTitle(T.title)
  return (
    <PageShell>
      <section aria-labelledby="page-title" className="pb-72 pt-40 md:pt-64 lg:pb-120 lg:pt-96">
        <Container className="grid items-center gap-x-64 gap-y-40 lg:grid-cols-12 4xl:max-w-screen-4xl">
          <div className="lg:col-span-7">
            <Tx {...T.h1} as="h1" role="title" inner="text-display-m" className="text-text-pri" id="page-title" />
            <Tx {...T.lead} as="p" role="lead" className="mt-24 max-w-read text-text-sec" />
            <p className="mt-24 flex flex-wrap items-center gap-12 text-text-meta">
              <Tx inline {...T.asked} role="caption" />
              <code className="max-w-full break-all rounded-sm bg-bg-panel px-10 py-4 font-ui text-bodySm text-text-pri">{pathname}</code>
            </p>
            <div className="mt-32 flex flex-wrap items-center gap-x-24 gap-y-12">
              <Button as={Link} to="/" size="lg">
                <Tx inline {...T.home} />
              </Button>
              <Link to="/rooms" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
                <Tx inline {...T.rooms} />
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-lg">
              <Platform />
            </div>
            <div className="mt-24">
              <StationSign station={{ code: STATION.code, name: STATION.name, nameKo: STATION.nameKo }} line={{ code: 'GY', color: 'yellow' }} size="sm" />
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  )
}
