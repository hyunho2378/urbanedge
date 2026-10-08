import { cx } from '@urbanedge/ds'
import { T } from '../../components/lang.jsx'
import { CameraView } from '../../components/CameraView.jsx'
import { Countdown } from '../../components/Countdown.jsx'
import { PoseFigure } from '../../components/PoseFigure.jsx'
import { COPY } from '../copy.js'
import { roomById } from '../rooms.js'

// 10. shoot v3: 가운데 미리보기, 오른쪽 카운트다운, 왼쪽 컷 정거장(찍힌 컷이 정거장 점을 채운다)과 포즈 제안.
// 아래 가운데의 렌즈 신호와 플래시는 KioskScreen이 그린다.
export default function Shoot({ ctrl }) {
  const { shoot, shots, cuts } = ctrl
  const n = cuts || 4
  const room = roomById(ctrl.room)
  const phase = shoot.phase
  const poseIdx = phase === 'rest' ? shoot.index + 1 : shoot.index
  const pose = room.copy.poses[poseIdx % room.copy.poses.length]
  const cur = Math.min(n, shoot.index + 1)
  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 96, width: 480 }}>
        <T n={COPY.shoot.cutOf} v={{ n: cur, total: n }} as="p" className="kt-subhead" />
        <ol className="mt-32 flex flex-wrap gap-16" aria-label={COPY.shoot.cuts.en}>
          {Array.from({ length: n }, (_, i) => {
            const done = !!shots[i]
            const now = i === shoot.index && !done && phase !== 'done'
            return (
              <li key={i} className={cx('relative overflow-hidden rounded-lg', done ? 'bg-bg-raised' : now ? 'bg-yellow' : 'bg-bg-panel')} style={{ width: 96, height: 128 }}>
                {done ? <img src={shots[i].url} alt="" className="k-pop h-full w-full object-cover" /> : null}
              </li>
            )
          })}
        </ol>
        {(phase === 'count' || phase === 'rest' || phase === 'intro') && (
          <div className="mt-64">
            <T n={COPY.shoot.pose} as="p" className="kt-label text-text-meta" />
            <div className="mt-16 flex items-end gap-24">
              <div style={{ height: 150 }}>
                <PoseFigure fig={pose.fig} className="h-full w-auto text-yellow" />
              </div>
              <T n={{ en: pose.en[0], ko: pose.ko[0] }} as="p" className="kt-strong pb-8" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute" style={{ left: 690, top: 96 }}>
        <CameraView camera={ctrl.camera} retouch={ctrl.retouch} style={{ width: 600, height: 800 }} className="k-lift" badge={false} />
      </div>

      <div className="absolute" style={{ left: 1380, top: 96, width: 480 }}>
        {phase === 'count' && <Countdown n={shoot.count} className="justify-items-start" />}
        {phase === 'intro' && <T n={COPY.shoot.firstUp} as="h1" className="kt-headline k-rise" />}
        {phase === 'rest' && <T n={COPY.shoot.rest} as="h1" className="kt-headline k-rise" />}
        {phase === 'done' && <T n={COPY.shoot.last} as="h1" className="kt-headline k-rise" />}
      </div>
    </div>
  )
}
