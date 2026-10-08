import { useMemo, useState } from 'react'
import { cx } from '@urbanedge/ds'
import { usePick } from '../i18n/index.jsx'
import { PageHero } from '../components/pages/PageHero.jsx'
import { Section } from '../components/pages/Section.jsx'
import { PhotoTile } from '../components/pages/PhotoTile.jsx'
import { Lightbox } from '../components/pages/Lightbox.jsx'
import { GALLERY, GALLERY_FILTERS } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const T = {
  title: { ko: '갤러리', en: 'Gallery' },
  label: { ko: '갤러리 / GALLERY', en: 'GALLERY' },
  h1: { ko: '공간과 결과물', en: 'The space and the prints' },
  desc: {
    ko: '매장 외관과 다섯 개의 방, 인화물과 포스터를 한곳에 모았으며, 사진을 누르면 크게 볼 수 있다.',
    en: 'The storefront, the five rooms, the prints and the posters in one place. Select a photo to view it larger.',
  },
  sectionLabel: { ko: '사진 모음', en: 'ALL PHOTOS' },
  filterAria: { ko: '사진 분류', en: 'Photo category' },
  total: { ko: (n) => `사진 ${n}장`, en: (n) => `${n} photos` },
  zoom: { ko: '크게 보기', en: 'View larger' },
  lbDialog: { ko: '사진 확대 보기', en: 'Photo viewer' },
  lbClose: { ko: '닫기', en: 'Close' },
  lbPrev: { ko: '이전 사진', en: 'Previous photo' },
  lbNext: { ko: '다음 사진', en: 'Next photo' },
}

export default function Gallery() {
  const pick = usePick()
  const [filter, setFilter] = useState('all')
  const [lb, setLb] = useState(null)
  usePageTitle(pick(T.title))

  const list = useMemo(() => (filter === 'all' ? GALLERY : GALLERY.filter((g) => g.tag === filter)), [filter])
  const countOf = (id) => (id === 'all' ? GALLERY.length : GALLERY.filter((g) => g.tag === id).length)
  const lang = pick({ ko: 'ko', en: 'en' })

  return (
    <div className="break-keep break-words">
      <PageHero index="04" label={pick(T.label)} title={pick(T.h1)} desc={pick(T.desc)} crumbs={[{ label: pick(T.title) }]} />

      <Section id="gallery-grid" index={1} label={pick(T.sectionLabel)}>
        <div className="flex flex-wrap items-center justify-between gap-x-24 gap-y-16">
          <div role="group" aria-label={pick(T.filterAria)} className="flex flex-wrap gap-8">
            {GALLERY_FILTERS.map((f) => {
              const on = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={cx(
                    'ue-press inline-flex min-h-48 items-center gap-8 rounded-pill border px-20 font-ui text-bodySm 4xl:text-body font-semibold transition-colors duration-fast ease-out',
                    on ? 'border-yellow bg-yellow text-text-onYellow' : 'border-hairlineStrong text-text-pri hover:border-yellow hover:text-yellow',
                  )}
                >
                  {pick(f.label)}
                  <span className={cx('ue-label text-caption 4xl:text-bodySm', on ? 'text-text-onYellow' : 'text-text-meta')}>{countOf(f.id)}</span>
                </button>
              )
            })}
          </div>
          <p role="status" aria-live="polite" className="ue-label text-label 4xl:text-bodySm text-text-meta">
            {T.total[lang](list.length)}
          </p>
        </div>

        <ul key={filter} className="mt-32 animate-fade-in columns-2 gap-12 md:columns-3 lg:gap-16 xl:columns-4 3xl:columns-5 4xl:columns-6">
          {list.map((g, i) => (
            <li key={g.id} className="mb-12 break-inside-avoid lg:mb-16">
              <PhotoTile photo={g} label={pick(T.zoom)} onOpen={() => setLb(i)} priority={i < 4} />
            </li>
          ))}
        </ul>
      </Section>

      {lb != null && (
        <Lightbox
          items={list}
          index={lb}
          onIndex={setLb}
          onClose={() => setLb(null)}
          label={{ dialog: pick(T.lbDialog), close: pick(T.lbClose), prev: pick(T.lbPrev), next: pick(T.lbNext) }}
        />
      )}
    </div>
  )
}
