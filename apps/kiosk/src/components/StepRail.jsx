import { cx } from '@urbanedge/ds'
import { LINE_BG, LINE_BORDER, roomById } from '../flow/rooms.js'
import { COPY, tr } from '../flow/copy.js'

// 노선형 단계 레일: 지하철 노선도처럼 정거장 점이 선으로 이어진다.
// 지난 구간은 방의 노선 색으로 채워지고(transform scaleX), 현재 정거장은 노랑 핀과 퍼지는 링으로 표시한다.
export function StepRail({ steps, step, room, lang, compact = false }) {
  const stops = steps.slice(1)
  const cur = stops.findIndex((s) => s.id === step)
  const n = stops.length
  const pct = cur <= 0 ? 0 : cur / (n - 1)
  const color = roomById(room).color
  return (
    <nav aria-label={tr(COPY.common.progress, lang)} className={cx('relative mx-96', compact ? 'h-32' : 'h-96')}>
      <div className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 rounded-pill bg-hairlineStrong" />
      <div className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2">
        <div
          className={cx('h-full w-full origin-left rounded-pill transition-transform duration-slow ease-out', LINE_BG[color])}
          style={{ transform: `scaleX(${pct})` }}
        />
      </div>
      <ol className="absolute inset-0">
        {stops.map((s, i) => {
          const state = i < cur ? 'done' : i === cur ? 'cur' : 'todo'
          const size = compact ? (state === 'cur' ? 'size-28' : 'size-16') : state === 'cur' ? 'size-48' : 'size-24'
          return (
            <li
              key={s.id}
              aria-current={state === 'cur' ? 'step' : undefined}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(i / (n - 1)) * 100}%` }}
            >
              <span className="sr-only">{tr(s.label, lang)}</span>
              <span
                aria-hidden="true"
                className={cx(
                  'relative block rounded-pill border-solid transition-transform duration-base ease-out',
                  size,
                  state === 'done' && cx('bg-bg-base', compact ? 'border-4' : 'border-8', LINE_BORDER[color]),
                  state === 'cur' && cx('bg-yellow', compact ? 'border-4 border-bg-base' : 'border-8 border-bg-base'),
                  state === 'todo' && 'border-4 border-hairlineStrong bg-bg-base',
                )}
              >
                {state === 'cur' && <span className="absolute inset-0 animate-ring-out rounded-pill border-2 border-yellow" />}
              </span>
              {state === 'cur' && !compact && (
                <span className="absolute bottom-full left-1/2 mb-8 -translate-x-1/2 whitespace-nowrap font-ui text-k-label font-bold text-text-pri">
                  <span className="mr-8 text-yellow">{String(i + 1).padStart(2, '0')}</span>
                  {tr(s.label, lang)}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
