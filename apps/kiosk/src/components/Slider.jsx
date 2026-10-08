import { useRef } from 'react'
import { cx } from '@urbanedge/ds'

// 큰 슬라이더. 손잡이 터치 영역은 120px이고 트랙은 얇다. 끌기와 키보드 화살표로 값을 바꾼다(0부터 1).
export function Slider({ value, onChange, label, minLabel, maxLabel, className, width = 640 }) {
  const ref = useRef(null)
  const set = (clientX) => {
    const r = ref.current.getBoundingClientRect()
    const s = r.width / width
    const px = (clientX - r.left) / s
    onChange(Math.min(1, Math.max(0, px / width)))
  }
  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    set(e.clientX)
  }
  const onMove = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) set(e.clientX)
  }
  const onKey = (e) => {
    const step = e.shiftKey ? 0.25 : 0.05
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(1, value + step))
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(0, value - step))
    else return
    e.preventDefault()
  }
  return (
    <div className={cx('select-none', className)}>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onKeyDown={onKey}
        className="relative touch-none"
        style={{ width, height: 120, cursor: 'pointer' }}
      >
        <div className="absolute inset-x-0 rounded-pill bg-text-pri/20" style={{ top: 52, height: 16 }} />
        <div className="absolute left-0 origin-left rounded-pill bg-yellow" style={{ top: 52, height: 16, width, transform: `scaleX(${value})` }} />
        <div className="absolute grid place-items-center rounded-pill bg-white text-text-onYellow k-lift" style={{ top: 28, left: 0, width: 64, height: 64, transform: `translate3d(${value * (width - 64)}px, 0, 0)` }}>
          <span className="rounded-pill bg-yellow" style={{ width: 24, height: 24 }} />
        </div>
      </div>
      {(minLabel || maxLabel) && (
        <div className="kt-caption mt-4 flex justify-between text-text-meta" style={{ width }}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}
