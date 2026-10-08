import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Button, Container, StationSign, TransitMap, platformById } from '@urbanedge/ds'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { PageTop } from '../components/pages/PageTop.jsx'
import { PlatformBadge } from '../components/pages/PlatformBadge.jsx'
import { Tape } from '../components/pages/Tape.jsx'
import { NETWORK, PLATFORMS, STATION } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'
import { RoomExplorer } from '../components/rooms/RoomExplorer.jsx'

const T = {
  title: { en: 'Platforms', ko: '승강장' },
  h1: { en: 'Gyeongju has no subway. We built a station anyway.', ko: '경주에 없던 지하철, 어반엣지역' },
  lead: {
    en: 'Welcome to GY-01 UrbanEdge, the first station of Gyeongju Metro. Four platforms sit inside it, and each platform is a photo room with its own kiosk. Walking from one room to the next counts as a transfer.',
    ko: 'GY-01 어반엣지역은 경주 메트로의 첫 정거장이며, 안쪽에 승강장 네 곳이 있고 승강장마다 키오스크가 달린 포토 룸이 하나씩 들어 있다. 방에서 방으로 걸어가는 일이 곧 환승이다.',
  },
  tape: [
    { en: 'Now boarding: Gyeongju Metro', ko: '승차 안내: 경주 메트로' },
    { en: 'This station is GY-01 UrbanEdge', ko: '이번 역은 GY-01 어반엣지입니다' },
    { en: 'Platform change: walk to the next room', ko: '승강장을 바꿀 때는 옆방으로 걸어가세요' },
    { en: 'Mind the lens, it sits below the screen', ko: '렌즈는 화면 아래에 있으니 주의하세요' },
  ],
  pause: { en: 'Pause announcements', ko: '안내 문구 멈추기' },
  play: { en: 'Resume announcements', ko: '안내 문구 다시 흐르기' },
  mapTitle: { en: 'Pick your platform.', ko: '승강장 선택' },
  mapSub: { en: 'Tap a track on the map. The platform opens right below it.', ko: '노선도에서 선로를 누르면 그 아래에 승강장이 열린다.' },
  mapLabel: { en: 'UrbanEdge station map with four platforms', ko: '승강장 네 곳이 있는 어반엣지역 노선도' },
  boardingNow: { en: 'Now boarding', ko: '지금 승차 중' },
  why: { en: 'Why it photographs well', ko: '잘 나오는 이유' },
  open: { en: 'Open this platform', ko: '이 승강장 보기' },
  next: { en: 'Next platform', ko: '다음 승강장' },
  allTitle: { en: 'One platform per mood', ko: '분위기마다 하나씩 승강장' },
  allSub: { en: 'Swipe, scroll or use the arrow keys. Each photo opens its platform.', ko: '옆으로 밀거나 화살표 키를 누르면 승강장이 넘어가고, 사진을 누르면 승강장 페이지로 이동한다.' },
  ctaTitle: { en: 'Cannot choose? Ride them in order.', ko: '고르기 어렵다면 순서대로 타 보는 방법이 있다' },
  ctaBody: { en: 'The journey page walks through the kiosk step by step, from the first tap to the print slot.', ko: '여정 안내 페이지에서 첫 터치부터 인화 출구까지 키오스크 사용 순서를 차례로 볼 수 있다.' },
  ctaLink: { en: 'See the journey', ko: '여정 안내 보기' },
}

