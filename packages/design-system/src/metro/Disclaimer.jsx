import { cx } from '../components/cx.js'
import { Bi } from '../components/Bi.jsx'
import { tok } from './colors.js'

// 고지 칩. 가상의 지하철 이야기이며 실제 교통시설이 아님을 알린다. 한영 전환에도 칩 크기가 변하지 않는다.
// size: 'sm' | 'md' | 'lg'
const F = { sm: 11, md: 12.5, lg: 15 }
export function ImaginaryMetroChip({ size = 'md', className }) {
  const f = F[size] || F.md
  return (
    <span
      className={cx('inline-flex items-center rounded-pill bg-bg-raised text-text-sec', className)}
      style={{ gap: f * 0.55, padding: `${f * 0.42}px ${f * 0.95}px ${f * 0.42}px ${f * 0.7}px`, fontSize: f, lineHeight: 1.2, fontWeight: 600, letterSpacing: '0.01em' }}
    >
      <svg width={f * 1.15} height={f * 1.15} viewBox="0 0 24 24" fill="none" stroke={tok('yellow')} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <rect x="5" y="3" width="14" height="14" rx="4" />
        <path d="M8 21l2-4M16 21l-2-4M9 9h6" />
      </svg>
      <Bi inline en="Imaginary Metro · Travel Experience" ko="가상의 지하철 여행 경험" />
    </span>
  )
}
