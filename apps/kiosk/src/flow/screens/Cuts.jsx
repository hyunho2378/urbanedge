import { Check } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'

// 4. cuts: 컷 수를 고른다. 큰 면 두 개가 선택지의 전부다. 고르면 면이 노랑으로 바뀌고 다음 버튼이 켜진다.
function Mini({ n }) {
  return (
    <span className="grid" style={{ gridTemplateColumns: 'repeat(4, 72px)', gap: 12 }} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="block rounded-md bg-current opacity-30" style={{ width: 72, height: 96 }} />
      ))}
    </span>
  )
}

function Tile({ n, label, body, on, onPick, coach }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onPick}
      data-coach={coach}
      className={cx('ue-press relative overflow-hidden rounded-xl text-left transition-[transform,opacity,background-color] duration-base ease-out', on ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-text-pri')}
      style={{ width: 880, height: 480 }}
    >
      <div className="absolute" style={{ left: 64, top: 52 }}>
        <T n={label} as="span" className="kt-title" />
      </div>
      <div className="absolute" style={{ right: 64, bottom: 56 }}>
        <Mini n={n} />
      </div>
      <div className="absolute" style={{ left: 64, bottom: 48, width: 400 }}>
        <T n={body} as="p" className="kt-body" />
      </div>
      <span className={cx('absolute grid place-items-center rounded-pill transition-[transform,opacity] duration-base ease-out', on ? 'scale-100 bg-bg-base text-yellow opacity-100' : 'scale-75 opacity-0')} style={{ right: 48, top: 48, width: 96, height: 96 }} aria-hidden="true">
        <Check size={56} strokeWidth={3.2} />
      </span>
    </button>
  )
}

export default function Cuts({ ctrl }) {
  const t = useT()
  return (
    <div className="k-tiles absolute inset-0">
      <div className="absolute" style={{ left: 64, top: 172, width: 1200 }}>
        <T n={COPY.cuts.title} as="h1" className="kt-title" />
        <T n={COPY.cuts.sub} v={{ sec: 5 }} as="p" className="kt-lead mt-12 text-text-sec" />
      </div>
      <div role="radiogroup" aria-label={t(COPY.cuts.title)} className="absolute flex gap-40" style={{ left: 80, top: 408 }}>
        <Tile n={4} label={COPY.cuts.four} body={COPY.cuts.fourBody} on={ctrl.cuts === 4} onPick={() => ctrl.setCuts(4)} coach="cuts" />
        <Tile n={8} label={COPY.cuts.eight} body={COPY.cuts.eightBody} on={ctrl.cuts === 8} onPick={() => ctrl.setCuts(8)} />
      </div>
    </div>
  )
}
