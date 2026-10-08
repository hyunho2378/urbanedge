import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, ExternalLink, Plus } from 'lucide-react'
import { Bi, Button, Container, cx } from '@urbanedge/ds'
import { Lightbox } from '../components/pages/Lightbox.jsx'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { PageTop } from '../components/pages/PageTop.jsx'
import { Tape } from '../components/pages/Tape.jsx'
import { Tilt } from '../components/pages/Tilt.jsx'
import { GALLERY, GALLERY_FILTERS, INSTAGRAM, NAVER_PLACE } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const T = {
  title: { en: 'Gallery', ko: '갤러리' },
  h1: { en: 'The wall of prints.', ko: '인화물이 붙은 벽' },
  lead: {
    en: 'Real strips from real visitors, next to the rooms they were shot in. Tap a photo to open it, share it, or jump to the original post.',
    ko: '방문객이 남긴 실제 인화물과 그 사진을 찍은 방을 함께 모았다. 사진을 누르면 크게 열어 공유하거나 원본 게시물로 넘어갈 수 있다.',
  },
  insta: { en: 'Instagram @__urbanedge', ko: '인스타그램 @__urbanedge' },
  naver: { en: 'Naver Place photos', ko: '네이버 플레이스 사진' },
  filterAria: { en: 'Photo category', ko: '사진 분류' },
  more: { en: 'Show more photos', ko: '사진 더 보기' },
  zoom: { en: 'Open photo', ko: '사진 열기' },
  tape: [
    { en: 'Prints on the wall are real', ko: '벽에 붙은 인화물은 모두 실제 사진입니다' },
    { en: 'Please do not touch the wet ink', ko: '아직 마르지 않은 잉크는 만지지 마세요' },
    { en: 'Tag @__urbanedge if you shoot something good', ko: '좋은 사진이 나오면 @__urbanedge를 태그하세요' },
  ],
  pause: { en: 'Pause announcements', ko: '안내 문구 멈추기' },
  play: { en: 'Resume announcements', ko: '안내 문구 다시 흐르기' },
  lb: {
    dialog: { en: 'Photo viewer', ko: '사진 확대 보기' },
    close: { en: 'Close', ko: '닫기' },
    prev: { en: 'Previous photo', ko: '이전 사진' },
    next: { en: 'Next photo', ko: '다음 사진' },
    share: { en: 'Share', ko: '공유' },
    source: { en: 'View the original post', ko: '원본 게시물 보기' },
  },
  shareTitle: 'UrbanEdge Metrography, Gyeongju',
}

// 블록 하나(아홉 장)가 모바일 2열과 데스크톱 6열 격자를 빈틈없이 채우는 칸 크기.
const SPANS = [
  'col-span-2 row-span-2 md:col-span-3 md:row-span-3',
  'col-span-1 row-span-2 md:col-span-3 md:row-span-2',
  'col-span-1 row-span-1 md:col-span-2 md:row-span-1',
  'col-span-1 row-span-1 md:col-span-1 md:row-span-1',
  'col-span-2 row-span-1 md:col-span-2 md:row-span-2',
  'col-span-1 row-span-2 md:col-span-2 md:row-span-3',
  'col-span-1 row-span-1 md:col-span-2 md:row-span-2',
  'col-span-1 row-span-1 md:col-span-2 md:row-span-1',
  'col-span-2 row-span-1 md:col-span-2 md:row-span-1',
]

const inFilter = (g, f) => {
  if (f === 'all') return true
  if (f === 'rooms') return g.kind === 'room'
  if (f === 'prints') return g.kind === 'print' || g.kind === 'team'
  return g.kind === 'space' || g.kind === 'poster'
}

const BLOCK = 9

export default function Gallery() {
  const v = useV()
  usePageTitle(T.title)
  const [filter, setFilter] = useState('all')
  const [count, setCount] = useState(BLOCK)
  const [lb, setLb] = useState(null)

  const list = useMemo(() => GALLERY.filter((g) => inFilter(g, filter)), [filter])
  useEffect(() => setCount(BLOCK), [filter])
  const visible = list.slice(0, count)
  const countOf = (id) => GALLERY.filter((g) => inFilter(g, id)).length
  const shown = { en: `Showing ${visible.length} of ${list.length}`, ko: `${list.length}장 가운데 ${visible.length}장 표시` }

  const seg = (on) => cx('ue-press inline-flex min-h-48 items-center gap-8 rounded-pill px-20 font-ui text-bodySm font-semibold transition-colors duration-fast ease-out', on ? 'bg-yellow text-text-onYellow' : 'bg-bg-panel text-text-pri hover:text-yellow')

  return (
    <PageShell>
      <PageTop title={T.h1} lead={T.lead}>
        <div className="mt-32 flex flex-wrap items-center gap-x-24 gap-y-12">
          <Button as="a" href={INSTAGRAM} target="_blank" rel="noopener noreferrer" size="lg">
            <Tx inline {...T.insta} />
            <ExternalLink size={18} aria-hidden="true" />
          </Button>
          <a href={NAVER_PLACE} target="_blank" rel="noopener noreferrer" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
            <Tx inline {...T.naver} />
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </PageTop>

      <section aria-label={v(T.title)} className="pb-64 md:pb-96">
        <Container className="4xl:max-w-screen-4xl">
          <div className="flex flex-wrap items-center justify-between gap-x-24 gap-y-16">
            <div role="group" aria-label={v(T.filterAria)} className="flex flex-wrap gap-8">
              {GALLERY_FILTERS.map((f) => (
                <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={seg(filter === f.id)}>
                  <Tx inline {...f.label} />
                  <span className={cx('t-caption tabular-nums', filter === f.id ? 'text-text-onYellow' : 'text-text-meta')}>{countOf(f.id)}</span>
                </button>
              ))}
            </div>
            <p role="status" aria-live="polite" className="tabular-nums text-text-meta">
              <Tx inline {...shown} role="caption" />
            </p>
          </div>

          <ul key={filter} className="mt-24 grid animate-fade-in grid-cols-2 gap-8 md:grid-cols-6 md:gap-12" style={{ gridAutoFlow: 'row dense', gridAutoRows: 'clamp(96px, 30vw, 132px)' }}>
            {visible.map((g, i) => {
              const tilt = g.kind === 'print' || g.kind === 'team'
              const inner = (
                <button type="button" onClick={() => setLb(i)} aria-label={`${v(T.zoom)}: ${v(g.alt)}`} className="ue-press group relative block size-full overflow-hidden rounded-md bg-bg-panel">
                  <img src={g.thumb} alt="" width={g.w} height={g.h} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover transition-opacity duration-base ease-out group-hover:opacity-85" />
                </button>
              )
              return (
                <li key={g.id} className={cx(SPANS[i % BLOCK], 'min-h-0 min-w-0')}>
                  {tilt ? (
                    <Tilt className="size-full" max={7}>
                      {inner}
                    </Tilt>
                  ) : (
                    inner
                  )}
                </li>
              )
            })}
          </ul>

          {count < list.length && (
            <div className="mt-32 flex justify-center">
              <button type="button" onClick={() => setCount((c) => c + BLOCK)} className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
                <Plus size={18} aria-hidden="true" />
                <Tx inline {...T.more} />
              </button>
            </div>
          )}
        </Container>
      </section>

      <Tape items={T.tape} pause={T.pause} play={T.play} />

      {lb != null && <Lightbox items={list} index={lb} onIndex={setLb} onClose={() => setLb(null)} shareTitle={T.shareTitle} label={T.lb} />}
    </PageShell>
  )
}
