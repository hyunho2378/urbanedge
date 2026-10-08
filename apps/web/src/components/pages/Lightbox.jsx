import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { usePick } from '../../i18n/index.jsx'

// 사진 확대 보기. role=dialog, 포커스 가두기, Esc 닫기, 좌우 화살표와 스와이프 이동.
// 닫으면 열기 전에 포커스가 있던 요소로 돌아간다.
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

export function Lightbox({ items, index, onIndex, onClose, label }) {
  const pick = usePick()
  const rootRef = useRef(null)
  const closeRef = useRef(null)
  const touch = useRef(null)
  const count = items.length
  const item = items[index]

  const go = useCallback((d) => onIndex((index + d + count) % count), [index, count, onIndex])

  // 열릴 때: 이전 포커스 저장, 스크롤 잠금, 닫기 버튼으로 포커스. 닫힐 때 복원.
  useEffect(() => {
    const prevFocus = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus()
    }
  }, [])

  // 키보드: Esc, 화살표, Tab 순환
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'Tab') {
        // 화면에 보이는 요소만 순환 대상으로 삼는다(md 이상에서는 하단 이동 버튼이 숨겨진다)
        const nodes = [...(rootRef.current?.querySelectorAll(FOCUSABLE) ?? [])].filter((n) => n.getClientRects().length > 0)
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (!rootRef.current.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // 앞뒤 사진을 미리 불러온다
  useEffect(() => {
    if (count < 2) return
    ;[(index + 1) % count, (index - 1 + count) % count].forEach((i) => {
      const img = new Image()
      img.src = items[i].full
    })
  }, [index, count, items])

  const onPointerDown = (e) => {
    touch.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e) => {
    const s = touch.current
    touch.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
  }

  const btn =
    'ue-press grid size-48 place-items-center rounded-pill border border-hairlineStrong bg-scrim text-text-pri transition-colors duration-fast ease-out hover:border-yellow hover:text-yellow'

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={label.dialog}
      className="fixed inset-0 z-modal flex animate-fade-in flex-col bg-bg-base"
    >
      <div className="flex items-center justify-between gap-16 px-16 py-12 md:px-24">
        <p className="ue-label text-label 4xl:text-bodySm text-text-sec" aria-live="polite">
          <span className="text-yellow">{String(index + 1).padStart(2, '0')}</span>
          <span> / {String(count).padStart(2, '0')}</span>
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={label.close} className={btn}>
          <X size={22} />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-16 md:px-96"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (touch.current = null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {count > 1 && (
          <button type="button" onClick={() => go(-1)} aria-label={label.prev} className={`${btn} absolute left-16 top-1/2 z-sticky hidden -translate-y-1/2 md:grid`}>
            <ChevronLeft size={24} />
          </button>
        )}
        <img
          key={item.full}
          src={item.full}
          alt={pick(item.alt)}
          draggable="false"
          className="max-h-full max-w-full animate-fade-in select-none rounded-md object-contain"
        />
        {count > 1 && (
          <button type="button" onClick={() => go(1)} aria-label={label.next} className={`${btn} absolute right-16 top-1/2 z-sticky hidden -translate-y-1/2 md:grid`}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-16 px-16 py-16 md:px-24">
        <p className="max-w-read text-bodySm 4xl:text-body text-text-sec">{pick(item.alt)}</p>
        {count > 1 && (
          <div className="flex gap-12 md:hidden">
            <button type="button" onClick={() => go(-1)} aria-label={label.prev} className={btn}>
              <ChevronLeft size={22} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={label.next} className={btn}>
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
