import { cx } from '@urbanedge/ds'
import { T } from '../../components/lang.jsx'
import { CameraView } from '../../components/CameraView.jsx'
import { Countdown } from '../../components/Countdown.jsx'
import { PoseFigure } from '../../components/PoseFigure.jsx'
import { COPY } from '../copy.js'
import { roomById } from '../rooms.js'

// 10. shoot: 촬영. 가운데는 미리보기, 오른쪽은 큰 카운트다운과 포즈 제안, 왼쪽은 찍힌 컷이 쌓이는 필름이다.
// 시선은 화면 아래의 렌즈에 두라고 계속 알린다. 플래시는 KioskScreen이 화면 전체로 낸다.
export default function Shoot({ ctrl }) {
  const { shoot, shots, cuts } = ctrl
  const n = cuts || 4
  const room = roomById(ctrl.room)
  const poseIdx = shoot.phase === 'rest' ? shoot.index + 1 : shoot.index
  const pose = room.copy.poses[poseIdx % room.copy.poses.length]
  const cols = 2
  const rows = Math.ceil(n / cols)
  const cw = n > 4 ? 150 : 150
  const ch = 200
  const phase = shoot.phase
  return (
    <div className="k-tiles absolute inset-0">
      <ol className="absolute grid" style={{ left: 64, top: 170, gridTemplateColumns: `repeat(${cols}, ${cw}px)`, gap: 16 }} aria-label="Cuts">
        {Array.from({ length: cols * rows }, (_, i) => {
          if (i >= n) return <li key={i} aria-hidden="true" />
          const done = !!shots[i]
          const cur = i === shoot.index && phase !== 'idle' && phase !== 'intro' && phase !== 'done' && !done
          return (
            <li key={i} className={cx('relative overflow-hidden rounded-lg', done ? 'bg-bg-raised' : cur ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-text-meta')} style={{ width: cw, height: ch }}>
              {done ? <img src={shots[i].url} alt="" className="k-pop h-full w-full object-cover" /> : <span className="kt-subhead kt-num absolute inset-0 grid place-items-center">{i + 1}</span>}
            </li>
          )
        })}
      </ol>

      <div className="absolute" style={{ left: 713, top: 150 }}>
        <CameraView camera={ctrl.camera} retouch={ctrl.retouch} style={{ width: 495, height: 660 }} className="k-lift" badge={false} />
      </div>

      <div className="absolute" style={{ left: 1290, top: 150, width: 566 }}>
        {phase === 'count' && (
          <div>
            <T n={COPY.island.cutOf} v={{ n: shoot.index + 1, total: n }} as="p" className="kt-strong text-text-sec" />
            <Countdown n={shoot.count} className="justify-items-start" />
          </div>
        )}
        {phase === 'intro' && (
          <div className="k-rise">
            <T n={COPY.shoot.firstUp} as="h1" className="kt-headline" />
            <T n={COPY.shoot.firstSub} as="p" className="kt-lead mt-16 text-text-sec" />
          </div>
        )}
        {phase === 'shutter' && (
          <div className="k-rise">
            <T n={COPY.island.cutOf} v={{ n: shoot.index + 1, total: n }} as="p" className="kt-headline" />
          </div>
        )}
        {phase === 'rest' && (
          <div className="k-rise">
            <T n={COPY.shoot.rest} as="h1" className="kt-headline" />
            <T n={COPY.shoot.restBody} as="p" className="kt-lead mt-16 text-text-sec" />
          </div>
        )}
        {phase === 'done' && (
          <div className="k-rise">
            <T n={COPY.shoot.last} as="h1" className="kt-headline" />
          </div>
        )}
        {(phase === 'count' || phase === 'rest' || phase === 'intro') && (
          <div className="mt-36 flex items-center gap-24">
            <div className="grid shrink-0 place-items-center rounded-xl bg-bg-raised" style={{ width: 160, height: 190 }}>
              <div style={{ height: 120 }}>
                <PoseFigure fig={pose.fig} className="h-full w-auto text-yellow" />
              </div>
            </div>
            <div>
              <T n={COPY.shoot.pose} as="p" className="kt-caption text-text-meta" />
              <T n={{ en: pose.en[0], ko: pose.ko[0] }} as="p" className="kt-strong" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
