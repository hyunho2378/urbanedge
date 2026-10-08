import { cx } from './cx.js'

const bg = { yellow: 'bg-line-yellow text-text-onYellow', red: 'bg-line-red text-text-pri', blue: 'bg-line-blue text-text-pri', green: 'bg-line-green text-text-onYellow' }

// 노선 배지: 방마다 L1~L5 코드와 노선 색
export function LineBadge({ code, color = 'yellow', size = 'md', className }) {
  const s = size === 'lg' ? 'size-56 text-h3' : size === 'kiosk' ? 'size-80 text-k-h3' : 'size-32 text-body-sm'
  return (
    <span className={cx('inline-grid shrink-0 place-items-center rounded-pill font-label font-bold tracking-tight', s, bg[color], className)}>
      {code}
    </span>
  )
}
