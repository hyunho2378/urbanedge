import { T } from '../../components/lang.jsx'
import { PoseFigure } from '../../components/PoseFigure.jsx'
import { COPY } from '../copy.js'
import { roomById, PLATFORM_BG } from '../rooms.js'
import { cx } from '@urbanedge/ds'

// 7. guide: 승강장(방)마다 다른 포즈 제안 네 가지. 아래 렌즈 표지가 계속 카메라 위치를 가리킨다.
export default function Guide({ ctrl }) {
  const room = roomById(ctrl.room)
  const poses = room.copy.poses
  return (
    <div className="k-tiles absolute inset-0">
      <div className="absolute" style={{ left: 64, top: 172, width: 1000 }}>
        <div className="flex items-center gap-20">
          <span className={cx('grid place-items-center rounded-pill font-label font-bold', PLATFORM_BG[room.color])} style={{ width: 80, height: 80, fontSize: 44 }}>
            {room.n}
          </span>
          <T n={room.title} as="p" className="kt-headline" />
        </div>
        <T n={COPY.guide.title} v={{ room: room.title }} as="h1" className="sr-only" />
      </div>
      <div className="absolute" style={{ left: 1100, top: 190, width: 756 }}>
        <T n={COPY.guide.tip} as="p" className="kt-body text-text-sec" />
      </div>
      <ul className="absolute grid" style={{ left: 64, top: 372, gridTemplateColumns: 'repeat(4, 412px)', columnGap: 48 }}>
        {poses.map((p, i) => (
          <li key={i} className={cx('k-rise', `k-d${i + 1}`)}>
            <div className="grid place-items-center rounded-xl bg-bg-raised" style={{ height: 232 }}>
              <div style={{ height: 184 }}>
                <PoseFigure fig={p.fig} className="h-full w-auto text-yellow" />
              </div>
            </div>
            <T n={{ en: p.en[0], ko: p.ko[0] }} as="p" className="kt-strong mt-16" />
            <T n={{ en: p.en[1], ko: p.ko[1] }} as="p" className="kt-body text-text-sec" />
          </li>
        ))}
      </ul>
    </div>
  )
}
