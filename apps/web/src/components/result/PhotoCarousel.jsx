import { useCallback, useRef } from 'react'
import { cx } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'
import { prefersReducedMotion } from '../../layout/scroll.js'
import { COPY } from './copy.js'

// 인화물 가로 스냅 캐러셀. 화면에 보이는 사진의 번호를 onIndex로 올려 저장 버튼과 맞춘다.
// 카드 테두리 없이 사진 자체가 면이다. 점 표시는 44px 터치 영역을 가진 버튼이다.
export function PhotoCarousel({ photos, index, onIndex }) {
  const pick = usePick()
  const ref = useRef(null)

  const step = () => {
    const el = ref.current
    return el ? el.scrollWidth / photos.length : 0
  }

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const next = el.scrollLeft >= max - 2 ? photos.length - 1 : Math.round(el.scrollLeft / step())
    onIndex(Math.max(0, Math.min(photos.length - 1, next)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onIndex, photos.length])

  const go = (i) => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ left: i * step(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    onIndex(i)
  }

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        role="group"
        aria-roledescription="carousel"
        aria-label={pick(COPY.carouselLabel)}
        tabIndex={0}
        className="rs-scroll -mx-24 flex snap-x snap-mandatory overflow-x-auto px-24 focus-visible:shadow-focus"
        style={{ scrollPaddingInline: '1.5rem' }}
      >
        {photos.map((p, i) => (
          <figure key={p.id} className="w-5/6 shrink-0 snap-center pr-12" aria-label={`${i + 1} / ${photos.length}`}>
            <img
              src={p.src}
              alt={pick(p.alt)}
              width={p.width}
              height={p.height}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable="false"
              className="block h-auto w-full rounded-md bg-white"
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
            />
          </figure>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-center">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => go(i)}
            aria-current={i === index ? 'true' : undefined}
            aria-label={`${i + 1} / ${photos.length}`}
            className="grid size-48 place-items-center focus-visible:shadow-focus"
          >
            <span className={cx('block h-8 rounded-pill transition-[transform,opacity] duration-fast ease-out', i === index ? 'w-24 bg-yellow' : 'w-8 bg-text-meta opacity-60')} />
          </button>
        ))}
      </div>
    </div>
  )
}

