import { cx } from '@urbanedge/ds'
import { Wrap } from '../../layout/Wrap.jsx'
import { B } from '../../layout/B.jsx'

// 홈 구간 공통 조각. 헤어라인 번호 라벨을 줄이고 면의 색 단계와 큰 타이포로 구간을 나눈다.

export function Section({ id, labelledBy, tone = 'base', className, wrapClass, children, ...rest }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      style={{ scrollMarginTop: 'var(--ue-header-h)' }}
      className={cx('relative py-28 md:py-80 lg:py-112', tone === 'elev' && 'bg-bg-elev', tone === 'panel' && 'bg-bg-panel', tone === 'light' && 'ue-light', className)}
      {...rest}
    >
      <Wrap className={wrapClass}>{children}</Wrap>
    </section>
  )
}

// 구간 머리: 작은 라벨, 큰 제목, 짧은 설명. 숫자만 강조하지 않는다.
export function Head({ label, title, titleId, desc, className, align = 'left', lean = false }) {
  return (
    <header className={cx('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {label && (
        <p className="t-label text-yellow">
          <B v={label} />
        </p>
      )}
      <h2 id={titleId} className="t-headline mt-12 text-text-pri 3xl:text-h1">
        <B v={title} />
      </h2>
      {desc && (
        <p className={cx('t-lead mt-12 max-w-read text-text-sec md:mt-16', lean && 'hidden md:block')}>
          <B v={desc} />
        </p>
      )}
    </header>
  )
}

// 비율을 먼저 예약한 사진 상자(레이아웃 이동 방지)
export function Photo({ src, alt, ratio = '4 / 5', className, imgClassName, priority = false, sizes, srcSet, ...rest }) {
  return (
    <div className={cx('relative overflow-hidden bg-bg-panel', className)} style={{ aspectRatio: ratio }} {...rest}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable="false"
        className={cx('absolute inset-0 size-full object-cover', imgClassName)}
      />
    </div>
  )
}
