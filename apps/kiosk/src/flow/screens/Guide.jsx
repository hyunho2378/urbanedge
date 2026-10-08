import { ArrowDownToLine, ArrowUpFromLine, Move } from 'lucide-react'
import { StationBadge } from '../../components/StationBadge.jsx'
import { PoseFigure } from '../../components/PoseFigure.jsx'
import { useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'
import { roomById } from '../rooms.js'

// 6. guide: 촬영 가이드. 방 이름과 노선 코드, 포즈 아이디어 4장(실루엣), 팁 3개. hintZone은 camera이고 하단에 렌즈 방향 안내가 뜬다.
const TIP_ICONS = [ArrowDownToLine, ArrowUpFromLine, Move]

export default function Guide({ ctrl }) {
  const t = useT()
  const room = roomById(ctrl.room)
  const tips = t(COPY.guide.tips)
  return (
    <div className="flex h-full flex-col gap-20 px-64 pb-16 pt-20">
      <div className="flex items-center justify-between gap-32">
        <h1 className="font-display text-k-h2 font-black leading-tight tracking-tightest">{t(COPY.guide.title)}</h1>
        <p className="flex items-center gap-20">
          <StationBadge code={room.code} color={room.color} size="lg" />
          <span className="flex flex-col leading-tight">
            <span className="ue-label text-k-h3 font-bold">{room.name}</span>
            <span className="font-ui text-k-label font-bold text-yellow">{t(COPY.guide.poses, { room: room.name })}</span>
          </span>
        </p>
      </div>

      <ul className="grid min-h-0 flex-1 grid-cols-4 gap-16">
        {room.copy.poses.map((p, i) => {
          const [name, desc] = t(p)
          return (
            <li key={name} className="flex min-w-0 flex-col rounded-xl border border-hairlineStrong bg-bg-panel p-24">
              <span className="ue-label text-k-label text-yellow">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex min-h-0 flex-1 items-center justify-center py-8">
                <PoseFigure fig={p.fig} label={name} className="h-full max-h-192 text-text-pri" />
              </span>
              <p className="font-display text-k-btn font-black leading-tight tracking-tightest">{name}</p>
              <p className="mt-8 text-k-body leading-snug text-text-sec">{desc}</p>
            </li>
          )
        })}
      </ul>

      <ul className="grid grid-cols-3 gap-16">
        {tips.map((tip, i) => {
          const Icon = TIP_ICONS[i]
          return (
            <li key={tip.t} className="flex items-start gap-16 rounded-xl border border-yellow px-24 py-20">
              <Icon size={48} className="mt-4 shrink-0 text-yellow" aria-hidden="true" />
              <span>
                <span className="block font-ui text-k-body font-extrabold leading-tight">{tip.t}</span>
                <span className="mt-4 block text-k-body leading-snug text-text-sec">{tip.d}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
