import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Expand } from 'lucide-react'
import { Container, cx } from '@urbanedge/ds'
import { Lightbox } from '../components/pages/Lightbox.jsx'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { PlatformBadge } from '../components/pages/PlatformBadge.jsx'
import { PoseDrawing } from '../components/pages/Poses.jsx'
import { ACCENT, findStation } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'
import NotFound from './NotFound.jsx'

const T = {
  platform: { en: 'Platform', ko: '승강장' },
  station: { en: 'GY-01 UrbanEdge Station', ko: 'GY-01 어반엣지역' },
  zoom: { en: 'Open photo', ko: '사진 열기' },
  posesTitle: { en: 'Poses', ko: '포즈' },
  morePhotos: { en: 'Photos', ko: '사진' },
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
  const [lb, setLb] = useState(null)
  usePageTitle({ en: `${st.name}, Platform ${st.no}`, ko: `${st.name}, ${st.no}번 승강장` })

  const [hero, ...more] = st.photoList
  const accent = ACCENT[st.accent]
  return (
    <PageShell>
      {/* 전면 사진 위에 승강장 번호와 이름. 번호 배지는 승강장 색이다. */}
      <header className="relative isolate overflow-hidden bg-bg-panel" style={{ height: 'min(56dvh, 560px)', minHeight: '320px' }}>
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
                <h1 className="t-display mt-8 text-display-m text-text-pri md:text-display-l">{st.title ? v(st.title) : st.name}</h1>
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
                      /
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
