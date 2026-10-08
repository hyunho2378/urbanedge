import { cx } from '@urbanedge/ds'

// 번호 라벨 + 헤어라인 (전시회 사이트의 섹션 라벨을 키오스크 크기로 옮긴 것)
export function ScreenLabel({ n, children, className }) {
  return (
    <div className={cx('w-full', className)}>
      <p className="ue-label flex items-baseline gap-16 text-k-label text-text-sec">
        {n != null && <span className="text-yellow">{String(n).padStart(2, '0')}</span>}
        <span>{children}</span>
      </p>
      <div className="mt-12 h-px w-full bg-hairlineStrong" />
    </div>
  )
}
