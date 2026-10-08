import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { CautionTape, cx } from '@urbanedge/ds'
import { UE_MARK_PATH } from '@urbanedge/brand'
import { usePick } from '../../i18n/index.jsx'
import { getVelocity, prefersReducedMotion } from '../../layout/scroll.js'

// 경고 테이프 띠. 글자가 흐르고 스크롤 속도에 따라 빨라진다. 일시정지 버튼, hover 정지, 동작 줄이기 정지(WCAG 2.2.2).
// tone: 'yellow'(노랑 테이프에 검정 글자) | 'black'(검정 띠에 노랑 글자). dir: -1 왼쪽으로, 1 오른쪽으로.
export default function TapeBand({ items, tone = 'yellow', dir = -1, tilt = -1.4, speed = 64, className }) {
  const pick = usePick()
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const wrap = useRef(null)
  const track = useRef(null)
  const group = useRef(null)
  const stop = useRef(false)
  stop.current = paused || hover
  const yellow = tone === 'yellow'
  const text = items.map((i) => pick(i))

  useEffect(() => {
    const el = track.current
    const gr = group.current
    if (!el || !gr || prefersReducedMotion()) return undefined
    let x = dir > 0 ? -gr.offsetWidth : 0
    let last = performance.now()
    let visible = true
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(wrap.current)
    const loop = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      if (visible && !stop.current) {
        const gw = gr.offsetWidth || 1
        const boost = 1 + Math.min(7, Math.abs(getVelocity()) * 0.4)
        x += dir * speed * boost * dt
        if (dir < 0 && x <= -gw) x += gw
        if (dir > 0 && x >= 0) x -= gw
        el.style.transform = `translate3d(${x}px,0,0)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [dir, speed, text.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderGroup = (refProp, hidden, key) => (
    <ul key={key} ref={refProp} aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {text.map((t, i) => (
        <li key={i} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-20 font-label text-h2 font-bold uppercase leading-none tracking-wide md:px-28 3xl:text-h1">{t}</span>
          <svg viewBox="0 0 380 280" aria-hidden="true" className="h-16 w-auto shrink-0 md:h-20">
            <path d={UE_MARK_PATH} fill="currentColor" fillRule="evenodd" />
          </svg>
        </li>
      ))}
    </ul>
  )

  return (
    <div
      ref={wrap}
      className={cx('relative z-10 overflow-hidden py-12 md:py-28', className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={cx('relative', yellow ? 'bg-yellow text-text-onYellow' : 'bg-bg-base text-yellow')}
        style={{ width: '116%', marginLeft: '-8%', transform: `rotate(${tilt}deg)` }}
      >
        <div className="h-8 w-full" aria-hidden="true">
          <CautionTape size={8} />
        </div>
        <p className="sr-only">{text.join('. ')}</p>
        <div className="py-12 md:py-16" aria-hidden="true">
          <div ref={track} className="flex w-max will-change-transform">
            {renderGroup(group, false, 0)}
            {renderGroup(null, true, 1)}
            {renderGroup(null, true, 2)}
            {renderGroup(null, true, 3)}
          </div>
        </div>
        <div className="h-8 w-full" aria-hidden="true">
          <CautionTape size={8} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? pick({ en: 'Play the announcement tape', ko: '안내 테이프 재생' }) : pick({ en: 'Pause the announcement tape', ko: '안내 테이프 일시정지' })}
        className="ue-press absolute right-12 top-1/2 z-10 grid size-48 -translate-y-1/2 place-items-center rounded-pill bg-bg-base text-yellow shadow-lift transition-colors duration-fast ease-out hover:bg-bg-raised"
      >
        {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
      </button>
    </div>
  )
}
