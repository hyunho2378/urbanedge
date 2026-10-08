import { useCallback, useEffect, useRef, useState } from 'react'
import { cx } from '../components/cx.js'
import { INK, lineRgb, tok } from './colors.js'
import { PLATFORMS, STATION, GYEONGJU_LINE } from './network.js'
import { Bi, pickLang, useLangValue } from '../components/Bi.jsx'
import { useReducedMotion } from './hooks.js'

const u = (k) => `calc(var(--u) * ${k})`
const FONT_LABEL = 'font-label'
// 한글에는 영문 대문자 자간을 주지 않는다.
const KO = '[&_[lang=ko]]:tracking-normal [&_[lang=ko]]:normal-case'

// 값이 바뀔 때 스플릿 플랩처럼 위로 접히고 아래에서 펴지는 전환. transform과 opacity만 쓴다.
function Flip({ value, children, className, line = false }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  const token = useRef(0)
  useEffect(() => {
    if (value === shown) return undefined
    const el = ref.current
    const t = (token.current += 1)
    if (reduced || !el || !el.animate) { setShown(value); return undefined }
    el.getAnimations().forEach((a) => a.cancel())
    const out = el.animate([{ transform: 'perspective(520px) rotateX(0deg)', opacity: 1 }, { transform: 'perspective(520px) rotateX(-82deg)', opacity: 0 }], { duration: 150, easing: 'cubic-bezier(.5,0,1,1)', fill: 'forwards' })
    out.onfinish = () => {
      if (token.current !== t) return
      setShown(value)
      out.cancel()
      el.animate([{ transform: 'perspective(520px) rotateX(82deg)', opacity: 0 }, { transform: 'perspective(520px) rotateX(0deg)', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' })
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <span className={cx('relative block', className)}>
      <span ref={ref} className="block" style={{ transformOrigin: '50% 50%', backfaceVisibility: 'hidden' }}>{children(shown)}</span>
      {line && <span aria-hidden="true" className="pointer-events-none absolute inset-x-0" style={{ top: '50%', height: 2, marginTop: -1, background: tok('bg-base', 0.85) }} />}
    </span>
  )
}

const Arrow = ({ dir }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined }}>
    <polyline points="9 5 16 12 9 19" />
  </svg>
)

function BoardFace({ boarding, next, doorsOpen = true, flip = false, onBoard, onNext, station = STATION, line = GYEONGJU_LINE }) {
  const lang = useLangValue()
  const render = (fn, val) => (flip ? <Flip value={val.id} line={val.line}>{() => fn(val.p)}</Flip> : fn(val.p))
  const nameRow = (p) => (
    <>
      <span className="block text-yellow" style={{ fontSize: u(2.55), fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.06 }}>{p.name}</span>
      <span className="block text-text-meta" style={{ fontSize: u(1.05), fontWeight: 500, marginTop: u(0.15) }}>{p.nameKo}</span>
    </>
  )
  const badge = (p) => (
    <span className="grid place-items-center rounded-pill font-label tabular-nums" style={{ width: u(4.1), height: u(4.1), fontSize: u(2.5), fontWeight: 800, lineHeight: 1, background: lineRgb(p.accent), color: INK, boxShadow: `0 0 0 ${u(0.22)} ${tok('white')}` }}>{p.number}</span>
  )
  const nextRow = (p) => (
    <span className="flex min-w-0 items-baseline justify-between" style={{ gap: u(1) }}>
      <span className="min-w-0 truncate text-text-pri" style={{ fontSize: u(1.4), fontWeight: 700, letterSpacing: '-0.02em' }}>{p.name}</span>
      <span className={cx(FONT_LABEL, 'shrink-0 text-text-meta', KO)} style={{ fontSize: u(1.0), fontWeight: 600, letterSpacing: '0.14em' }}><Bi inline en={`PLATFORM ${p.number}`} ko={`${p.number}번 승강장`} /></span>
    </span>
  )
  const Body = onBoard ? 'button' : 'div'
  return (
    <div className="overflow-hidden" style={{ borderRadius: u(1.2), background: tok('bg-base'), boxShadow: `0 0 0 1px ${tok('text-pri', 0.1)}, 0 ${u(1.2)} ${u(3)} ${tok('black', 0.5)}` }}>
      <div className="flex items-center justify-between" style={{ background: tok('bg-panel'), padding: `${u(0.8)} ${u(1.2)}`, gap: u(1) }}>
        <span className="flex min-w-0 items-center" style={{ gap: u(0.8) }}>
          <span className="grid shrink-0 place-items-center rounded-pill font-label" style={{ width: u(2.2), height: u(2.2), fontSize: u(1.45), fontWeight: 800, lineHeight: 1, background: lineRgb(line.color), color: INK, paddingTop: u(0.06) }}>{line.code}</span>
          <span className="truncate font-label uppercase text-text-pri" style={{ fontSize: u(1.35), fontWeight: 700, letterSpacing: '0.1em' }}>{station.code} {station.name}</span>
        </span>
        <span className={cx('flex shrink-0 items-center font-label uppercase text-yellow', KO)} style={{ gap: u(0.55), fontSize: u(1.15), fontWeight: 700, letterSpacing: '0.14em' }}>
          <span aria-hidden="true" className="rounded-pill bg-yellow motion-safe:animate-pulse-soft" style={{ width: u(0.7), height: u(0.7) }} />
          {doorsOpen ? <Bi inline en="Doors open" ko="출입문 열림" /> : <Bi inline en="Doors closed" ko="출입문 닫힘" />}
        </span>
      </div>
      <Body
        {...(onBoard ? { type: 'button', onClick: onBoard, 'aria-label': pickLang(lang, `Board platform ${boarding.number}, ${boarding.name}`, `${boarding.number}번 승강장 ${boarding.nameKo}에 탑승`) } : {})}
        className={cx('flex w-full items-center justify-between text-left', onBoard && 'ue-press cursor-pointer')}
        style={{ padding: `${u(1.2)} ${u(1.2)}`, gap: u(1.2), background: 'transparent', color: 'inherit' }}
      >
        <span className="block min-w-0">
          <span className={cx('block font-label uppercase text-yellow', KO)} style={{ fontSize: u(1.0), fontWeight: 700, letterSpacing: '0.18em', marginBottom: u(0.35) }}><Bi en="Now boarding" ko="승차 중" /></span>
          {render(nameRow, { id: boarding.id, p: boarding, line: true })}
        </span>
        <span className="flex shrink-0 flex-col items-center" style={{ gap: u(0.35) }}>
          {render(badge, { id: boarding.id, p: boarding })}
          <span className={cx('font-label uppercase text-text-meta', KO)} style={{ fontSize: u(0.9), fontWeight: 600, letterSpacing: '0.16em' }}><Bi inline en="Platform" ko="승강장" /></span>
        </span>
      </Body>
      <div style={{ background: tok('bg-elev'), padding: `${u(0.9)} ${u(1.2)}` }}>
        <span className="flex items-baseline" style={{ gap: u(1) }}>
          <span className={cx('font-label uppercase text-text-meta', KO)} style={{ fontSize: u(1.0), fontWeight: 700, letterSpacing: '0.18em', minWidth: u(3.2) }}><Bi inline en="Next" ko="다음" /></span>
          <span className="block min-w-0 flex-1">{render(nextRow, { id: next.id, p: next })}</span>
        </span>
      </div>
    </div>
  )
}

// 정적 행선지 전광판. boarding, next는 플랫폼 객체({ id, number, name, nameKo, accent }).
export function DestinationBoard({ boarding = PLATFORMS[1], next = PLATFORMS[2], doorsOpen = true, size = 'md', className, station, line }) {
  const base = size === 'lg' ? 'clamp(14px, 1.6vw, 26px)' : size === 'sm' ? '11px' : '14px'
  return (
    <div className={cx('w-full', className)} style={{ '--u': base }} role="group" aria-label={`Now boarding ${boarding.name}, platform ${boarding.number}. Next ${next.name}, platform ${next.number}.`}>
      <BoardFace boarding={boarding} next={next} doorsOpen={doorsOpen} station={station} line={line} />
    </div>
  )
}

// 출발 전광판. 플랫폼 4개를 넘겨 본다. 화살표, 점, 가로 스와이프, 키보드(좌우 화살표), 자동 넘김(일시정지 제공).
// props: platformIndex(제어), defaultIndex, onChange(index, platform), onBoard(platform, index), autoAdvance(true 또는 ms), platforms, size
export function DepartureBoard({ platformIndex, defaultIndex = 0, onChange, onBoard, autoAdvance = false, platforms = PLATFORMS, doorsOpen = true, size = 'md', className, station, line }) {
  const reduced = useReducedMotion()
  const [inner, setInner] = useState(defaultIndex)
  const n = platforms.length
  const idx = ((platformIndex !== undefined ? platformIndex : inner) % n + n) % n
  const go = useCallback(
    (to) => {
      const next = ((to % n) + n) % n
      if (platformIndex === undefined) setInner(next)
      if (onChange) onChange(next, platforms[next])
    },
    [n, onChange, platformIndex, platforms],
  )
  const [paused, setPaused] = useState(false)
  const [hold, setHold] = useState(false)
  const ms = autoAdvance === true ? 5200 : Number(autoAdvance) || 0
  useEffect(() => {
    if (!ms || paused || hold || reduced) return undefined
    const t = setInterval(() => { if (!document.hidden) go(idx + 1) }, ms)
    return () => clearInterval(t)
  }, [ms, paused, hold, reduced, go, idx])

  const drag = useRef(null)
  const base = size === 'lg' ? 'clamp(15px, 2.1vw, 28px)' : size === 'sm' ? '11px' : 'clamp(12px, 3.5vw, 18px)'
  const cur = platforms[idx]
  const nxt = platforms[(idx + 1) % n]
  return (
    <div
      className={cx('mx-auto w-full', className)}
      style={{ '--u': base, maxWidth: size === 'lg' ? 760 : 520 }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Departure board"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1) } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1) }
      }}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <span className="sr-only" aria-live="polite">{`Now boarding ${cur.name}, platform ${cur.number}. Next ${nxt.name}, platform ${nxt.number}.`}</span>
      <div
        style={{ touchAction: 'pan-y' }}
        onPointerDown={(e) => { drag.current = e.clientX }}
        onPointerUp={(e) => {
          if (drag.current == null) return
          const dx = e.clientX - drag.current
          drag.current = null
          if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1))
        }}
        onPointerCancel={() => { drag.current = null }}
      >
        <BoardFace boarding={cur} next={nxt} doorsOpen={doorsOpen} flip station={station} line={line} onBoard={onBoard ? () => onBoard(cur, idx) : undefined} />
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: u(0.9) }}>
        <button type="button" onClick={() => go(idx - 1)} aria-label="Previous platform" className="ue-press grid shrink-0 cursor-pointer place-items-center rounded-pill bg-bg-raised text-text-pri" style={{ width: 44, height: 44 }}><Arrow dir="left" /></button>
        <span className="flex items-center" style={{ gap: u(0.7) }} role="group" aria-label="Platforms">
          {platforms.map((p, i) => (
            <button key={p.id} type="button" onClick={() => go(i)} aria-label={`Platform ${p.number}, ${p.name}`} aria-current={i === idx} className="grid cursor-pointer place-items-center" style={{ width: 36, height: 44 }}>
              <span className="block rounded-pill" style={{ width: i === idx ? u(2.4) : u(0.8), height: u(0.8), background: i === idx ? lineRgb(p.accent) : tok('text-pri', 0.3), transition: 'transform 320ms var(--ue-ease-out), background-color 320ms var(--ue-ease-out)' }} />
            </button>
          ))}
          {ms > 0 && (
            <button type="button" onClick={() => setPaused((v) => !v)} aria-pressed={paused} aria-label={paused ? 'Resume auto advance' : 'Pause auto advance'} className="ue-press grid cursor-pointer place-items-center rounded-pill text-text-sec" style={{ width: 44, height: 44 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">{paused ? <path d="M3 1.5v11l9-5.5z" /> : <><rect x="2.5" y="1.5" width="3" height="11" rx="1" /><rect x="8.5" y="1.5" width="3" height="11" rx="1" /></>}</svg>
            </button>
          )}
        </span>
        <button type="button" onClick={() => go(idx + 1)} aria-label="Next platform" className="ue-press grid shrink-0 cursor-pointer place-items-center rounded-pill bg-bg-raised text-text-pri" style={{ width: 44, height: 44 }}><Arrow dir="right" /></button>
      </div>
    </div>
  )
}
