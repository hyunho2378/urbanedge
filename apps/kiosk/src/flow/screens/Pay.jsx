import { useEffect, useState } from 'react'
import { Banknote, Check, CreditCard, Keyboard, ScanLine, Smartphone, Ticket, X } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { KButton } from '../../components/KButton.jsx'
import { CardReader } from '../../components/CardReader.jsx'
import { StripView } from '../../components/StripView.jsx'
import { CodeKeypad } from '../../components/OnScreenKeyboard.jsx'
import { COPY } from '../copy.js'
import { brandLabel, installmentLabel } from '../payDetails.js'
import { defaultFrameFor, frameById } from '../prints.js'

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

// 상품마다 대표 프레임(카드 썸네일과 주문 내역 미리보기에 쓴다).
const THUMB = { strip4: 'route', grid4: 'classic-white', grid8: 'classic-blue', premium: 'crosswalk' }
const thumbFrame = (p) => frameById(THUMB[p.id]) || defaultFrameFor(p.cuts)

function Products({ ctrl }) {
  const list = (ctrl.products || []).filter((p) => p.enabled)
  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 236, width: 1400 }}>
        <T n={COPY.pay.productTitle} as="h1" className="kt-title" />
        <T n={COPY.pay.productSub} as="p" className="kt-lead mt-16 text-text-sec" />
      </div>
      <div className="absolute grid gap-32" style={{ left: 120, top: 432, width: 1680, gridTemplateColumns: `repeat(${Math.max(1, list.length)}, 1fr)` }} role="group" aria-label={COPY.pay.productTitle.en}>
        {list.map((p) => (
          <button key={p.id} type="button" onClick={() => ctrl.setProduct(p.id)} className="ue-press flex flex-col items-stretch whitespace-normal rounded-xl bg-bg-panel text-left transition-[transform,background-color] duration-fast ease-out" style={{ height: 436, padding: 28 }}>
            <div className="flex items-center justify-center" style={{ height: 200 }} aria-hidden="true">
              <StripView frame={thumbFrame(p)} date={ctrl.date} roomId={ctrl.room} height={200} className="k-lift" />
            </div>
            <T n={p.name} as="span" className="kt-strong mt-20 block" />
            <T n={COPY.pay.cutsPrints} v={{ cuts: p.cuts, prints: p.prints }} as="span" className="kt-caption block text-text-sec" />
            <span className="kt-subhead kt-num mt-8 block">
              <T n={COPY.pay.amount} v={{ price: won(p.price) }} inline />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Fare({ ctrl }) {
  const p = ctrl.product
  const frame = ctrl.frame || (p ? thumbFrame(p) : defaultFrameFor(ctrl.cuts || 4))
  const disc = Math.min(ctrl.pay.discount || 0, ctrl.price)
  const total = Math.max(0, ctrl.price - disc)
  const coupon = ctrl.pay.coupon
  return (
    <div className="absolute" style={{ left: 120, top: 236, width: 600 }}>
      <T n={COPY.pay.order} as="p" className="kt-label text-text-meta" />
      <div className="mt-16 rounded-xl bg-bg-panel" style={{ padding: 32 }}>
        {p ? (
          <div className="flex items-baseline justify-between gap-24">
            <span className="min-w-0">
              <T n={p.name} as="span" className="kt-strong block" />
              <T n={COPY.pay.cutsPrints} v={{ cuts: p.cuts, prints: p.prints }} as="span" className="kt-caption block text-text-meta" />
            </span>
            <span className="kt-strong kt-num shrink-0">{won(p.price)}</span>
          </div>
        ) : null}
        {coupon ? (
          <div className="mt-16 flex items-baseline justify-between gap-24 text-yellow">
            <T n={COPY.pay.discountLine} as="span" className="kt-strong" />
            <span className="kt-strong kt-num">-{won(disc)}</span>
          </div>
        ) : null}
        <div className="mt-24 border-t border-bg-raised pt-24">
          <T n={COPY.pay.total} as="p" className="kt-caption text-text-meta" />
          <p className="kt-headline kt-num mt-4">
            <T n={COPY.pay.amount} v={{ price: won(total) }} inline />
          </p>
        </div>
      </div>
      <div className="relative mt-24" style={{ height: 210 }} aria-hidden="true">
        <div className="absolute" style={{ left: 28, top: 8, transform: 'rotate(-4deg)' }}>
          <StripView frame={frame} date={ctrl.date} roomId={ctrl.room} height={200} className="k-lift opacity-60" />
        </div>
        <div className="absolute" style={{ left: 0, top: 0 }}>
          <StripView frame={frame} date={ctrl.date} roomId={ctrl.room} height={200} className="k-lift" />
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
      {pay.status === 'success' ? (
        <>
          <Receipt ctrl={ctrl} />
          <p className="kt-strong mt-32 flex items-center gap-16 text-yellow">
            <Check size={40} strokeWidth={2.6} aria-hidden="true" />
            <T n={COPY.pay.readerOkCard} inline />
          </p>
        </>
      ) : (
        <div className="mt-24">
          <CardReader ctrl={ctrl} />
        </div>
      )}
    </div>
  )
}

function Cash({ ctrl }) {
  const pct = ctrl.pay.cash
  return (
    <div>
      <T n={COPY.pay.cashTitle} v={{ price: won(Math.max(0, ctrl.price - (ctrl.pay.discount || 0))) }} as="h1" className="kt-headline" />
      <T n={COPY.pay.cashHint} as="p" className="kt-body mt-16 text-text-sec" />
      <div className="relative mt-64 overflow-hidden rounded-pill bg-bg-raised" style={{ width: 880, height: 24 }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)}>
        <div className="absolute inset-0 origin-left bg-yellow transition-transform duration-slow ease-out" style={{ transform: `scaleX(${pct})` }} />
      </div>
      <p className="kt-subhead kt-num mt-24">
        {won(Math.round(Math.max(0, ctrl.price - (ctrl.pay.discount || 0)) * pct))} <span className="kt-body text-text-meta">/ {won(Math.max(0, ctrl.price - (ctrl.pay.discount || 0)))}</span>
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

// 영수증 요약: 상품, 금액, 할인, 결제 금액은 왼쪽 주문 내역이 이미 보여 주므로 여기에는 결제 수단과 시각만 둔다.
function Receipt({ ctrl }) {
  const t = useT()
  const { pay } = ctrl
  const now = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const R = COPY.pay.receipt
  const d = pay.detail || {}
  const lang = ctrl.lang
  const rows = [[R.method, t(R.methods[pay.method] || R.methods.card)]]
  if (d.brand) rows.push([R.issuer, brandLabel(d.brand, lang)], [R.number, d.masked], [R.approval, d.approval], [R.installment, installmentLabel(d.installment, lang)])
  if (d.kind === 'cash') rows.push([R.received, `${won(d.received)}${lang === 'en' ? ' KRW' : '원'}`], [R.change, `${won(d.change)}${lang === 'en' ? ' KRW' : '원'}`])
  if (d.code) rows.push([R.code, d.code])
  rows.push([R.time, hhmm])
  return (
    <dl className="mt-32 rounded-xl bg-bg-panel" style={{ width: 640, padding: '12px 40px' }}>
      {rows.map(([k, v], i) => (
        <div key={i} className="kt-body flex items-baseline justify-between" style={{ height: rows.length > 3 ? 52 : 64 }}>
          <dt className="text-text-sec"><T n={k} inline /></dt>
          <dd className="kt-num m-0">{v}</dd>
        </div>
      ))}
    </dl>
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
  if (!ctrl.product && ctrl.products && ctrl.products.some((p) => p.enabled) && pay.status === 'choose') return <Products ctrl={ctrl} />
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
  } else if (pay.status === 'success') right = (
      <Result ok title={COPY.pay.paidTitle} body={couponUsed ? COPY.pay.paidCoupon : COPY.pay.paidBody}>
        <Receipt ctrl={ctrl} />
      </Result>
    )
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
      <div className="absolute" style={{ left: 840, top: 236, width: 1016 }}>
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
