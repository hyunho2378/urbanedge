import { cx } from '@urbanedge/ds'

// 4컷과 8컷의 차이를 보여 주는 도식. 4컷은 찍은 4장이 그대로 프레임에 들어가고,
// 8컷은 찍은 8장 가운데 4장을 골라 프레임에 넣는다.
const PICKED = [1, 2, 5, 6]

export function CutSchematic({ cuts, ariaLabel, className }) {
  const eight = cuts === 8
  const size = 34
  const gap = 8
  const cols = 4
  const rows = eight ? 2 : 1
  const gridW = cols * size + (cols - 1) * gap
  const gridH = rows * size + (rows - 1) * gap
  const top = (120 - gridH) / 2
  return (
    <svg viewBox="0 0 340 120" role="img" aria-label={ariaLabel} className={cx('block h-auto w-full', className)}>
      {Array.from({ length: cuts }).map((_, i) => {
        const x = (i % cols) * (size + gap)
        const y = top + Math.floor(i / cols) * (size + gap)
        const picked = !eight || PICKED.includes(i)
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={size}
            height={size}
            rx="4"
            className={picked ? 'fill-yellow' : 'fill-bg-raised stroke-hairlineStrong'}
            strokeWidth="1.5"
          />
        )
      })}
      <g className="fill-none stroke-text-sec" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${gridW + 14} 60 H ${gridW + 46}`} />
        <path d={`M${gridW + 38} 52 L ${gridW + 46} 60 L ${gridW + 38} 68`} />
      </g>
      <rect x="262" y="4" width="68" height="112" rx="6" className="fill-bg-panel stroke-hairlineStrong" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="270" y={11 + i * 26} width="52" height="22" rx="3" className="fill-yellow" />
      ))}
    </svg>
  )
}
