import { useState } from 'react'
import { Hand, Pause, Play } from 'lucide-react'
import { LineBadge } from '@urbanedge/ds'
import { StripPreview } from '@urbanedge/brand'
import { T, useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'
import { roomById } from '../rooms.js'

// 1. attract: 어두운 타일 벽. 환영 문구와 승강장 안내, 실제 인화 프레임이 두 줄로 천천히 올라가고 내려가며, 가로지르는 경고 테이프가 렌즈 위치를 알린다.
// 화면 어디를 눌러도 시작한다. 움직임은 오른쪽 아래 버튼으로 멈출 수 있다.
const COL_A = ['classic-white', 'ticket-night', 'signature', 'pill']
const COL_B = ['tape', 'classic-black', 'poster', 'route']

function Column({ ids, cls, date, roomId, style }) {
  const list = [...ids, ...ids]
  return (
    <div className={`flex flex-col ${cls}`} style={{ gap: 32, ...style }}>
      {list.map((id, i) => (
        <div key={`${id}-${i}`} className="k-lift shrink-0" style={{ width: 360, height: 540 }}>
          <StripPreview frameId={id} date={date} roomId={roomId} mode="sheet" scale={0.3} alt="" style={{ width: 360, height: 540 }} />
        </div>
      ))}
    </div>
  )
}

export default function Attract({ ctrl }) {
  const t = useT()
  const [paused, setPaused] = useState(false)
  const room = roomById(ctrl.room)
  const run = paused ? { animationPlayState: 'paused' } : undefined
  return (
    <div className="k-tiles absolute inset-0 overflow-hidden">
      <button type="button" onClick={ctrl.next} className="absolute inset-0 z-10 h-full w-full cursor-pointer" aria-label={`${t(COPY.attract.touch)}. ${t(COPY.attract.title)}`} />

      {/* 실제 인화 프레임 두 줄 */}
      <div className="absolute overflow-hidden" style={{ left: 1100, top: 0, width: 820, height: 1080 }} aria-hidden="true">
        <div className="absolute" style={{ left: 40, top: 0 }}>
          <Column ids={COL_A} date={ctrl.date} roomId={ctrl.room} cls="k-scroll-up" style={run} />
        </div>
        <div className="absolute" style={{ left: 440, top: -300 }}>
          <Column ids={COL_B} date={ctrl.date} roomId={ctrl.room} cls="k-scroll-down" style={run} />
        </div>
        <div className="k-fade-t absolute inset-x-0 top-0" style={{ height: 220 }} />
        <div className="k-fade-b absolute inset-x-0 bottom-0" style={{ height: 220 }} />
      </div>

      {/* 글 */}
      <div className="absolute" style={{ left: 64, top: 172, width: 980 }}>
        <T n={COPY.attract.title} as="h1" className="kt-title" />
        <div className="mt-28 flex items-center gap-20">
          <LineBadge code={String(room.n)} color={room.color} size="xl" label={`Platform ${room.n}`} />
          <T n={room.title} as="p" className="kt-subhead" />
        </div>
        <T n={COPY.attract.sub} as="p" className="kt-lead mt-24 text-text-sec" />
        <div className="k-breathe mt-36 inline-flex items-center gap-16 rounded-pill bg-yellow px-48 text-text-onYellow" style={{ height: 120 }}>
          <Hand size={44} strokeWidth={2.4} aria-hidden="true" />
          <T n={COPY.attract.touch} as="span" className="kt-btn" />
        </div>
      </div>

      {/* 경고 테이프: 렌즈 위치 */}
      <div className="absolute overflow-hidden" style={{ left: -80, top: 836, width: 2080, height: 96, transform: 'rotate(-2deg)' }} aria-hidden="true">
        <div className="absolute inset-0 bg-yellow" />
        <div className="k-tape absolute inset-x-0 top-0" style={{ height: 10 }} />
        <div className="k-tape absolute inset-x-0 bottom-0" style={{ height: 10 }} />
        <div className="k-flow absolute left-0 top-0 flex h-full w-max items-center text-text-onYellow" style={run}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="kt-strong flex shrink-0 items-center gap-32 pr-32" style={{ fontWeight: 800 }}>
              <T n={COPY.attract.tape} inline />
              <span aria-hidden="true">‡</span>
              <T n={COPY.attract.tapeSub} inline />
              <span aria-hidden="true">‡</span>
            </span>
          ))}
        </div>
      </div>

      <div className="absolute" style={{ left: 64, bottom: 64 }}>
        <T n={COPY.common.imaginary} as="p" className="kt-caption text-text-meta" />
      </div>

      <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} aria-label={paused ? t(COPY.attract.play) : t(COPY.attract.pause)} className="ue-press absolute z-20 grid place-items-center rounded-pill bg-bg-raised text-text-pri" style={{ right: 64, bottom: 72, width: 120, height: 120 }}>
        {paused ? <Play size={48} aria-hidden="true" /> : <Pause size={48} aria-hidden="true" />}
      </button>
    </div>
  )
}
