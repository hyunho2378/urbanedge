import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { LineBadge } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'

// 이전 방과 다음 방 이동. 첫 방의 이전은 마지막 방, 마지막 방의 다음은 첫 방으로 이어진다.
export function RoomNav({ prev, next, labels }) {
  const pick = usePick()
  const base =
    'group ue-press flex items-center gap-20 rounded-lg border border-hairline bg-bg-panel p-20 transition-colors duration-base ease-out hover:border-yellow lg:p-28'
  return (
    <nav aria-label={labels.nav} className="grid gap-16 md:grid-cols-2 lg:gap-24">
      <Link to={`/rooms/${prev.id}`} rel="prev" className={base}>
        <ArrowLeft size={28} aria-hidden="true" className="shrink-0 text-yellow transition-transform duration-base ease-out group-hover:-translate-x-4" />
        <span className="min-w-0 flex-1">
          <span className="ue-label block text-label 4xl:text-bodySm text-text-meta">{labels.prev}</span>
          <span className="mt-4 flex items-center gap-12">
            <LineBadge code={prev.code} color={prev.color} />
            <span className="ue-label truncate text-h3 4xl:text-h2 text-text-pri group-hover:text-yellow">{prev.name}</span>
          </span>
          <span className="mt-4 block truncate text-bodySm 4xl:text-body text-text-sec">{pick(prev.title)}</span>
        </span>
      </Link>
      <Link to={`/rooms/${next.id}`} rel="next" className={`${base} md:flex-row-reverse md:text-right`}>
        <ArrowRight size={28} aria-hidden="true" className="shrink-0 text-yellow transition-transform duration-base ease-out group-hover:translate-x-4" />
        <span className="min-w-0 flex-1">
          <span className="ue-label block text-label 4xl:text-bodySm text-text-meta">{labels.next}</span>
          <span className="mt-4 flex items-center gap-12 md:flex-row-reverse">
            <LineBadge code={next.code} color={next.color} />
            <span className="ue-label truncate text-h3 4xl:text-h2 text-text-pri group-hover:text-yellow">{next.name}</span>
          </span>
          <span className="mt-4 block truncate text-bodySm 4xl:text-body text-text-sec">{pick(next.title)}</span>
        </span>
      </Link>
    </nav>
  )
}
