import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react'
import { ShareButton, useLangValue } from '@urbanedge/ds'
import { Tx, useV } from './Bilingual.jsx'

// 사진 확대 보기: 화면 가운데의 작은 대화상자. 바깥을 누르거나 Esc로 닫는다.
// role=dialog, 포커스 가두기, 좌우 화살표와 스와이프, 공유(ShareButton). 닫으면 열기 전에 포커스가 있던 요소로 돌아간다.
// 공유 대화상자가 열려 있는 동안에는 키 입력을 그쪽에 맡긴다. 하단 바와 하단 시트를 쓰지 않는다.
// label: { dialog, close, prev, next, share, source }는 모두 { en, ko }.
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

export function Lightbox({ items, index, onIndex, onClose, label, shareTitle }) {
  const v = useV()
  const lang = useLangValue()
  const rootRef = useRef(null)
  const closeRef = useRef(null)
  const touch = useRef(null)
  const count = items.length
  const item = items[index]

  const go = useCallback((d) => onIndex((index + d + count) % count), [index, count, onIndex])

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

  useEffect(() => {
    const onKey = (e) => {
      const root = rootRef.current
      if (!root) return
      if (!root.contains(e.target) && e.target.closest?.('[role="dialog"]')) return
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
        const nodes = [...root.querySelectorAll(FOCUSABLE)].filter((n) => n.getClientRects().length > 0)
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (!root.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go, onClose])

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

  const round = 'ue-press absolute grid size-48 place-items-center rounded-pill bg-bg-base text-text-pri transition-colors duration-fast ease-out hover:text-yellow'
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const absolute = item.full.startsWith('http') ? item.full : `${origin}${item.full}`

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={v(label.dialog)}
      className="fixed inset-0 z-modal grid animate-fade-in place-items-center bg-scrim p-16"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full" style={{ maxWidth: 'min(92vw, 640px)' }}>
        <div className="relative overflow-hidden rounded-lg bg-bg-panel" style={{ touchAction: 'pan-y' }} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (touch.current = null)}>
          <img key={item.full} src={item.full} alt={v(item.alt)} draggable="false" className="mx-auto block max-w-full animate-fade-in select-none object-contain" style={{ maxHeight: '66dvh' }} />
          <button ref={closeRef} type="button" onClick={onClose} aria-label={v(label.close)} className={`${round} right-8 top-8`}>
            <X size={20} aria-hidden="true" />
          </button>
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label={v(label.prev)} className={`${round} left-8 top-1/2 -translate-y-1/2`}>
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={v(label.next)} className={`${round} right-8 top-1/2 -translate-y-1/2`}>
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
        <div className="mt-12 flex items-start justify-between gap-16">
          <div className="min-w-0">
            <Tx {...item.alt} as="p" role="caption" className="text-text-sec" />
            {item.source && (
              <a href={item.source} target="_blank" rel="noopener noreferrer" className="t-caption mt-4 inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
                <Tx inline {...label.source} />
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-12">
            <p className="t-caption tabular-nums text-text-meta" aria-live="polite">
              {index + 1} / {count}
            </p>
            <ShareButton url={typeof window !== 'undefined' ? window.location.href : ''} title={shareTitle} text={v(item.alt)} image={absolute} variant="ghost" lang={lang}>
              <Tx inline {...label.share} />
            </ShareButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
