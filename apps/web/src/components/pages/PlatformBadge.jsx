import { cx } from '@urbanedge/ds'
import { ACCENT } from './content.js'

// 승강장 번호 배지: 승강장 색 원 안의 숫자(서울 지하철 승강장 번호처럼 원으로 둘러싼다).
const SIZES = { sm: 'size-32 text-caption', md: 'size-48 text-bodySm', lg: 'size-72 text-h4', xl: 'size-96 text-h2' }

export function PlatformBadge({ no, accent = 'yellow', size = 'md', className }) {
  const a = ACCENT[accent]
  return (
    <span className={cx('inline-grid shrink-0 place-items-center rounded-pill font-ui font-extrabold leading-none', a.bg, a.fg, SIZES[size], className)} aria-hidden="true">
      {no}
    </span>
  )
}
