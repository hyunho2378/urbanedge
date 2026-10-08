import { ChevronDown } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 렌즈 방향 안내: 화면 하단 중앙에서 아래로 향하는 쉐브론. 실제 렌즈는 모니터 바로 아래 중앙에 있다.
function Chevrons() {
  return (
    <span className="flex flex-col items-center -space-y-12" aria-hidden="true">
      <ChevronDown size={32} strokeWidth={3.5} className="k-chevron" />
      <ChevronDown size={32} strokeWidth={3.5} className="k-chevron k-chevron-3" />
    </span>
  )
}

export function LensHint({ className }) {
  const t = useT()
  return (
    <div className={cx('flex items-center justify-center gap-24 text-yellow', className)} role="note">
      <Chevrons />
      <span className="font-ui text-k-body font-extrabold leading-none">{t(COPY.common.lensBelow)}</span>
      <Chevrons />
    </div>
  )
}
