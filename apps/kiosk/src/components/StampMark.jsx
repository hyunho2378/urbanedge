import { cx } from '@urbanedge/ds'

// 승강장 스탬프: 승강장 색 원판, 이중 링, 승강장 번호와 이름. prints.js의 drawStamp와 같은 모양이다.
const FILL = { yellow: 'fill-line-yellow', red: 'fill-line-red', blue: 'fill-line-blue', green: 'fill-line-green' }
const INK = { yellow: 'fill-bg-base stroke-bg-base', red: 'fill-text-pri stroke-text-pri', blue: 'fill-text-pri stroke-text-pri', green: 'fill-bg-base stroke-bg-base' }

export function StampMark({ platform, size = 160, rot = 0, className }) {
  const ink = INK[platform.color]
  const [fillCls, strokeCls] = [ink.split(' ')[0], ink.split(' ')[1]]
  const label = platform.name.replace(' SHOT', '')
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" className={cx('block', className)} style={{ transform: rot ? `rotate(${rot}deg)` : undefined }}>
      <circle cx="60" cy="60" r="60" className={FILL[platform.color]} />
      <circle cx="60" cy="60" r="54" className={cx('fill-none', strokeCls)} strokeWidth="4" />
      <circle cx="60" cy="60" r="45.6" className={cx('fill-none', strokeCls)} strokeWidth="1.6" />
      <text x="60" y="58" textAnchor="middle" dominantBaseline="middle" className={cx('font-brand', fillCls)} fontSize="36" fontWeight="700">
        {`P${platform.n}`}
      </text>
      <text x="60" y="83" textAnchor="middle" className={cx('font-label', fillCls)} fontSize="14" fontWeight="600" textLength={Math.min(78, label.length * 8.2)} lengthAdjust="spacingAndGlyphs">
        {label}
      </text>
    </svg>
  )
}
