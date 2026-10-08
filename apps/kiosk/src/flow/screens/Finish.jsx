import { T, useT } from '../../components/lang.jsx'
import { ExitSign } from '../../components/ExitSign.jsx'
import { LineMap } from '../../components/LineMap.jsx'
import { QrCode } from '../../components/QrCode.jsx'
import { COPY } from '../copy.js'
import { resultUrl } from '../config.js'

// 13. finish: 하차. 노란 출구 면. 인화물은 아래 트레이로 나온다는 안내와 출구 표지, 모바일 결과 페이지 QR, 승강장 노선도가 한 화면에 있다.
export default function Finish({ ctrl }) {
  const t = useT()
  return (
    <div className="k-tiles-yellow absolute inset-0 text-text-onYellow">
      <div className="absolute" style={{ left: 64, top: 172, width: 1060 }}>
        <T n={COPY.finish.title} as="h1" className="kt-title" />
        <T n={COPY.finish.body} as="p" className="kt-body mt-20" />
        <ExitSign className="mt-20" />
      </div>
      <div className="k-pop absolute rounded-xl bg-bg-base text-text-pri" style={{ left: 1196, top: 172, width: 660, padding: 44 }}>
        <div className="mx-auto" style={{ width: 360 }}>
          <QrCode value={resultUrl(ctrl.lang)} size={360} label={t(COPY.finish.qrTitle)} className="rounded-lg" />
        </div>
        <T n={COPY.finish.qrTitle} as="p" className="kt-strong mt-24" />
        <T n={COPY.finish.qrBody} as="p" className="kt-caption mt-4 text-text-sec" />
      </div>
      <div className="absolute" style={{ left: 1196, top: 812, width: 660 }}>
        <T n={COPY.common.imaginary} as="p" className="kt-caption" />
      </div>
      <div className="absolute" style={{ left: 64, top: 806, width: 1380 }}>
        <LineMap room={ctrl.room} ink />
      </div>
    </div>
  )
}
