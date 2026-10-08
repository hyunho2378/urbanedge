import { useEffect, useLayoutEffect, useState } from 'react'
import { T, useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'
import { KButton } from './KButton.jsx'

// CoachMark: 화면 안 코치마크. data-coach="id"가 붙은 요소를 스포트라이트로 밝히고 말풍선을 붙인다.
// 아무 곳이나 누르면 닫히고, 같은 세션에서는 단계마다 한 번만 보인다. "안내 끄기"로 세션 동안 모두 끈다.
export function CoachMark({ id, node, rootRef, onDone, onSkip }) {
  const t = useT()
  const text = t(node)
  const [rect, setRect] = useState(null)

  useLayoutEffect(() => {
    let raf = 0
    let tries = 0
    const find = () => {
      const root = rootRef.current
      const el = root && root.querySelector(`[data-coach="${id}"]`)
      if (!el) {
        if (tries++ < 20) raf = requestAnimationFrame(find)
        else onDone()
        return
      }
      const rr = root.getBoundingClientRect()
      const s = rr.width / (root.offsetWidth || 1920)
      const r = el.getBoundingClientRect()
      setRect({ x: (r.left - rr.left) / s, y: (r.top - rr.top) / s, w: r.width / s, h: r.height / s })
    }
    find()
    return () => cancelAnimationFrame(raf)
  }, [id, rootRef, onDone])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault()
        onDone()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone])

  if (!rect) return null
  const pad = 20
  const cx = rect.x + rect.w / 2
  const below = rect.y + rect.h / 2 < 520
  const bw = 760
  const left = Math.min(1920 - 64 - bw, Math.max(64, cx - bw / 2))
  const top = below ? rect.y + rect.h + pad + 28 : rect.y - pad - 28
  return (
    <div className="absolute inset-0 z-overlay" role="dialog" aria-modal="true" aria-label={text} onPointerDown={onDone}>
      <div className="absolute rounded-xl" style={{ left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2, boxShadow: '0 0 0 4000px rgb(var(--ue-black) / 0.74)' }} />
      <div className="k-ripple absolute rounded-xl border-4 border-yellow" style={{ left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2 }} />
      <div className="k-pop absolute rounded-xl bg-yellow px-40 py-32 text-text-onYellow k-lift" style={{ left, width: bw, top, transform: below ? undefined : 'translateY(-100%)' }} onPointerDown={(e) => e.stopPropagation()}>
        <p className="kt-subhead">
          <T n={node} />
        </p>
        <div className="mt-24 flex items-center justify-between gap-16">
          <KButton tone="ink" onClick={onDone}>
            <T n={COPY.common.gotIt} inline />
          </KButton>
          <button type="button" className="kt-strong min-h-touch px-24 underline underline-offset-8" onClick={onSkip}>
            <T n={COPY.common.skipTips} inline />
          </button>
        </div>
      </div>
    </div>
  )
}
