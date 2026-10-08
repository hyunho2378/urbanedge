// Simulator.jsx: 경로 `/`. 가운데 기기, 오른쪽(모바일은 아래) 주석 패널.
// 기기 부품은 컨트롤러 필드(hintZone, flashing, printUrl, cameraActive)에 반응한다.
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, RotateCcw } from 'lucide-react'
import { Button, Wordmark, cx } from '@urbanedge/ds'
import DeviceFrame from '../device/DeviceFrame.jsx'
import Stage from '../device/Stage.jsx'
import { PARTS, ZONES } from '../device/geometry.js'
import KioskScreen from '../flow/KioskScreen.jsx'
import { PANEL } from './copy.js'
import './simulator.css'

const heading = 'ue-label text-label text-text-meta'

// 두 선택지 중 하나를 고르는 분절 컨트롤
function Segmented({ label, value, onChange, options }) {
  return (
    <div role="group" aria-label={label} className="flex overflow-hidden rounded-md border border-hairlineStrong">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'ue-press min-h-48 flex-1 px-12 font-ui text-bodySm font-semibold',
              on ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-text-sec hover:bg-bg-panel',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Switch({ checked, onChange, children }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-48 w-full items-center justify-between gap-16 rounded-md border border-hairlineStrong bg-bg-raised px-12 text-left font-ui text-bodySm font-semibold text-text-pri hover:bg-bg-panel"
    >
      <span>{children}</span>
      <span className={cx('relative h-24 w-48 shrink-0 rounded-pill border border-hairlineStrong', checked ? 'bg-yellow' : 'bg-bg-base')}>
        <span
          className={cx(
            'absolute left-2 top-2 size-20 rounded-pill transition-transform duration-fast ease-out',
            checked ? 'translate-x-24 bg-black' : 'translate-x-0 bg-text-meta',
          )}
        />
      </span>
    </button>
  )
}

function StateRow({ k, v, on }) {
  return (
    <div className="flex items-center justify-between gap-16 py-8">
      <dt className="text-bodySm text-text-meta">{k}</dt>
      <dd className={cx('inline-flex items-center gap-8 font-ui text-bodySm font-semibold', on ? 'text-yellow' : 'text-text-sec')}>
        <span className={cx('size-8 rounded-pill', on ? 'bg-yellow' : 'bg-hairlineStrong')} aria-hidden="true" />
        {v}
      </dd>
    </div>
  )
}

