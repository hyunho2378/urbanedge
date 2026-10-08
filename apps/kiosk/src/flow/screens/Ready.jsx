import { T } from '../../components/lang.jsx'
import { CameraView } from '../../components/CameraView.jsx'
import { COPY } from '../copy.js'

// 9. ready: 촬영 전 마지막 확인. 얼굴을 타원에 맞추고 아래 렌즈를 본다. 시작은 오른쪽 아래 버튼이다.
export default function Ready({ ctrl }) {
  return (
    <div className="k-tiles absolute inset-0">
      <div className="absolute" style={{ left: 64, top: 172, width: 600 }}>
        <T n={COPY.ready.title} as="h1" className="kt-title" />
        <T n={COPY.ready.body} as="p" className="kt-lead mt-24 text-text-sec" />
      </div>
      <div className="absolute" style={{ left: 713, top: 150 }}>
        <CameraView camera={ctrl.camera} retouch={ctrl.retouch} style={{ width: 495, height: 660 }} className="k-lift">
          <svg viewBox="0 0 495 660" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <path fillRule="evenodd" className="fill-black/45" d="M0 0H495V660H0Z M247.5 90 C 340 90 392 190 392 300 C 392 420 330 500 247.5 500 C 165 500 103 420 103 300 C 103 190 155 90 247.5 90Z" />
            <path className="stroke-yellow" fill="none" strokeWidth="5" strokeDasharray="18 14" d="M247.5 90 C 340 90 392 190 392 300 C 392 420 330 500 247.5 500 C 165 500 103 420 103 300 C 103 190 155 90 247.5 90Z" />
          </svg>
          <span className="kt-caption absolute bottom-20 left-1/2 -translate-x-1/2 rounded-pill bg-scrim px-20 py-6 text-text-pri">
            <T n={COPY.ready.guideLine} inline />
          </span>
        </CameraView>
      </div>
      {ctrl.camera.status === 'fallback' && (
        <div className="absolute" style={{ left: 1290, top: 172, width: 566 }}>
          <T n={COPY.ready.fallback} as="p" className="kt-body text-text-sec" />
        </div>
      )}
    </div>
  )
}
