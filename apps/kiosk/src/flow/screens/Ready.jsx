import { Check } from 'lucide-react'
import { CameraView } from '../../components/CameraView.jsx'
import { useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'
import { FLOW } from '../config.js'

// 8. ready: 카메라 확인. 얼굴 위치 안내선, 하단 렌즈 방향 안내(hintZone camera), 하단 오른쪽의 "준비되면 촬영 시작" 큰 버튼.
function FaceGuide() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <ellipse cx="800" cy="400" rx="200" ry="260" className="fill-none stroke-yellow" strokeWidth="6" strokeDasharray="22 16" />
      <path d="M 430 900 C 450 700 620 650 800 650 C 980 650 1150 700 1170 900" className="fill-none stroke-yellow" strokeWidth="6" strokeDasharray="22 16" />
      <path d="M 90 150 V 90 H 150 M 1450 90 H 1510 V 150 M 1510 750 V 810 H 1450 M 150 810 H 90 V 750" className="fill-none stroke-yellow" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}

export default function Ready({ ctrl }) {
  const t = useT()
  const checks = t(COPY.ready.checks)
  return (
    <div className="flex h-full gap-40 px-64 pb-16 pt-20">
      <div className="flex w-2/3 shrink-0 flex-col gap-12">
        <CameraView camera={ctrl.camera} retouch={ctrl.retouch} className="aspect-video w-full">
          <FaceGuide />
          <p className="absolute inset-x-0 top-24 mx-auto w-max rounded-pill bg-scrim px-32 py-12 font-ui text-k-body font-bold text-yellow">
            {t(COPY.ready.guideLine)}
          </p>
        </CameraView>
        {ctrl.camera.status === 'fallback' && <p className="text-k-body text-text-sec">{t(COPY.ready.fallback)}</p>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-24">
        <h1 className="font-display text-k-h2 font-black leading-tight tracking-tightest">{t(COPY.ready.title)}</h1>
        <ol className="flex flex-col gap-16">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-20 rounded-lg border border-hairlineStrong bg-bg-panel px-24 py-20">
              <span className="grid size-48 shrink-0 place-items-center rounded-pill bg-yellow text-text-onYellow">
                <Check size={28} strokeWidth={4} aria-hidden="true" />
              </span>
              <span className="text-k-body font-semibold leading-snug">
                {c.replace('{cuts}', ctrl.cuts || 4).replace('{sec}', FLOW.secondsPerShot)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
