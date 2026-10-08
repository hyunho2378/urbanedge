import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { cx } from './cx.js'

// 흐르는 문구. WCAG 2.2.2에 따라 일시정지 버튼과 hover 정지를 제공하고, 동작 줄이기에서는 정지한다.
export function Marquee({ items, pauseLabel = 'Pause', playLabel = 'Play', className }) {
  const [paused, setPaused] = useState(false)
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center gap-40 pr-40" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className="ue-label flex items-center gap-40 text-h3 text-text-pri">
          <span>{t}</span>
          <span aria-hidden="true" className="text-yellow">‡</span>
        </li>
      ))}
    </ul>
  )
  return (
    <div className={cx('relative flex items-center border-y border-hairline', className)}>
      <div className="group min-w-0 flex-1 overflow-hidden py-20" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div
          className="flex w-max animate-marquee will-change-transform motion-reduce:animate-none"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        >
          {row(false)}
          {row(true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? playLabel : pauseLabel}
        className="ue-press mx-16 grid size-40 shrink-0 place-items-center rounded-pill border border-hairlineStrong text-text-pri hover:border-yellow hover:text-yellow"
      >
        {paused ? <Play size={16} /> : <Pause size={16} />}
      </button>
    </div>
  )
}
