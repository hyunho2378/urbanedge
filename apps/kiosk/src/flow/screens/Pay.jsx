import { useEffect, useState } from 'react'
import { Banknote, CreditCard, Check, Keyboard, ScanLine, Ticket, X, ArrowDownRight } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { KButton } from '../../components/KButton.jsx'
import { CodeKeypad } from '../../components/OnScreenKeyboard.jsx'
import { COPY } from '../copy.js'
import { PRICE } from '../config.js'

// 6. pay: 결제 수단 고르기와 결제. 왼쪽은 영수증 같은 요약, 오른쪽은 수단 세 줄이다.
// 수단을 고르면 오른쪽이 그 수단의 안내로 바뀌고, 결제가 끝나면 잠시 뒤 포즈 안내로 넘어간다(시뮬레이션이며 실제로 결제되지 않는다).
const METHODS = [
  { id: 'card', icon: CreditCard, node: COPY.pay.methods.card },
  { id: 'cash', icon: Banknote, node: COPY.pay.methods.cash },
  { id: 'coupon', icon: Ticket, node: COPY.pay.methods.coupon },
]
const won = (n) => n.toLocaleString('en-US')

function Summary({ coupon }) {
  const due = coupon ? 0 : PRICE.base
  return (
    <div className="rounded-xl bg-bg-raised" style={{ width: 720, padding: 48 }}>
      <div className="flex items-baseline justify-between gap-24">
        <T n={COPY.pay.sessionLine} as="span" className="kt-body" />
        <span className="kt-body kt-num">{won(PRICE.base)}</span>
      </div>
      <T n={COPY.pay.printsLine} v={{ n: PRICE.prints }} as="p" className="kt-body mt-4 text-text-sec" />
      {coupon && (
        <div className="mt-20 flex items-baseline justify-between gap-24 text-yellow">
          <T n={COPY.pay.couponLine} v={{ code: coupon }} as="span" className="kt-body" />
          <span className="kt-body kt-num">-{won(PRICE.base)}</span>
        </div>
      )}
      <div className="mt-28 h-4 rounded-pill bg-text-pri/15" aria-hidden="true" />
      <div className="mt-24 flex items-end justify-between gap-24">
        <T n={COPY.pay.total} as="span" className="kt-strong" />
        <span className="kt-headline kt-num">{won(due)}</span>
      </div>
      <T n={{ en: 'KRW', ko: '원' }} as="p" className="kt-caption text-right text-text-meta" />
    </div>
  )
}

function Row({ m, onPick, coach }) {
  const Icon = m.icon
  return (
    <button type="button" onClick={onPick} data-coach={coach} className="ue-press flex w-full items-center gap-36 rounded-xl bg-bg-raised text-left transition-[transform,opacity,background-color] duration-fast ease-out" style={{ minHeight: 176, padding: '28px 48px' }}>
      <span className="grid shrink-0 place-items-center rounded-pill bg-yellow text-text-onYellow" style={{ width: 96, height: 96 }}>
        <Icon size={52} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="block min-w-0 flex-1">
        <T n={m.node.title} as="span" className="kt-subhead" />
        <T n={m.node.body} as="span" className="kt-body text-text-sec" />
      </span>
    </button>
  )
}

function Spinner() {
  return (
    <svg viewBox="0 0 100 100" width="160" height="160" className="animate-spin text-yellow" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" strokeOpacity="0.25" />
      <path d="M50 10 A40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
    </svg>
  )
}

