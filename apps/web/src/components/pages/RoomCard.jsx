import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Checker, LineBadge } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'

// 방 카드: 사진, 노선 배지, 이름, 한 줄 소개. 체커보드는 코너 장식으로만 쓴다.
export function RoomCard({ room, cta }) {
  const pick = usePick()
  const first = room.photoList[0]
  return (
    <Link
      to={`/rooms/${room.id}`}
      className="group ue-press flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-bg-panel transition-colors duration-base ease-out hover:border-yellow"
    >
      <div className="relative overflow-hidden bg-bg-raised" style={{ aspectRatio: '4 / 5' }}>
        <img
          src={first.thumb}
          alt={pick(first.alt)}
          width={first.w}
          height={first.h}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-scrim to-transparent" />
        <div aria-hidden="true" className="absolute right-0 top-0 size-56 overflow-hidden opacity-90">
          <Checker size={14} />
        </div>
        <div className="absolute left-16 top-16">
          <LineBadge code={room.code} color={room.color} size="lg" />
        </div>
        <p className="ue-label absolute bottom-16 left-16 right-16 text-h2 leading-snug text-text-pri">{room.name}</p>
      </div>
      <div className="flex flex-1 flex-col gap-8 p-20 lg:p-24">
        <h3 className="text-h4 4xl:text-h3 font-bold text-text-pri">{pick(room.title)}</h3>
        <p className="flex-1 text-bodySm 4xl:text-body text-text-sec">{pick(room.tagline)}</p>
        <span className="mt-8 inline-flex items-center gap-8 text-bodySm 4xl:text-body font-semibold text-yellow">
          {cta}
          <ArrowUpRight size={18} aria-hidden="true" className="transition-transform duration-base ease-out group-hover:translate-x-4 group-hover:-translate-y-4" />
        </span>
      </div>
    </Link>
  )
}
