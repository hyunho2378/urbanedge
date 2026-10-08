import { useEffect, useState } from 'react'
import { Banknote, Check, CreditCard, Keyboard, ScanLine, Smartphone, Ticket, X } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { KButton } from '../../components/KButton.jsx'
import { CardReader } from '../../components/CardReader.jsx'
import { StripView } from '../../components/StripView.jsx'
import { CodeKeypad } from '../../components/OnScreenKeyboard.jsx'
import { COPY } from '../copy.js'
import { PRICE } from '../config.js'
import { defaultFrameFor } from '../prints.js'

// 6. pay v3: 왼쪽은 요금(7,000원, 인화 2장, 고른 프레임), 오른쪽은 지금 해야 할 일 하나.
// 수단은 카드, 삼성페이, 현금, 쿠폰 넷이다. 결제는 시뮬레이션이며 각 수단의 행동은 오른쪽 아래 주 버튼 하나로 한다(KioskScreen barConfig).
// 카드와 삼성페이를 처음 고르면 오른쪽 칸 안에 단말기 위치 팁이 열린다(온보딩 두 번째 순간). 닫으면 짧은 안내만 남는다.
const METHODS = [
  { id: 'card', icon: CreditCard },
  { id: 'samsung', icon: Smartphone },
  { id: 'cash', icon: Banknote },
  { id: 'coupon', icon: Ticket },
]
const won = (n) => n.toLocaleString('en-US')

function Fare({ ctrl }) {
  const frame = ctrl.frame || defaultFrameFor(ctrl.cuts || 4)
  const coupon = ctrl.pay.coupon
  return (
    <div className="absolute" style={{ left: 120, top: 236, width: 600 }}>
      <T n={COPY.pay.fare} as="p" className="kt-label text-text-meta" />
      <p className={cx('kt-headline kt-num mt-8', coupon && 'text-text-meta line-through')}>
        <T n={COPY.pay.amount} inline />
      </p>
      <T n={COPY.pay.printsLine} v={{ n: PRICE.prints }} as="p" className="kt-body text-text-sec" />
      {coupon ? <T n={COPY.pay.couponLine} v={{ code: coupon }} as="p" className="kt-strong mt-8 text-yellow" /> : null}
      <div className="relative mt-48" style={{ height: 380 }} aria-hidden="true">
        <div className="absolute" style={{ left: 28, top: 10, transform: 'rotate(-4deg)' }}>
          <StripView frame={frame} date={ctrl.date} roomId={ctrl.room} height={360} className="k-lift opacity-60" />
        </div>
        <div className="absolute" style={{ left: 0, top: 0 }}>
          <StripView frame={frame} date={ctrl.date} roomId={ctrl.room} height={360} className="k-lift" />
        </div>
      </div>
    </div>
  )
}

