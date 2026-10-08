import { useState } from 'react'
import { ArrowBigUp, Delete, Globe } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { backspace, typeJamo, SHIFT_KO } from '../flow/hangul.js'
import { useLang, useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 온스크린 키보드: 한글 두벌식과 영문 쿼티. 20칸 그리드에서 글자 키는 2칸(120px), 기능 키는 3칸 이상이다.
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

const keyBase =
  'ue-press flex min-h-touch items-center justify-center rounded-lg border font-ui text-k-btn font-semibold transition-[transform,opacity,background-color] duration-fast ease-out'
const keyTone = 'border-hairlineStrong bg-bg-raised text-text-pri'
const keyFn = 'border-hairlineStrong bg-bg-panel text-text-pri'

export function OnScreenKeyboard({ value, onChange, onDone, disabled }) {
  const t = useT()
  const lang = useLang()
  const [mode, setMode] = useState(lang === 'en' ? 'en' : 'ko')
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
  const punct = (ch) => !disabled && onChange(value + ch)
  const cell = (span, start) => ({ gridColumn: start ? `${start} / span ${span}` : `span ${span}` })

  const letter = (ch, start) => (
    <button key={ch} type="button" disabled={disabled} className={cx(keyBase, keyTone, 'disabled:opacity-40')} style={cell(2, start)} onClick={() => press(ch)}>
      {mode === 'en' && shift ? ch.toUpperCase() : mode === 'ko' && shift ? SHIFT_KO[ch] || ch : ch}
    </button>
  )

  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }} role="group" aria-label={t(mode === 'ko' ? COPY.keyboard.groupKo : COPY.keyboard.groupEn)}>
      {rows[0].map((ch) => letter(ch))}
      {rows[1].map((ch, i) => letter(ch, i === 0 ? 2 : undefined))}
      <span style={{ gridColumn: 'span 1' }} aria-hidden="true" />
      <button
        type="button"
        disabled={disabled}
        aria-pressed={shift}
        aria-label={t(mode === 'ko' ? COPY.keyboard.shift : COPY.keyboard.shiftEn)}
        className={cx(keyBase, shift ? 'border-yellow bg-yellow text-text-onYellow' : keyFn, 'disabled:opacity-40')}
        style={cell(3)}
        onClick={() => setShift((s) => !s)}
      >
        <ArrowBigUp size={44} strokeWidth={2.5} aria-hidden="true" />
      </button>
      {rows[2].map((ch) => letter(ch))}
      <button
        type="button"
        disabled={disabled}
        aria-label={t(COPY.keyboard.del)}
        className={cx(keyBase, keyFn, 'disabled:opacity-40')}
        style={cell(3)}
        onClick={() => onChange(mode === 'ko' ? backspace(value) : Array.from(value).slice(0, -1).join(''))}
      >
        <Delete size={44} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={disabled}
        className={cx(keyBase, keyFn, 'gap-8 disabled:opacity-40')}
        style={cell(3)}
        onClick={() => {
          setMode((m) => (m === 'ko' ? 'en' : 'ko'))
          setShift(false)
        }}
      >
        <Globe size={36} strokeWidth={2.5} aria-hidden="true" />
        <span>{mode === 'ko' ? t(COPY.keyboard.toEn) : t(COPY.keyboard.toKo)}</span>
      </button>
      {PUNCT.map((ch) => (
        <button key={ch} type="button" disabled={disabled} className={cx(keyBase, keyTone, 'disabled:opacity-40')} style={cell(2)} onClick={() => punct(ch)}>
          {ch}
        </button>
      ))}
      <button type="button" disabled={disabled} className={cx(keyBase, keyTone, 'disabled:opacity-40')} style={cell(8)} onClick={() => punct(' ')}>
        {t(COPY.keyboard.space)}
      </button>
      <button type="button" disabled={disabled} className={cx(keyBase, 'border-yellow bg-yellow text-text-onYellow disabled:opacity-40')} style={cell(3)} onClick={onDone}>
        {t(COPY.keyboard.enter)}
      </button>
    </div>
  )
}
