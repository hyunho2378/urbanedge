import { Check } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { CutPreview } from '../../components/CutPreview.jsx'
import { useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'
import { FLOW } from '../config.js'

// 4. cuts: 4컷과 8컷을 나란히 크게 비교한다. 촬영 횟수와 1회 촬영 시간을 숫자로 적는다.
// 4컷은 4장을 찍어 전부 쓰고, 8컷은 8장을 찍어 마음에 드는 4장을 고른다(select 단계).
function CutCard({ n, selected, onPick }) {
  const t = useT()
  const c = n === 4 ? COPY.cuts.four : COPY.cuts.eight
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onPick}
      className={cx(
        'ue-press relative flex min-h-touch flex-1 gap-32 rounded-xl border-2 p-40 text-left transition-[transform,opacity,background-color] duration-fast ease-out',
        selected ? 'border-yellow bg-bg-panel shadow-glowYellow' : 'border-hairlineStrong bg-bg-elev',
      )}
    >
      <span className="flex w-192 shrink-0 flex-col items-start justify-between">
        <span className="ue-label text-k-label text-yellow">{n === 4 ? '01' : '02'}</span>
        <span className="flex flex-col">
          <span className="font-display text-k-hero font-black leading-none tracking-tightest">
            {t(c.big)}
          </span>
          <span className="font-display text-k-h3 font-black leading-tight">{t(c.unit)}</span>
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-between gap-24">
        <span className="flex items-start" style={{ minHeight: 176 }}>
          <CutPreview cuts={n} className="w-full" />
        </span>
        <span className="text-k-body font-semibold leading-snug">{t(c.how)}</span>
        <span className="flex flex-wrap gap-12">
          {[t(c.count), t(COPY.cuts.per, { sec: FLOW.secondsPerShot }), t(c.pick)].map((x) => (
            <span key={x} className="rounded-pill border border-hairlineStrong px-20 py-8 font-ui text-k-label font-bold text-text-pri">
              {x}
            </span>
          ))}
        </span>
      </span>
      {selected && (
        <span className="absolute right-24 top-24 grid size-56 place-items-center rounded-pill bg-yellow text-text-onYellow">
          <Check size={36} strokeWidth={4} aria-hidden="true" />
          <span className="sr-only">{t(COPY.common.selected)}</span>
        </span>
      )}
    </button>
  )
}

export default function Cuts({ ctrl }) {
  const t = useT()
  return (
    <div className="flex h-full flex-col gap-24 px-64 pb-16 pt-24">
      <div className="flex items-end justify-between gap-32">
        <h1 className="font-display text-k-h2 font-black leading-tight tracking-tightest">{t(COPY.cuts.title)}</h1>
        <p className="pb-8 font-ui text-k-label font-bold text-text-sec">{t(COPY.cuts.chosenFrame)}</p>
      </div>
      <div role="group" aria-label={t(COPY.cuts.title)} className="flex min-h-0 flex-1 gap-32">
        <CutCard n={4} selected={ctrl.cuts === 4} onPick={() => ctrl.setCuts(4)} />
        <CutCard n={8} selected={ctrl.cuts === 8} onPick={() => ctrl.setCuts(8)} />
      </div>
    </div>
  )
}
