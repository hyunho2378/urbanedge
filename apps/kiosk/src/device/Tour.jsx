// Tour.jsx: 코치마크 투어. 스포트라이트, 말풍선, 다음 이전 건너뛰기, 키보드.
// 말풍선은 대상 옆에 붙는 작은 팝오버이고 좁은 화면에서도 하단 시트를 쓰지 않는다(들어갈 자리가 없으면 화면 중앙의 작은 대화상자).
// 대상은 data-tour 표식으로 찾는다. 대상이 화면 밖에 있는 부품(렌즈, 카드 단말기, 인화 출구를 /screen에서 볼 때)은
// 화면 아래 가장자리에서 아래쪽 화살표로 가리킨다. 열림과 단계는 부모가 URL로 관리한다(useTour).
// 모든 문구는 Bi로 그려 한영 전환에도 말풍선 크기가 변하지 않는다. 움직임은 transform과 opacity만 쓴다.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ChevronRight, Maximize2 } from 'lucide-react'
import { Bi, Button, cx, pickLang, useLangValue } from '@urbanedge/ds'
import { TOUR_COPY, TOUR_PROGRESS, TOUR_STEPS, TOUR_UI } from './tourCopy.js'
import './tour.css'

const PAD = 8
const GAP = 16
const MARGIN = 12

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi))

function rectOf(el) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return null
  return { x: r.left, y: r.top, w: r.width, h: r.height }
}

function roundedRect({ x, y, w, h }, r) {
  const rr = Math.min(r, w / 2, h / 2)
  return `M${x + rr} ${y}H${x + w - rr}A${rr} ${rr} 0 0 1 ${x + w} ${y + rr}V${y + h - rr}A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}H${x + rr}A${rr} ${rr} 0 0 1 ${x} ${y + h - rr}V${y + rr}A${rr} ${rr} 0 0 1 ${x + rr} ${y}Z`
}

// 투어 레이어(fixed inset 0)의 실제 크기를 따라간다. 스크롤바가 생기거나 사라져도 창 크기 이벤트 없이 바뀌므로 레이어를 직접 관찰한다.
function useLayerSize() {
  const [el, setEl] = useState(null)
  const [vp, setVp] = useState(() => ({ w: document.documentElement.clientWidth || window.innerWidth, h: window.innerHeight }))
  useLayoutEffect(() => {
    if (!el) return undefined
    const read = () => setVp((p) => (p.w === el.clientWidth && p.h === el.clientHeight ? p : { w: el.clientWidth, h: el.clientHeight }))
    read()
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(read)
    ro?.observe(el)
    window.addEventListener('resize', read)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', read)
    }
  }, [el])
  return [vp, setEl]
}

// 대상 요소의 화면 좌표를 계속 따라간다(스크롤, 크기 변경 포함).
function useTargetRect(selector, active, key) {
  const [rect, setRect] = useState(null)
  useLayoutEffect(() => {
    if (!active) return undefined
    let raf = 0
    const find = () => (selector ? document.querySelector(`[data-tour="${selector}"]`) : null)
    const measure = () => {
      raf = 0
      setRect(rectOf(find()))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    const el = find()
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' })
    }
    measure()
    const t = setTimeout(measure, 120)
    window.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    if (el && ro) ro.observe(el)
    return () => {
      clearTimeout(t)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      ro?.disconnect()
    }
  }, [selector, active, key])
  return rect
}

const linkBtn = 'ue-press min-h-48 rounded-md px-4 font-ui text-body-sm font-semibold text-text-meta hover:text-text-pri'

