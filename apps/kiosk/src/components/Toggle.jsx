import { cx } from '@urbanedge/ds'

// 큰 켜짐 꺼짐 토글. 손잡이는 transform으로만 움직인다.
export function Toggle({ on, onChange, label, onText, offText, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cx(
        'ue-press flex min-h-touch shrink-0 items-center gap-12 rounded-lg border px-16 font-ui text-k-btn font-semibold transition-[transform,opacity,background-color] duration-fast ease-out',
        on ? 'border-yellow bg-tint text-yellow' : 'border-hairlineStrong bg-bg-panel text-text-pri',
        className,
      )}
    >
      <span className={cx('relative h-56 w-112 shrink-0 rounded-pill', on ? 'bg-yellow' : 'bg-bg-raised')}>
        <span
          className={cx(
            'absolute left-4 top-4 size-48 rounded-pill transition-transform duration-base ease-out',
            on ? 'translate-x-56 bg-bg-base' : 'translate-x-0 bg-text-meta',
          )}
        />
      </span>
      <span>{on ? onText : offText}</span>
    </button>
  )
}
