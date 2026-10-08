import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { usePick } from '../i18n/index.jsx'
import { lockScroll, unlockScroll } from './scroll.js'

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'

// 모달. 모든 화면에서 가운데 대화상자다(하단 시트는 쓰지 않는다). 포커스 가두기, Esc 닫기, 스크롤 잠금, 닫을 때 포커스 복귀.
export default function Modal({ open, onClose, label, className, children }) {
  const pick = usePick()
  const panel = useRef(null)
  const closeBtn = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const opener = document.activeElement
    const body = document.body
    const prev = { overflow: body.style.overflow, pad: body.style.paddingRight }
    const bar = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (bar > 0) body.style.paddingRight = `${bar}px`
    lockScroll()
    closeBtn.current?.focus()
    return () => {
      body.style.overflow = prev.overflow
      body.style.paddingRight = prev.pad
      unlockScroll()
      opener?.focus?.({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panel.current) return
    const nodes = [...panel.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null)
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-16 md:p-40" onKeyDown={onKeyDown}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={pick({ en: 'Close', ko: '닫기' })}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-scrim"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-lenis-prevent
        className={cx(
          'relative flex max-h-full w-full max-w-5xl flex-col overflow-y-auto rounded-xl bg-bg-elev text-text-pri shadow-lift animate-pop-in',
          className,
        )}
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label={pick({ en: 'Close', ko: '닫기' })}
          className="ue-press absolute right-12 top-12 z-10 grid size-48 place-items-center rounded-pill bg-bg-raised text-text-pri transition-colors duration-fast ease-out hover:bg-yellow hover:text-text-onYellow"
        >
          <X size={20} aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}
