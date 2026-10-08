import { useState } from 'react'
import { ArrowBigUp, Delete, Globe } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { backspace, typeJamo, SHIFT_KO } from '../flow/hangul.js'
import { COUPON_ALPHABET, formatCoupon } from '../flow/coupon.js'
import { useLang, useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 온스크린 키보드: 한글 두벌식과 영문 쿼티(20칸 그리드, 글자 키 120px), 그리고 쿠폰 코드 키패드(8칸 그리드).
// 한글은 hangul.js가 문자열만으로 조합한다. value와 onChange로 제어한다.
const KO = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
]
const EN = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]
const PUNCT = ['.', '!', '?']

const keyBase = 'ue-press flex items-center justify-center rounded-xl font-ui text-k-btn font-semibold transition-[transform,opacity,background-color] duration-fast ease-out disabled:opacity-40'
const keyTone = 'bg-bg-raised text-text-pri'
const keyFn = 'bg-bg-panel text-text-pri'
const KEY_H = { minHeight: 120 }

export function OnScreenKeyboard({ value, onChange, onDone, disabled }) {
  const t = useT()
  const lang = useLang()
  const [mode, setMode] = useState(lang === 'ko' ? 'ko' : 'en')
  const [shift, setShift] = useState(false)
  const rows = mode === 'ko' ? KO : EN

  const press = (ch) => {
    if (disabled) return
    let nxt
    if (mode === 'ko') nxt = typeJamo(value, shift ? SHIFT_KO[ch] || ch : ch)
    else nxt = value + (shift ? ch.toUpperCase() : ch)
    onChange(nxt)
    if (shift) setShift(false)
  }
  const cell = (span, start) => ({ gridColumn: start ? `${start} / span ${span}` : `span ${span}`, ...KEY_H })

  const letter = (ch, start) => (
    <button key={ch} type="button" disabled={disabled} className={cx(keyBase, keyTone)} style={cell(2, start)} onClick={() => press(ch)}>
      {mode === 'en' && shift ? ch.toUpperCase() : mode === 'ko' && shift ? SHIFT_KO[ch] || ch : ch}
    </button>
  )

  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }} role="group" aria-label={t(mode === 'ko' ? COPY.keyboard.groupKo : COPY.keyboard.groupEn)}>
      {rows[0].map((ch) => letter(ch))}
      {rows[1].map((ch, i) => letter(ch, i === 0 ? 2 : undefined))}
      <span style={{ gridColumn: 'span 1' }} aria-hidden="true" />
      <button type="button" disabled={disabled} aria-pressed={shift} aria-label={t(COPY.keyboard.shift)} className={cx(keyBase, shift ? 'bg-yellow text-text-onYellow' : keyFn)} style={cell(3)} onClick={() => setShift((s) => !s)}>
        <ArrowBigUp size={44} strokeWidth={2.4} aria-hidden="true" />
      </button>
      {rows[2].map((ch) => letter(ch))}
      <button type="button" disabled={disabled} aria-label={t(COPY.keyboard.del)} className={cx(keyBase, keyFn)} style={cell(3)} onClick={() => onChange(mode === 'ko' ? backspace(value) : Array.from(value).slice(0, -1).join(''))}>
        <Delete size={44} strokeWidth={2.4} aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={disabled}
        className={cx(keyBase, keyFn, 'gap-8')}
        style={cell(3)}
        onClick={() => {
          setMode((m) => (m === 'ko' ? 'en' : 'ko'))
          setShift(false)
        }}
      >
        <Globe size={36} strokeWidth={2.4} aria-hidden="true" />
        <span>{mode === 'ko' ? t(COPY.keyboard.toEn) : t(COPY.keyboard.toKo)}</span>
      </button>
      {PUNCT.map((ch) => (
        <button key={ch} type="button" disabled={disabled} className={cx(keyBase, keyTone)} style={cell(2)} onClick={() => !disabled && onChange(value + ch)}>
          {ch}
        </button>
      ))}
      <button type="button" disabled={disabled} className={cx(keyBase, keyTone)} style={cell(8)} onClick={() => !disabled && onChange(value + ' ')}>
        {t(COPY.keyboard.space)}
      </button>
      <button type="button" disabled={disabled} className={cx(keyBase, 'bg-yellow text-text-onYellow')} style={cell(3)} onClick={onDone}>
        {t(COPY.keyboard.enter)}
      </button>
    </div>
  )
}

// 쿠폰 코드 키패드: 코드에 쓰는 32자(I, O, 0, 1 제외)를 8칸 4줄로 놓는다. 값은 UE-XXXX-XXXX 모양으로 정리된다.
export function CodeKeypad({ value, onChange, onApply, disabled, applyLabel, deleteLabel }) {
  const t = useT()
  const raw = value.replace(/^UE-?/, '').replace(/-/g, '')
  const add = (ch) => !disabled && raw.length < 8 && onChange(formatCoupon(raw + ch))
  const del = () => !disabled && onChange(formatCoupon(raw.slice(0, -1)))
  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(8, 120px)' }} role="group" aria-label={t(COPY.pay.codeKeys)}>
      {[...COUPON_ALPHABET].map((ch) => (
        <button key={ch} type="button" disabled={disabled} className={cx(keyBase, keyTone)} style={KEY_H} onClick={() => add(ch)}>
          {ch}
        </button>
      ))}
      <button type="button" disabled={disabled || raw.length === 0} aria-label={deleteLabel} className={cx(keyBase, keyFn)} style={{ gridColumn: 'span 3', ...KEY_H }} onClick={del}>
        <Delete size={44} strokeWidth={2.4} aria-hidden="true" />
      </button>
      <button type="button" disabled={disabled || raw.length < 8} className={cx(keyBase, 'bg-yellow text-text-onYellow')} style={{ gridColumn: 'span 5', ...KEY_H }} onClick={onApply}>
        {applyLabel}
      </button>
    </div>
  )
}
