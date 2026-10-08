import { cx } from './cx.js'
import { typography } from '../tokens.js'
import { lineRgb, tok, INK } from '../metro/colors.js'

// 크기 표. px는 지름. kiosk는 이전 이름과의 호환용으로 xl과 같다.
const SIZES = { xs: 20, sm: 24, md: 32, lg: 56, xl: 80, kiosk: 80 }

// 글자 수에 따른 글자 크기(지름 100 기준). 응축형 Barlow Condensed 800으로 자간을 좁혀 원 안을 꽉 채운다.
const FS = [0, 66, 54, 42, 34]

// 서울 지하철식 원형 노선 배지. 노선색 원, 안쪽 흰 링, 굵은 노선 코드(H, GY, 1).
// 20px 이하에서는 링을 빼서 뭉개지지 않게 한다. 어두운 바탕 위 윤곽을 위해 바깥에 아주 얇은 그림자 링을 둔다.
export function LineBadge({ code, color = 'yellow', size = 'md', className, label, style, ring = true }) {
  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md
  const txt = String(code)
  const fs = FS[Math.min(4, Math.max(1, txt.length))]
  const showRing = ring && px >= 24
  return (
    <span role="img" aria-label={label || `Line ${code}`} className={cx('inline-block shrink-0 select-none align-middle', className)} style={{ width: px, height: px, lineHeight: 0, ...style }}>
      <svg viewBox="0 0 100 100" width={px} height={px} aria-hidden="true" focusable="false" style={{ display: 'block', overflow: 'visible' }}>
        <circle cx="50" cy="50" r="50" fill={lineRgb(color)} />
        <circle cx="50" cy="50" r="49.2" fill="none" stroke={tok('black')} strokeOpacity="0.16" strokeWidth="1.6" />
        {showRing && <circle cx="50" cy="50" r="42.5" fill="none" stroke={tok('white')} strokeOpacity="0.92" strokeWidth={px >= 48 ? 3.2 : 4.4} />}
        <text
          x="50"
          y={50 + fs * 0.355}
          textAnchor="middle"
          fill={INK}
          style={{ fontFamily: typography.family.label, fontSize: fs, fontWeight: 800, letterSpacing: txt.length > 1 ? '-0.03em' : '0', fontVariantNumeric: 'tabular-nums' }}
        >
          {txt}
        </text>
      </svg>
    </span>
  )
}
