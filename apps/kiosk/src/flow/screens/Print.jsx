import { useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { StripView } from '../../components/StripView.jsx'
import { StampMark } from '../../components/StampMark.jsx'
import { OnScreenKeyboard } from '../../components/OnScreenKeyboard.jsx'
import { DragLayer, useDrag } from '../../components/useDrag.jsx'
import { useStageRef } from '../../components/stage.js'
import { COPY } from '../copy.js'
import { FLOW } from '../config.js'
import { ROOMS, roomById } from '../rooms.js'
import { copiesOf, defaultFrameFor, photosFromArrangement } from '../prints.js'

// 12. print: 인화되는 동안 스트립 위에 승강장 스탬프를 올리고 메모를 남긴다. 스탬프는 끌어 놓으면 찍히고, 찍힌 스탬프를 인화물 밖으로 끌면 지워진다.
// 인화가 끝나면 더는 바꿀 수 없다. 스탬프 위치는 한 장 안의 0부터 1 비율이다(prints.js의 overlayStamps와 같은 기준).
const H = 700

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
    if (c.x < r.left || c.x > r.right || c.y < r.top || c.y > r.bottom) return null
    return { x: (c.x - r.left) / r.width, y: (c.y - r.top) / r.height }
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
      <div className="k-tiles absolute inset-0">
        <div className="absolute flex items-center justify-between rounded-xl bg-bg-raised px-48" style={{ left: 64, top: 172, width: 1792, height: 140 }} aria-live="polite">
          <span className="kt-headline">
            {message || <span className="text-text-meta">{t(COPY.print.notePlaceholder)}</span>}
            <span className="k-caret ml-8 inline-block bg-yellow align-middle" style={{ width: 6, height: 64 }} aria-hidden="true" />
          </span>
          <span className="kt-body kt-num text-text-meta">
            {len}/{FLOW.messageMax}
          </span>
        </div>
        <div className="absolute" style={{ left: 64, top: 340, width: 1792 }}>
          <OnScreenKeyboard value={message} onChange={ctrl.setMessage} onDone={() => setEditing(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="k-tiles absolute inset-0">
      <div className="absolute" style={{ left: 64, top: 172, width: 960 }}>
        <T n={done ? COPY.print.titleDone : COPY.print.title} as="h1" className="kt-headline" />
        <T n={done ? COPY.print.locked : COPY.print.stampHint} as="p" className="kt-body mt-12 text-text-sec" />
      </div>

      <div className="absolute" style={{ left: 64, top: 500 }} data-coach="print">
        <ul className="flex gap-24">
          {ROOMS.map((r) => (
            <li key={r.id}>
              <button type="button" disabled={done} onPointerDown={(e) => dragNew(e, r.id)} aria-label={`${r.n} ${r.name}`} className="ue-press grid touch-none place-items-center rounded-pill disabled:opacity-40" style={{ width: 150, height: 150 }}>
                <StampMark platform={r} size={140} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-28 flex items-center gap-16">
          <button type="button" disabled={done} onClick={() => setEditing(true)} className="ue-press flex items-center gap-20 rounded-xl bg-bg-raised px-36 text-left disabled:opacity-40" style={{ height: 120, width: 760 }}>
            <Pencil size={44} strokeWidth={2.2} className="shrink-0 text-yellow" aria-hidden="true" />
            <span className="kt-body block truncate">{message || <T n={COPY.print.noteAdd} inline />}</span>
          </button>
          {stamps.length > 0 && !done && (
            <button type="button" onClick={ctrl.clearStamps} className="kt-body min-h-touch px-12 text-text-sec underline underline-offset-8">
              <T n={COPY.print.clear} inline />
            </button>
          )}
        </div>
      </div>

      <div className="absolute" style={{ left: 64, top: 840, width: 860 }}>
        <div className="relative overflow-hidden rounded-pill bg-bg-raised" style={{ height: 24 }} role="progressbar" aria-label={t(COPY.print.progress)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}>
          <div className="absolute inset-0 origin-left bg-yellow transition-transform duration-base ease-out" style={{ transform: `scaleX(${p})` }} />
        </div>
      </div>

      <div className="absolute" style={{ left: 1500 - winW / 2, top: 170 }}>
        <div ref={winRef} className={cx('relative overflow-hidden transition-opacity duration-slow', !done && 'k-print-bob')} style={{ width: winW, height: H, opacity: 0.55 + 0.45 * p }}>
          <div style={{ width: sheetW, height: H }}>{frame && <StripView frame={frame} photos={photos} date={ctrl.date} roomId={ctrl.room} message={message} height={H} className="k-lift" label={t(frame.name)} />}</div>
          {stamps.map((s, i) => {
            const d = winW * 0.34
            return (
              <button key={i} type="button" disabled={done} onPointerDown={(e) => dragPlaced(e, i)} aria-label={`${roomById(s.room).n} ${roomById(s.room).name}`} className="k-stamp absolute touch-none" style={{ left: s.x * winW - 60, top: s.y * H - 60, width: 120, height: 120, display: 'grid', placeItems: 'center' }}>
                <StampMark platform={roomById(s.room)} size={d} rot={s.rot} />
              </button>
            )
          })}
        </div>
      </div>
      <DragLayer drag={drag}>{(pl) => <StampMark platform={roomById(pl.room)} size={winW * 0.34 + 24} />}</DragLayer>
    </div>
  )
}
