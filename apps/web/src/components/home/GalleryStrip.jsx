import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Reveal } from '@urbanedge/ds'
import { HOME_GALLERY } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { Wrap } from '../../layout/Wrap.jsx'
import { T } from '../../layout/type.js'
import { Section, SectionHead } from './parts.jsx'

const COPY = {
  label: { ko: '갤러리', en: 'Gallery' },
  title: { ko: '결과물과 공간', en: 'Prints and places' },
  desc: {
    ko: '인화물과 방 안쪽 모습을 가로로 넘겨 본다.',
    en: 'Swipe through prints and views of the rooms.',
  },
  region: { ko: '갤러리 사진 띠. 좌우 화살표 키로 넘긴다.', en: 'Gallery photo strip. Use the left and right arrow keys to scroll.' },
  prev: { ko: '이전 사진', en: 'Previous photos' },
  next: { ko: '다음 사진', en: 'Next photos' },
  all: { ko: '갤러리 전체 보기', en: 'Open the full gallery' },
}

// 갤러리 띠: 화면 가장자리까지 이어지는 가로 스크롤(scroll-snap). 키보드 화살표와 이전, 다음 버튼으로 넘긴다.
export default function GalleryStrip() {
  const pick = usePick()
  const ref = useRef(null)
  const by = (dir) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.7 })
  }
  const arrow = 'ue-press grid size-48 place-items-center rounded-pill border border-hairlineStrong text-text-pri transition-colors duration-fast ease-out hover:border-yellow hover:text-yellow'

  return (
    <section id="gallery" aria-labelledby="gallery-title" style={{ scrollMarginTop: 'var(--ue-header-h)' }} className="section-y relative overflow-hidden">
      <Wrap>
        <SectionHead index={5} label={COPY.label} titleId="gallery-title" title={COPY.title} desc={COPY.desc} className="mb-32 lg:mb-48" />
        <div className="mb-24 flex items-center justify-end gap-12">
          <button type="button" onClick={() => by(-1)} aria-label={pick(COPY.prev)} className={arrow}>
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => by(1)} aria-label={pick(COPY.next)} className={arrow}>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      </Wrap>

      <Reveal className="overflow-hidden">
        <div
          ref={ref}
          role="region"
          tabIndex={0}
          aria-label={pick(COPY.region)}
          className="-mb-24 flex scroll-smooth snap-x snap-mandatory gap-16 overflow-x-auto pb-48 lg:gap-24"
          style={{
            paddingInline: 'max(var(--ue-page-px), calc((100vw - 2560px) / 2 + var(--ue-page-px)))',
            scrollPaddingInline: 'var(--ue-page-px)',
          }}
        >
          {HOME_GALLERY.map((g, i) => (
            <figure
              key={g.src}
              className="relative shrink-0 snap-start overflow-hidden rounded-lg bg-bg-panel"
              style={{ height: 'clamp(280px, 34vw, 560px)', aspectRatio: g.ratio }}
            >
              <img
                src={g.src}
                alt={pick(g.alt)}
                loading="lazy"
                decoding="async"
                draggable="false"
                className="absolute inset-0 size-full object-cover"
              />
            </figure>
          ))}
        </div>
      </Reveal>

      <Wrap>
        <Reveal className="mt-32 lg:mt-48">
          <Link
            to="/gallery"
            className={`${T.body} group inline-flex min-h-48 items-center gap-12 font-ui font-semibold text-yellow underline-offset-8 hover:underline`}
          >
            {pick(COPY.all)}
            <ArrowRight size={20} aria-hidden="true" className="transition-transform duration-base ease-out group-hover:translate-x-4" />
          </Link>
        </Reveal>
      </Wrap>
    </section>
  )
}