export default function Rooms() {
  const v = useV()
  usePageTitle(T.title)
  const [active, setActive] = useState('karaoke')
  const at = Math.max(0, PLATFORMS.findIndex((s) => s.id === active))
  const st = PLATFORMS[at]
  const prev = PLATFORMS[(at - 1 + PLATFORMS.length) % PLATFORMS.length]
  const next = PLATFORMS[(at + 1) % PLATFORMS.length]
  const rail = useRef(null)
  const photo = st.photoList[1] || st.photoList[0]

  const select = (id) => {
    if (PLATFORMS.some((p) => p.id === id)) setActive(id)
  }
  const onRailKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const el = rail.current
    if (!el) return
    e.preventDefault()
    el.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * el.clientWidth * 0.6, behavior: 'smooth' })
  }
  const nm = (p) => ({ name: p.title.en, nameKo: p.title.ko })

  return (
    <PageShell>
      <PageTop title={T.h1} lead={T.lead} />
      <RoomExplorer />
      <Tape items={T.tape} pause={T.pause} play={T.play} />

      <section aria-labelledby="rooms-map" className="section-y">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.mapTitle} as="h2" role="headline" className="text-text-pri" id="rooms-map" />
          <Tx {...T.mapSub} as="p" role="body" className="mt-12 max-w-read text-text-sec" />

          <div className="mx-auto mt-32 w-full max-w-wide md:mt-48">
            <TransitMap network={NETWORK} orientation="auto" activeId={active} onSelect={select} animateTrain aria-label={v(T.mapLabel)} />
          </div>

          <div key={st.id} className="mt-48 grid animate-fade-in gap-x-64 gap-y-24 lg:mt-72 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Link to={`/rooms/${st.id}`} className="group relative block overflow-hidden rounded-lg bg-bg-panel" style={{ aspectRatio: '4 / 5' }} aria-label={`${v(T.open)}: ${v(st.title)}`}>
                <img
                  src={photo.thumb}
                  srcSet={`${photo.thumb} ${photo.w}w, ${photo.full} 1350w`}
                  sizes="(min-width: 1024px) 40vw, 92vw"
                  alt={v(photo.alt)}
                  width={photo.w}
                  height={photo.h}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-opacity duration-base ease-out group-hover:opacity-90"
                />
                <span className="absolute left-16 top-16 rounded-pill bg-bg-base px-12 py-8 text-text-pri">
                  <Tx inline {...T.boardingNow} role="label" />
                </span>
              </Link>
            </div>

            <div className="lg:col-span-7 lg:pt-24">
              <StationSign
                station={{ code: STATION.code, name: STATION.name, nameKo: STATION.nameKo }}
                platform={platformById(st.id)}
                line={{ code: 'GY', color: 'yellow' }}
                prev={nm(prev)}
                next={nm(next)}
                size="md"
              />
              <Tx {...st.vibe} as="h3" role="headline" className="mt-32 text-text-pri" />
              <Tx {...st.story} as="p" role="body" className="mt-16 max-w-read text-text-sec" />
              <p className="mt-24 max-w-read text-text-meta">
                <Tx inline {...T.why} role="strong" className="mr-8 text-text-pri" />
                <Tx inline {...st.why} role="caption" />
              </p>
              <div className="mt-32 flex flex-wrap items-center gap-x-24 gap-y-12">
                <Button as={Link} to={`/rooms/${st.id}`} size="lg">
                  <Tx inline {...T.open} />
                  <ArrowRight size={20} aria-hidden="true" />
                </Button>
                <button type="button" onClick={() => setActive(next.id)} className="inline-flex min-h-48 items-center gap-8 text-text-sec hover:text-yellow">
                  <Tx inline {...T.next} role="strong" />
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="rooms-all" className="overflow-hidden bg-bg-elev py-64 md:py-96">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.allTitle} as="h2" role="headline" className="text-text-pri" id="rooms-all" />
          <Tx {...T.allSub} as="p" role="body" className="mt-12 max-w-read text-text-sec" />
        </Container>
        <ul ref={rail} tabIndex={0} onKeyDown={onRailKey} aria-label={v(T.allTitle)} className="mt-32 flex snap-x snap-mandatory gap-12 overflow-x-auto px-page pb-24 md:gap-24" style={{ scrollbarWidth: 'none' }}>
          {PLATFORMS.map((s, i) => {
            const ph = s.photoList[0]
            return (
              <li key={s.id} className={`w-4/5 shrink-0 snap-start md:w-1/3 xl:w-1/4 ${i % 2 ? 'md:mt-48' : ''}`}>
                <Link to={`/rooms/${s.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-lg bg-bg-panel" style={{ aspectRatio: i % 2 ? '4 / 5' : '3 / 4' }}>
                    <img src={ph.thumb} alt={v(ph.alt)} width={ph.w} height={ph.h} loading="lazy" decoding="async" className="size-full object-cover transition-opacity duration-base ease-out group-hover:opacity-85" />
                    <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-scrim to-transparent" />
                    <PlatformBadge no={s.no} accent={s.accent} size="md" className="absolute left-16 top-16" />
                    <p className="t-title absolute inset-x-16 bottom-16 text-text-pri">{s.name}</p>
                  </div>
                  <p className="mt-16 flex items-start gap-8 text-text-pri">
                    <Tx {...s.vibe} role="subhead" className="min-w-0 flex-1" />
                    <ArrowUpRight size={18} aria-hidden="true" className="mt-4 shrink-0 text-yellow transition-transform duration-base ease-out group-hover:-translate-y-4 group-hover:translate-x-4" />
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="rooms-cta" className="section-y">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.ctaTitle} as="h2" role="headline" className="max-w-read text-text-pri" id="rooms-cta" />
          <Tx {...T.ctaBody} as="p" role="body" className="mt-16 max-w-read text-text-sec" />
          <Link to="/guide" className="t-strong mt-24 inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
            <Tx inline {...T.ctaLink} />
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </Container>
      </section>
    </PageShell>
  )
}
