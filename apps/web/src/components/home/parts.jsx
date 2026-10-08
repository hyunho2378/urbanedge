import { Reveal, cx } from '@urbanedge/ds'
import { Wrap } from '../../layout/Wrap.jsx'
import { T } from '../../layout/type.js'
import { usePick } from '../../i18n/index.jsx'

// 홈 구간 공통 조각: 구간 껍데기(앵커와 헤더 보정), 번호 라벨 + 제목, 사진 상자.

// 구간 껍데기. 고정 헤더 아래로 앵커가 가려지지 않도록 scroll-margin을 둔다.
export function Section({ id, labelledBy, tone = 'base', className, children, ...rest }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      style={{ scrollMarginTop: 'var(--ue-header-h)' }}
      className={cx('section-y relative', tone === 'elev' && 'bg-bg-elev', className)}
      {...rest}
    >
      <Wrap>{children}</Wrap>
    </section>
  )
}

// "01 소개" 번호 라벨 + 헤어라인 + 큰 제목 + 설명(전시회 사이트 방식)
export function SectionHead({ index, label, titleId, title, desc, className }) {
  const pick = usePick()
  return (
    <Reveal className={cx('mb-48 lg:mb-72', className)}>
      <p className={`${T.label} flex items-baseline gap-16 text-text-sec`}>
        <span className="text-yellow">{String(index).padStart(2, '0')}</span>
        <span>{pick(label)}</span>
      </p>
      <div className="mt-16 h-px w-full bg-hairline" />
      {title && (
        <h2 id={titleId} className={`${T.h2} mt-40 max-w-5xl text-balance lg:mt-56 3xl:max-w-none`}>
          {pick(title)}
        </h2>
      )}
      {desc && <p className={`${T.lead} mt-24 max-w-read text-text-sec`}>{pick(desc)}</p>}
    </Reveal>
  )
}

// 비율을 먼저 예약한 사진 상자. 이미지가 늦게 와도 레이아웃이 움직이지 않는다.
export function Photo({ src, alt, ratio = '4 / 5', className, imgClassName, priority = false, ...rest }) {
  return (
    <div className={cx('relative overflow-hidden rounded-lg bg-bg-panel', className)} style={{ aspectRatio: ratio }} {...rest}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable="false"
        className={cx('absolute inset-0 size-full object-cover', imgClassName)}
      />
    </div>
  )
}
