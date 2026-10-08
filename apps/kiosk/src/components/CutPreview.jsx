import { Check } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 컷 배열 미리보기: 4컷은 4장 전부 쓰고, 8컷은 8장 중 4장이 선택된 모양으로 보여 준다.
const PICKED_OF_8 = [1, 2, 5, 7]

export function CutPreview({ cuts, className }) {
  const t = useT()
  const n = cuts
  return (
    <ol className={cx('grid grid-cols-4 gap-12', className)} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const picked = n === 4 || PICKED_OF_8.includes(i)
        return (
          <li
            key={i}
            className={cx(
              'relative grid aspect-video place-items-center rounded-md border-2',
              picked ? 'border-yellow bg-yellow text-text-onYellow' : 'border-hairlineStrong bg-bg-raised text-text-meta',
            )}
          >
            <span className="ue-label text-k-label font-bold">{i + 1}</span>
            {picked && n === 8 && <Check size={28} strokeWidth={4} className="absolute right-6 top-6" />}
          </li>
        )
      })}
      <span className="sr-only">{t(n === 4 ? COPY.cuts.four.name : COPY.cuts.eight.name)}</span>
    </ol>
  )
}
