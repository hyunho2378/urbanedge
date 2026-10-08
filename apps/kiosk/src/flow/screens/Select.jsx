import { useMemo, useState } from 'react'
import { cx } from '@urbanedge/ds'
import { T } from '../../components/lang.jsx'
import { StripView } from '../../components/StripView.jsx'
import { Zoomable } from '../../components/Zoomable.jsx'
import { useT } from '../../components/lang.jsx'
import { DragLayer, useDrag } from '../../components/useDrag.jsx'
import { useStageRef } from '../../components/stage.js'
import { COPY } from '../copy.js'
import { defaultFrameFor } from '../prints.js'

// 11. select: 찍은 컷을 인화 칸에 끌어 놓는다. 위 줄은 찍은 컷, 아래 줄은 인화 순서 칸이고 오른쪽 미리보기가 바로 바뀐다.
// 끌기가 어려운 사람을 위해 컷을 한 번 누르면 첫 빈 칸에 들어가고, 칸을 누르면 비워진다.
export default function Select({ ctrl }) {
  const t = useT()
  const stageRef = useStageRef()
  const { drag, begin } = useDrag(stageRef)
  const [over, setOver] = useState(null)
  const { shots, arrangement } = ctrl
  const frame = ctrl.frame || defaultFrameFor(ctrl.cuts || 4)
  const S = arrangement.length
  const n = shots.length
  const big = Math.max(n, S) <= 4
  const tw = big ? 150 : 120
  const th = big ? 200 : 160
  // 미리보기는 회색 자리표시 없이 실제 인화물처럼 보인다. 빈 칸에는 아직 배치하지 않은 컷을 순서대로 채워 보여 준다.
  const photos = useMemo(() => {
    const free = shots.map((_, i) => i).filter((i) => !arrangement.includes(i))
    return arrangement.map((v) => {
      const k = v != null ? v : free.shift()
      return k != null && shots[k] ? shots[k].canvas : null
    }).filter(Boolean)
  }, [arrangement, shots])
  const slotAt = (c) => {
    const el = document.elementFromPoint(c.x, c.y)
    const s = el && el.closest('[data-slot]')
    return s ? Number(s.dataset.slot) : null
  }

  const onShotDown = (e, i) => {
    begin(e, { src: shots[i].url }, {
      onMove: ({ client }) => setOver(slotAt(client)),
      onEnd: ({ moved, target }) => {
        setOver(null)
        if (!moved) {
          const at = arrangement.indexOf(i)
          if (at >= 0) ctrl.clearSlot(at)
          else {
            const empty = arrangement.indexOf(null)
            if (empty >= 0) ctrl.placeShot(i, empty)
          }
          return
        }
        const slot = target && target.closest('[data-slot]')
        if (slot) ctrl.placeShot(i, Number(slot.dataset.slot))
      },
    })
  }
  const onSlotDown = (e, s) => {
    if (arrangement[s] == null) return
    begin(e, { src: shots[arrangement[s]].url }, {
      onMove: ({ client }) => setOver(slotAt(client)),
      onEnd: ({ moved, target }) => {
        setOver(null)
        if (!moved) return ctrl.clearSlot(s)
        const slot = target && target.closest('[data-slot]')
        if (slot) ctrl.swapSlots(s, Number(slot.dataset.slot))
        else ctrl.clearSlot(s)
      },
    })
  }

  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 212 }}>
        {frame && <Zoomable height={680} label={t(COPY.common.zoomOpen)} render={(h) => <StripView frame={frame} photos={photos} date={ctrl.date} roomId={ctrl.room} message={ctrl.message} height={h} scale={1} className="k-lift" label={COPY.select.tray.en} />} />}
      </div>

      <div className="absolute" style={{ left: 760, top: 236, width: 1096 }}>
        <T n={S < n ? COPY.select.titlePick : COPY.select.titleArrange} v={{ n: S }} as="h1" className="kt-headline" />
        <T n={COPY.select.hint} as="p" className="kt-body mt-12 text-text-sec" />
      </div>

      <div className="absolute" style={{ left: 760, top: 420 }}>
        <T n={COPY.select.tray} as="p" className="kt-label mb-16 text-text-meta" />
        <ul className="flex flex-wrap gap-16" style={{ width: 1096 }} data-tray="">
          {shots.map((s, i) => {
            const at = arrangement.indexOf(i)
            return (
              <li key={i}>
                <button
                  type="button"
                  onPointerDown={(e) => onShotDown(e, i)}
                  aria-label={`${COPY.select.shotN.en.replace('{n}', i + 1)}${at >= 0 ? `, ${COPY.select.slotN.en.replace('{n}', at + 1)}` : ''}`}
                  className="ue-press relative block touch-none overflow-hidden rounded-lg bg-bg-raised"
                  style={{ width: tw, height: th }}
                >
                  <img src={s.url} alt="" draggable="false" className={cx('h-full w-full object-cover transition-opacity duration-fast', at >= 0 && 'opacity-30')} />
                  {at >= 0 && <span className="kt-subhead kt-num absolute inset-0 grid place-items-center text-yellow">{at + 1}</span>}
                </button>
              </li>
            )
          })}
        </ul>
        <T n={COPY.select.stripOrder} as="p" className="kt-label mb-16 mt-40 text-text-meta" />
        <ul className="flex flex-wrap gap-16" style={{ width: 1096 }}>
          {arrangement.map((v, s) => (
            <li key={s}>
              <div
                data-slot={s}
                onPointerDown={(e) => onSlotDown(e, s)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && v != null && ctrl.clearSlot(s)}
                aria-label={COPY.select.slotN.en.replace('{n}', s + 1)}
                className={cx('relative touch-none overflow-hidden rounded-lg transition-[transform,background-color] duration-fast', v == null ? 'bg-bg-panel' : 'bg-bg-raised', over === s && 'scale-105 bg-yellow')}
                style={{ width: tw, height: th }}
              >
                {v != null ? <img src={shots[v].url} alt="" draggable="false" className="h-full w-full object-cover" /> : <span className="kt-strong kt-num absolute inset-0 grid place-items-center text-text-meta">{s + 1}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <DragLayer drag={drag}>{(p) => <img src={p.src} alt="" className="rounded-lg object-cover" style={{ width: tw, height: th }} />}</DragLayer>
    </div>
  )
}
