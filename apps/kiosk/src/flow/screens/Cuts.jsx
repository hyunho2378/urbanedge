import { Check } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { StripView } from '../../components/StripView.jsx'
import { COPY } from '../copy.js'
import { frameById, defaultFrameFor } from '../prints.js'

// 4. cuts v3: 실제 인화 프레임 두 장(4컷, 8컷)이 선택지다. 고르면 면이 노랑으로 바뀌고 다음 버튼이 켜진다.
function Tile({ n, label, body, on, onPick, frame, date, room }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onPick}
      className={cx('ue-press relative flex items-end gap-40 overflow-hidden whitespace-normal rounded-xl text-left transition-[transform,background-color] duration-base ease-out', on ? 'bg-yellow text-text-onYellow' : 'bg-bg-panel text-text-pri')}
      style={{ width: 780, height: 440, padding: 44 }}
    >
      <div className="shrink-0">{frame ? <StripView frame={frame} date={date} roomId={room} height={352} scale={0.5} className="k-lift" /> : null}</div>
      <div className="min-w-0 pb-8">
        <T n={label} as="span" className="kt-headline block" />
        <T n={body} as="span" className={cx('kt-body mt-8 block', on ? 'text-text-onYellow' : 'text-text-sec')} />
      </div>
      <span className={cx('absolute grid place-items-center rounded-pill transition-[transform,opacity] duration-base ease-out', on ? 'scale-100 bg-bg-base text-yellow opacity-100' : 'scale-75 opacity-0')} style={{ right: 40, top: 40, width: 88, height: 88 }} aria-hidden="true">
        <Check size={52} strokeWidth={2.6} />
      </span>
      <span className="sr-only">{n}</span>
    </button>
  )
}

export default function Cuts({ ctrl }) {
  const t = useT()
  const f4 = frameById('classic-white') || defaultFrameFor(4)
  const f8 = frameById('classic-blue') || defaultFrameFor(8)
  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 236, width: 1400 }}>
        <T n={COPY.cuts.title} as="h1" className="kt-title" />
        <T n={COPY.cuts.sub} v={{ sec: 5 }} as="p" className="kt-lead mt-16 text-text-sec" />
      </div>
      <div role="radiogroup" aria-label={t(COPY.cuts.title)} className="absolute flex gap-40" style={{ left: 120, top: 432 }}>
        <Tile n={4} label={COPY.cuts.four} body={COPY.cuts.fourBody} on={ctrl.cuts === 4} onPick={() => ctrl.setCuts(4)} frame={f4} date={ctrl.date} room={ctrl.room} />
        <Tile n={8} label={COPY.cuts.eight} body={COPY.cuts.eightBody} on={ctrl.cuts === 8} onPick={() => ctrl.setCuts(8)} frame={f8} date={ctrl.date} room={ctrl.room} />
      </div>
    </div>
  )
}
