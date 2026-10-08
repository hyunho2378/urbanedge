import { useMemo } from 'react'
import { FrameCard } from '../../components/FrameCard.jsx'
import { FrameCanvas } from '../../components/FrameCanvas.jsx'
import { useT } from '../../components/lang.jsx'
import { useSamplePhotos } from '../camera.js'
import { COPY } from '../copy.js'
import { framesFor } from '../frames.js'

// 5. frame: 선택한 컷 수에 맞는 프레임(Signature Cut, Layer Cut). 카드는 실제 합성 미리보기이고, 선택하면 오른쪽에 큰 미리보기가 나온다.
// 이 다음에 결제가 끝났다고 가정한다(결제 화면은 만들지 않는다).
export default function Frame({ ctrl }) {
  const t = useT()
  const samples = useSamplePhotos()
  const photos = useMemo(() => samples.slice(0, 4), [samples.length])
  const list = framesFor(ctrl.cuts)
  const sel = ctrl.frame
  return (
    <div className="flex h-full gap-48 px-64 pb-16 pt-24">
      <div className="flex min-w-0 flex-1 flex-col gap-24">
        <h1 className="font-display text-k-h2 font-black leading-tight tracking-tightest">{t(COPY.frame.title)}</h1>
        <div role="group" aria-label={t(COPY.frame.title)} className="flex min-h-0 flex-1 gap-16 pb-8">
          {list.map((f) => (
            <div key={f.id} className="flex min-w-0 flex-1">
              <FrameCard frame={f} photos={photos} room={ctrl.room} selected={sel?.id === f.id} onSelect={() => ctrl.setFrame(f.id)} />
            </div>
          ))}
        </div>
      </div>
      <aside className="flex w-2/5 shrink-0 flex-col items-center gap-16 rounded-xl border border-hairlineStrong bg-bg-elev px-32 pb-24 pt-24" aria-live="polite">
        <p className="ue-label w-full text-k-label text-yellow">{t(COPY.frame.preview)}</p>
        <div className="flex flex-1 items-center">
          {sel && <FrameCanvas key={sel.id} frame={sel} photos={photos} room={ctrl.room} maxW={560} maxH={560} label={t(COPY.frame.preview)} className="animate-pop-in" />}
        </div>
        {sel && (
          <div className="w-full">
            <p className="font-display text-k-h3 font-black leading-tight tracking-tightest">
              {t(COPY.frame.families[sel.family])} {t(COPY.frame.variants[sel.variant])}
            </p>
            <p className="mt-4 text-k-body text-text-sec">{t(COPY.frame.noteFamily[sel.family])}</p>
          </div>
        )}
      </aside>
    </div>
  )
}
