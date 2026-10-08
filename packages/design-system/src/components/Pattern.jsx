import { cx } from './cx.js'

// 브랜드 패턴 4종: 횡단보도, 체커보드, 경고 테이프, 노선 리본. 전부 inline SVG, 색은 CSS 변수.
export function Crosswalk({ className, angle = -18, bars = 14 }) {
  return (
    <svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true" className={cx('block h-full w-full', className)}>
      <g transform={`rotate(${angle} 500 100) translate(-120 -80)`}>
        {Array.from({ length: bars }).map((_, i) => (
          <rect key={i} x={i * 90} y="0" width="46" height="360" fill="rgb(var(--ue-text-pri))" />
        ))}
      </g>
    </svg>
  )
}

export function Checker({ className, size = 24 }) {
  const id = `chk-${size}`
  return (
    <svg aria-hidden="true" className={cx('block h-full w-full', className)}>
      <defs>
        <pattern id={id} width={size * 2} height={size * 2} patternUnits="userSpaceOnUse">
          <rect width={size} height={size} fill="rgb(var(--ue-text-pri))" />
          <rect x={size} y={size} width={size} height={size} fill="rgb(var(--ue-text-pri))" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function CautionTape({ className, size = 28 }) {
  const id = `tape-${size}`
  return (
    <svg aria-hidden="true" className={cx('block h-full w-full', className)}>
      <defs>
        <pattern id={id} width={size * 2} height={size * 2} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={size} height={size * 2} fill="rgb(var(--ue-yellow))" />
          <rect x={size} width={size} height={size * 2} fill="rgb(var(--ue-bg-base))" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function RouteRibbon({ className }) {
  return (
    <div className={cx('flex h-8 w-full', className)} aria-hidden="true">
      <span className="flex-1 bg-line-yellow" />
      <span className="flex-1 bg-line-red" />
      <span className="flex-1 bg-line-blue" />
      <span className="flex-1 bg-line-green" />
    </div>
  )
}
