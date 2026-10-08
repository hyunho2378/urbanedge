import { cx } from '@urbanedge/ds'
import { StationBadge } from './StationBadge.jsx'
import { ROOMS, LINE_BG } from '../flow/rooms.js'
import { useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 방 5곳을 잇는 노선도. 구간마다 왼쪽 방의 노선 색을 쓰고, 현재 방에는 "지금 이 방" 표시를 붙인다.
export function RouteMap({ room, className }) {
  const t = useT()
  return (
    <div className={cx('relative', className)}>
      <div className="absolute inset-x-0 flex px-64" style={{ top: 46 }} aria-hidden="true">
        {ROOMS.slice(0, -1).map((r) => (
          <span key={r.id} className={cx('h-12 flex-1', LINE_BG[r.color])} />
        ))}
      </div>
      <ol className="relative flex justify-between">
        {ROOMS.map((r) => {
          const here = r.id === room
          return (
            <li key={r.id} className="flex w-1/5 flex-col items-center gap-12 text-center">
              <span className={cx('rounded-pill border-8 border-bg-base', here && 'shadow-glowYellow')}>
                <StationBadge code={r.code} color={r.color} size="lg" />
              </span>
              <span className="ue-label text-k-label text-text-pri">{r.name}</span>
              <span className={cx('rounded-pill px-16 py-4 text-k-label font-bold', here ? 'bg-yellow text-text-onYellow' : 'text-text-meta')}>
                {here ? t(COPY.common.thisRoom) : t(r.copy.title)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
