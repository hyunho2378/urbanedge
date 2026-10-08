import { useRef, useState } from 'react'
import { T, useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'
import './card-reader.css'

// CardReader: 결제 단계의 카드 투입 장면(1920x1080 캔버스 단위 px).
// 카드: 아래 IC 투입구로 끌어 내리거나 누르면 미끄러져 들어가고, LED가 깜박이며 읽은 뒤 승인되면 다시 올라온다.
// 삼성페이: 휴대폰을 단말기 위로 끌어 내리거나 누르면 단말기에 닿고 파동이 퍼진다.
// 상태는 컨트롤러가 정한다: pay.reader(null | 'in' | 'out'), pay.status('waiting' | 'processing' | 'success').
// 동작 줄이기 설정이면 card-reader.css가 전환을 끈다(상태만 즉시 바뀐다).

const W = 620 // 장면 너비
const SLOT_Y = 360 // 투입구 선의 y
const CARD = { w: 200, h: 317 }
const PHONE = { w: 156, h: 300 }
const CARD_IN = SLOT_Y - CARD.h + 210 // 꽂힌 상태의 이동 거리(카드 위쪽 107px만 보인다)
const PHONE_IN = 150 // 휴대폰이 단말기 패드에 닿는 이동 거리
const COMMIT = 90 // 이만큼 끌어 내리면 꽂힌 것으로 본다

function CardFace() {
  return (
    <svg viewBox="0 0 200 317" width={CARD.w} height={CARD.h} aria-hidden="true" className="block">
      <defs>
        <linearGradient id="cr-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2a28" />
          <stop offset="1" stopColor="#0d0d0c" />
        </linearGradient>
        <linearGradient id="cr-chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3d27a" />
          <stop offset="1" stopColor="#b8892e" />
        </linearGradient>
      </defs>
      <rect width="200" height="317" rx="14" fill="url(#cr-card)" />
      <rect x="0" y="0" width="200" height="317" rx="14" fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="1.5" />
      <rect x="0" y="66" width="200" height="16" fill="rgb(var(--ue-yellow))" />
      <text x="20" y="44" fill="#fff" fontFamily="Pretendard Variable, Pretendard, sans-serif" fontSize="20" fontWeight="700" letterSpacing="-0.3">UrbanEdge</text>
      <text x="20" y="128" fill="rgb(255 255 255 / 0.62)" fontFamily="Barlow Condensed, sans-serif" fontSize="15" fontWeight="600" letterSpacing="2">METRO CARD</text>
      <g transform="translate(150 118)" fill="none" stroke="rgb(255 255 255 / 0.75)" strokeWidth="2.4" strokeLinecap="round">
        <path d="M0 -10 A12 12 0 0 1 0 10" />
        <path d="M6 -16 A20 20 0 0 1 6 16" />
        <path d="M12 -22 A28 28 0 0 1 12 22" />
      </g>
      <text x="20" y="214" fill="#fff" fontFamily="Barlow Condensed, sans-serif" fontSize="22" fontWeight="600" letterSpacing="2.5">4026 0000 2026</text>
      <text x="20" y="238" fill="rgb(255 255 255 / 0.55)" fontFamily="Barlow Condensed, sans-serif" fontSize="14" fontWeight="600" letterSpacing="1.5">GY-01  10/30</text>
      {/* IC 칩: 투입구로 먼저 들어가는 아래쪽 끝 */}
      <g transform="translate(64 256)">
        <rect width="72" height="50" rx="9" fill="url(#cr-chip)" />
        <path d="M0 17 H24 M0 33 H24 M48 17 H72 M48 33 H72 M24 0 V50 M48 0 V50 M24 25 H48" stroke="#7a5a1c" strokeWidth="1.6" fill="none" />
      </g>
    </svg>
  )
}

function PhoneFace() {
  return (
    <svg viewBox="0 0 156 300" width={PHONE.w} height={PHONE.h} aria-hidden="true" className="block">
      <rect width="156" height="300" rx="26" fill="#121211" stroke="rgb(255 255 255 / 0.22)" strokeWidth="2" />
      <rect x="8" y="8" width="140" height="284" rx="20" fill="#1d1d1b" />
      <rect x="62" y="16" width="32" height="8" rx="4" fill="#000" />
      <rect x="20" y="96" width="116" height="74" rx="10" fill="#2a2a28" stroke="rgb(255 255 255 / 0.16)" />
      <rect x="20" y="114" width="116" height="9" fill="rgb(var(--ue-yellow))" />
      <text x="28" y="108" fill="#fff" fontFamily="Pretendard Variable, Pretendard, sans-serif" fontSize="11" fontWeight="700">UrbanEdge</text>
      <rect x="34" y="200" width="88" height="34" rx="17" fill="rgb(255 255 255 / 0.12)" />
      <text x="78" y="222" textAnchor="middle" fill="#fff" fontFamily="Pretendard Variable, Pretendard, sans-serif" fontSize="13" fontWeight="600">Pay</text>
    </svg>
  )
}

export function CardReader({ ctrl }) {
  const t = useT()
  const { pay } = ctrl
  const phone = pay.method === 'samsung'
  const size = phone ? PHONE : CARD
  const inDist = phone ? PHONE_IN : CARD_IN
  const [drag, setDrag] = useState(null) // 끌고 있는 거리(캔버스 px) 또는 null
  const start = useRef(null)
  const moved = useRef(false)

  const waiting = pay.status === 'waiting' && !pay.reader
  const reading = pay.reader === 'in' || pay.status === 'processing'
  const ok = pay.status === 'success'
  const state = ok ? 'ok' : reading ? 'reading' : 'idle'

  // 카드 위치: 기다릴 때 0, 끄는 중이면 손가락 위치, 꽂히면 inDist, 승인 뒤 카드는 다시 위로(-8), 휴대폰은 떨어진다.
  let y = 0
  if (drag != null) y = drag
  else if (pay.reader === 'in' || pay.status === 'processing') y = inDist
  else if (ok) y = phone ? 0 : -8

  const insert = () => {
    if (waiting) ctrl.payTap(true)
  }
  const onPointerDown = (e) => {
    if (!waiting) return
    const r = e.currentTarget.getBoundingClientRect()
    start.current = { y: e.clientY, scale: r.height / size.h }
    moved.current = false
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!start.current) return
    const dy = (e.clientY - start.current.y) / start.current.scale
    if (Math.abs(dy) > 6) moved.current = true
    if (moved.current) setDrag(Math.max(0, Math.min(inDist, dy)))
  }
  const onPointerUp = (e) => {
    if (!start.current) return
    const dy = (e.clientY - start.current.y) / start.current.scale
    start.current = null
    setDrag(null)
    if (moved.current && dy >= COMMIT) insert()
  }
  const onClick = () => {
    if (moved.current) {
      moved.current = false
      return
    }
    insert()
  }

  const left = (W - size.w) / 2
  const status = ok ? (phone ? COPY.pay.readerOkPhone : COPY.pay.readerOkCard) : reading ? COPY.pay.reading : phone ? COPY.pay.phoneHint : COPY.pay.cardHint

  return (
    <div className={`cr cr--${state} ${phone ? 'cr--phone' : 'cr--card'}`} style={{ width: W, height: 540 }}>
      {/* 단말기 몸체 */}
      <div className="cr-body" style={{ left: 0, top: SLOT_Y - 20, width: W, height: 140 }} aria-hidden="true">
        <span className="cr-led" />
        <span className="cr-label kt-label">{phone ? 'TAP' : 'IC'}</span>
        {phone && (
          <span className="cr-pad">
            <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
              <path d="M16 14 A14 14 0 0 1 16 34" />
              <path d="M23 9 A21 21 0 0 1 23 39" />
              <path d="M30 4 A28 28 0 0 1 30 44" />
            </svg>
          </span>
        )}
        {phone && reading && <span className="cr-wave" />}
      </div>

      {/* 카드나 휴대폰. 카드는 투입구 선 아래가 잘려 보이도록 감싼다. */}
      <div className="cr-mask" style={{ left: 0, top: -60, width: W, height: phone ? 600 : SLOT_Y + 60 }}>
        <button
          type="button"
          className={`cr-item ${drag != null ? 'cr-item--drag' : ''} ${waiting && drag == null ? 'cr-item--hint' : ''}`}
          style={{ left, top: 60, width: size.w, height: size.h, transform: `translate3d(0, ${y}px, 0)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            start.current = null
            setDrag(null)
          }}
          onClick={onClick}
          disabled={!waiting}
          aria-label={t(phone ? COPY.pay.phoneAria : COPY.pay.cardAria)}
        >
          {phone ? <PhoneFace /> : <CardFace />}
        </button>
      </div>

      {/* 투입구: 카드 위에 그려져 카드가 안으로 들어가 보이게 한다 */}
      {!phone && <span className="cr-slot" style={{ left: (W - 300) / 2, top: SLOT_Y - 8, width: 300, height: 16 }} aria-hidden="true" />}

      <p className="cr-status kt-strong" aria-live="polite" style={{ top: SLOT_Y + 140, width: W }}>
        <T n={status} inline />
      </p>
    </div>
  )
}
