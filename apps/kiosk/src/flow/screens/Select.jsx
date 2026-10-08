import { useMemo } from 'react'
import { cx } from '@urbanedge/ds'
import { FrameCanvas } from '../../components/FrameCanvas.jsx'
import { useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'
import { FLOW } from '../config.js'

// 10. select: 8컷이면 8장 중 4장 선택(누르면 선택, 다시 누르면 취소, 선택 수 n/4), 4컷이면 확인과 다시 찍기.
// 오른쪽 프레임에는 선택한 순서대로 즉시 합성된다.
export default function Select({ ctrl }) {
  const t = useT()
  const eight = ctrl.cuts === 8
  const sel = ctrl.selected
  const photos = useMemo(() => sel.map((i) => (ctrl.shots[i] ? { src: ctrl.shots[i].canvas } : null)), [sel, ctrl.shots])
  const cols = eight ? 'grid-cols-4' : 'grid-cols-2'
  return (
    <div className="flex h-full gap-40 px-64 pb-16 pt-20">
      <div className="flex min-w-0 flex-1 flex-col gap-16">
        <h1 className="font-display text-k-h2 font-black leading-tight tracking-tightest">{t(eight ? COPY.select.titleEight : COPY.select.titleFour)}</h1>
        {eight && <p className="text-k-body text-text-sec">{t(COPY.select.tapHint)}</p>}
        <ul className={cx('grid content-start gap-12', cols)}>
          {ctrl.shots.map((s, i) => {
            const order = sel.indexOf(i)
            const on = order >= 0
            const body = (
              <>
                <img src={s.url} alt="" draggable={false} className="w-full object-cover" style={{ aspectRatio: eight ? '4 / 3' : '16 / 9' }} />
                {on && (
                  <span className="absolute left-8 top-8 grid size-56 place-items-center rounded-pill bg-yellow font-label text-k-btn font-bold text-text-onYellow">{order + 1}</span>
                )}
                {!on && <span className="absolute inset-0 bg-scrim" aria-hidden="true" />}
                <span className="ue-label absolute bottom-8 right-12 text-k-label font-bold text-text-pri">{i + 1}</span>
              </>
            )
            return (
              <li key={i}>
                {eight ? (
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={t(COPY.select.shot, { n: i + 1 })}
                    onClick={() => ctrl.toggleSelect(i)}
                    className={cx(
                      'ue-press relative block min-h-touch w-full overflow-hidden rounded-lg border-4 transition-[transform,opacity] duration-fast ease-out',
                      on ? 'border-yellow' : 'border-hairlineStrong',
                    )}
                  >
                    {body}
                  </button>
                ) : (
                  <div className="relative overflow-hidden rounded-lg border-4 border-yellow">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <aside className="flex w-1/3 shrink-0 flex-col items-center gap-16 rounded-xl border border-hairlineStrong bg-bg-elev px-32 pb-24 pt-24" aria-live="polite">
        <div className="flex w-full items-baseline justify-between">
          <p className="ue-label text-k-label text-yellow">{t(COPY.select.preview)}</p>
          {eight && (
            <p className="font-display text-k-h3 font-black leading-none tracking-tightest">
              <span className="text-yellow">{t(COPY.select.count, { n: sel.length })}</span>
            </p>
          )}
        </div>
        <div className="flex flex-1 items-center">
          {ctrl.frame && <FrameCanvas frame={ctrl.frame} photos={photos} room={ctrl.room} maxW={520} maxH={600} label={t(COPY.select.preview)} />}
        </div>
        {eight && sel.length < FLOW.slots && <p className="text-k-body text-text-sec">{t(COPY.select.needMore)}</p>}
      </aside>
    </div>
  )
}
