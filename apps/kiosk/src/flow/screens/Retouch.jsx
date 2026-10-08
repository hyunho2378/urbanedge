import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { CameraView } from '../../components/CameraView.jsx'
import { Slider } from '../../components/Slider.jsx'
import { COPY } from '../copy.js'
import { FILTER_IDS } from '../retouch.js'

// 8. retouch: 실시간 미리보기를 보면서 피부 보정, 밝기, 필터를 고른다. 모두 선택 사항이며 기본값으로 바로 다음으로 가도 된다.
function Row({ label, children }) {
  return (
    <div className="flex items-start gap-24">
      <div className="shrink-0 pt-32" style={{ width: 250 }}>
        <T n={label} as="span" className="kt-strong" />
      </div>
      {children}
    </div>
  )
}

export default function Retouch({ ctrl }) {
  const t = useT()
  const r = ctrl.retouch
  return (
    <div className="k-tiles absolute inset-0">
      <div className="absolute" style={{ left: 64, top: 172, width: 540 }}>
        <CameraView camera={ctrl.camera} retouch={r} style={{ width: 540, height: 720 }} className="k-lift" />
      </div>
      <div className="absolute" style={{ left: 740, top: 172, width: 1116 }}>
        <T n={COPY.retouch.title} as="h1" className="kt-title" />
      </div>
      <div className="absolute flex flex-col gap-12" style={{ left: 740, top: 332 }} data-coach="retouch">
        <Row label={COPY.retouch.skin}>
          <Slider value={r.skin} onChange={(v) => ctrl.setRetouch({ skin: v })} label={t(COPY.retouch.skin)} minLabel={t(COPY.retouch.off)} maxLabel={t(COPY.retouch.max)} width={640} />
        </Row>
        <Row label={COPY.retouch.bright}>
          <Slider value={r.bright} onChange={(v) => ctrl.setRetouch({ bright: v })} label={t(COPY.retouch.bright)} minLabel={t(COPY.retouch.dark)} maxLabel={t(COPY.retouch.light)} width={640} />
        </Row>
      </div>
      <div className="absolute" style={{ left: 740, top: 700 }}>
        <T n={COPY.retouch.filter} as="p" className="kt-strong text-text-sec" />
        <div role="radiogroup" aria-label={t(COPY.retouch.filter)} className="mt-12 flex gap-16">
          {FILTER_IDS.map((id) => {
            const on = r.filter === id
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => ctrl.setRetouch({ filter: id })}
                className={cx('ue-press rounded-pill px-28 transition-[transform,opacity,background-color] duration-fast ease-out', on ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-text-pri')}
                style={{ minWidth: 262, height: 120 }}
              >
                <T n={COPY.retouch.filters[id]} as="span" className="kt-strong" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
