import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Expand } from 'lucide-react'
import { Container, ShareButton, cx, useLangValue } from '@urbanedge/ds'
import { SITE } from '../data/site.js'
import { Lightbox } from '../components/pages/Lightbox.jsx'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { PlatformBadge } from '../components/pages/PlatformBadge.jsx'
import { PoseDrawing } from '../components/pages/Poses.jsx'
import { Ticket } from '../components/pages/Ticket.jsx'
import { ACCENT, NOTICE, PLATFORMS, STATION, findStation } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'
import NotFound from './NotFound.jsx'

const T = {
  platform: { en: 'Platform', ko: '승강장' },
  station: { en: 'GY-01 UrbanEdge Station', ko: 'GY-01 어반엣지역' },
  zoom: { en: 'Open photo', ko: '사진 열기' },
  on: { en: 'In the room', ko: '방 안' },
  why: { en: 'Why it photographs well', ko: '잘 나오는 이유' },
  posesTitle: { en: 'Poses', ko: '포즈' },
  posesSub: {
    en: 'Each one uses something that is really in the room. Change pose every shot and the strip reads like a short story.',
    ko: '방에 실제로 놓인 소품을 기준으로 골랐으며, 컷마다 포즈를 바꾸면 인화물 한 장이 짧은 이야기처럼 읽힌다.',
  },
  morePhotos: { en: 'Photos', ko: '사진' },
  ticketTitle: { en: 'Your Metro Ticket', ko: '메트로 승차권' },
  ticketLine: { en: 'Gyeongju Metro, GY-01 UrbanEdge', ko: '경주 메트로, GY-01 어반엣지' },
  ticketWink: {
    en: 'Valid for one photo journey inside this building. Not valid on any real train, bus or taxi.',
    ko: '이 건물 안의 촬영 여정 한 번에만 쓸 수 있으며, 실제 기차와 버스, 택시에서는 쓸 수 없다.',
  },
  admit: { en: 'ADMIT ONE', ko: '1회 탑승' },
  share: { en: 'Share this platform', ko: '이 승강장 공유' },
  prev: { en: 'Previous platform', ko: '이전 승강장' },
  next: { en: 'Next platform', ko: '다음 승강장' },
  all: { en: 'All platforms', ko: '모든 승강장' },
  lb: {
    dialog: { en: 'Photo viewer', ko: '사진 확대 보기' },
    close: { en: 'Close', ko: '닫기' },
    prev: { en: 'Previous photo', ko: '이전 사진' },
    next: { en: 'Next photo', ko: '다음 사진' },
    share: { en: 'Share', ko: '공유' },
    source: { en: 'View the original post', ko: '원본 게시물 보기' },
  },
}

// 비대칭 사진 배치: 12열 격자에서 큰 칸과 작은 칸, 아래로 내린 칸을 섞는다.
const COLLAGE = [
  { span: 'col-span-7', ratio: '4 / 5', shift: '' },
  { span: 'col-span-5', ratio: '3 / 4', shift: 'mt-48 md:mt-96' },
  { span: 'col-span-5', ratio: '3 / 4', shift: '' },
  { span: 'col-span-7', ratio: '4 / 3', shift: 'mt-24 md:mt-48' },
]

export default function RoomDetail() {
  const { id } = useParams()
  const st = findStation(id)
  if (!st) return <NotFound />
  return <PlatformView key={st.id} st={st} />
}

