import { Expand } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'

// 확대 보기를 여는 사진 버튼. fit 이 cover 이면 부모가 비율을 정하고, 아니면 사진 원래 비율을 쓴다.
export function PhotoTile({ photo, onOpen, label, fit = 'natural', priority = false, className, sizes }) {
  const pick = usePick()
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${label}: ${pick(photo.alt)}`}
      className={cx('group ue-press relative block w-full overflow-hidden rounded-lg border border-hairline bg-bg-panel', fit === 'cover' && 'h-full', className)}
    >
      <img
        src={photo.thumb}
        alt=""
        width={photo.w}
        height={photo.h}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cx('w-full object-cover', fit === 'cover' ? 'h-full' : 'h-auto')}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-end justify-end bg-scrim p-12 opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="grid size-40 place-items-center rounded-pill bg-yellow text-text-onYellow">
          <Expand size={18} />
        </span>
      </span>
    </button>
  )
}
