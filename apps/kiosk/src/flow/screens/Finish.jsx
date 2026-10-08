import { ArrowDown } from 'lucide-react'
import { QrPlaceholder } from '../../components/QrPlaceholder.jsx'
import { RouteMap } from '../../components/RouteMap.jsx'
import { useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'

// 12. finish: 인화물은 아래 출구에서 나온다(hintZone slot). QR 모양 자리표시와 @__urbanedge 태그 안내, 다른 방으로 가는 노선도, 처음으로(하단 오른쪽).
export default function Finish({ ctrl }) {
  const t = useT()
  return (
    <div className="flex h-full flex-col gap-20 px-64 pb-16 pt-24">
      <div className="flex min-h-0 flex-1 gap-40">
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h1 className="font-display text-k-title font-black leading-tight tracking-tightest">{t(COPY.finish.title)}</h1>
            <p className="mt-12 text-k-lead leading-snug text-text-sec">{t(COPY.finish.body)}</p>
          </div>
          <div className="flex items-end gap-40">
            {ctrl.printUrl && (
              <img src={ctrl.printUrl} alt={t(COPY.print.titleDone)} draggable={false} className="w-auto rounded-md border border-hairlineStrong object-contain" style={{ maxHeight: 300, maxWidth: 360 }} />
            )}
            <div className="flex items-center gap-20 pb-8 text-yellow">
              <ArrowDown size={96} strokeWidth={3} className="k-chevron" aria-hidden="true" />
              <span className="font-display text-k-h2 font-black leading-none tracking-tightest">{t(COPY.finish.prints)}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center justify-center gap-12 rounded-xl border border-yellow bg-bg-panel p-24 text-center" style={{ width: 400 }}>
          <p className="font-display text-k-h3 font-black leading-tight tracking-tightest">{t(COPY.finish.qrTitle)}</p>
          <QrPlaceholder label={t(COPY.finish.qrNote)} className="w-full rounded-md" />
          <p className="font-brand text-k-btn font-bold text-yellow">@__urbanedge</p>
          <p className="text-k-label font-semibold leading-snug text-text-sec">{t(COPY.finish.qrBody)}</p>
          <p className="text-k-label text-text-meta">{t(COPY.finish.qrNote)}</p>
        </div>
      </div>
      <div className="rounded-xl border border-hairlineStrong bg-bg-elev px-48 pb-16 pt-20">
        <p className="mb-12 font-ui text-k-label font-bold text-yellow">{t(COPY.finish.routeTitle)}</p>
        <RouteMap room={ctrl.room} />
      </div>
    </div>
  )
}
