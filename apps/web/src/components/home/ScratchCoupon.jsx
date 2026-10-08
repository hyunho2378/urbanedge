import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy, Lock } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { SITE } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { markRevealed, useRevealed, useShared } from './rewards.js'
import { useShare } from './kit.jsx'
import { B } from '../../layout/B.jsx'

// CSS 변수(RGB 3채널)를 canvas용 색 문자열로 읽는다. 소스에 색 리터럴을 쓰지 않기 위해서다.
const cssRgb = (name, alpha = 1) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace(/\s+/g, ' ')
  return `rgb(${v.split(' ').join(',')}${alpha < 1 ? `,${alpha}` : ''})`
}

// 스크래치 쿠폰. 공유 시트를 열었다 닫으면 잠금이 풀린다(정직 시스템, 메모리에만 저장).
// 긁기: 포인터와 터치. 키보드와 보조기기: "Reveal" 버튼.
export default function ScratchCoupon({ className }) {
  const pick = usePick()
  const shared = useShared()
  const revealed = useRevealed()
  const canvas = useRef(null)
  const state = useRef({ down: false, last: null, strokes: 0 })
  const [copied, setCopied] = useState(false)
  const share = useShare({ title: SITE.name, text: pick({ en: 'Gyeongju has no subway, so UrbanEdge built a station.', ko: '경주에 지하철이 없어서 어반엣지가 역을 만들었다.' }) })

  const paintFoil = useCallback(() => {
    const c = canvas.current
    if (!c) return
    const r = c.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = Math.round(r.width * dpr)
    c.height = Math.round(r.height * dpr)
    const g = c.getContext('2d')
    g.scale(dpr, dpr)
    g.globalCompositeOperation = 'source-over'
    g.fillStyle = cssRgb('--ue-yellow')
    g.fillRect(0, 0, r.width, r.height)
    g.fillStyle = cssRgb('--ue-bg-base')
    for (let x = -r.height; x < r.width + r.height; x += 36) {
      g.beginPath()
      g.moveTo(x, 0)
      g.lineTo(x + 18, 0)
      g.lineTo(x + 18 - r.height, r.height)
      g.lineTo(x - r.height, r.height)
      g.fill()
    }
    g.fillStyle = cssRgb('--ue-bg-base', 0.88)
    const pw = Math.min(r.width - 32, 260)
    g.fillRect((r.width - pw) / 2, r.height / 2 - 24, pw, 48)
    g.fillStyle = cssRgb('--ue-yellow')
    g.font = '700 16px "Barlow Condensed", sans-serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(pick({ en: 'SCRATCH HERE', ko: '여기를 긁으세요' }), r.width / 2, r.height / 2)
    g.globalCompositeOperation = 'destination-out'
  }, [pick])

  useEffect(() => {
    if (!shared || revealed) return undefined
    paintFoil()
    window.addEventListener('resize', paintFoil)
    return () => window.removeEventListener('resize', paintFoil)
  }, [shared, revealed, paintFoil])

  const cleared = () => {
    const c = canvas.current
    const g = c.getContext('2d')
    const w = 40
    const h = 16
    const tmp = document.createElement('canvas')
    tmp.width = w
    tmp.height = h
    const t = tmp.getContext('2d')
    t.drawImage(c, 0, 0, w, h)
    const d = t.getImageData(0, 0, w, h).data
    let n = 0
    for (let i = 3; i < d.length; i += 4) if (d[i] < 40) n += 1
    void g
    return n / (w * h)
  }

  const scratch = (e) => {
    const c = canvas.current
    if (!c || !state.current.down) return
    const r = c.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const g = c.getContext('2d')
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.lineWidth = 44
    g.beginPath()
    const l = state.current.last || { x, y }
    g.moveTo(l.x, l.y)
    g.lineTo(x, y)
    g.stroke()
    state.current.last = { x, y }
    state.current.strokes += 1
    if (state.current.strokes % 6 === 0 && cleared() > 0.42) markRevealed()
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.coupon.code)
    } catch {
      /* 클립보드가 막힌 환경에서는 표시만 한다 */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className={cx('relative', className)}>
      {/* 쿠폰 본체(잠금 해제 뒤에만 코드가 DOM에 있다) */}
      <div className="relative overflow-hidden rounded-lg bg-black text-text-pri" style={{ minHeight: 148 }}>
        <div className="flex flex-col items-start justify-center gap-4 p-20 md:p-24" style={{ minHeight: 148 }}>
          {shared ? (
            <>
              <p className="t-label text-text-meta"><B v={{ en: 'Kiosk coupon', ko: '키오스크 쿠폰' }} inline /></p>
              <p className="t-title tracking-wide text-yellow" aria-live="polite">
                {revealed ? SITE.coupon.code : pick({ en: 'Scratch to reveal', ko: '긁어서 확인' })}
              </p>
              <p className="t-caption text-text-sec"><B v={{ en: 'Show this code at the kiosk.', ko: '키오스크에서 이 코드를 보여 준다.' }} inline /></p>
            </>
          ) : (
            <>
              <Lock size={22} aria-hidden="true" className="text-text-meta" />
              <p className="t-subhead"><B v={{ en: 'Share the line to unlock a scratch card.', ko: '노선을 공유하면 스크래치 카드가 열린다' }} inline /></p>
              <button type="button" onClick={share.open} className="ue-press mt-8 inline-flex min-h-48 items-center rounded-pill bg-yellow px-24 font-ui text-body-sm font-semibold text-text-onYellow transition-colors duration-fast ease-out hover:bg-yellow-hover">
                <B v={{ en: 'Share to unlock', ko: '공유하고 열기' }} inline />
              </button>
            </>
          )}
        </div>
        {shared && (
          <canvas
            ref={canvas}
            aria-hidden="true"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              state.current.down = true
              state.current.last = null
              scratch(e)
            }}
            onPointerMove={scratch}
            onPointerUp={() => {
              state.current.down = false
              state.current.last = null
              if (cleared() > 0.42) markRevealed()
            }}
            className={cx('absolute inset-0 size-full cursor-crosshair touch-none transition-opacity duration-slow ease-out', revealed && 'pointer-events-none opacity-0')}
          />
        )}
      </div>
      {shared && (
        <div className="mt-12 flex flex-wrap items-center gap-8">
          {!revealed && (
            <button type="button" onClick={markRevealed} className="ue-press inline-flex min-h-48 items-center rounded-pill bg-bg-raised px-20 font-ui text-body-sm font-semibold text-text-pri transition-colors duration-fast ease-out hover:bg-yellow hover:text-text-onYellow">
              <B v={{ en: 'Reveal', ko: '바로 확인' }} inline />
            </button>
          )}
          {revealed && (
            <button type="button" onClick={copy} className="ue-press inline-flex min-h-48 items-center gap-8 rounded-pill bg-bg-raised px-20 font-ui text-body-sm font-semibold text-text-pri transition-colors duration-fast ease-out hover:bg-yellow hover:text-text-onYellow">
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? pick({ en: 'Copied', ko: '복사됨' }) : pick({ en: 'Copy code', ko: '코드 복사' })}
            </button>
          )}
        </div>
      )}
      {share.sheet}
    </div>
  )
}
