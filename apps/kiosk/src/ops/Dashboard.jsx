// ops/Dashboard.jsx: 매출 대시보드. 키오스크가 결제하면 바로 갱신된다. 샘플 거래가 섞이면 모든 카드에 '샘플 포함'이 붙는다.
import { useMemo, useState } from 'react'
import { BOOTHS, METHODS, ops, useOps } from './store.js'
import { makeSampleTx } from './sample.js'
import { BOOTH_COLOR, BoothDot, METHOD_LABEL, SampleBadge, Tabs, useL, useLangCode, won } from './ui.jsx'

export function rangeStart(range, now = new Date()) {
  if (range === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  return new Date(now.getFullYear(), 0, 1).getTime()
}

export function summarize(tx) {
  const paid = tx.filter((t) => t.status === 'paid')
  const refunded = tx.filter((t) => t.status === 'refunded')
  const revenue = paid.reduce((a, t) => a + t.amount, 0)
  return { revenue, count: paid.length, avg: paid.length ? revenue / paid.length : 0, refunds: refunded.length, refundAmount: refunded.reduce((a, t) => a + t.amount, 0), paid }
}

export default function Dashboard() {
  const L = useL()
  const lang = useLangCode()
  const [range, setRange] = useState('today')
  const all = useOps((s) => s.tx)
  const price = useOps((s) => s.price)
  const hasSample = useOps((s) => s.hasSample)
  const tx = useMemo(() => {
    const from = rangeStart(range)
    return all.filter((t) => t.ts >= from)
  }, [all, range])
  const sum = useMemo(() => summarize(tx), [tx])
  const sampleIn = tx.some((t) => t.sample)

  const byBooth = BOOTHS.map((b) => ({ ...b, v: sum.paid.filter((t) => t.booth === b.id).reduce((a, t) => a + t.amount, 0), c: sum.paid.filter((t) => t.booth === b.id).length }))
  const boothMax = Math.max(1, ...byBooth.map((b) => b.v))

  const now = new Date()
  const buckets = useMemo(() => {
    if (range === 'today') return Array.from({ length: 24 }, (_, h) => ({ k: h, label: String(h), v: 0 }))
    if (range === 'month') {
      const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      return Array.from({ length: days }, (_, i) => ({ k: i + 1, label: String(i + 1), v: 0 }))
    }
    return Array.from({ length: 12 }, (_, i) => ({ k: i + 1, label: `${i + 1}`, v: 0 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])
  const series = buckets.map((b) => ({ ...b }))
  for (const t of sum.paid) {
    const d = new Date(t.ts)
    const k = range === 'today' ? d.getHours() : range === 'month' ? d.getDate() : d.getMonth() + 1
    const s = series.find((x) => x.k === k)
    if (s) s.v += t.amount
  }
  const seriesMax = Math.max(1, ...series.map((s) => s.v))
  const seriesTitle = range === 'today' ? L('Revenue by hour', '시간대별 매출') : range === 'month' ? L('Revenue by day', '일별 매출') : L('Revenue by month', '월별 매출')
  const unit = range === 'today' ? L('h', '시') : range === 'month' ? L('', '일') : L('', '월')

  const byMethod = METHODS.map((m) => ({ m, c: sum.paid.filter((t) => t.method === m).length }))
  const methodTotal = Math.max(1, byMethod.reduce((a, x) => a + x.c, 0))

  return (
    <div className="op-stack">
      <div className="op-row-between">
        <Tabs
          size="sm"
          label={L('Range', '기간')}
          value={range}
          onChange={setRange}
          items={[
            { id: 'today', label: L('Today', '오늘') },
            { id: 'month', label: L('This month', '이번 달') },
            { id: 'year', label: L('This year', '올해') },
          ]}
        />
        <div className="op-row">
          {hasSample ? (
            <button type="button" className="op-btn op-btn-ghost" onClick={ops.clearSample}>
              {L('Clear sample', '샘플 지우기')}
            </button>
          ) : (
            <button type="button" className="op-btn op-btn-ghost" onClick={() => ops.loadSample(makeSampleTx({ price }))}>
              {L('Add sample data', '샘플 데이터 넣기')}
            </button>
          )}
        </div>
      </div>
      {!all.length ? <p className="op-note">{L('No sales yet in this session. Pay on a kiosk on the left and it shows up here at once.', '아직 이 세션의 결제가 없다. 왼쪽 키오스크에서 결제하면 바로 여기에 잡힌다.')}</p> : null}
      {sampleIn ? <p className="op-note op-note-warn">{L('Sample rows are made up for the demo and are not real sales.', '샘플 행은 시연용으로 만든 값이며 실제 매출이 아니다.')}</p> : null}

      <div className="op-kpis">
        <Kpi label={L('Revenue', '매출')} value={won(sum.revenue)} sample={sampleIn} />
        <Kpi label={L('Payments', '결제 건수')} value={`${sum.count.toLocaleString()}${L('', '건')}`} sample={sampleIn} />
        <Kpi label={L('Avg. ticket', '평균 객단가')} value={won(sum.avg)} sample={sampleIn} />
        <Kpi label={L('Refunds', '환불')} value={`${sum.refunds}${L('', '건')} · ${won(sum.refundAmount)}`} sample={sampleIn} />
      </div>

      <div className="op-grid-2">
        <section className="op-card" aria-label={L('Revenue by booth', '부스별 매출')}>
          <div className="op-card-head">
            <h3 className="op-h3">{L('Revenue by booth', '부스별 매출')}</h3>
            <SampleBadge show={sampleIn} />
          </div>
          <ul className="op-bars-h">
            {byBooth.map((b) => (
              <li key={b.id}>
                <span className="op-bar-label">
                  <BoothDot id={b.id} />
                  {b.name[lang] || b.name.ko}
                </span>
                <span className="op-bar-track">
                  <span className="op-bar-fill" style={{ width: `${(b.v / boothMax) * 100}%`, background: `rgb(${BOOTH_COLOR[b.id]})` }} />
                </span>
                <span className="op-num op-bar-val">
                  {won(b.v)} <span className="op-meta">{sum.revenue ? Math.round((b.v / sum.revenue) * 100) : 0}%</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="op-card" aria-label={L('Payment methods', '결제수단')}>
          <div className="op-card-head">
            <h3 className="op-h3">{L('Payment methods', '결제수단')}</h3>
            <SampleBadge show={sampleIn} />
          </div>
          <div className="op-stackbar" role="img" aria-label={byMethod.map((x) => `${METHOD_LABEL[x.m][lang] || METHOD_LABEL[x.m].ko} ${x.c}`).join(', ')}>
            {byMethod.map((x, i) => (x.c ? <span key={x.m} style={{ flexGrow: x.c, background: ['#111', '#5B5B57', '#9A9A94', 'rgb(245 197 24)'][i] }} /> : null))}
          </div>
          <ul className="op-legend">
            {byMethod.map((x, i) => (
              <li key={x.m}>
                <span className="op-dot" style={{ width: 10, height: 10, background: ['#111', '#5B5B57', '#9A9A94', 'rgb(245 197 24)'][i] }} aria-hidden="true" />
                {METHOD_LABEL[x.m][lang] || METHOD_LABEL[x.m].ko}
                <span className="op-num op-meta">
                  {x.c}
                  {L('', '건')} · {Math.round((x.c / methodTotal) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="op-card" aria-label={seriesTitle}>
        <div className="op-card-head">
          <h3 className="op-h3">{seriesTitle}</h3>
          <SampleBadge show={sampleIn} />
        </div>
        <div className="op-bars-v" role="img" aria-label={`${seriesTitle}: ${series.filter((s) => s.v).map((s) => `${s.label}${unit} ${won(s.v)}`).join(', ') || '0'}`}>
          {series.map((s) => (
            <div key={s.k} className="op-col" title={`${s.label}${unit} ${won(s.v)}`}>
              <span className="op-col-fill" style={{ height: `${(s.v / seriesMax) * 100}%` }} />
              <span className="op-col-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Kpi({ label, value, sample }) {
  return (
    <div className="op-kpi">
      <span className="op-kpi-label">
        {label}
        <SampleBadge show={sample} />
      </span>
      <span className="op-kpi-value op-num">{value}</span>
    </div>
  )
}
