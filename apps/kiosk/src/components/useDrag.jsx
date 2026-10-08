import { useCallback, useEffect, useRef, useState } from 'react'

// useDrag: 포인터 기반 끌어 놓기(마우스와 터치 공통). 고정된 1920x1080 화면 안에서 쓴다.
// begin(event, payload, { onEnd, onMove, threshold })로 시작한다. 임계값(기본 10px)보다 적게 움직이면 탭으로 보고 onEnd({ moved: false })를 부른다.
// 놓은 자리의 요소는 target으로 넘어온다(고스트는 pointer-events 없음). 좌표는 화면(스테이지) 기준으로 변환해 drag에 담는다.
export function useDrag(rootRef) {
  const [drag, setDrag] = useState(null)
  const cleanup = useRef(null)

  useEffect(() => () => cleanup.current?.(), [])

  const toStage = useCallback(
    (cx, cy) => {
      const el = rootRef.current
      if (!el) return { x: cx, y: cy }
      const r = el.getBoundingClientRect()
      const s = r.width / (el.offsetWidth || 1920)
      return { x: (cx - r.left) / s, y: (cy - r.top) / s, scale: s }
    },
    [rootRef],
  )

  const begin = useCallback(
    (e, payload, { onEnd, onMove, threshold = 10 } = {}) => {
      if (e.button != null && e.button > 0) return
      cleanup.current?.()
      const sx = e.clientX
      const sy = e.clientY
      let active = false
      const move = (ev) => {
        const dx = ev.clientX - sx
        const dy = ev.clientY - sy
        if (!active && Math.hypot(dx, dy) < threshold) return
        active = true
        ev.preventDefault()
        const p = toStage(ev.clientX, ev.clientY)
        setDrag({ payload, x: p.x, y: p.y })
        onMove?.({ payload, client: { x: ev.clientX, y: ev.clientY }, stage: p })
      }
      const up = (ev) => {
        stop()
        setDrag(null)
        const target = active ? document.elementFromPoint(ev.clientX, ev.clientY) : null
        onEnd?.({ payload, moved: active, target, client: { x: ev.clientX, y: ev.clientY }, stage: toStage(ev.clientX, ev.clientY) })
      }
      const stop = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
        cleanup.current = null
      }
      window.addEventListener('pointermove', move, { passive: false })
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
      cleanup.current = stop
    },
    [toStage],
  )

  return { drag, begin, toStage }
}

// 끄는 동안 손가락을 따라다니는 고스트. children은 payload를 받아 그린다.
export function DragLayer({ drag, children }) {
  if (!drag) return null
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-toast" style={{ transform: `translate3d(${drag.x}px, ${drag.y}px, 0)` }} aria-hidden="true">
      <div className="k-lift -translate-x-1/2 -translate-y-1/2 scale-105">{children(drag.payload)}</div>
    </div>
  )
}
