// Simulator.jsx v2: 경로 `/`. 모니터 중심으로 줄인 기기와 조작 패널(데스크톱은 오른쪽, 모바일은 기기 아래 본문).
// 웹 페이지이므로 하단 시트와 하단 고정 바를 쓰지 않는다. 버튼은 주 버튼 하나(새 창 전체 화면)이고 나머지는 텍스트 링크와 토글이다.
// 모든 문구는 <Bi>로 그려 한영 전환에도 레이아웃이 움직이지 않는다.
// 새 창 전체 화면 열기, 코치마크 투어, 단계 점프(데스크톱 세로 레일, 모바일 가로 칩), ?embed=1 크롬 없는 모드를 제공한다.
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, Maximize2 } from 'lucide-react'
import { Bi, Button, cx, pickLang, useLangValue } from '@urbanedge/ds'
import { UEMark } from '@urbanedge/brand'
import DeviceFrame from '../device/DeviceFrame.jsx'
import Stage from '../device/Stage.jsx'
import Tour from '../device/Tour.jsx'
import { TOUR_STEPS } from '../device/tourCopy.js'
import { NOTICE } from '../device/stations.js'
import { useTour } from '../device/useTour.js'
import { useMedia } from '../device/useMedia.js'
import { PARTS, ZONES } from '../device/geometry.js'
import KioskScreen from '../flow/KioskScreen.jsx'
import { PANEL } from './copy.js'
import './simulator.css'

const eyebrow = 't-label text-text-meta'
const T = ({ k, ...rest }) => <Bi en={PANEL.en[k]} ko={PANEL.ko[k]} {...rest} />
const textLink = 'ue-press inline-flex min-h-48 items-center gap-4 rounded-md font-ui text-body-sm font-semibold text-text-pri hover:text-yellow'

// 두 선택지 토글. 면 하나와 글자색만으로 구분하고 테두리를 쓰지 않는다.
function TextToggle({ label, value, onChange, options }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-4">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'ue-press min-h-48 rounded-md px-12 font-ui text-body-sm font-semibold',
              on ? 'bg-bg-raised text-text-pri' : 'text-text-meta hover:text-text-pri',
            )}
          >
            {o.node}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({ checked, onChange, children }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="ue-press flex min-h-48 w-full items-center justify-between gap-16 rounded-md font-ui text-body-sm font-semibold text-text-pri"
    >
      <span>{children}</span>
      <span className={cx('relative h-24 w-48 shrink-0 rounded-pill', checked ? 'bg-yellow' : 'bg-bg-raised')}>
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
    <div className="flex items-center justify-between gap-16 py-12">
      <dt className="t-caption text-text-meta">{k}</dt>
      <dd className={cx('t-strong inline-flex items-center gap-8 text-body-sm', on ? 'text-yellow' : 'text-text-sec')}>
        <span className={cx('size-8 rounded-pill', on ? 'bg-yellow' : 'bg-hairlineStrong')} aria-hidden="true" />
        {v}
      </dd>
    </div>
  )
}

// 데스크톱: 노선처럼 정거장 점이 이어진 세로 레일
function StepRail({ steps, step, goTo, listRef }) {
  return (
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
                'ue-press flex w-full items-center gap-12 rounded-md px-10 py-12 text-left font-ui text-body-sm font-semibold',
                on ? 'bg-tint text-yellow' : 'text-text-sec hover:bg-bg-panel',
              )}
            >
              <span className={cx('relative size-12 shrink-0 rounded-pill border-2', on ? 'border-yellow bg-yellow' : 'border-hairlineStrong bg-bg-base')} aria-hidden="true" />
              <span className="ue-label w-24 shrink-0 text-text-meta">{String(i + 1).padStart(2, '0')}</span>
              <Bi inline en={s.label.en} ko={s.label.ko} />
            </button>
          </li>
        )
      })}
    </ol>
  )
}

