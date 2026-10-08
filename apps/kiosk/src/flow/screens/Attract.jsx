import { useState } from 'react'
import { ChevronDown, Pause, Play } from 'lucide-react'
import { Crosswalk, LineBadge } from '@urbanedge/ds'
import { SampleStrip } from '../../components/SampleStrip.jsx'
import { roomById } from '../rooms.js'
import { COPY, tr } from '../copy.js'

// 1. attract: 풀블리드 어두운 화면. 워드마크, 숨쉬는 터치 안내, 천천히 흐르는 샘플 인화물, 카메라 위치 힌트.
// 대기 화면은 아직 언어를 고르기 전이라 한국어와 영어를 함께 보여 준다.
export default function Attract({ ctrl }) {
  const [paused, setPaused] = useState(false)
  const room = roomById(ctrl.room)
  const L = (n) => tr(n, 'ko')
  const E = (n) => tr(n, 'en')
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-bg-base px-64 pt-40">
      {/* 전체 화면 터치 영역 */}
      <button
        type="button"
        onClick={ctrl.next}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer"
        aria-label={`${E(COPY.attract.touchEn)}. ${L(COPY.attract.touchKo)}`}
      />

      <div className="flex items-center justify-between">
        <p className="flex items-center gap-16 text-text-pri">
          <span aria-hidden="true" className="font-brand text-k-h3 font-bold leading-none text-yellow">‡</span>
          <span className="ue-label text-k-label">UrbanEdge Metrography</span>
        </p>
        <p className="flex items-center gap-16 rounded-pill border border-hairlineStrong py-8 pl-8 pr-28">
          <LineBadge code={room.code} color={room.color} size="lg" />
          <span className="ue-label text-k-label">{room.name}</span>
        </p>
      </div>

      <div className="mt-32 flex items-start justify-between">
        <div className="flex flex-col gap-8">
          <p className="ue-label text-k-label text-yellow">{L(COPY.attract.kicker)}</p>
          <h1 className="font-brand text-k-hero font-bold leading-none tracking-tightest">UrbanEdge</h1>
          <p className="mt-8 font-display text-k-h3 font-black leading-tight tracking-tightest">
            {L(COPY.attract.title1)} {L(COPY.attract.title2)}
          </p>
          <p className="text-k-lead text-text-sec">{L(COPY.attract.sub)}</p>
        </div>
        <div className="k-breathe mt-16 flex w-2/5 flex-col items-center gap-8 rounded-xl border border-yellow px-48 py-40 text-center shadow-glowYellow">
          <p className="font-display text-k-h2 font-black leading-tight tracking-tightest text-yellow">{L(COPY.attract.touchEn)}</p>
          <p className="font-display text-k-h3 font-bold leading-tight">{L(COPY.attract.touchKo)}</p>
        </div>
      </div>

      <div className="mt-24 h-24 w-full shrink-0 overflow-hidden opacity-60">
        <Crosswalk angle={-10} bars={30} />
      </div>

      <SampleStrip paused={paused} className="-mx-64 mt-20 min-h-0 flex-1" />

      {/* 카메라 위치 힌트: 화면 아래 중앙 */}
      <div className="-mx-64 flex h-144 shrink-0 items-center justify-center gap-32 border-t border-hairline bg-bg-base">
        <ChevronDown size={64} strokeWidth={3.5} className="k-chevron text-yellow" aria-hidden="true" />
        <div className="text-center">
          <p className="font-ui text-k-lead font-extrabold leading-tight text-yellow">{L(COPY.common.cameraBelow)}</p>
          <p className="font-ui text-k-body font-semibold leading-tight text-text-sec">{E(COPY.common.cameraBelow)}</p>
        </div>
        <ChevronDown size={64} strokeWidth={3.5} className="k-chevron k-chevron-3 text-yellow" aria-hidden="true" />
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? `${E(COPY.attract.play)} ${L(COPY.attract.play)}` : `${E(COPY.attract.pause)} ${L(COPY.attract.pause)}`}
        aria-pressed={paused}
        className="ue-press absolute bottom-16 right-64 z-20 grid size-120 place-items-center rounded-pill border border-hairlineStrong bg-bg-base text-text-pri"
      >
        {paused ? <Play size={48} aria-hidden="true" /> : <Pause size={48} aria-hidden="true" />}
      </button>
    </div>
  )
}
