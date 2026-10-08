import { useEffect, useRef } from 'react'
import { useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'
import { TouchButton } from './TouchButton.jsx'

// 무입력 안내 대화상자: 계속하기 또는 처음으로. 남은 초는 숫자로 보여 준다(움직이는 타이머 없음).
export function IdleDialog({ secondsLeft, onKeep, onHome }) {
  const t = useT()
  const keepRef = useRef(null)
  useEffect(() => {
    keepRef.current?.focus()
  }, [])
  return (
    <div className="absolute inset-0 z-modal grid place-items-center bg-scrim" onPointerDown={onKeep}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        aria-describedby="idle-body"
        onPointerDown={(e) => e.stopPropagation()}
        className="flex w-3/5 animate-pop-in flex-col items-center gap-32 rounded-xl border border-yellow bg-bg-panel px-64 py-64 text-center shadow-lift"
      >
        <h2 id="idle-title" className="font-display text-k-h2 font-black leading-tight tracking-tightest">
          {t(COPY.idle.title)}
        </h2>
        <p className="font-display text-k-title font-black leading-none tracking-tightest text-yellow" aria-hidden="true">
          {secondsLeft}
        </p>
        <p id="idle-body" className="text-k-body text-text-sec">
          {t(COPY.idle.body, { sec: secondsLeft })}
        </p>
        <div className="flex gap-24">
          <TouchButton ref={keepRef} variant="primary" onClick={onKeep}>
            {t(COPY.idle.keep)}
          </TouchButton>
          <TouchButton variant="outline" onClick={onHome}>
            {t(COPY.idle.home)}
          </TouchButton>
        </div>
      </div>
    </div>
  )
}