// 모바일: 기기 아래 본문에 놓인 가로 스크롤 칩. 현재 단계가 가운데로 온다.
function StepChips({ steps, step, goTo, listRef }) {
  useEffect(() => {
    const box = listRef.current
    const cur = box?.querySelector('[aria-current="step"]')
    if (box && cur) box.scrollTo({ left: cur.offsetLeft - (box.clientWidth - cur.clientWidth) / 2, behavior: 'auto' })
  }, [step, listRef])
  return (
    <ol ref={listRef} className="sim-chips flex gap-8 overflow-x-auto pb-8">
      {steps.map((s, i) => {
        const on = s.id === step
        return (
          <li key={s.id} className="shrink-0">
            <button
              type="button"
              onClick={() => goTo(s.id)}
              aria-current={on ? 'step' : undefined}
              className={cx(
                'ue-press flex min-h-48 items-center gap-8 rounded-pill px-16 font-ui text-body-sm font-semibold',
                on ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-text-sec',
              )}
            >
              <span className={cx('ue-label', on ? 'text-text-onYellow' : 'text-text-meta')}>{String(i + 1).padStart(2, '0')}</span>
              <Bi inline en={s.label.en} ko={s.label.ko} />
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function LangToggle({ lang, setLang }) {
  return (
    <TextToggle
      label="Language / 언어"
      value={lang}
      onChange={setLang}
      options={[
        { value: 'en', node: 'English' },
        { value: 'ko', node: '한국어' },
      ]}
    />
  )
}

export default function Simulator({ ctrl }) {
  const { step, steps, goTo, reset, lang, setLang, cameraMode, setCameraMode, hintZone, flashing, printUrl, cameraActive, room } = ctrl
  const [params] = useSearchParams()
  const embed = params.get('embed') === '1'
  const L = useLangValue()
  const t = (k) => PANEL[L === 'ko' ? 'ko' : 'en'][k]
  const desktop = useMedia('(min-width: 1024px)')
  const [annotate, setAnnotate] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const listRef = useRef(null)
  const tourCtx = embed ? 'embedDevice' : 'sim'
  // v3: 투어는 버튼(Take the tour)이나 ?tour=N으로만 연다. 자동으로 화면을 덮지 않는다.
  const tour = useTour({ total: TOUR_STEPS[tourCtx].length, autoOpen: false })
  const [tourHint, setTourHint] = useState(null)
  const before = useRef(null)

  const idx = Math.max(0, steps.findIndex((s) => s.id === step))
  const hintShown = tour.open && tourHint ? tourHint : hintZone
  const zoneLabel = hintShown && ZONES[hintShown] ? ZONES[hintShown].label : null

  // 투어가 카드 단말기 단계에 오면 화면도 결제 단계로 보여 주고, 끝나면 원래 단계로 돌려놓는다.
  const onTourStep = (s) => {
    setTourHint(s.hint ?? null)
    if (s.goTo && steps.some((x) => x.id === s.goTo)) {
      if (before.current == null) before.current = step
      goTo(s.goTo)
    }
  }
  const closeTour = () => {
    tour.close()
    setTourHint(null)
    if (before.current != null) {
      goTo(before.current)
      before.current = null
    }
  }

  // 새 창 전체 화면. 팝업이 막히면 링크가 새 탭으로 열린다.
  const q = new URLSearchParams({ lang, camera: cameraMode })
  if (room) q.set('room', room)
  const screenUrl = `/screen?${q.toString()}`
  const openFull = (e) => {
    const aw = Number(window.screen?.availWidth) || 1920
    const ah = Number(window.screen?.availHeight) || 1080
    const win = window.open(screenUrl, 'ue-kiosk-screen', `popup=yes,width=${aw},height=${ah},left=0,top=0`)
    if (win) {
      e.preventDefault()
      setBlocked(false)
      win.focus?.()
    } else {
      setBlocked(true)
    }
  }

  // 패널 단축키: 화살표로 단계 이동, Esc로 처음으로. 패널 안에 포커스가 있을 때만 동작하므로 기기 화면에는 영향이 없다.
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    const move = (n) => {
      const next = Math.min(steps.length - 1, Math.max(0, n))
      e.preventDefault()
      goTo(steps[next].id)
      if (listRef.current?.contains(e.target)) requestAnimationFrame(() => listRef.current?.querySelectorAll('button')[next]?.focus())
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

  const device = (
    <div className="sim-device" data-embed={embed ? 'true' : 'false'}>
      <DeviceFrame hint={hintShown} flashing={flashing} printUrl={printUrl} cameraActive={cameraActive} annotate={annotate} bg={embed ? 'base' : 'elev'}>
        <Stage label={pickLang(L, 'Kiosk screen', '키오스크 화면')}>
          <KioskScreen ctrl={ctrl} />
        </Stage>
      </DeviceFrame>
    </div>
  )

  const live = (
    <p className="sr-only" role="status" aria-live="polite">
      {zoneLabel ? t('live')(pickLang(L, zoneLabel.en, zoneLabel.ko)) : ''}
    </p>
  )

  const tourEl = <Tour open={tour.open} ctx={tourCtx} index={tour.index} onIndex={tour.go} onClose={closeTour} onStepChange={onTourStep} />

  if (embed) {
    return (
      <div className="sim-embed grid h-dvh place-items-center bg-bg-base text-text-pri">
        {device}
        {live}
        {tourEl}
      </div>
    )
  }

  const stateRows = (
    <dl className="mt-8 divide-y divide-hairline">
      <StateRow k={<T k="hint" inline />} v={zoneLabel ? <Bi inline en={zoneLabel.en} ko={zoneLabel.ko} /> : <T k="none" inline />} on={Boolean(zoneLabel)} />
      <StateRow k={<T k="led" inline />} v={flashing ? <T k="ledOn" inline /> : <T k="ledOff" inline />} on={Boolean(flashing)} />
      <StateRow k={<T k="lens" inline />} v={cameraActive ? <T k="lensOn" inline /> : <T k="lensOff" inline />} on={Boolean(cameraActive)} />
      <StateRow k={<T k="print" inline />} v={printUrl ? <T k="printOut" inline /> : <T k="none" inline />} on={Boolean(printUrl)} />
    </dl>
  )

  const parts = annotate ? (
    <section className="mt-32" aria-labelledby="sim-parts">
      <h2 id="sim-parts" className={eyebrow}><T k="partsHead" /></h2>
      <ol className="mt-12 space-y-12">
        {PARTS.map((p, i) => (
          <li key={p.id} className="flex gap-12">
            <span className="ue-label w-24 shrink-0 text-yellow" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <p className="t-strong text-body-sm text-text-pri"><Bi en={p.label.en} ko={p.label.ko} /></p>
              <p className="t-caption mt-2 text-text-sec"><Bi en={p.desc.en} ko={p.desc.ko} /></p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  ) : null

  const actions = (
    <div className="space-y-8">
      <Button as="a" href={screenUrl} target="_blank" rel="noopener" variant="primary" size="lg" onClick={openFull} className="w-full" aria-label={t('fullscreen')}>
        <Maximize2 size={18} aria-hidden="true" />
        <Bi inline en={PANEL.en.fullscreen} ko={PANEL.ko.fullscreen} />
      </Button>
      <p className="t-caption text-text-meta" role="status">
        {blocked ? (
          <>
            <T k="blocked" inline />{' '}
            <a href={screenUrl} target="_blank" rel="noopener" className="t-strong text-yellow underline underline-offset-4">
              <T k="blockedLink" inline />
            </a>
          </>
        ) : (
          <T k="fullscreenNote" />
        )}
      </p>
      <div className="flex items-center gap-24">
        <button type="button" onClick={tour.start} className={textLink}>
          <T k="tour" inline />
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <button type="button" onClick={reset} className={cx(textLink, 'text-text-sec')}>
          <T k="restart" inline />
        </button>
      </div>
    </div>
  )

  const settings = (
    <section className="space-y-8" aria-labelledby="sim-settings">
      <h2 id="sim-settings" className={eyebrow}><T k="settingsHead" /></h2>
      <div>
        <TextToggle
          label={t('camera')}
          value={cameraMode}
          onChange={setCameraMode}
          options={[
            { value: 'sample', node: <T k="cameraSample" inline /> },
            { value: 'live', node: <T k="cameraLive" inline /> },
          ]}
        />
        <p className="t-caption mt-4 text-text-meta"><T k="cameraNote" /></p>
      </div>
      <Toggle checked={annotate} onChange={setAnnotate}>
        <T k="annotate" inline />
      </Toggle>
    </section>
  )

  const notes = (
    <section className="mt-32 rounded-lg bg-bg-panel p-16" aria-labelledby="sim-note">
      <h2 id="sim-note" className={eyebrow}><T k="noteHead" /></h2>
      <p className="t-strong mt-8 text-body-sm text-text-pri"><Bi en={NOTICE.en} ko={NOTICE.ko} /></p>
      <p className="t-body mt-4 text-body-sm text-text-sec"><T k="note" /></p>
    </section>
  )

  return (
    <div className="sim-root min-h-dvh bg-bg-base text-text-pri lg:flex lg:h-dvh lg:overflow-hidden">
      {!desktop ? (
        <header className="flex items-center justify-between gap-12 bg-bg-base px-16 py-8">
          <div className="flex min-w-0 items-center gap-12">
            <UEMark className="h-24 w-auto shrink-0 text-yellow" title="UrbanEdge" />
            <h1 className="t-strong hidden truncate text-body sm:block"><T k="titleShort" inline /></h1>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </header>
      ) : null}

      <section className="flex flex-col items-center justify-center gap-12 bg-bg-elev px-16 py-16 lg:min-w-0 lg:flex-1 lg:px-24" aria-label={t('deviceLabel')}>
        {device}
        {live}
      </section>

      <aside className="sim-panel bg-bg-base px-16 py-24 lg:px-24" aria-label={t('title')} data-tour={desktop ? 'panel' : undefined} onKeyDown={onKeyDown}>
        {desktop ? (
          <header className="mb-24">
            <div className="flex items-center justify-between gap-12">
              <div className="flex items-center gap-12">
                <UEMark className="h-24 w-auto text-yellow" title="UrbanEdge" />
                <p className={eyebrow}><T k="eyebrow" inline /></p>
              </div>
              <LangToggle lang={lang} setLang={setLang} />
            </div>
            <h1 className="t-headline mt-16 text-h2"><T k="title" /></h1>
            <p className="t-body mt-8 text-body-sm text-text-sec"><T k="intro" /></p>
          </header>
        ) : null}

        {actions}

        <section className="mt-32" aria-labelledby="sim-steps">
          <h2 id="sim-steps" className={eyebrow}><T k="stepsHead" /></h2>
          <p className="sr-only"><T k="stepsHint" /></p>
          {desktop ? (
            <StepRail steps={steps} step={step} goTo={goTo} listRef={listRef} />
          ) : (
            <div className="mt-12" data-tour="panel">
              <StepChips steps={steps} step={step} goTo={goTo} listRef={listRef} />
              <p className="t-caption mt-4 text-text-meta"><Bi en={PANEL.en.stepOf(idx + 1, steps.length)} ko={PANEL.ko.stepOf(idx + 1, steps.length)} /></p>
            </div>
          )}
        </section>

        <div className="mt-32">{settings}</div>

        <section className="mt-32" aria-labelledby="sim-state">
          <h2 id="sim-state" className={eyebrow}><T k="stateHead" /></h2>
          {stateRows}
        </section>

        {parts}
        {notes}
        {desktop ? <p className="t-caption mt-24 text-text-meta"><T k="keys" /></p> : null}
      </aside>

      {tourEl}
    </div>
  )
}
