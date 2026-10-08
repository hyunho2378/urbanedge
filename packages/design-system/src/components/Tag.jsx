import { cx } from './cx.js'

export function Tag({ children, tone = 'line', className }) {
  const t = tone === 'yellow' ? 'bg-yellow text-text-onYellow' : 'border border-hairlineStrong text-text-sec'
  return <span className={cx('ue-label inline-flex items-center rounded-sm px-10 py-4 text-label', t, className)}>{children}</span>
}
