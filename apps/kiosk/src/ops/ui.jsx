// ops/ui.jsx: 운영 화면 공용 조각(언어, 탭, 대화상자, 형식).
import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { pickLang, useLangValue } from '@urbanedge/ds'
import { BOOTHS } from './store.js'

// 운영 화면은 문구가 많고 촘촘해서 두 언어를 겹치지 않고 현재 언어 하나만 쓴다.
export function useL() {
  const lang = useLangValue()
  return useCallback((en, ko) => pickLang(lang, en, ko), [lang])
}
export const useLangCode = useLangValue

export const BOOTH_COLOR = { retro: '63 166 107', karaoke: '231 65 53', subway: '245 197 24' }
export const boothOf = (id) => BOOTHS.find((b) => b.id === id) || BOOTHS[0]

export const METHOD_LABEL = {
  card: { en: 'Card', ko: '카드' },
  samsungpay: { en: 'Samsung Pay', ko: '삼성페이' },
  cash: { en: 'Cash', ko: '현금' },
  coupon: { en: 'Coupon', ko: '쿠폰' },
}
export const STEP_LABEL = {
  attract: { en: 'Idle', ko: '대기' },
  language: { en: 'Language', ko: '언어 선택' },
  pay: { en: 'Paying', ko: '결제 중' },
  cuts: { en: 'Choosing cuts', ko: '컷 선택' },
  frame: { en: 'Choosing frame', ko: '프레임 선택' },
  guide: { en: 'Guide', ko: '촬영 안내' },
  shoot: { en: 'Shooting', ko: '촬영 중' },
  select: { en: 'Picking shots', ko: '사진 고르기' },
  print: { en: 'Printing', ko: '인화 중' },
  finish: { en: 'Done', ko: '완료' },
}

export const won = (n) => `${Math.round(n).toLocaleString('ko-KR')}원`
export const hhmm = (ts) => {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
export const ymd = (ts) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function BoothDot({ id, size = 10 }) {
  return <span aria-hidden="true" className="op-dot" style={{ width: size, height: size, background: `rgb(${BOOTH_COLOR[id]})` }} />
}

export function SampleBadge({ show }) {
  const L = useL()
  if (!show) return null
  return <span className="op-sample">{L('Includes sample', '샘플 포함')}</span>
}

// 탭: role=tablist, 좌우 화살표/Home/End로 이동한다.
export function Tabs({ items, value, onChange, label, size = 'md' }) {
  const refs = useRef([])
  const onKey = (e, i) => {
    let j = null
    if (e.key === 'ArrowRight') j = (i + 1) % items.length
    if (e.key === 'ArrowLeft') j = (i - 1 + items.length) % items.length
    if (e.key === 'Home') j = 0
    if (e.key === 'End') j = items.length - 1
    if (j == null) return
    e.preventDefault()
    onChange(items[j].id)
    refs.current[j]?.focus()
  }
  return (
    <div role="tablist" aria-label={label} className={`op-tabs op-tabs-${size}`}>
      {items.map((it, i) => (
        <button
          key={it.id}
          ref={(el) => (refs.current[i] = el)}
          role="tab"
          type="button"
          id={`op-tab-${it.id}`}
          aria-selected={value === it.id}
          aria-controls={`op-panel-${it.id}`}
          tabIndex={value === it.id ? 0 : -1}
          onClick={() => onChange(it.id)}
          onKeyDown={(e) => onKey(e, i)}
          className="op-tab"
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  )
}

// 대화상자: 운영 패널 안에 뜬다. Esc와 바깥 누르기로 닫히고 닫히면 초점이 돌아간다.
export function Dialog({ open, onClose, title, children, wide }) {
  const box = useRef(null)
  const back = useRef(null)
  const L = useL()
  useEffect(() => {
    if (!open) return undefined
    back.current = document.activeElement
    box.current?.querySelector('button, input, select')?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
      if (e.key === 'Tab' && box.current) {
        const f = [...box.current.querySelectorAll('button, input, select, [tabindex="0"]')]
        if (!f.length) return
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault()
          f[f.length - 1].focus()
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault()
          f[0].focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      back.current?.focus?.()
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="op-backdrop" onClick={onClose}>
      <div ref={box} role="dialog" aria-modal="true" aria-label={title} className={`op-dialog ${wide ? 'op-dialog-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="op-dialog-head">
          <h3 className="op-h3">{title}</h3>
          <button type="button" className="op-icon-btn" onClick={onClose} aria-label={L('Close', '닫기')}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Slider({ label, value, min, max, step, onChange, format = (v) => v.toFixed(2) }) {
  return (
    <label className="op-slider">
      <span className="op-slider-top">
        <span>{label}</span>
        <span className="op-num">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </label>
  )
}

export function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className="op-switch">
      <span className="op-switch-knob" />
    </button>
  )
}
