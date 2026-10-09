// ops/Pos.jsx: 거래 목록, 환불, 일 마감. 인화가 안 됐을 때 전화 대신 여기서 바로 환불한다.
import { useMemo, useState } from 'react'
import { Receipt, RotateCcw } from 'lucide-react'
import { BOOTHS, METHODS, ops, useOps } from './store.js'
import { frameById } from '../flow/prints.js'
import { rangeStart, summarize } from './Dashboard.jsx'
import { Dialog, METHOD_LABEL, boothOf, hhmm, useL, useLangCode, won, ymd } from './ui.jsx'

export default function Pos() {
  const L = useL()
  const lang = useLangCode()
  const tx = useOps((s) => s.tx)
  const frames = useOps((s) => s.frames)
  const [booth, setBooth] = useState('all')
  const [method, setMethod] = useState('all')
  const [confirm, setConfirm] = useState(null)
  const [receipt, setReceipt] = useState(false)

  const rows = useMemo(() => tx.filter((t) => (booth === 'all' || t.booth === booth) && (method === 'all' || t.method === method)).slice(0, 200), [tx, booth, method])
  const todayTx = useMemo(() => tx.filter((t) => t.ts >= rangeStart('today')), [tx])
  const day = summarize(todayTx)
  const byMethod = METHODS.map((m) => {
    const p = day.paid.filter((t) => t.method === m)
    return { m, c: p.length, v: p.reduce((a, t) => a + t.amount, 0) }
  })
  const nameOf = (id) => {
    if (!id) return null
    const f = frameById(id)
    if (f) return f.name[lang] || f.name.ko
    const c = frames.find((x) => x.id === id)?.custom
    return c ? c.name : id
  }

  return (
    <div className="op-stack">
      <div className="op-grid-pos">
        <section className="op-card op-close" aria-label={L('Day close', '일 마감')}>
          <div className="op-card-head">
            <h3 className="op-h3">{L('Day close', '일 마감')}</h3>
          </div>
          <p className="op-kpi-value op-num">{won(day.revenue)}</p>
          <p className="op-meta">
            {day.count}
            {L(' paid', '건 결제')} · {L('refunds', '환불')} {day.refunds}
            {L('', '건')}
          </p>
          <ul className="op-legend op-legend-col">
            {byMethod.map((x) => (
              <li key={x.m}>
                {METHOD_LABEL[x.m][lang] || METHOD_LABEL[x.m].ko}
                <span className="op-num">
                  {x.c}
                  {L('', '건')} · {won(x.v)}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="op-btn" onClick={() => setReceipt(true)}>
            <Receipt size={16} aria-hidden="true" />
            {L('Close the day', '일 마감 영수증')}
          </button>
        </section>

        <section className="op-card op-tx" aria-label={L('Transactions', '거래 내역')}>
          <div className="op-card-head">
            <h3 className="op-h3">{L('Transactions', '거래 내역')}</h3>
            <div className="op-row">
              <label className="op-select">
                <span className="sr-only">{L('Booth', '부스')}</span>
                <select value={booth} onChange={(e) => setBooth(e.target.value)} aria-label={L('Booth', '부스')}>
                  <option value="all">{L('All booths', '전체 부스')}</option>
                  {BOOTHS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name[lang] || b.name.ko}
                    </option>
                  ))}
                </select>
              </label>
              <label className="op-select">
                <span className="sr-only">{L('Method', '결제수단')}</span>
                <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label={L('Method', '결제수단')}>
                  <option value="all">{L('All methods', '전체 결제수단')}</option>
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {METHOD_LABEL[m][lang] || METHOD_LABEL[m].ko}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {rows.length === 0 ? (
            <p className="op-empty">{L('No transactions yet. Payments from the kiosks appear here.', '아직 거래가 없다. 키오스크에서 결제하면 여기에 쌓인다.')}</p>
          ) : (
            <div className="op-table-wrap">
              <table className="op-table">
                <thead>
                  <tr>
                    <th scope="col">{L('Time', '시간')}</th>
                    <th scope="col">{L('Booth', '부스')}</th>
                    <th scope="col">{L('Method', '결제수단')}</th>
                    <th scope="col">{L('Coupon', '쿠폰')}</th>
                    <th scope="col">{L('Cuts / frame', '컷/프레임')}</th>
                    <th scope="col" className="op-right">
                      {L('Amount', '금액')}
                    </th>
                    <th scope="col">{L('Status', '상태')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className={t.status === 'refunded' ? 'op-refunded' : ''}>
                      <td className="op-num">
                        {t.ts < rangeStart('today') ? `${ymd(t.ts)} ` : ''}
                        {hhmm(t.ts)}
                      </td>
                      <td>
                        <span className="op-row op-gap-6">
                                                    {boothOf(t.booth).name[lang] || boothOf(t.booth).name.ko}
                        </span>
                      </td>
                      <td>{METHOD_LABEL[t.method]?.[lang] || METHOD_LABEL[t.method]?.ko || t.method}</td>
                      <td className="op-mono">{t.coupon || '-'}</td>
                      <td>
                        {t.cuts ? `${t.cuts}${L(' cuts', '컷')}` : '-'}
                        {nameOf(t.frameId) ? ` / ${nameOf(t.frameId)}` : ''}
                      </td>
                      <td className="op-num op-right">{won(t.amount)}</td>
                      <td>
                        {t.status === 'refunded' ? (
                          <span className="op-chip">{L('Refunded', '환불됨')}</span>
                        ) : (
                          <button type="button" className="op-btn op-btn-sm op-btn-ghost" onClick={() => setConfirm(t)}>
                            <RotateCcw size={14} aria-hidden="true" />
                            {L('Refund', '환불')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog open={!!confirm} onClose={() => setConfirm(null)} title={L('Refund this payment?', '이 결제를 환불할까?')}>
        {confirm ? (
          <>
            <p className="op-body">
              {hhmm(confirm.ts)} · {boothOf(confirm.booth).name[lang] || boothOf(confirm.booth).name.ko} · {METHOD_LABEL[confirm.method]?.[lang] || METHOD_LABEL[confirm.method]?.ko} · {won(confirm.amount)}
            </p>
            <p className="op-meta">{L('Status changes to Refunded and the totals drop by this amount.', '상태가 환불됨으로 바뀌고 매출 합계에서 이 금액이 빠진다.')}</p>
            <div className="op-row op-end">
              <button type="button" className="op-btn op-btn-ghost" onClick={() => setConfirm(null)}>
                {L('Cancel', '취소')}
              </button>
              <button
                type="button"
                className="op-btn op-btn-danger"
                onClick={() => {
                  ops.refund(confirm.id)
                  setConfirm(null)
                }}
              >
                {L('Refund', '환불하기')}
              </button>
            </div>
          </>
        ) : null}
      </Dialog>

      <Dialog open={receipt} onClose={() => setReceipt(false)} title={L('Day close receipt', '일 마감 영수증')}>
        <div className="op-receipt" aria-label={L('Receipt', '영수증')}>
          <p className="op-receipt-c">URBANEDGE GY-01</p>
          <p className="op-receipt-c">{new Date().toLocaleDateString('ko-KR')} {L('day close', '일 마감')}</p>
          <hr />
          {BOOTHS.map((b) => {
            const p = day.paid.filter((t) => t.booth === b.id)
            return (
              <p key={b.id} className="op-receipt-row">
                <span>
                  P{b.n} {b.name[lang] || b.name.ko} ({p.length})
                </span>
                <span>{won(p.reduce((a, t) => a + t.amount, 0))}</span>
              </p>
            )
          })}
          <hr />
          {byMethod.map((x) => (
            <p key={x.m} className="op-receipt-row">
              <span>
                {METHOD_LABEL[x.m][lang] || METHOD_LABEL[x.m].ko} ({x.c})
              </span>
              <span>{won(x.v)}</span>
            </p>
          ))}
          <p className="op-receipt-row">
            <span>
              {L('Refunded, not in totals', '환불, 합계 제외')} ({day.refunds})
            </span>
            <span>{won(day.refundAmount)}</span>
          </p>
          <hr />
          <p className="op-receipt-row op-receipt-total">
            <span>{L('NET', '순매출')}</span>
            <span>{won(day.revenue)}</span>
          </p>
        </div>
      </Dialog>
    </div>
  )
}
