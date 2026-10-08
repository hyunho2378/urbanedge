import { T } from '../../components/lang.jsx'
import { PoseFigure } from '../../components/PoseFigure.jsx'
import { COPY } from '../copy.js'
import { roomById } from '../rooms.js'

// 7. guide v3.1: 촬영 직전 한 장. 처음 한 번은 렌즈 위치 팁(온보딩 세 번째 순간)이 포즈 자리에 열리고, 닫으면 포즈 네 가지가 나온다.
// 보정과 얼굴 맞추기 단계는 없다. 아래 가운데의 렌즈 신호는 KioskScreen이 그린다.
export default function Guide({ ctrl }) {
  const room = roomById(ctrl.room)
  const poses = room.copy.poses
  const seen = ctrl.coach.seen.lens
  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 236, width: 1500 }}>
        <T n={COPY.guide.title} v={{ room: room.title }} as="h1" className="kt-title" />
        <T n={COPY.guide.tip} as="p" className="kt-lead mt-16 text-text-sec" />
      </div>
      {seen ? (
        <ul className="absolute grid" style={{ left: 120, top: 500, gridTemplateColumns: 'repeat(4, 380px)', columnGap: 56 }}>
          {poses.map((p, i) => (
            <li key={i} className={`k-rise k-d${i + 1}`}>
              <div className="flex items-end" style={{ height: 180 }}>
                <PoseFigure fig={p.fig} className="h-full w-auto text-yellow" />
              </div>
              <T n={{ en: p.en[0], ko: p.ko[0] }} as="p" className="kt-strong mt-28" />
              <T n={{ en: p.en[1], ko: p.ko[1] }} as="p" className="kt-body mt-4 text-text-sec" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="absolute" style={{ left: 120, top: 440, width: 1200 }}>
        </div>
      )}
    </div>
  )
}