export default function Tour({ open, ctx = 'sim', index = 0, onIndex, onClose, onStepChange }) {
  const lang = useLangValue()
  const steps = TOUR_STEPS[ctx] ?? TOUR_STEPS.sim
  const step = steps[Math.min(index, steps.length - 1)]
  const last = index >= steps.length - 1
  const [vp, setLayer] = useLayerSize()
  const rect = useTargetRect(step?.target, open, `${ctx}-${index}-${vp.w}x${vp.h}`)
  const bubbleRef = useRef(null)
  const nextRef = useRef(null)
  const [size, setSize] = useState({ w: 320, h: 180 })
  const opener = useRef(null)

  // 열릴 때 포커스를 기억하고 닫힐 때 돌려준다.
  useEffect(() => {
    if (!open) return undefined
    opener.current = document.activeElement
    return () => {
      const el = opener.current
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus({ preventScroll: true })
    }
  }, [open])

  useEffect(() => {
    if (open && step) onStepChange?.(step, ctx)
  }, [open, step?.id, ctx]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) nextRef.current?.focus({ preventScroll: true })
  }, [open, index])

  useLayoutEffect(() => {
    if (!open || !bubbleRef.current) return
    const r = bubbleRef.current.getBoundingClientRect()
    if (Math.abs(r.width - size.w) > 1 || Math.abs(r.height - size.h) > 1) setSize({ w: r.width, h: r.height })
  })

  const next = useCallback(() => (last ? onClose?.() : onIndex?.(index + 1)), [last, index, onClose, onIndex])
  const back = useCallback(() => onIndex?.(Math.max(0, index - 1)), [index, onIndex])

  // 키보드: 화살표로 이동, Esc로 건너뛰기, Tab은 말풍선 안에서만 돈다. 화면 안쪽 키 처리보다 먼저 받는다.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const eat = () => {
        e.preventDefault()
        e.stopPropagation()
      }
      if (e.key === 'Escape') {
        eat()
        onClose?.()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        eat()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        eat()
        back()
      } else if (e.key === 'Tab' && bubbleRef.current) {
        const f = [...bubbleRef.current.querySelectorAll('button:not([disabled])')]
        if (!f.length) return
        const first = f[0]
        const lastEl = f[f.length - 1]
        const cur = document.activeElement
        if (!bubbleRef.current.contains(cur)) {
          e.preventDefault()
          first.focus()
        } else if (e.shiftKey && cur === first) {
          e.preventDefault()
          lastEl.focus()
        } else if (!e.shiftKey && cur === lastEl) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, next, back, onClose])

  if (!open || !step) return null

  const text = TOUR_COPY[step.id]
  const { w: vw, h: vh } = vp
  const edgeMode = Boolean(step.edgeOnly)
  const centerMode = Boolean(step.center)
  const hole = !edgeMode && !centerMode && rect ? { x: rect.x - PAD, y: rect.y - PAD, w: rect.w + PAD * 2, h: rect.h + PAD * 2 } : null
  const holeR = step.round && hole ? Math.min(hole.w, hole.h) / 2 : 14

  // 화면 가장자리 화살표: 화면(스테이지) 박스 아래쪽 안에서 가로 위치로 가리킨다.
  let edge = null
  if ((edgeMode || centerMode) && rect) {
    const ax = rect.x + rect.w * (step.edge ?? 0.5)
    edge = { ax: clamp(ax, rect.x + 32, rect.x + rect.w - 32), bottom: rect.y + rect.h, rect }
  }

  // 말풍선 위치: 대상 옆 팝오버. 들어갈 자리가 없으면 화면 중앙.
  const bw = Math.min(320, vw - MARGIN * 2)
  let bubbleStyle = {}
  let pointer = null
  if (hole) {
    const cx0 = hole.x + hole.w / 2
    const cy0 = hole.y + hole.h / 2
    const fitsBelow = hole.y + hole.h + GAP + size.h + MARGIN <= vh
    const fitsAbove = hole.y - GAP - size.h - MARGIN >= 0
    const fitsRight = hole.x + hole.w + GAP + bw + MARGIN <= vw
    const fitsLeft = hole.x - GAP - bw - MARGIN >= 0
    let side
    if (hole.h > vh * 0.45 || hole.w > vw * 0.5) side = fitsRight ? 'right' : fitsLeft ? 'left' : fitsBelow ? 'below' : fitsAbove ? 'above' : 'center'
    else side = fitsBelow ? 'below' : fitsAbove ? 'above' : fitsRight ? 'right' : fitsLeft ? 'left' : 'center'
    let x
    let y
    if (side === 'below' || side === 'above') {
      x = clamp(cx0 - bw / 2, MARGIN, vw - bw - MARGIN)
      y = side === 'below' ? hole.y + hole.h + GAP : hole.y - GAP - size.h
      pointer = { side, offset: clamp(cx0 - x, 24, bw - 24) }
    } else if (side === 'right' || side === 'left') {
      x = side === 'right' ? hole.x + hole.w + GAP : hole.x - GAP - bw
      y = clamp(cy0 - size.h / 2, MARGIN, vh - size.h - MARGIN)
      pointer = { side, offset: clamp(cy0 - y, 24, size.h - 24) }
    } else {
      x = (vw - bw) / 2
      y = clamp((vh - size.h) / 2, MARGIN, vh)
    }
    bubbleStyle = { width: bw, transform: `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)` }
  } else if (edge) {
    const x = clamp(edge.ax - bw / 2, MARGIN, vw - bw - MARGIN)
    const y = centerMode ? clamp(edge.rect.y + edge.rect.h / 2 - size.h / 2, MARGIN, vh - size.h - MARGIN) : clamp(edge.bottom - 96 - size.h, MARGIN, vh - size.h - MARGIN)
    bubbleStyle = { width: bw, transform: `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)` }
  } else {
    bubbleStyle = { width: bw, transform: `translate3d(${Math.round((vw - bw) / 2)}px,${Math.round(Math.max(MARGIN, (vh - size.h) / 2))}px,0)` }
  }

  const canFullscreen = step.id === 'window' && typeof document !== 'undefined' && document.fullscreenEnabled
  const goFullscreen = () => {
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    onClose?.()
  }

  const dimPath = hole
    ? `M0 0H${vw}V${vh}H0Z${roundedRect(hole, holeR)}`
    : edge && centerMode
      ? `M0 0H${vw}V${vh}H0Z${roundedRect(edge.rect, 6)}`
      : `M0 0H${vw}V${vh}H0Z`

  const pointerStyle = pointer
    ? pointer.side === 'below'
      ? { top: -7, left: pointer.offset - 7 }
      : pointer.side === 'above'
        ? { bottom: -7, left: pointer.offset - 7 }
        : pointer.side === 'right'
          ? { left: -7, top: pointer.offset - 7 }
          : { right: -7, top: pointer.offset - 7 }
    : null

  return (
    <div ref={setLayer} className="tour-layer" data-tour-layer={ctx} data-step={step.id}>
      <svg className="tour-dim tour-fade" key={`dim-${index}`} viewBox={`0 0 ${vw} ${vh}`} aria-hidden="true">
        <path d={dimPath} fillRule="evenodd" style={{ fill: edgeMode ? 'rgb(var(--ue-black) / 0.55)' : 'rgb(var(--ue-black) / 0.74)' }} />
      </svg>

      {hole ? (
        <>
          <div
            className="tour-ring tour-fade"
            key={`ring-${index}`}
            style={{ width: hole.w, height: hole.h, borderRadius: holeR, transform: `translate3d(${hole.x}px,${hole.y}px,0)` }}
            aria-hidden="true"
          />
          {!step.interactive ? (
            <div className="absolute left-0 top-0" style={{ width: hole.w, height: hole.h, transform: `translate3d(${hole.x}px,${hole.y}px,0)` }} aria-hidden="true" />
          ) : null}
        </>
      ) : null}

      {edge && edgeMode ? (
        <>
          <div
            className="tour-edge-glow"
            aria-hidden="true"
            style={{ width: edge.rect.w, height: Math.max(48, edge.rect.h * 0.1), transform: `translate3d(${edge.rect.x}px,${edge.bottom - Math.max(48, edge.rect.h * 0.1)}px,0)` }}
          />
          <div className="tour-edge tour-fade" key={`edge-${index}`} aria-hidden="true" style={{ transform: `translate3d(${edge.ax - 28}px,${edge.bottom - 76}px,0)` }}>
            <div className="tour-arrow grid size-56 place-items-center rounded-pill bg-yellow text-text-onYellow">
              <ArrowDown size={30} strokeWidth={2.6} />
            </div>
          </div>
        </>
      ) : null}

      <div
        ref={bubbleRef}
        key={`bubble-${index}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        aria-label={pickLang(lang, TOUR_UI.dialog.en, TOUR_UI.dialog.ko)}
        className="tour-bubble tour-fade rounded-lg p-20"
        style={bubbleStyle}
      >
        {pointerStyle ? <span className="tour-pointer" aria-hidden="true" style={{ ...pointerStyle, transform: 'rotate(45deg)' }} /> : null}

        <p className="relative flex items-center gap-4" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.id} className={cx('h-6 rounded-pill', i === index ? 'w-20 bg-yellow' : i < index ? 'w-6 bg-text-sec' : 'w-6 bg-hairlineStrong')} />
          ))}
        </p>
        <span className="sr-only">{TOUR_PROGRESS[lang](index + 1, steps.length)}</span>

        <h2 id="tour-title" className="t-headline relative mt-12 text-h3">
          <Bi en={text.title.en} ko={text.title.ko} />
        </h2>
        <p id="tour-body" className="t-body relative mt-4 text-body-sm text-text-sec">
          <Bi en={text.body.en} ko={text.body.ko} />
        </p>

        <div className="relative mt-16 flex items-center justify-between gap-12">
          <div className="flex items-center gap-12">
            {index > 0 ? (
              <button type="button" onClick={back} className={linkBtn}>
                <Bi inline en={TOUR_UI.back.en} ko={TOUR_UI.back.ko} />
              </button>
            ) : null}
            <button type="button" onClick={onClose} className={linkBtn}>
              <Bi inline en={canFullscreen ? TOUR_UI.notNow.en : TOUR_UI.skip.en} ko={canFullscreen ? TOUR_UI.notNow.ko : TOUR_UI.skip.ko} />
            </button>
          </div>
          {canFullscreen ? (
            <Button ref={nextRef} variant="primary" size="md" onClick={goFullscreen} className="px-16">
              <Maximize2 size={16} aria-hidden="true" />
              <Bi inline en={TOUR_UI.fullscreen.en} ko={TOUR_UI.fullscreen.ko} />
            </Button>
          ) : (
            <Button ref={nextRef} variant="primary" size="md" onClick={next} className="px-16">
              <Bi inline en={last ? TOUR_UI.finish.en : TOUR_UI.next.en} ko={last ? TOUR_UI.finish.ko : TOUR_UI.next.ko} />
              {last ? null : <ChevronRight size={18} aria-hidden="true" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
