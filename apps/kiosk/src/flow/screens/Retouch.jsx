import { CameraView } from '../../components/CameraView.jsx'
import { Segmented } from '../../components/Segmented.jsx'
import { Toggle } from '../../components/Toggle.jsx'
import { useT } from '../../components/lang.jsx'
import { useSamplePhotos } from '../camera.js'
import { COPY } from '../copy.js'
import { FILTER_IDS, cssFilterOf } from '../retouch.js'
import { Check } from 'lucide-react'
import { cx } from '@urbanedge/ds'

// 7. retouch: 피부 보정 강도, 밝기, 필터를 큰 토글과 세그먼트로 고르고, 카메라 영상(또는 샘플)에 바로 적용해 확인한다.
function FilterTile({ id, selected, onPick, sample, label, retouch }) {
  const t = useT()
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onPick}
      className={cx(
        'ue-press relative h-160 min-h-touch flex-1 overflow-hidden rounded-lg border-2 transition-[transform,opacity] duration-fast ease-out',
        selected ? 'border-yellow' : 'border-hairlineStrong',
      )}
    >
      {sample && (
        <img
          src={sample.src.src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: cssFilterOf({ ...retouch, skin: 0, bright: 1, filter: id }), objectPosition: `${sample.fx * 100}% ${sample.fy * 100}%` }}
        />
      )}
      {id === 'flash' && <span className="absolute inset-0 bg-yellow opacity-25" aria-hidden="true" />}
      <span className="absolute inset-x-0 bottom-0 bg-scrim px-8 py-6 text-center font-ui text-k-label font-bold leading-tight">{label}</span>
      {selected && (
        <span className="absolute right-8 top-8 grid size-36 place-items-center rounded-pill bg-yellow text-text-onYellow">
          <Check size={24} strokeWidth={4} aria-hidden="true" />
          <span className="sr-only">{t(COPY.common.selected)}</span>
        </span>
      )}
    </button>
  )
}

export default function Retouch({ ctrl }) {
  const t = useT()
  const r = ctrl.retouch
  const samples = useSamplePhotos()
  const sample = samples[0]
  const levels = t(COPY.retouch.skinLevels)
  const bright = t(COPY.retouch.brightLevels)
  return (
    <div className="flex h-full flex-col gap-16 px-64 pb-16 pt-20">
      <h1 className="font-display text-k-h2 font-black leading-tight tracking-tightest">{t(COPY.retouch.title)}</h1>
      <div className="flex min-h-0 flex-1 gap-40">
        <div className="flex w-1/2 shrink-0 flex-col gap-12">
          <CameraView camera={ctrl.camera} retouch={r} className="aspect-video w-full" />
          <p className="text-k-body text-text-sec">{t(COPY.retouch.live)}</p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-16 pb-8">
          <section aria-labelledby="rt-skin" className="flex flex-col gap-12">
            <h2 id="rt-skin" className="font-ui text-k-label font-bold text-yellow">{t(COPY.retouch.skin)}</h2>
            <div className="flex gap-8">
              <Toggle
                on={r.skin > 0}
                label={t(COPY.retouch.skin)}
                onText={t(COPY.retouch.skinOn)}
                offText={t(COPY.retouch.skinOff)}
                onChange={(on) => ctrl.setRetouch({ skin: on ? 2 : 0 })}
              />
              <Segmented
                className="flex-1"
                label={t(COPY.retouch.skin)}
                disabled={r.skin === 0}
                value={r.skin}
                onChange={(v) => ctrl.setRetouch({ skin: v })}
                options={[1, 2, 3].map((v) => ({ value: v, label: levels[v - 1] }))}
              />
            </div>
          </section>
          <section aria-labelledby="rt-bright" className="flex flex-col gap-8">
            <h2 id="rt-bright" className="font-ui text-k-label font-bold text-yellow">{t(COPY.retouch.brightness)}</h2>
            <Segmented
              label={t(COPY.retouch.brightness)}
              value={r.bright}
              onChange={(v) => ctrl.setRetouch({ bright: v })}
              options={[0, 1, 2].map((v) => ({ value: v, label: bright[v] }))}
            />
          </section>
          <section aria-labelledby="rt-filter" className="flex flex-col gap-8">
            <h2 id="rt-filter" className="font-ui text-k-label font-bold text-yellow">{t(COPY.retouch.filter)}</h2>
            <div role="group" aria-label={t(COPY.retouch.filter)} className="flex gap-8">
              {FILTER_IDS.map((id) => (
                <FilterTile key={id} id={id} retouch={r} sample={sample} label={t(COPY.retouch.filters[id])} selected={r.filter === id} onPick={() => ctrl.setRetouch({ filter: id })} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
