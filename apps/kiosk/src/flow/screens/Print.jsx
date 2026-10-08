import { useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { StripView } from '../../components/StripView.jsx'
import { StampMark } from '../../components/StampMark.jsx'
import { Zoomable } from '../../components/Zoomable.jsx'
import { OnScreenKeyboard } from '../../components/OnScreenKeyboard.jsx'
import { DragLayer, useDrag } from '../../components/useDrag.jsx'
import { useStageRef } from '../../components/stage.js'
import { COPY } from '../copy.js'
import { FLOW } from '../config.js'
import { ROOMS, roomById } from '../rooms.js'
import { copiesOf, defaultFrameFor, photosFromArrangement } from '../prints.js'

// 12. print v3: 왼쪽은 인화되는 실제 인화 시트(합성기 결과, 스트립형은 한 용지에 두 줄), 오른쪽은 스탬프 넷과 메모, 진행 막대.
// 스탬프는 끌어 놓거나 한 번 누르면 찍히고, 찍힌 스탬프를 시트 밖으로 끌면 지워진다. 위치는 한 줄(첫 번째 사본) 안의 0부터 1 비율이며
// 스트립형은 두 사본에 같은 자리로 찍힌다(prints.js overlayStamps와 같은 기준). 인화가 끝나면 더는 바꿀 수 없다.
const H = 800

export default function Print({ ctrl }) {
  const t = useT()
  const stageRef = useStageRef()
  const { drag, begin } = useDrag(stageRef)
  const winRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const { printProgress: p, printDone: done, stamps, message } = ctrl
  const frame = ctrl.frame || defaultFrameFor(ctrl.cuts || 4)
  const copies = copiesOf(frame, 'sheet')
  const sheetW = Math.round((H * 2) / 3)
  const winW = sheetW / copies
  const photos = photosFromArrangement(ctrl.arrangement, ctrl.shots)

  const frac = (c) => {
    const r = winRef.current.getBoundingClientRect()
    const w = r.width / copies
    if (c.x < r.left || c.x > r.right || c.y < r.top || c.y > r.bottom) return null
    return { x: ((c.x - r.left) % w) / w, y: (c.y - r.top) / r.height }
  }
  const dragNew = (e, roomId) => {
    if (done) return
    begin(e, { room: roomId }, {
      onEnd: ({ moved, client }) => {
        if (!moved) return ctrl.addStamp(roomId, 0.5, 0.28 + ((stamps.length * 0.17) % 0.5))
        const f = frac(client)
        if (f) ctrl.addStamp(roomId, f.x, f.y)
      },
    })
  }
  const dragPlaced = (e, i) => {
    if (done) return
    begin(e, { room: stamps[i].room, placed: true }, {
      onEnd: ({ moved, client }) => {
        if (!moved) return
        const f = frac(client)
        if (f) ctrl.moveStamp(i, f.x, f.y)
        else ctrl.removeStamp(i)
      },
    })
  }

  if (editing) {
    const len = Array.from(message).length
    return (
      <div className="absolute inset-0 bg-bg-base">
        <div className="absolute flex items-center justify-between rounded-xl bg-bg-panel px-48" style={{ left: 64, top: 220, width: 1792, height: 136 }} aria-live="polite">
          <span className="kt-subhead">
            {message || <span className="text-text-meta">{t(COPY.print.notePlaceholder)}</span>}
            <span className="k-caret ml-8 inline-block bg-yellow align-middle" style={{ width: 4, height: 56 }} aria-hidden="true" />
          </span>
          <span className="kt-body kt-num text-text-meta">
            {len}/{FLOW.messageMax}
          </span>
        </div>
        <div className="absolute" style={{ left: 64, top: 384, width: 1792 }}>
          <OnScreenKeyboard value={message} onChange={ctrl.setMessage} onDone={() => setEditing(false)} />
        </div>
      </div>
    )
  }

  const d = winW * 0.34
  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 210 }}>
        {done && ctrl.printUrl ? (
          <Zoomable height={H} label={t(COPY.common.zoomOpen)} render={(h) => <img src={ctrl.printUrl} alt="" draggable="false" className="k-lift block" style={{ height: h, width: 'auto' }} />} />
        ) : (
        <div ref={winRef} className={cx('relative', !done && 'k-print-bob')} style={{ width: sheetW, height: H }}>
          {frame && <StripView frame={frame} photos={photos} date={ctrl.date} roomId={ctrl.room} message={message} height={H} scale={1} className="k-lift" label={t(frame.name)} />}
          {Array.from({ length: copies }, (_, c) =>
            stamps.map((s, i) => (
              <button key={`${c}-${i}`} type="button" disabled={done} tabIndex={c ? -1 : 0} onPointerDown={(e) => dragPlaced(e, i)} aria-label={`${roomById(s.room).n} ${roomById(s.room).name}`} className="k-stamp absolute grid touch-none place-items-center" style={{ left: c * winW + s.x * winW - 60, top: s.y * H - 60, width: 120, height: 120 }}>
                <StampMark platform={roomById(s.room)} size={d} rot={s.rot} />
              </button>
            )),
          )}
        </div>
        )}
      </div>

      <div className="absolute" style={{ left: 840, top: 236, width: 1016 }}>
        <T n={done ? COPY.print.titleDone : COPY.print.title} as="h1" className="kt-title" />
        <T n={done ? COPY.print.locked : COPY.print.sub} as="p" className="kt-lead mt-16 text-text-sec" />
        <div className="relative mt-40 overflow-hidden rounded-pill bg-bg-raised" style={{ height: 12, width: 880 }} role="progressbar" aria-label={t(COPY.print.progress)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}>
          <div className="absolute inset-0 origin-left bg-yellow transition-transform duration-base ease-out" style={{ transform: `scaleX(${p})` }} />
        </div>
      </div>

      <div className="absolute" style={{ left: 840, top: 560 }}>
        <T n={COPY.print.stamps} as="p" className="kt-label text-text-meta" />
        <ul className="mt-16 flex gap-24">
          {ROOMS.map((r) => (
            <li key={r.id}>
              <button type="button" disabled={done} onPointerDown={(e) => dragNew(e, r.id)} aria-label={`${r.n} ${r.name}`} className="ue-press grid touch-none place-items-center rounded-pill disabled:opacity-40" style={{ width: 136, height: 136 }}>
                <StampMark platform={r} size={128} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-32 flex items-center gap-24">
          <button type="button" disabled={done} onClick={() => setEditing(true)} className="ue-press flex items-center gap-20 rounded-pill bg-bg-panel px-40 text-left disabled:opacity-40" style={{ height: 120, maxWidth: 640 }}>
            <Pencil size={40} strokeWidth={2} className="shrink-0 text-yellow" aria-hidden="true" />
            <span className="kt-strong block truncate">{message || <T n={COPY.print.noteAdd} inline />}</span>
          </button>
          {stamps.length > 0 && !done && (
            <button type="button" onClick={ctrl.clearStamps} className="kt-body min-h-touch px-16 text-text-sec">
              <T n={COPY.print.clear} inline />
            </button>
          )}
        </div>
      </div>
      <DragLayer drag={drag}>{(pl) => <StampMark platform={roomById(pl.room)} size={d + 24} />}</DragLayer>
    </div>
  )
}
