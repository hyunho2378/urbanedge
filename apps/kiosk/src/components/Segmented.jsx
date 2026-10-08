import { cx } from '@urbanedge/ds'

// 큰 세그먼트 선택. 각 칸은 터치 120px 이상이고 키보드 화살표로 이동한다.
export function Segmented({ options, value, onChange, label, disabled = false, className }) {
  const onKey = (e, i) => {
    if (disabled) return
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = options[(i + d + options.length) % options.length]
    onChange(n.value)
  }
  return (
    <div role="radiogroup" aria-label={label} className={cx('flex gap-8', className)}>
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={disabled}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => onChange(o.value)}
            className={cx(
              'ue-press min-h-touch flex-1 rounded-lg border px-16 font-ui text-k-btn font-semibold transition-[transform,opacity,background-color] duration-fast ease-out disabled:opacity-40',
              on ? 'border-yellow bg-yellow text-text-onYellow' : 'border-hairlineStrong bg-bg-panel text-text-pri',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