export default function Simulator({ ctrl }) {
  const { step, steps, goTo, reset, lang, setLang, cameraMode, setCameraMode, hintZone, flashing, printUrl, cameraActive } = ctrl
  const t = PANEL[lang] ?? PANEL.ko
  const [annotate, setAnnotate] = useState(false)
  const listRef = useRef(null)
  const idx = Math.max(0, steps.findIndex((s) => s.id === step))
  const zoneLabel = hintZone && ZONES[hintZone] ? ZONES[hintZone].label[lang] ?? ZONES[hintZone].label.ko : null

  // 패널 단축키: 화살표로 단계 이동, Esc로 처음으로. 패널 안에 포커스가 있을 때만 동작하므로 기기 화면에는 영향이 없다.
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    const move = (n) => {
      const next = Math.min(steps.length - 1, Math.max(0, n))
      e.preventDefault()
      goTo(steps[next].id)
      if (listRef.current?.contains(e.target)) {
        requestAnimationFrame(() => listRef.current?.querySelectorAll('button')[next]?.focus())
      }
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') move(idx - 1)
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') move(idx + 1)
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(steps.length - 1)
    else if (e.key === 'Escape') {
      e.preventDefault()
      reset()
    }
  }

  return (
    <div className="min-h-dvh bg-bg-base text-text-pri lg:flex lg:h-dvh lg:overflow-hidden">
      <section className="flex items-center justify-center bg-bg-elev px-16 py-24 lg:min-w-0 lg:flex-1 lg:px-24 lg:py-24" aria-label={t.deviceLabel}>
        <div className="sim-device">
          <DeviceFrame hint={hintZone} flashing={flashing} printUrl={printUrl} cameraActive={cameraActive} annotate={annotate} lang={lang}>
            <Stage>
              <KioskScreen ctrl={ctrl} />
            </Stage>
          </DeviceFrame>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {zoneLabel ? t.live(zoneLabel) : ''}
        </p>
      </section>

      <aside className="sim-panel border-t border-hairline bg-bg-base px-20 py-24 lg:border-l lg:border-t-0" aria-label={t.title} onKeyDown={onKeyDown}>
        <header>
          <div className="flex items-start justify-between gap-16">
            <Wordmark />
            <span className="ue-label whitespace-nowrap rounded-sm border border-hairlineStrong px-10 py-4 text-label text-text-sec" aria-label={`${idx + 1} / ${steps.length}`}>
              {String(idx + 1).padStart(2, '0')} / {steps.length}
            </span>
          </div>
          <h1 className="mt-16 break-keep font-display text-h3 font-black tracking-tightest">{t.title}</h1>
        </header>

        <div className="mt-20 flex items-stretch gap-8">
          <div className="min-w-0 flex-1">
            <Segmented
              label={t.language}
              value={lang}
              onChange={setLang}
              options={[
                { value: 'ko', label: '한국어' },
                { value: 'en', label: 'English' },
              ]}
            />
          </div>
          <Button variant="outline" size="md" onClick={reset} className="shrink-0">
            <RotateCcw size={16} aria-hidden="true" />
            {t.restart}
          </Button>
        </div>

        <section className="mt-24" aria-labelledby="sim-steps">
          <h2 id="sim-steps" className={heading}>{t.stepsHead}</h2>
          <p className="sr-only">{t.stepsHint}</p>
          <ol ref={listRef} className="relative mt-12 before:absolute before:bottom-24 before:left-14 before:top-24 before:w-4 before:bg-hairlineStrong">
            {steps.map((s, i) => {
              const on = s.id === step
              return (
                <li key={s.id} className="relative">
                  <button
                    type="button"
                    onClick={() => goTo(s.id)}
                    aria-current={on ? 'step' : undefined}
                    className={cx(
                      'ue-press flex min-h-48 w-full items-center gap-12 rounded-md px-10 text-left font-ui text-bodySm font-semibold',
                      on ? 'bg-tint text-yellow' : 'text-text-sec hover:bg-bg-panel',
                    )}
                  >
                    <span className={cx('relative size-12 shrink-0 rounded-pill border-2', on ? 'border-yellow bg-yellow' : 'border-hairlineStrong bg-bg-base')} aria-hidden="true" />
                    <span className="ue-label w-24 shrink-0 text-text-meta">{String(i + 1).padStart(2, '0')}</span>
                    <span>{s.label[lang] ?? s.label.ko}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="mt-32" aria-labelledby="sim-settings">
          <h2 id="sim-settings" className={heading}>{t.settingsHead}</h2>
          <div className="mt-12 space-y-16">
            <div>
              <p className="mb-8 text-bodySm text-text-sec">{t.camera}</p>
              <Segmented
                label={t.camera}
                value={cameraMode}
                onChange={setCameraMode}
                options={[
                  { value: 'sample', label: t.cameraSample },
                  { value: 'live', label: t.cameraLive },
                ]}
              />
            </div>
            <Switch checked={annotate} onChange={setAnnotate}>
              {t.annotate}
            </Switch>
          </div>
        </section>

        <div className="mt-16">
          <Button as={Link} to="/screen" variant="dark" size="md" className="w-full">
            <ExternalLink size={16} aria-hidden="true" />
            {t.openScreen}
          </Button>
        </div>

        <section className="mt-32" aria-labelledby="sim-state">
          <h2 id="sim-state" className={heading}>{t.stateHead}</h2>
          <dl className="mt-8 divide-y divide-hairline">
            <StateRow k={t.hint} v={zoneLabel ?? t.none} on={Boolean(zoneLabel)} />
            <StateRow k={t.led} v={flashing ? t.ledOn : t.ledOff} on={Boolean(flashing)} />
            <StateRow k={t.lens} v={cameraActive ? t.lensOn : t.lensOff} on={Boolean(cameraActive)} />
            <StateRow k={t.print} v={printUrl ? t.printOut : t.none} on={Boolean(printUrl)} />
          </dl>
        </section>

        {annotate ? (
          <section className="mt-32" aria-labelledby="sim-parts">
            <h2 id="sim-parts" className={heading}>{t.partsHead}</h2>
            <ol className="mt-12 space-y-12">
              {PARTS.map((p, i) => (
                <li key={p.id} className="flex gap-12">
                  <span className="grid size-24 shrink-0 place-items-center rounded-pill border-2 border-yellow font-label text-bodySm font-bold text-yellow" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-ui text-bodySm font-semibold text-text-pri">{p.label[lang] ?? p.label.ko}</p>
                    <p className="mt-2 text-bodySm text-text-sec">{p.desc[lang] ?? p.desc.ko}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="mt-32 rounded-lg border border-hairlineStrong bg-bg-panel p-16" aria-labelledby="sim-scope">
          <h2 id="sim-scope" className={heading}>{t.paymentHead}</h2>
          <p className="mt-8 text-bodySm text-text-pri">{t.payment}</p>
        </section>

        <p className="mt-24 text-bodySm text-text-meta">{t.keys}</p>
      </aside>
    </div>
  )
}
