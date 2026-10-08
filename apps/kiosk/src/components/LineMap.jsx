import { cx } from '@urbanedge/ds'
import { TrainIcon, LineBadge } from '@urbanedge/ds'
import { T, useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'
import { ROOMS, STATION, PLATFORM_BG } from '../flow/rooms.js'

// LineMap: 황리단선 어반엣지역의 승강장 4곳을 한 줄로 잇는 노선도. 현재 승강장에 열차와 "현재 위치" 표시가 선다.
export function LineMap({ room, className, ink = false }) {
  const t = useT()
  return (
    <div className={cx('relative', className)} role="group" aria-label={t(COPY.finish.mapTitle)}>
      <div className={cx('absolute rounded-pill', ink ? 'bg-bg-base' : 'bg-yellow')} style={{ left: 120, right: 120, top: 116, height: 16 }} aria-hidden="true" />
      <div className="absolute flex items-center gap-12" style={{ left: 0, top: 84 }}>
        <LineBadge code="GY" color="yellow" size="xl" />
      </div>
      <ol className="relative flex justify-between" style={{ paddingLeft: 160, paddingRight: 120 }}>
        {ROOMS.map((r) => {
          const here = r.id === room
          return (
            <li key={r.id} className="flex w-1/4 flex-col items-center text-center">
              <span className="relative block" style={{ height: 96 }}>
                {here && (
                  <span className="absolute left-1/2 -translate-x-1/2" style={{ top: -52 }}>
                    <TrainIcon size={72} />
                  </span>
                )}
              </span>
              <span className={cx('grid place-items-center rounded-pill font-label font-bold ring-8 ring-bg-base', PLATFORM_BG[r.color], here && 'shadow-glowYellow')} style={{ width: 80, height: 80, fontSize: 40, marginTop: -64 }}>
                {r.n}
              </span>
              <T n={r.title} as="span" className="kt-strong mt-16" />
              {here && <T n={COPY.finish.here} as="span" className={cx('kt-caption mt-4 rounded-pill px-16', ink ? 'bg-bg-base text-yellow' : 'bg-yellow text-text-onYellow')} />}
            </li>
          )
        })}
      </ol>
      <p className={cx('kt-label absolute', ink ? 'text-text-onYellow' : 'text-text-meta')} style={{ left: 0, top: 176 }} aria-hidden="true">
        {STATION.code}
      </p>
    </div>
  )
}
