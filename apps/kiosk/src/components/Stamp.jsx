import { cx } from '@urbanedge/ds'

// 노선 스탬프: 노선 색 이중 링과 노선 코드. 인화물에 올라가는 스탬프(frames.js drawStamp)와 같은 모양이다.
const STROKE = { yellow: 'stroke-line-yellow', red: 'stroke-line-red', blue: 'stroke-line-blue', green: 'stroke-line-green' }
const FILL = { yellow: 'fill-line-yellow', red: 'fill-line-red', blue: 'fill-line-blue', green: 'fill-line-green' }

export function Stamp({ room, className, tilt = 0 }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={cx('block', className)} style={{ transform: `rotate(${tilt}deg)` }}>
      <circle cx="60" cy="60" r="55" className={cx('fill-none', STROKE[room.color])} strokeWidth="6" />
      <circle cx="60" cy="60" r="45" className={cx('fill-none', STROKE[room.color])} strokeWidth="2" />
      <text x="60" y="68" textAnchor="middle" className={cx('font-brand', FILL[room.color])} fontSize="38" fontWeight="700">
        {room.code}
      </text>
      <text x="60" y="89" textAnchor="middle" className={cx('font-label', FILL[room.color])} fontSize="12" fontWeight="600" textLength={Math.min(64, room.name.length * 7.5)} lengthAdjust="spacingAndGlyphs">
        {room.name}
      </text>
    </svg>
  )
}
