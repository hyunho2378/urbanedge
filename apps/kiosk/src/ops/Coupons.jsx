// ops/Coupons.jsx: 제휴처 일일 코드, 1회용 코드 묶음, 웹사이트 스크래치 쿠폰 안내.
// 코드는 모두 UE-XXXX-XXXX 형식이고 키오스크의 기존 체크섬 검사를 통과한다(flow/coupon.js makeCoupon).
// 제휴처 코드는 '제휴처 이름 + 날짜'에서 결정적으로 만들어져 매일 바뀌고, 같은 날에는 누가 만들어도 같다.
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { COUPON_ALPHABET, makeCoupon } from '../flow/coupon.js'
import { ops, today, useOps } from './store.js'
import { Switch, useL, won } from './ui.jsx'

function hash(str) {
  let h = 2166136261
  for (const ch of str) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}
function sevenFrom(seed) {
  let h = seed >>> 0
  let out = ''
  for (let i = 0; i < 7; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    h = (h + 0x9e3779b9) >>> 0
    out += COUPON_ALPHABET[h % 32]
  }
  return out
}
export const dailyCode = (partner, date = today()) => makeCoupon(sevenFrom(hash(`${partner}|${date}`)))
const randomCode = () => makeCoupon(sevenFrom((Math.random() * 2 ** 32) >>> 0))

export default function Coupons() {
  const L = useL()
  const coupons = useOps((s) => s.coupons)
  const price = useOps((s) => s.price)
  const [partner, setPartner] = useState('올리브 카페')
  const [discount, setDiscount] = useState(1000)
  const [batchN, setBatchN] = useState(10)
  const [batchD, setBatchD] = useState(price)
  const [copied, setCopied] = useState(false)

  const code = dailyCode(partner.trim() || 'partner')
  const registered = coupons.find((c) => c.code === code)

  const issueDaily = () => {
    if (registered) return
    ops.addCoupon({ code, label: partner.trim(), kind: 'daily', discount, date: today(), maxUses: 0 })
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  const issueBatch = () => {
    const n = Math.max(1, Math.min(50, batchN))
    for (let i = 0; i < n; i++) ops.addCoupon({ code: randomCode(), label: L('Single-use', '1회용'), kind: 'single', discount: batchD, maxUses: 1 })
  }

  return (
    <div className="op-stack">
      <div className="op-grid-2">
        <section className="op-card" aria-label={L('Partner daily code', '제휴처 일일 코드')}>
          <h3 className="op-h3">{L('Partner daily code', '제휴처 일일 코드')}</h3>
          <p className="op-meta">{L('A new code every day from the partner name and date. Print it at the bottom of the partner receipt; no one has to change anything by hand.', '제휴처 이름과 날짜로 매일 새 코드가 나온다. 제휴처 영수증 하단에 넣으면 되고 손으로 바꿀 필요가 없다.')}</p>
          <div className="op-form">
            <label className="op-field">
              <span>{L('Partner', '제휴처')}</span>
              <input value={partner} onChange={(e) => setPartner(e.target.value)} />
            </label>
            <label className="op-field">
              <span>{L('Discount (KRW)', '할인 금액(원)')}</span>
              <input type="number" min={500} step={500} value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
            </label>
          </div>
          <div className="op-code-box">
            <span className="op-code" aria-label={L('Today’s code', '오늘의 코드')}>
              {code}
            </span>
            <button type="button" className="op-icon-btn" onClick={copy} aria-label={L('Copy code', '코드 복사')}>
              {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            </button>
          </div>
          <p className="op-meta op-num">
            {today()} · {won(discount)} {L('off', '할인')}
          </p>
          <div className="op-receipt op-receipt-mini" aria-label={L('Receipt footer preview', '영수증 하단 미리보기')}>
            <p className="op-receipt-c">{partner.trim() || L('Partner', '제휴처')}</p>
            <hr />
            <p className="op-receipt-c">{L('UrbanEdge photo coupon', '어반엣지 사진관 할인')} {won(discount)}</p>
            <p className="op-receipt-c op-receipt-total">{code}</p>
            <p className="op-receipt-c">{L('Today only · enter on the kiosk', '오늘만 사용 · 키오스크에 입력')}</p>
          </div>
          <button type="button" className="op-btn" onClick={issueDaily} disabled={!!registered}>
            {registered ? L('Active today', '오늘 사용 중') : L('Activate today’s code', '오늘 코드 등록')}
          </button>
        </section>

        <section className="op-card" aria-label={L('Single-use codes', '1회용 코드 묶음')}>
          <h3 className="op-h3">{L('Single-use codes', '1회용 코드 묶음')}</h3>
          <p className="op-meta">{L('Each code works once. Use them for events or apology vouchers.', '코드마다 한 번만 쓸 수 있다. 이벤트나 사과 쿠폰에 쓴다.')}</p>
          <div className="op-form">
            <label className="op-field">
              <span>{L('How many', '개수')}</span>
              <input type="number" min={1} max={50} value={batchN} onChange={(e) => setBatchN(Number(e.target.value) || 1)} />
            </label>
            <label className="op-field">
              <span>{L('Discount (KRW)', '할인 금액(원)')}</span>
              <input type="number" min={500} step={500} value={batchD} onChange={(e) => setBatchD(Number(e.target.value) || 0)} />
            </label>
          </div>
          <button type="button" className="op-btn" onClick={issueBatch}>
            {L('Generate', '만들기')}
          </button>
          <p className="op-note">{L('Website scratch-card codes (UE-XXXX-XXXX) are accepted on the kiosk by checksum, for a free session.', '웹사이트 스크래치 쿠폰(UE-XXXX-XXXX)은 체크섬으로 키오스크가 바로 받는다(무료 1회).')}</p>
        </section>
      </div>

      <section className="op-card" aria-label={L('Issued codes', '발급한 코드')}>
        <h3 className="op-h3">{L('Issued codes', '발급한 코드')}</h3>
        {coupons.length === 0 ? (
          <p className="op-empty">{L('No codes issued in this session.', '이 세션에서 발급한 코드가 없다.')}</p>
        ) : (
          <div className="op-table-wrap">
            <table className="op-table">
              <thead>
                <tr>
                  <th scope="col">{L('Code', '코드')}</th>
                  <th scope="col">{L('Type', '종류')}</th>
                  <th scope="col">{L('Label', '이름')}</th>
                  <th scope="col" className="op-right">
                    {L('Discount', '할인')}
                  </th>
                  <th scope="col" className="op-right">
                    {L('Used', '사용')}
                  </th>
                  <th scope="col">{L('Active', '사용 가능')}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.code} className={c.active ? '' : 'op-refunded'}>
                    <td className="op-mono">{c.code}</td>
                    <td>{c.kind === 'daily' ? `${L('Daily', '일일')} ${c.date}` : L('Single-use', '1회용')}</td>
                    <td>{c.label}</td>
                    <td className="op-num op-right">{won(c.discount)}</td>
                    <td className="op-num op-right">
                      {c.uses}
                      {c.maxUses ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td>
                      <Switch checked={c.active} onChange={() => ops.toggleCoupon(c.code)} label={`${c.code} ${L('active', '사용 가능')}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
