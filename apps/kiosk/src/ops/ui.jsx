// ops/ui.jsx: 운영 화면 공용 조각(언어, 탭, 대화상자, 형식).
import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { BOOTHS } from './store.js'

// 운영 화면은 문구가 많고 촘촘해서 두 언어를 겹치지 않고 현재 언어 하나만 쓴다.
let curLang = 'ko'
// 운영 화면은 한국어만 쓴다. (영어 값은 받아 두기만 하고 쓰지 않는다)
export function useL() {
  return useCallback((en, ko) => ko, [])
}
export const useLangCode = () => 'ko'

// 색은 검정, 흰색, 노랑만 쓴다. 부스는 색이 아니라 이름과 P번호로 구분한다.
export const BOOTH_COLOR = { retro: '17 17 17', karaoke: '17 17 17', subway: '17 17 17' }
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

// 금액: 한국어는 7,000원, 영어는 ₩7,000. 쓰는 화면이 모두 useL()을 먼저 부르므로 현재 언어를 따른다.
export const won = (n) => (curLang === 'en' ? `₩${Math.round(n).toLocaleString('en-US')}` : `${Math.round(n).toLocaleString('ko-KR')}원`)
export const hhmm = (ts) => {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
export const ymd = (ts) => {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 점 표시는 쓰지 않는다(자리만 유지).
export function BoothDot() {
  return null
}

export const hhmmss = (ts) => {
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
// 12.3만 / 12.3k 처럼 줄여 쓴다(차트 막대 위 숫자용)
export const compact = (n, lang = 'ko') => {
  if (lang === 'ko') return n >= 10000 ? `${(n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}만` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}천` : String(n)
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n)
}
export const relTime = (ts, now, lang = 'ko') => {
  const s = Math.max(0, Math.floor((now - ts) / 1000))
  if (s < 10) return lang === 'ko' ? '방금' : 'just now'
  if (s < 60) return lang === 'ko' ? `${s}초 전` : `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return lang === 'ko' ? `${m}분 전` : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return lang === 'ko' ? `${h}시간 전` : `${h}h ago`
  return lang === 'ko' ? `${Math.floor(h / 24)}일 전` : `${Math.floor(h / 24)}d ago`
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

// 결제수단 상세: 카드는 카드사와 가린 번호, 승인번호, 할부. 현금은 받은 금액과 거스름돈. 쿠폰은 코드와 채널.
export const payMain = (t) => {
  const p = t.pay || {}
  if (t.method === 'card') return p.brand || '카드'
  if (t.method === 'samsungpay') return '삼성페이'
  return METHOD_LABEL[t.method]?.ko || t.method
}
export const payLines = (t) => {
  const p = t.pay || {}
  if (t.method === 'card' || t.method === 'samsungpay') return [p.masked, p.approval ? `승인 ${p.approval}` : null, p.installment].filter(Boolean)
  if (t.method === 'cash') return p.received ? [`받은 금액 ${won(p.received)}`, `거스름돈 ${won(p.change || 0)}`] : []
  if (t.method === 'coupon') return [p.code || t.coupon, p.channel || t.couponChannel].filter(Boolean)
  return []
}
export const payShort = (t) => {
  const p = t.pay || {}
  const last4 = (p.masked || '').replace(/\D/g, '').slice(-4)
  if (t.method === 'card') return p.brand ? `${p.brand.replace('카드', '')} ${last4}`.trim() : '카드'
  if (t.method === 'samsungpay') return `삼성페이 ${last4}`.trim()
  if (t.method === 'coupon') return '쿠폰'
  return METHOD_LABEL[t.method]?.ko || t.method
}

