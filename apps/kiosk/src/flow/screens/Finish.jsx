import { T, useT } from '../../components/lang.jsx'
import { QrCode } from '../../components/QrCode.jsx'
import { StripView } from '../../components/StripView.jsx'
import { Zoomable } from '../../components/Zoomable.jsx'
import { COPY } from '../copy.js'
import { resultUrl } from '../config.js'
import { defaultFrameFor, photosFromArrangement } from '../prints.js'

// 13. finish v3.1: 초점은 방금 인화한 실제 인화물 하나. 오른쪽에는 제목, 한 줄 안내, QR 하나만 둔다. 출구 표지와 긴 문장은 걷어 냈다.
export default function Finish({ ctrl }) {
  const t = useT()
  const frame = ctrl.frame || defaultFrameFor(ctrl.cuts || 4)
  const has = ctrl.shots.length > 0 && ctrl.arrangement.every((v) => v != null)
  const photos = has ? photosFromArrangement(ctrl.arrangement, ctrl.shots) : undefined
  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 220 }}>
        {frame && <Zoomable height={760} label={t(COPY.common.zoomOpen)} render={(h) => <StripView frame={frame} photos={photos} date={ctrl.date} roomId={ctrl.room} message={ctrl.message} height={h} scale={1} className="k-lift" label={t(frame.name)} />} />}
      </div>
      <div className="absolute" style={{ left: 840, top: 236, width: 960 }}>
        <T n={COPY.finish.title} as="h1" className="kt-title" />
        <T n={COPY.finish.body} as="p" className="kt-lead mt-24 text-text-sec" />
      </div>
      <div className="absolute flex items-center gap-32" style={{ left: 840, top: 640 }}>
        <div className="shrink-0 rounded-lg bg-white" style={{ padding: 12 }}>
          <QrCode value={resultUrl(ctrl.lang)} size={168} label={t(COPY.finish.qrTitle)} />
        </div>
        <T n={COPY.finish.qrTitle} as="p" className="kt-strong" />
      </div>
      <div className="absolute" style={{ left: 120, bottom: 28 }}>
      </div>
    </div>
  )
}
