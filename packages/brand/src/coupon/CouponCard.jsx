import { useEffect, useRef, useState } from 'react'
import { Bi, useLangValue } from '@urbanedge/ds'
import { UEMark } from '../logo/UEMark.jsx'
import { STATION, SYSTEM } from '../print/stations.js'

// CouponCard: 검정과 노랑 승차권형 쿠폰. 색은 디자인시스템 CSS 변수(--ue-*)에서 읽고, 스타일은 인라인이라 앱의 Tailwind 설정과 무관하게 동작한다.
// props: code, title, subtitle, expires, scratch(긁어서 열기), revealed(제어), onReveal(code), className, style. 고정 문구는 Bi로 그린다(LangContext를 따른다).
const LABEL = '"Barlow Condensed", "Pretendard Variable", Pretendard, sans-serif'
const UI = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Helvetica Neue", Arial, sans-serif'
const v = (name, a) => (a == null ? `rgb(var(--ue-${name}))` : `rgb(var(--ue-${name}) / ${a})`)
function ScratchLayer({ onDone, label }) {
  const ref = useRef(null)
  const drawing = useRef(false)
  useEffect(() => {
    const c = ref.current
    const r = c.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = Math.round(r.width * dpr)
    c.height = Math.round(r.height * dpr)
    const g = c.getContext('2d')
    g.scale(dpr, dpr)
    const css = getComputedStyle(document.documentElement)
    const rgb = (n, fb) => `rgb(${(css.getPropertyValue(`--ue-${n}`) || fb).trim().split(' ').join(',')})`
    const yellow = rgb('yellow', '245 197 24')
    const ink = rgb('bg-base', '10 10 10')
    g.fillStyle = yellow
    g.fillRect(0, 0, r.width, r.height)
    g.fillStyle = ink
    for (let x = -r.height; x < r.width + r.height; x += 36) {
      g.beginPath()
      g.moveTo(x, r.height)
      g.lineTo(x + 14, r.height)
      g.lineTo(x + 14 + r.height, 0)
      g.lineTo(x + r.height, 0)
      g.closePath()
      g.fill()
    }
    g.fillStyle = yellow
    const tw = Math.min(r.width * 0.8, 320)
    g.fillRect((r.width - tw) / 2, r.height / 2 - 20, tw, 40)
    g.fillStyle = ink
    g.font = `700 ${Math.max(16, Math.min(22, r.height * 0.28))}px ${LABEL}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(label, r.width / 2, r.height / 2 + 1)
  }, [label])

  const erase = (e) => {
    const c = ref.current
    const r = c.getBoundingClientRect()
    const g = c.getContext('2d')
    g.globalCompositeOperation = 'destination-out'
    g.beginPath()
    g.arc(e.clientX - r.left, e.clientY - r.top, Math.max(18, r.height * 0.22), 0, Math.PI * 2)
    g.fill()
  }
  const measure = () => {
    const c = ref.current
    const g = c.getContext('2d')
    const { width, height } = c
    const data = g.getImageData(0, 0, width, height).data
    let clear = 0
    let total = 0
    for (let i = 3; i < data.length; i += 4 * 61) {
      total++
      if (data[i] < 40) clear++
    }
    if (clear / total > 0.5) onDone()
  }
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      onPointerDown={(e) => {
        drawing.current = true
        e.currentTarget.setPointerCapture?.(e.pointerId)
        erase(e)
      }}
      onPointerMove={(e) => drawing.current && erase(e)}
      onPointerUp={() => {
        drawing.current = false
        measure()
      }}
      onPointerCancel={() => (drawing.current = false)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair', borderRadius: 6 }}
    />
  )
}

export function CouponCard({ code = 'UE-XXXX-XXXX', title = 'UrbanEdge coupon', subtitle, expires, scratch = false, revealed, onReveal, className, style }) {
  const lang = useLangValue()
  const [open, setOpen] = useState(!scratch)
  const shown = revealed ?? open
  const reveal = () => {
    if (shown) return
    setOpen(true)
    onReveal?.(code)
  }
  const notch = (x) =>
    `radial-gradient(circle 15px at ${x} 0, transparent 97%, black) top / 100% 51% no-repeat, radial-gradient(circle 15px at ${x} 100%, transparent 97%, black) bottom / 100% 51% no-repeat`
  return (
    <div
      role="group"
      aria-label={`${title}`}
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        maxWidth: 620,
        aspectRatio: '2.45 / 1',
        minHeight: 200,
        color: v('text-pri'),
        background: v('bg-base'),
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgb(var(--ue-black) / 0.55)',
        WebkitMask: notch('26%'),
        mask: notch('26%'),
        fontFamily: UI,
        ...style,
      }}
    >
      {/* 왼쪽 노랑 스텁 */}
      <div style={{ flex: '0 0 26%', background: v('yellow'), color: v('text-on-yellow'), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '14px 8px' }}>
        <UEMark title="" aria-hidden="true" style={{ width: '56%', height: 'auto', display: 'block' }} />
        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: LABEL, fontWeight: 700, letterSpacing: '0.2em', fontSize: 'clamp(11px, 2.4vw, 15px)' }}>{`${STATION.code} ${STATION.name}`}</div>
        <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 'clamp(13px, 3vw, 20px)', letterSpacing: '0.08em' }}>{SYSTEM.code}</div>
      </div>
      <div aria-hidden="true" style={{ flex: '0 0 0', borderLeft: `3px dashed ${v('text-pri', 0.34)}`, margin: '14px 0' }} />
      {/* 오른쪽 본문 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px 14px 22px', gap: 8 }}>
        <div>
          <div style={{ fontFamily: LABEL, fontWeight: 600, letterSpacing: '0.2em', fontSize: 'clamp(11px, 2.4vw, 14px)', color: v('yellow') }}><Bi en="COUPON" ko="쿠폰" inline /></div>
          <div style={{ fontWeight: 750, fontSize: 'clamp(18px, 4.6vw, 28px)', lineHeight: 1.12, letterSpacing: '-0.03em', textWrap: 'balance' }}>{title}</div>
          {subtitle && <div style={{ fontWeight: 450, fontSize: 'clamp(12px, 2.8vw, 15px)', color: v('text-sec'), marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
        <div style={{ position: 'relative', background: v('bg-raised'), borderRadius: 6, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52 }}>
          <span aria-hidden={!shown} style={{ fontFamily: LABEL, fontWeight: 700, letterSpacing: '0.1em', fontSize: 'clamp(24px, 6.4vw, 40px)', color: v('yellow'), whiteSpace: 'nowrap' }}>
            {code}
          </span>
          {!shown && <ScratchLayer label={lang === 'ko' ? '여기를 긁으세요' : 'SCRATCH HERE'} onDone={reveal} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 20 }}>
          {!shown ? (
            <button type="button" onClick={reveal} style={{ font: `600 13px ${UI}`, color: v('text-pri'), background: 'transparent', border: 0, padding: '4px 0', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
              <Bi en="Reveal code" ko="코드 보기" inline />
            </button>
          ) : (
            <span role="status" style={{ fontWeight: 500, fontSize: 12, color: v('text-meta') }}>
              {expires ? (
                <>
                  <Bi en="Valid until" ko="유효 기간" inline /> {expires}
                </>
              ) : (
                `${STATION.code} ${STATION.name}`
              )}
            </span>
          )}
          <span aria-hidden="true" style={{ fontFamily: LABEL, fontWeight: 600, letterSpacing: '0.2em', fontSize: 11, color: v('text-meta') }}>
            <Bi en="GYEONGJU METRO" ko="경주 메트로" inline />
          </span>
        </div>
      </div>
      {shown && scratch && (
        <span className="sr-only" role="status">
          <Bi en="Code revealed:" ko="코드:" inline /> {code}
        </span>
      )}
    </div>
  )
}
