import { Check } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { CameraView } from '../../components/CameraView.jsx'
import { Countdown } from '../../components/Countdown.jsx'
import { useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'
import { roomById } from '../rooms.js'

// 9. shoot: 큰 카운트다운, 컷 n / m, 컷마다 포즈 제안 한 줄. 셔터 순간에는 flashing(300ms)과 화면 플래시가 켜진다.
// 컷 사이에는 쉬는 시간 안내가 뜬다. 촬영 컷 수는 cuts와 같다.
export default function Shoot({ ctrl }) {
  const t = useT()
  const n = ctrl.cuts || 4
  const { index, phase, count } = ctrl.shoot
  const room = roomById(ctrl.room)
  const poses = room.copy.poses
  const [poseName, poseDesc] = t(poses[index % poses.length])
  const cur = Math.min(index + 1, n)

  let overlay = null
  if (phase === 'intro' || phase === 'idle') {
    overlay = (
      <div className="absolute inset-0 grid place-items-center bg-scrim text-center">
        <div className="animate-pop-in">
          <p className="font-display text-k-h2 font-black leading-tight tracking-tightest text-yellow">{t(COPY.shoot.firstUp)}</p>
          <p className="mt-12 font-display text-k-h3 font-bold">{t(COPY.shoot.getReady)}</p>
        </div>
      </div>
    )
  } else if (phase === 'count') {
    overlay = (
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid place-items-center rounded-pill bg-scrim" style={{ width: 460, height: 460 }}>
          <Countdown n={count} />
        </div>
      </div>
    )
  } else if (phase === 'rest' || phase === 'done') {
    overlay = (
      <div className="absolute inset-0 grid place-items-center bg-scrim text-center">
        <div className="animate-pop-in px-48">
          <p className="font-display text-k-h2 font-black leading-tight tracking-tightest">{phase === 'done' ? t(COPY.shoot.last) : t(COPY.shoot.rest)}</p>
          {phase === 'rest' && <p className="mt-12 text-k-lead text-text-sec">{t(COPY.shoot.restBody)}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full gap-40 px-64 pb-16 pt-20">
      <div className="flex w-2/3 shrink-0 flex-col gap-12">
        <CameraView camera={ctrl.camera} retouch={ctrl.retouch} className="aspect-video w-full">
          {overlay}
        </CameraView>
        <p className="font-ui text-k-body font-bold text-yellow">{t(COPY.shoot.lookLens)}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-24">
        <p className="font-display text-k-title font-black leading-none tracking-tightest" aria-live="polite">
          <span className="text-yellow">{String(cur).padStart(2, '0')}</span>
          <span className="text-text-meta"> / {String(n).padStart(2, '0')}</span>
        </p>
        <h1 className="sr-only">{t(COPY.shoot.shotOf, { n: cur, total: n })}</h1>
        <div className="rounded-xl border border-yellow bg-bg-panel p-24">
          <p className="ue-label text-k-label text-yellow">{t(COPY.shoot.pose)}</p>
          <p className="mt-8 font-display text-k-h3 font-black leading-tight tracking-tightest">{poseName}</p>
          <p className="mt-8 text-k-body leading-snug text-text-sec">{poseDesc}</p>
        </div>
        <ol className={cx('grid gap-8', n === 4 ? 'grid-cols-2' : 'grid-cols-4')} aria-label={t(COPY.shoot.shotOf, { n: ctrl.shots.length, total: n })}>
          {Array.from({ length: n }, (_, i) => {
            const shot = ctrl.shots[i]
            return (
              <li key={i} className={cx('relative aspect-video overflow-hidden rounded-md border-2', shot ? 'border-yellow' : 'border-dashed border-hairlineStrong')}>
                {shot ? (
                  <>
                    <img src={shot.url} alt="" className="h-full w-full animate-pop-in object-cover" draggable={false} />
                    <span className="absolute right-4 top-4 grid size-28 place-items-center rounded-pill bg-yellow text-text-onYellow">
                      <Check size={20} strokeWidth={4} aria-hidden="true" />
                    </span>
                  </>
                ) : (
                  <span className="ue-label grid h-full place-items-center text-k-label text-text-meta">{i + 1}</span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
