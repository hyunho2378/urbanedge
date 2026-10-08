import { useEffect, useRef } from 'react'
import { T } from './lang.jsx'
import { COPY } from '../flow/copy.js'
import { KButton } from './KButton.jsx'

// 무입력 안내: 계속하기 또는 처음으로. 남은 초는 숫자로 보여 준다.
export function IdleDialog({ secondsLeft, onKeep, onHome }) {
  const keepRef = useRef(null)
  useEffect(() => {
    keepRef.current?.focus()
  }, [])
  return (
    <div className="absolute inset-0 z-modal grid place-items-center bg-scrim" onPointerDown={onKeep}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-body" onPointerDown={(e) => e.stopPropagation()} className="k-pop k-lift flex flex-col items-center gap-24 rounded-xl bg-yellow px-80 py-64 text-center text-text-onYellow" style={{ width: 1060 }}>
        <h2 id="idle-title" className="kt-title">
          <T n={COPY.idle.title} />
        </h2>
        <p id="idle-body" className="kt-lead">
          <T n={COPY.idle.body} v={{ sec: secondsLeft }} />
        </p>
        <div className="mt-16 flex gap-16">
          <KButton ref={keepRef} tone="ink" onClick={onKeep}>
            <T n={COPY.idle.keep} inline />
          </KButton>
          <KButton tone="ghostInk" onClick={onHome}>
            <T n={COPY.idle.home} inline />
          </KButton>
        </div>
      </div>
    </div>
  )
}
