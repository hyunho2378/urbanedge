import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { CautionTape, cx } from '@urbanedge/ds'
import { Tx, useV } from './Bilingual.jsx'
import { useReducedMotion } from './hooks.js'

// 경고 테이프 띠: 노랑 바탕에 검정 글자가 흐른다. 스크롤이 빠를수록 빨리 흐르고, 일시정지 버튼이 있다(WCAG 2.2.2).
// items: [{ en, ko }]. 모든 문구는 Bi라서 언어를 바꿔도 띠의 폭과 높이가 변하지 않는다. 동작 줄이기에서는 흐르지 않는다.
export function Tape({ items, pause, play, className, tilt = true }) {
  const track = useRef(null)
  const anim = useRef(null)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const v = useV()

  useEffect(() => {
    const el = track.current
    if (!el || reduce || !el.animate) return undefined
    const a = el.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-50%,0,0)' }], { duration: 52000, iterations: Infinity, easing: 'linear' })
    anim.current = a
    let last = window.scrollY
    let rate = 1
    let raf = 0
    const tick = () => {
      const y = window.scrollY
      const target = 1 + Math.min(Math.abs(y - last) / 6, 7)
      last = y
      rate += (target - rate) * 0.12
      if (Math.abs(rate - a.playbackRate) > 0.02) a.playbackRate = rate
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      a.cancel()
    }
  }, [reduce])

  useEffect(() => {
    const a = anim.current
    if (!a) return
    if (paused) a.pause()
    else a.play()
  }, [paused, reduce])

  const row = (hidden) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-24 whitespace-nowrap pr-24 font-label text-h3 font-bold uppercase leading-none tracking-wide">
          <Tx inline {...t} />
          <span aria-hidden="true">‡</span>
        </li>
      ))}
    </ul>
  )

  return (
    <div className={cx('relative overflow-hidden py-16', className)} role="region" aria-label={v(items[0])}>
      <div className={cx('relative bg-yellow text-text-onYellow', tilt && '-rotate-1 scale-x-105')}>
        <div className="h-8 w-full" aria-hidden="true">
          <CautionTape size={8} />
        </div>
        <div className="flex items-center py-12">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div ref={track} className="flex w-max will-change-transform">
              {row(false)}
              {row(true)}
            </div>
          </div>
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={v(paused ? play : pause)}
              aria-pressed={paused}
              className="ue-press relative z-sticky mx-12 grid size-48 shrink-0 place-items-center rounded-pill bg-bg-base text-yellow"
            >
              {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
            </button>
          )}
        </div>
        <div className="h-8 w-full" aria-hidden="true">
          <CautionTape size={8} />
        </div>
      </div>
    </div>
  )
}