function Choose({ ctrl }) {
  const t = useT()
  return (
    <div>
      <T n={COPY.pay.title} as="h1" className="kt-headline" />
      <div className="mt-48 grid gap-32" style={{ gridTemplateColumns: 'repeat(2, 460px)' }} role="group" aria-label={t(COPY.pay.methodsLabel)}>
        {METHODS.map((m) => {
          const Icon = m.icon
          const c = COPY.pay.methods[m.id]
          return (
            <button key={m.id} type="button" onClick={() => ctrl.setPayMethod(m.id)} className="ue-press flex flex-col items-start justify-between whitespace-normal rounded-xl bg-bg-panel text-left transition-[transform,background-color] duration-fast ease-out" style={{ height: 230, padding: 40 }}>
              <Icon size={60} strokeWidth={1.8} className="shrink-0 text-yellow" style={{ width: 60, height: 60 }} aria-hidden="true" />
              <span className="block">
                <T n={c.title} as="span" className="kt-subhead block" />
                <T n={c.body} as="span" className="kt-body block text-text-sec" />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Reader({ ctrl }) {
  const { pay } = ctrl
  const samsung = pay.method === 'samsung'
  const title = pay.status === 'success' ? COPY.pay.paidTitle : pay.status === 'processing' ? COPY.pay.processing : samsung ? COPY.pay.samsungTitle : COPY.pay.cardTitle
  return (
    <div>
      <T n={title} as="h1" className="kt-headline" />
      <div className="mt-24">
        <CardReader ctrl={ctrl} />
      </div>
    </div>
  )
}

function Cash({ ctrl }) {
  const pct = ctrl.pay.cash
  return (
    <div>
      <T n={COPY.pay.cashTitle} as="h1" className="kt-headline" />
      <T n={COPY.pay.cashHint} as="p" className="kt-body mt-16 text-text-sec" />
      <div className="relative mt-64 overflow-hidden rounded-pill bg-bg-raised" style={{ width: 880, height: 24 }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)}>
        <div className="absolute inset-0 origin-left bg-yellow transition-transform duration-slow ease-out" style={{ transform: `scaleX(${pct})` }} />
      </div>
      <p className="kt-subhead kt-num mt-24">
        {won(Math.round(PRICE.base * pct))} <span className="kt-body text-text-meta">/ {won(PRICE.base)}</span>
      </p>
    </div>
  )
}

function Coupon({ ctrl }) {
  const { pay } = ctrl
  const t = useT()
  const [code, setCode] = useState('')
  useEffect(() => {
    if (pay.method !== 'coupon') setCode('')
  }, [pay.method])
  const scan = pay.view === 'scan'
  const err = pay.couponError
  const toggle = (
    <button type="button" onClick={() => ctrl.setCouponView(scan ? 'type' : 'scan')} className="ue-press kt-strong mt-24 flex items-center gap-16 text-text-sec" style={{ minHeight: 120 }}>
      {scan ? <Keyboard size={40} strokeWidth={2} aria-hidden="true" /> : <ScanLine size={40} strokeWidth={2} aria-hidden="true" />}
      <T n={scan ? COPY.pay.useType : COPY.pay.useScan} inline />
    </button>
  )
  if (scan) {
    return (
      <div>
        <T n={COPY.pay.couponScanTitle} as="h1" className="kt-headline" />
        <T n={COPY.pay.couponScanHint} as="p" className="kt-body mt-16 text-text-sec" />
        {toggle}
      </div>
    )
  }
  return (
    <div style={{ marginTop: -16 }}>
      <div className={cx('flex flex-col justify-center rounded-xl px-40 transition-colors duration-fast', err ? 'bg-yellow text-text-onYellow' : 'bg-bg-panel')} style={{ height: 120, width: 1016 }} aria-live="polite">
        <span className="kt-subhead kt-num font-label">
          {code || <span className="text-text-meta">{t(COPY.pay.codeEmpty)}</span>}
          {!err && <span className="k-caret ml-8 inline-block bg-yellow align-middle" style={{ width: 4, height: 44 }} aria-hidden="true" />}
        </span>
        {err && <T n={COPY.pay.couponBad} as="span" className="kt-caption" />}
      </div>
      <div className="mt-16">
        <CodeKeypad value={code} onChange={setCode} onApply={() => ctrl.applyCoupon(code)} applyLabel={t(COPY.pay.couponApply)} deleteLabel={t(COPY.pay.del)} />
      </div>
    </div>
  )
}

function Result({ ok, title, body, children }) {
  return (
    <div className="k-pop flex flex-col items-start">
      <span className={cx('grid place-items-center rounded-pill', ok ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-text-pri')} style={{ width: 136, height: 136 }} aria-hidden="true">
        {ok ? <Check size={80} strokeWidth={2.6} /> : <X size={80} strokeWidth={2.6} />}
      </span>
      <T n={title} as="h1" className="kt-title mt-40" />
      <T n={body} as="p" className="kt-lead mt-16 text-text-sec" />
      {children}
    </div>
  )
}

export default function Pay({ ctrl }) {
  const { pay } = ctrl
  const couponUsed = pay.method === 'coupon' && pay.status === 'success'
  const typing = pay.status === 'waiting' && pay.method === 'coupon' && pay.view !== 'scan'
  let right
  const reader = pay.method === 'card' || pay.method === 'samsung'
  if (pay.status === 'choose') right = <Choose ctrl={ctrl} />
  else if (reader && ['waiting', 'processing', 'success'].includes(pay.status)) right = <Reader ctrl={ctrl} />
  else if (pay.status === 'processing') {
    right = (
      <div className="flex flex-col items-start">
        <svg viewBox="0 0 100 100" width="136" height="136" className="k-spin text-yellow" aria-hidden="true">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeOpacity="0.2" />
          <path d="M50 10 A40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <T n={COPY.pay.processing} as="h1" className="kt-title mt-40" />
      </div>
    )
  } else if (pay.status === 'success') right = <Result ok title={COPY.pay.paidTitle} body={couponUsed ? COPY.pay.paidCoupon : COPY.pay.paidBody} />
  else if (pay.status === 'failed') {
    right = (
      <Result ok={false} title={COPY.pay.failTitle} body={COPY.pay.failBody}>
        <KButton tone="soft" onClick={ctrl.payRetry} className="mt-40">
          <T n={COPY.pay.retry} inline />
        </KButton>
      </Result>
    )
  } else if (pay.method === 'cash') right = <Cash ctrl={ctrl} />
  else right = <Coupon ctrl={ctrl} />

  return (
    <div className="absolute inset-0 bg-bg-base">
      <Fare ctrl={ctrl} />
      <div className="absolute" style={{ left: 840, top: typing ? 236 : 240, width: 1016 }}>
        {right}
      </div>
      {typing ? (
        <div className="absolute" style={{ left: 120, bottom: 190 }}>
          <button type="button" onClick={() => ctrl.setCouponView('scan')} className="ue-press kt-strong flex items-center gap-16 text-text-sec" style={{ minHeight: 120 }}>
            <ScanLine size={40} strokeWidth={2} aria-hidden="true" />
            <T n={COPY.pay.useScan} inline />
          </button>
        </div>
      ) : null}
    </div>
  )
}
