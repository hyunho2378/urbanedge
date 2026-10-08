import { LineBadge } from '@urbanedge/ds'
import { roomById } from '../flow/rooms.js'
import { tr } from '../flow/copy.js'

// 상단 브랜드 바: 워드마크, 현재 단계, 방 이름과 노선 코드. 실제 기기 화면의 상단 바(워드마크 중앙, 우측 상태)를 노랑으로 옮겼다.
export function TopBar({ steps, step, room, lang }) {
  const r = roomById(room)
  const i = steps.findIndex((s) => s.id === step)
  const label = tr(steps[i].label, lang)
  return (
    <header className="relative z-header flex h-96 shrink-0 items-center justify-between bg-yellow px-64 text-text-onYellow">
      <div className="flex items-center gap-20">
        <span aria-hidden="true" className="font-brand text-k-h3 font-bold leading-none">‡</span>
        <span className="font-brand text-k-btn font-bold leading-none tracking-tightest">UrbanEdge</span>
        <span className="ue-label pt-4 text-k-label leading-none">Metrography</span>
      </div>
      <p className="flex items-baseline gap-16 font-ui text-k-label font-bold" aria-live="polite">
        <span className="ue-label">{String(i).padStart(2, '0')} / {String(steps.length - 1).padStart(2, '0')}</span>
        <span>{label}</span>
      </p>
      <div className="flex h-72 items-center gap-16 rounded-pill bg-bg-base py-8 pl-8 pr-28 text-text-pri">
        <LineBadge code={r.code} color={r.color} size="lg" />
        <span className="ue-label text-k-label">{r.name}</span>
      </div>
    </header>
  )
}
