import { cx } from './cx.js'

// "01 ROOMS" 형태의 섹션 라벨 + 헤어라인 (26-1 DAH EXHIBITION 방식)
export function SectionLabel({ index, children, className }) {
  return (
    <div className={cx('mb-40 lg:mb-64', className)}>
      <p className="ue-label flex items-baseline gap-16 text-label text-text-sec">
        {index != null && <span className="text-yellow">{String(index).padStart(2, '0')}</span>}
        <span>{children}</span>
      </p>
      <div className="mt-16 h-px w-full bg-hairline" />
    </div>
  )
}
