import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { T } from './lang.jsx'
import { useStageRef } from './stage.js'
import { COPY } from '../flow/copy.js'

// Zoomable: 인화물을 누르면 제자리에서 화면 한가운데로 커지며 떠오르고, 다시 누르거나 배경을 누르거나 Esc를 누르면 제자리로 돌아간다.
// render(height)가 같은 인화물을 원하는 높이로 그린다. 확대 높이는 zoomHeight(캔버스 1080 안에 들어가는 값).
// 동작 줄이기 설정이면 전환 없이 바로 나타나고 사라진다.
const MS = 380

export function Zoomable({ render, height, zoomHeight = 940, label, disabled = false, className, style }) {
  const stageRef = useStageRef()
  const [phase, setPhase] = useState('closed') // closed | open | closing
  const thumb = useRef(null)
  const item = useRef(null)
  const from = useRef(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const root = stageRef?.current
  const scaleOf = () => {
    const r = root.getBoundingClientRect()
    return { r, s: r.width / root.offsetWidth }
  }

  const openIt = () => {
    if (disabled || !root || phase !== 'closed') return
    const { r, s } = scaleOf()
    const b = thumb.current.getBoundingClientRect()
    from.current = { x: (b.left - r.left) / s, y: (b.top - r.top) / s, w: b.width / s, h: b.height / s }
    setPhase('open')
  }
  const closeIt = useCallback(() => {
    if (phase !== 'open') return
    if (reduced) setPhase('closed')
    else {
      setPhase('closing')
      setTimeout(() => setPhase('closed'), MS)
    }
  }, [phase, reduced])

  // 열릴 때: 썸네일 위치와 크기에서 시작해 가운데로 간다. 닫힐 때: 반대로.
  useLayoutEffect(() => {
    const el = item.current
    if (!el || phase === 'closed') return
    const { r, s } = scaleOf()
    const b = el.getBoundingClientRect()
    const to = { x: (b.left - r.left) / s, y: (b.top - r.top) / s, w: b.width / s, h: b.height / s }
    const f = from.current
    const k = f.h / to.h
    const t0 = `translate3d(${f.x - to.x}px, ${f.y - to.y}px, 0) scale(${k})`
    if (phase === 'open') {
      if (reduced) return
      el.style.transition = 'none'
      el.style.transform = t0
      void el.offsetWidth
      el.style.transition = `transform ${MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
      el.style.transform = 'translate3d(0,0,0) scale(1)'
    } else if (phase === 'closing') {
      el.style.transition = `transform ${MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
      el.style.transform = t0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (phase !== 'open') return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeIt()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [phase, closeIt])

  const shown = phase !== 'closed'
  return (
    <>
      <button
        ref={thumb}
        type="button"
        onClick={openIt}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="dialog"
        className={className}
        style={{ display: 'block', padding: 0, border: 0, background: 'none', cursor: disabled ? 'default' : 'zoom-in', visibility: shown ? 'hidden' : 'visible', ...style }}
      >
        {render(height)}
      </button>
      {shown && root
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              onClick={closeIt}
              className="absolute inset-0 z-overlay flex items-center justify-center"
              style={{ background: phase === 'open' ? 'rgb(var(--ue-black) / 0.82)' : 'rgb(var(--ue-black) / 0)', transition: reduced ? 'none' : `background ${MS}ms ease-out`, cursor: 'zoom-out' }}
            >
              <div ref={item} style={{ willChange: 'transform' }}>
                {render(zoomHeight)}
              </div>
              <div className="pointer-events-none absolute inset-x-0 text-center" style={{ bottom: 22, opacity: phase === 'open' ? 1 : 0, transition: reduced ? 'none' : 'opacity 200ms' }}>
                <T n={COPY.common.zoomClose} as="p" className="kt-caption text-text-sec" />
              </div>
              <ZoomFocus onClose={closeIt} />
            </div>,
            root,
          )
        : null}
    </>
  )
}

// 키보드로 열었을 때 초점을 대화상자 안에 둔다.
function ZoomFocus({ onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return <button ref={ref} type="button" onClick={onClose} className="absolute opacity-0" style={{ left: 0, top: 0, width: 1, height: 1 }} aria-label="Close" />
}