function Result({ ok, title, body, children }) {
  return (
    <div className="k-pop flex flex-col items-start gap-24">
      <span className={cx('grid place-items-center rounded-pill', ok ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised text-yellow')} style={{ width: 160, height: 160 }} aria-hidden="true">
        {ok ? <Check size={96} strokeWidth={3.2} /> : <X size={96} strokeWidth={3.2} />}
      </span>
      <T n={title} as="h2" className="kt-title" />
      <T n={body} as="p" className="kt-lead text-text-sec" />
      {children}
    </div>
  )
}

function CardPanel({ ctrl }) {
  return (
    <div>
      <T n={COPY.pay.terminalTitle} as="h2" className="kt-headline" />
      <T n={COPY.pay.terminalBody} as="p" className="kt-lead mt-16 text-text-sec" />
      <div className="mt-28 flex items-center gap-20 text-yellow">
        <ArrowDownRight size={72} strokeWidth={2.6} className="k-nudge" aria-hidden="true" />
        <T n={COPY.pay.terminalHint} as="span" className="kt-strong" />
      </div>
      <div className="mt-40 flex flex-col items-start gap-8">
        <KButton onClick={() => ctrl.payTap(true)}>
          <T n={COPY.pay.demoTap} inline />
        </KButton>
        <button type="button" className="kt-body min-h-touch text-text-sec underline underline-offset-8" onClick={() => ctrl.payTap(false)}>
          <T n={COPY.pay.demoDecline} inline />
        </button>
      </div>
    </div>
  )
}

function CashPanel({ ctrl }) {
  const pct = ctrl.pay.cash
  return (
    <div>
      <T n={COPY.pay.cashTitle} as="h2" className="kt-headline" />
      <T n={COPY.pay.cashBody} as="p" className="kt-lead mt-16 text-text-sec" />
      <div className="relative mt-48 overflow-hidden rounded-pill bg-bg-raised" style={{ width: 800, height: 56 }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)}>
        <div className="absolute inset-0 origin-left bg-yellow transition-transform duration-slow ease-out" style={{ transform: `scaleX(${pct})` }} />
      </div>
      <p className="kt-headline kt-num mt-20">
        {won(Math.round(PRICE.base * pct))} <span className="kt-lead text-text-meta">/ {won(PRICE.base)}</span>
      </p>
      <div className="mt-28">
        <KButton onClick={ctrl.payCash}>
          <T n={COPY.pay.cashDemo} inline />
        </KButton>
      </div>
    </div>
  )
}

function CouponPanel({ ctrl }) {
  const { pay } = ctrl
  const t = useT()
  const [code, setCode] = useState('')
  useEffect(() => {
    if (pay.method !== 'coupon') setCode('')
  }, [pay.method])
  const scan = pay.view === 'scan'
  const err = pay.couponError
  return (
    <div style={{ marginTop: -12 }}>
      <div className="flex items-start gap-16">
        {scan ? (
          <T n={COPY.pay.couponBody} as="p" className="kt-lead" />
        ) : (
          <div className={cx('flex flex-col justify-center rounded-xl px-40 transition-colors duration-fast', err ? 'bg-yellow text-text-onYellow' : 'bg-bg-raised')} style={{ height: 120, width: 880 }} aria-live="polite">
            <span className="kt-subhead kt-num font-label tracking-wide">
              {code || <span className="text-text-meta">{t(COPY.pay.codeEmpty)}</span>}
              {!err && <span className="k-caret ml-8 inline-block bg-yellow align-middle" style={{ width: 6, height: 44 }} aria-hidden="true" />}
            </span>
            {err && <T n={COPY.pay.couponBad} as="span" className="kt-caption" />}
          </div>
        )}
        <button
          type="button"
          onClick={() => ctrl.setCouponView(scan ? 'type' : 'scan')}
          aria-label={t(scan ? COPY.pay.useType : COPY.pay.useScan)}
          className="ue-press grid shrink-0 place-items-center rounded-xl bg-bg-raised text-yellow"
          style={{ width: 120, height: 120, marginLeft: scan ? 'auto' : 0 }}
        >
          {scan ? <Keyboard size={56} strokeWidth={2.2} aria-hidden="true" /> : <ScanLine size={56} strokeWidth={2.2} aria-hidden="true" />}
        </button>
      </div>
      {scan ? (
        <div className="mt-28">
          <div className="relative grid place-items-center overflow-hidden rounded-xl bg-bg-raised" style={{ width: 1016, height: 320 }}>
            <ScanLine size={140} strokeWidth={1.6} className="k-breathe text-yellow" aria-hidden="true" />
            <T n={COPY.pay.scanning} as="span" className="kt-strong absolute bottom-24" />
          </div>
          <div className="mt-24">
            <KButton onClick={() => ctrl.applyCoupon(ctrl.demoCoupon)}>
              <T n={COPY.pay.couponScan} inline />
            </KButton>
          </div>
        </div>
      ) : (
        <div className="mt-12">
          <CodeKeypad value={code} onChange={setCode} onApply={() => ctrl.applyCoupon(code)} applyLabel={t(COPY.pay.couponApply)} deleteLabel={t(COPY.pay.del)} />
        </div>
      )}
    </div>
  )
}

export default function Pay({ ctrl }) {
  const { pay } = ctrl
  const couponUsed = pay.method === 'coupon' && pay.status === 'success'
  let right
  if (pay.status === 'choose') {
    right = (
      <div className="flex flex-col gap-24" style={{ width: 960 }} role="group" aria-label={COPY.pay.title.en}>
        {METHODS.map((m, i) => (
          <Row key={m.id} m={m} onPick={() => ctrl.setPayMethod(m.id)} coach={i === 2 ? 'pay' : undefined} />
        ))}
      </div>
    )
  } else if (pay.status === 'processing') {
    right = (
      <div className="flex flex-col items-start gap-24">
        <Spinner />
        <T n={COPY.pay.processing} as="h2" className="kt-title" />
      </div>
    )
  } else if (pay.status === 'success') {
    right = <Result ok title={COPY.pay.paidTitle} body={couponUsed ? COPY.pay.paidCoupon : COPY.pay.paidBody} />
  } else if (pay.status === 'failed') {
    right = (
      <Result ok={false} title={COPY.pay.failTitle} body={COPY.pay.failBody}>
        <KButton onClick={ctrl.payRetry}>
          <T n={COPY.pay.retry} inline />
        </KButton>
      </Result>
    )
  } else if (pay.method === 'card') right = <CardPanel ctrl={ctrl} />
  else if (pay.method === 'cash') right = <CashPanel ctrl={ctrl} />
  else right = <CouponPanel ctrl={ctrl} />

  return (
    <div className="k-tiles absolute inset-0">
      <div className="absolute" style={{ left: 64, top: 172, width: 760 }}>
        <T n={COPY.pay.title} as="h1" className="kt-title" />
      </div>
      <div className="absolute" style={{ left: 64, top: 456 }}>
        <Summary coupon={pay.coupon} />
        <T n={COPY.pay.demoNote} as="p" className="kt-caption mt-20 text-text-meta" />
      </div>
      <div className="absolute" style={{ left: 840, top: pay.status === 'waiting' && pay.method === 'coupon' ? 172 : 184, width: 1016 }}>
        {right}
      </div>
    </div>
  )
}
