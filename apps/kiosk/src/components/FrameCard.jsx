import { Check } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { FrameCanvas } from './FrameCanvas.jsx'
import { useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 프레임 선택 카드: 실제 합성 미리보기(샘플 사진 4장)와 이름. 선택하면 노랑 테두리와 체크가 붙는다.
export function FrameCard({ frame, photos, room, selected, onSelect }) {
  const t = useT()
  const family = t(COPY.frame.families[frame.family])
  const variant = t(COPY.frame.variants[frame.variant])
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${family} ${variant}`}
      onClick={onSelect}
      className={cx(
        'ue-press relative flex h-full w-full min-h-touch flex-col items-center justify-between gap-16 rounded-xl border-2 bg-bg-panel px-12 pb-20 pt-24 transition-[transform,opacity,background-color] duration-fast ease-out',
        selected ? 'border-yellow shadow-glowYellow' : 'border-hairlineStrong',
      )}
    >
      <span className="flex h-full flex-1 items-center">
        <FrameCanvas frame={frame} photos={photos} room={room} maxW={228} maxH={380} label={`${family} ${variant}`} />
      </span>
      <span className="flex flex-col items-center gap-4">
        <span className="font-ui text-k-label font-bold text-yellow">{family}</span>
        <span className="font-ui text-k-btn font-bold leading-tight">{variant}</span>
      </span>
      {selected && (
        <span className="absolute right-12 top-12 grid size-48 place-items-center rounded-pill bg-yellow text-text-onYellow">
          <Check size={32} strokeWidth={4} aria-hidden="true" />
          <span className="sr-only">{t(COPY.common.selected)}</span>
        </span>
      )}
    </button>
  )
}