function PlatformView({ st }) {
  const v = useV()
  const lang = useLangValue()
  const [lb, setLb] = useState(null)
  usePageTitle({ en: `${st.name}, Platform ${st.no}`, ko: `${st.name}, ${st.no}번 승강장` })

  const at = PLATFORMS.findIndex((p) => p.id === st.id)
  const prev = PLATFORMS[(at - 1 + PLATFORMS.length) % PLATFORMS.length]
  const next = PLATFORMS[(at + 1) % PLATFORMS.length]
  const [hero, ...more] = st.photoList
  const accent = ACCENT[st.accent]
  const price = lang === 'ko' ? `${SITE.price.base.toLocaleString('ko-KR')}원` : `₩${SITE.price.base.toLocaleString('en-US')}`
  const fare = { en: `Base price ${SITE.price.base.toLocaleString('en-US')} won, 2 prints included.`, ko: `기본 요금 ${SITE.price.base.toLocaleString('ko-KR')}원, 인화 2장 포함.` }
  const d = new Date()
  const date = `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  const origin = typeof window !== 'undefined' ? window.location.href : ''
  const stationLine = { en: `Platform ${st.no}, ${st.title.en}`, ko: `${st.no}번 승강장, ${st.title.ko}` }

  return (
    <PageShell>
      {/* 전면 사진 위에 승강장 번호와 이름. 번호 배지는 승강장 색이다. */}
      <header className="relative isolate overflow-hidden bg-bg-panel" style={{ height: 'min(82dvh, 880px)', minHeight: '440px' }}>
        <button type="button" onClick={() => setLb(0)} aria-label={`${v(T.zoom)}: ${v(hero.alt)}`} className="absolute inset-0 block size-full">
          <img src={hero.full} srcSet={`${hero.thumb} ${hero.w}w, ${hero.full} 1350w`} sizes="100vw" alt="" width={hero.w} height={hero.h} decoding="async" className="size-full object-cover" />
        </button>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-bg-base via-scrim to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <Container className="pb-32 md:pb-48 4xl:max-w-screen-4xl">
            <div className="flex items-end gap-16 md:gap-24">
              <PlatformBadge no={st.no} accent={st.accent} size="xl" className="md:size-120 md:text-display-m" />
              <div className="min-w-0">
                <p className="text-text-sec">
                  <Tx inline {...T.platform} role="caption" /> <span className="t-caption">{st.no},</span> <Tx inline {...T.station} role="caption" />
                </p>
                <h1 className="t-display mt-8 text-display-m text-text-pri md:text-display-l">{st.name}</h1>
              </div>
            </div>
          </Container>
        </div>
        <span className="pointer-events-none absolute right-16 top-16 inline-flex items-center gap-8 rounded-pill bg-scrim px-14 py-8 text-text-pri">
          <Expand size={14} aria-hidden="true" />
          <Tx inline {...T.zoom} role="caption" />
        </span>
      </header>

      <section className="section-y">
        <Container className="grid gap-x-64 gap-y-32 lg:grid-cols-12 4xl:max-w-screen-4xl">
          <div className="lg:col-span-7" />
          <div className="lg:col-span-5 lg:pt-8">
                        <ul className="mt-16 flex flex-wrap items-center gap-x-16 gap-y-8">
              {st.props.map((p, i) => (
                <li key={i} className="flex items-center gap-16 text-text-pri">
                  {i > 0 && (
                    <span aria-hidden="true" className={accent.text}>
                      ‡
                    </span>
                  )}
                  <Tx inline {...p} role="subhead" />
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section aria-labelledby="poses" className="bg-bg-elev py-64 md:py-96">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.posesTitle} as="h2" role="headline" className="text-text-pri" id="poses" />
        </Container>
        <ul
          className="mt-32 flex snap-x snap-mandatory gap-12 overflow-x-auto px-page pb-16 md:mx-auto md:grid md:max-w-wide md:grid-cols-3 md:gap-24 md:overflow-visible md:pb-0 4xl:max-w-screen-4xl"
          style={{ scrollbarWidth: 'none' }}
          tabIndex={0}
          aria-label={v(T.posesTitle)}
        >
          {st.poses.map((p, i) => (
            <li key={p.id} className={cx('w-[72%] max-w-240 shrink-0 snap-start md:w-auto md:max-w-none', i === 1 && 'md:mt-48')}>
              <div className="rounded-lg bg-bg-panel px-24 pb-8 pt-32 text-text-pri">
                <PoseDrawing id={p.id} label={v(p.title)} className="mx-auto max-w-240" />
              </div>
              <Tx {...p.title} as="h3" role="subhead" className="mt-16 text-text-pri" />
            </li>
          ))}
        </ul>
      </section>

      {more.length > 0 && (
        <section aria-labelledby="more" className="section-y overflow-hidden">
          <Container className="4xl:max-w-screen-4xl">
            <Tx {...T.morePhotos} as="h2" role="headline" className="text-text-pri" id="more" />
            <ul className="mt-32 grid grid-cols-12 gap-x-12 gap-y-12 md:gap-x-24 md:gap-y-24">
              {more.map((ph, i) => {
                const c = COLLAGE[i % COLLAGE.length]
                return (
                  <li key={ph.id} className={cx(c.span, c.shift)}>
                    <button type="button" onClick={() => setLb(i + 1)} aria-label={`${v(T.zoom)}: ${v(ph.alt)}`} className="ue-press group relative block w-full overflow-hidden rounded-lg bg-bg-panel" style={{ aspectRatio: c.ratio }}>
                      <img src={ph.thumb} alt="" width={ph.w} height={ph.h} loading="lazy" decoding="async" className="size-full object-cover transition-opacity duration-base ease-out group-hover:opacity-85" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      )}

      <nav aria-label={v(T.all)} className="pb-64">
        <Container className="4xl:max-w-screen-4xl">
          <Link to="/rooms" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
            <ArrowLeft size={18} aria-hidden="true" />
            <Tx inline {...T.all} />
          </Link>
        </Container>
      </nav>

      {lb != null && <Lightbox items={st.photoList} index={lb} onIndex={setLb} onClose={() => setLb(null)} shareTitle={`${st.name} | UrbanEdge`} label={T.lb} />}
    </PageShell>
  )
}
