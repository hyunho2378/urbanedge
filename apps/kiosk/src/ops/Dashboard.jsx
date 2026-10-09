// ops/Dashboard.jsx: 매출 대시보드(관리자 화면 스타일). 키오스크가 결제하면 1초 안에 숫자와 피드가 바뀐다.
// 구성: 제목줄(실시간, 시계, 기간, 전체화면) → 숫자 카드 4개(이전 기간 대비) → 시간대별 매출(부스별 쌓기)과 실시간 결제 피드 → 부스별, 상품별, 결제수단.
// 전체화면(TV 모드)은 같은 화면을 크게 키우고 기기 상태 줄을 붙인다. /dashboard 페이지는 항상 TV 모드다.
import { useEffect, useMemo, useRef, useState } from 'react'
import { History, Maximize2, Minimize2, Trash2 } from 'lucide-react'
import { BOOTHS, METHODS, ops, useOps } from './store.js'
import { makeHistoryTx } from './history.js'
import { BOOTH_COLOR, BoothDot, METHOD_LABEL, STEP_LABEL, Tabs, compact, hhmmss, relTime, useL, useLangCode, won } from './ui.jsx'

export function rangeStart(range, now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (range === 'today') return d.getTime()
  if (range === 'week') return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)).getTime()
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  return new Date(now.getFullYear(), 0, 1).getTime()
}
// 바로 이전 기간의 시작(어제, 지난주, 지난달, 작년)
function prevStartOf(range, start) {
  const d = new Date(start)
  if (range === 'today') return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1).getTime()
  if (range === 'week') return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7).getTime()
  if (range === 'month') return new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime()
  return new Date(d.getFullYear() - 1, 0, 1).getTime()
}

export function summarize(tx) {
  const paid = tx.filter((t) => t.status === 'paid')
  const refunded = tx.filter((t) => t.status === 'refunded')
  const revenue = paid.reduce((a, t) => a + t.amount, 0)
  return { revenue, count: paid.length, avg: paid.length ? revenue / paid.length : 0, refunds: refunded.length, refundAmount: refunded.reduce((a, t) => a + t.amount, 0), paid }
}

function useNow(ms) {
  const [n, setN] = useState(() => Date.now())
  useEffect(() => {
    const i = setInterval(() => setN(Date.now()), ms)
    return () => clearInterval(i)
  }, [ms])
  return n
}

const DOW_KO = ['일', '월', '화', '수', '목', '금', '토']
const DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Clock({ now }) {
  const lang = useLangCode()
  const d = new Date(now)
  const p = (n) => String(n).padStart(2, '0')
  const dow = (lang === 'ko' ? DOW_KO : DOW_EN)[d.getDay()]
  return (
    <time className="op-clock op-num" dateTime={d.toISOString()}>
      {d.getFullYear()}.{p(d.getMonth() + 1)}.{p(d.getDate())} ({dow}) <strong>{p(d.getHours())}:{p(d.getMinutes())}:{p(d.getSeconds())}</strong>
    </time>
  )
}

function Delta({ cur, prev, label }) {
  const L = useL()
  if (!prev) return <span className="op-delta op-delta-flat">{label} —</span>
  const pct = Math.round(((cur - prev) / prev) * 100)
  const up = pct > 0
  return (
    <span className={`op-delta ${pct === 0 ? 'op-delta-flat' : up ? 'op-delta-up' : 'op-delta-down'}`}>
      <span aria-hidden="true">{pct === 0 ? '–' : up ? '▲' : '▼'}</span>
      <span className="op-sr">{up ? L('up', '증가') : pct < 0 ? L('down', '감소') : L('flat', '변화 없음')}</span> {Math.abs(pct)}% <span className="op-delta-label">{label}</span>
    </span>
  )
}

function Stat({ label, value, children, dot }) {
  return (
    <div className="op-kpi">
      <span className="op-kpi-label">
        {dot ? <span className="op-dot" style={{ width: 8, height: 8, background: dot }} aria-hidden="true" /> : null}
        {label}
      </span>
      <span className="op-kpi-value op-num">{value}</span>
      {children}
    </div>
  )
}

function Head({ title, right }) {
  return (
    <div className="op-card-head">
      <h3 className="op-h3">{title}</h3>
      {right}
    </div>
  )
}

function buildSeries(range, paid, now, lang) {
  const d = new Date(now)
  let buckets
  let keyOf
  if (range === 'today') {
    buckets = Array.from({ length: 14 }, (_, i) => ({ k: 10 + i, label: String(10 + i) }))
    keyOf = (t) => Math.min(23, Math.max(10, new Date(t).getHours()))
  } else if (range === 'week') {
    const names = lang === 'ko' ? ['월', '화', '수', '목', '금', '토', '일'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    buckets = names.map((n, i) => ({ k: i, label: n }))
    keyOf = (t) => (new Date(t).getDay() + 6) % 7
  } else if (range === 'month') {
    const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    buckets = Array.from({ length: days }, (_, i) => ({ k: i + 1, label: String(i + 1) }))
    keyOf = (t) => new Date(t).getDate()
  } else {
    buckets = Array.from({ length: 12 }, (_, i) => ({ k: i + 1, label: String(i + 1) }))
    keyOf = (t) => new Date(t).getMonth() + 1
  }
  const series = buckets.map((b) => ({ ...b, v: 0, by: Object.fromEntries(BOOTHS.map((x) => [x.id, 0])) }))
  for (const t of paid) {
    const s = series.find((x) => x.k === keyOf(t.ts))
    if (s) {
      s.v += t.amount
      s.by[t.booth] += t.amount
    }
  }
  return series
}

function StackedChart({ series, nowKey, title, unit }) {
  const L = useL()
  const lang = useLangCode()
  const max = Math.max(1, ...series.map((s) => s.v))
  const labelled = series.length <= 14
  const summary = series.filter((s) => s.v).map((s) => `${s.label}${unit} ${won(s.v)}`).join(', ') || '0'
  return (
    <div>
      <div className="op-chart" role="img" aria-label={`${title}: ${summary}`}>
        {!labelled ? <span className="op-chart-max op-num" aria-hidden="true">{compact(max, lang)}</span> : null}
        <div className="op-chart-bars">
          {series.map((s, i) => (
            <div key={s.k} className={`op-col ${s.k === nowKey ? 'op-col-now' : ''}`} title={`${s.label}${unit} ${won(s.v)}`}>
              <div className="op-col-area">
                <div className="op-col-stack" style={{ height: `${(s.v / max) * 100}%` }}>
                  {labelled && s.v ? <span className="op-col-val op-num">{compact(s.v, lang)}</span> : null}
                  {BOOTHS.map((b) => (s.by[b.id] ? <i key={b.id} style={{ flexGrow: s.by[b.id], background: `rgb(${BOOTH_COLOR[b.id]})` }} /> : null))}
                </div>
              </div>
              <span className="op-col-label">{labelled || i === 0 || (i + 1) % 5 === 0 ? s.label : ''}</span>
            </div>
          ))}
        </div>
      </div>
      <ul className="op-key" aria-label={L('Booths', '부스')}>
        {BOOTHS.map((b) => (
          <li key={b.id}>
            <BoothDot id={b.id} size={8} />
            {b.name[lang] || b.name.ko}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Feed({ items, products, now }) {
  const L = useL()
  const lang = useLangCode()
  if (!items.length) return <p className="op-empty">{L('No payments yet today. A payment on any kiosk appears here at once.', '오늘 결제가 아직 없다. 키오스크에서 결제하면 바로 여기에 나타난다.')}</p>
  return (
    <ul className="op-feed" aria-live="polite" aria-label={L('Live payments', '실시간 결제')}>
      {items.map((t) => {
        const p = products.find((x) => x.id === t.product)
        const label = p ? p.name[lang] || p.name.ko : t.cuts ? `${t.cuts}${L(' cuts', '컷')}` : '—'
        return (
          <li key={t.id} className={`${now - t.ts < 4000 ? 'op-new' : ''} ${t.status === 'refunded' ? 'op-refunded' : ''}`}>
            <span className="op-feed-time op-num">{hhmmss(t.ts)}</span>
            <span className="op-feed-main">
              <BoothDot id={t.booth} size={8} />
              <span className="op-feed-name">{label}</span>
              <span className="op-meta">
                {METHOD_LABEL[t.method]?.[lang] || t.method}
                {t.status === 'refunded' ? ` · ${L('refunded', '환불됨')}` : ''}
              </span>
            </span>
            <span className="op-num op-feed-amt">{won(t.amount)}</span>
          </li>
        )
      })}
    </ul>
  )
}

function Devices({ now }) {
  const L = useL()
  const lang = useLangCode()
  const booth = useOps((s) => s.booth)
  const tx = useOps((s) => s.tx)
  const start = rangeStart('today', new Date(now))
  return (
    <ul className="op-devices" aria-label={L('Devices', '기기 상태')}>
      {BOOTHS.map((b) => {
        const s = booth[b.id]
        const mine = tx.filter((t) => t.booth === b.id && !t.history && t.status === 'paid')
        const last = mine[0]
        const today = mine.filter((t) => t.ts >= start)
        const step = s.cameraActive ? L('Shooting', '촬영 중') : STEP_LABEL[s.step]?.[lang] || STEP_LABEL[s.step]?.ko || s.step
        return (
          <li key={b.id} className="op-device" style={{ '--op-booth': `rgb(${BOOTH_COLOR[b.id]})` }}>
            <span className="op-booth-bar" aria-hidden="true" />
            <span className="op-booth-name">
              <span className="op-dot" style={{ width: 9, height: 9, background: s.online ? '#3FA66B' : '#9A9A94' }} aria-hidden="true" />
              P{b.n} {b.name[lang] || b.name.ko}
            </span>
            <span className="op-booth-sub">{s.online ? step : L('Offline', '연결 끊김')}</span>
            <span className="op-booth-sub">
              {L('Last payment', '마지막 결제')} {last ? relTime(last.ts, now, lang) : '—'} · {L('today', '오늘')} <span className="op-num">{today.length}</span>
              {L('', '건')}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export default function Dashboard({ tv: tvForced = false, connected = true }) {
  const L = useL()
  const lang = useLangCode()
  const [range, setRange] = useState('today')
  const all = useOps((s) => s.tx)
  const products = useOps((s) => s.products)
  const hasHistory = useOps((s) => s.hasSample)
  const now = useNow(1000)
  const minute = Math.floor(now / 60000)
  const dayKey = new Date(now).toDateString()
  const wrap = useRef(null)
  const [full, setFull] = useState(false)
  const [pseudo, setPseudo] = useState(false)
  const [zoom, setZoom] = useState(1)
  const on = full || pseudo
  const tv = tvForced || on

  useEffect(() => {
    const f = () => setFull(document.fullscreenElement === wrap.current)
    document.addEventListener('fullscreenchange', f)
    return () => document.removeEventListener('fullscreenchange', f)
  }, [])
  useEffect(() => {
    if (!tv) {
      setZoom(1)
      return undefined
    }
    const f = () => setZoom(Math.max(1, Math.min(2, window.innerWidth / 1200, window.innerHeight / 820)))
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [tv])
  // 브라우저 전체화면을 먼저 시도하고, 막혀 있으면(iframe 등) 같은 탭 안에서 화면을 가득 채운다. Esc로 끝낸다.
  const toggleFull = () => {
    if (document.fullscreenElement) return void document.exitFullscreen?.()
    if (pseudo) return setPseudo(false)
    const el = wrap.current
    if (!el?.requestFullscreen) return setPseudo(true)
    el.requestFullscreen().catch(() => setPseudo(true))
  }
  useEffect(() => {
    if (!pseudo) return undefined
    const k = (e) => e.key === 'Escape' && setPseudo(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [pseudo])

  const start = useMemo(() => rangeStart(range, new Date()), [range, dayKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const data = useMemo(() => {
    const t0 = Date.now()
    const prevStart = prevStartOf(range, start)
    return { cur: summarize(all.filter((t) => t.ts >= start)), prev: summarize(all.filter((t) => t.ts >= prevStart && t.ts < prevStart + (t0 - start))) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, range, start, minute])
  const { cur, prev } = data

  const series = useMemo(() => buildSeries(range, cur.paid, Date.now(), lang), [cur, range, lang, minute]) // eslint-disable-line react-hooks/exhaustive-deps
  const nd = new Date(now)
  const nowKey = range === 'today' ? Math.min(23, Math.max(10, nd.getHours())) : range === 'week' ? (nd.getDay() + 6) % 7 : range === 'month' ? nd.getDate() : nd.getMonth() + 1
  const unit = range === 'today' ? L('h', '시') : range === 'year' ? L('', '월') : range === 'month' ? L('', '일') : ''
  const chartTitle = { today: L('Revenue by hour', '시간대별 매출'), week: L('Revenue by day', '요일별 매출'), month: L('Revenue by day', '일별 매출'), year: L('Revenue by month', '월별 매출') }[range]
  const vs = { today: L('vs. yesterday', '어제 같은 시각 대비'), week: L('vs. last week', '지난주 대비'), month: L('vs. last month', '지난달 대비'), year: L('vs. last year', '작년 대비') }[range]

  const feedStart = rangeStart('today', nd)
  const feed = useMemo(() => all.filter((t) => t.ts >= feedStart && !t.history).slice(0, tv ? 14 : 10), [all, feedStart, tv])

  const byBooth = BOOTHS.map((b) => {
    const p = cur.paid.filter((t) => t.booth === b.id)
    return { ...b, v: p.reduce((a, t) => a + t.amount, 0), c: p.length }
  })
  const boothMax = Math.max(1, ...byBooth.map((b) => b.v))
  const prodRows = [...products.map((p) => ({ id: p.id, name: p.name[lang] || p.name.ko })), { id: null, name: L('Other', '기타') }]
    .map((p) => {
      const rows = cur.paid.filter((t) => (t.product || null) === p.id)
      return { ...p, c: rows.length, v: rows.reduce((a, t) => a + t.amount, 0) }
    })
    .filter((p) => p.c || p.id)
  const prodMax = Math.max(1, ...prodRows.map((p) => p.v))
  const byMethod = METHODS.map((m) => ({ m, c: cur.paid.filter((t) => t.method === m).length }))
  const methodTotal = Math.max(1, byMethod.reduce((a, x) => a + x.c, 0))
  const MC = ['#111', '#5B5B57', '#9A9A94', 'rgb(245 197 24)']

  return (
    <div ref={wrap} className={`op-dash ${tv ? 'op-tv' : ''} ${pseudo ? 'op-pseudo' : ''}`}>
      <div className="op-dash-in" style={tv ? { zoom, '--op-z': zoom } : undefined}>
        <header className="op-dash-head">
          <div className="op-dash-title">
            <h2 className="op-h2">{L('Live status', '실시간 현황')}</h2>
            <span className={`op-live ${connected ? '' : 'op-live-off'}`}>
              <i aria-hidden="true" />
              {connected ? L('Live', '실시간') : L('Waiting for connection', '연결 대기 중')}
            </span>
            <Clock now={now} />
          </div>
          <div className="op-row">
            <Tabs
              size="sm"
              label={L('Range', '기간')}
              value={range}
              onChange={setRange}
              items={[
                { id: 'today', label: L('Today', '오늘') },
                { id: 'week', label: L('This week', '이번 주') },
                { id: 'month', label: L('This month', '이번 달') },
                { id: 'year', label: L('This year', '올해') },
              ]}
            />
            {!tvForced ? (
              hasHistory ? (
                <button type="button" className="op-btn op-btn-ghost op-btn-sm" onClick={ops.clearHistory}>
                  <Trash2 size={14} aria-hidden="true" />
                  {L('Clear past records', '지난 기록 지우기')}
                </button>
              ) : (
                <button type="button" className="op-btn op-btn-ghost op-btn-sm" onClick={() => ops.loadHistory(makeHistoryTx({ products }))}>
                  <History size={14} aria-hidden="true" />
                  {L('Load past records', '지난 기록 불러오기')}
                </button>
              )
            ) : null}
            <button type="button" className="op-btn op-btn-sm" onClick={toggleFull} aria-pressed={on}>
              {on ? <Minimize2 size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
              {on ? L('Exit full screen', '전체화면 끝내기') : L('Full screen', '전체화면')}
            </button>
          </div>
        </header>

        {tv ? <Devices now={now} /> : null}

        <div className="op-kpis">
          <Stat label={L('Revenue', '매출')} value={won(cur.revenue)} dot="#111">
            <Delta cur={cur.revenue} prev={prev.revenue} label={vs} />
          </Stat>
          <Stat label={L('Payments', '결제 건수')} value={`${cur.count.toLocaleString()}${L('', '건')}`} dot="#5B5B57">
            <Delta cur={cur.count} prev={prev.count} label={vs} />
          </Stat>
          <Stat label={L('Avg. ticket', '객단가')} value={won(cur.avg)} dot="rgb(245 197 24)">
            <Delta cur={cur.avg} prev={prev.avg} label={vs} />
          </Stat>
          <Stat label={L('Refunds', '환불')} value={`${cur.refunds}${L('', '건')}`} dot="#B3261E">
            <span className="op-delta op-delta-flat op-num">{won(cur.refundAmount)}</span>
          </Stat>
        </div>

        <div className="op-dash-main">
          <section className="op-card" aria-label={chartTitle}>
            <Head title={chartTitle} />
            <StackedChart series={series} nowKey={nowKey} title={chartTitle} unit={unit} />
          </section>
          <section className="op-card" aria-label={L('Live payments', '실시간 결제')}>
            <Head title={L('Live payments', '실시간 결제')} right={<span className="op-meta">{L('Today', '오늘')}</span>} />
            <Feed items={feed} products={products} now={now} />
          </section>
        </div>

        <div className="op-dash-3">
          <section className="op-card" aria-label={L('Revenue by booth', '부스별 매출')}>
            <Head title={L('Revenue by booth', '부스별 매출')} />
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
                    {won(b.v)} <span className="op-meta">{cur.revenue ? Math.round((b.v / cur.revenue) * 100) : 0}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="op-card" aria-label={L('Sales by product', '상품별 판매')}>
            <Head title={L('Sales by product', '상품별 판매')} />
            <ul className="op-bars-h">
              {prodRows.map((p) => (
                <li key={p.id || 'other'}>
                  <span className="op-bar-label">{p.name}</span>
                  <span className="op-bar-track">
                    <span className="op-bar-fill" style={{ width: `${(p.v / prodMax) * 100}%`, background: '#111' }} />
                  </span>
                  <span className="op-num op-bar-val">
                    {p.c}
                    {L('', '건')} <span className="op-meta">{won(p.v)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="op-card" aria-label={L('Payment methods', '결제수단')}>
            <Head title={L('Payment methods', '결제수단')} />
            <div className="op-stackbar" role="img" aria-label={byMethod.map((x) => `${METHOD_LABEL[x.m][lang] || METHOD_LABEL[x.m].ko} ${x.c}`).join(', ')}>
              {byMethod.map((x, i) => (x.c ? <span key={x.m} style={{ flexGrow: x.c, background: MC[i] }} /> : null))}
            </div>
            <ul className="op-legend op-legend-col">
              {byMethod.map((x, i) => (
                <li key={x.m}>
                  <span className="op-dot" style={{ width: 10, height: 10, background: MC[i] }} aria-hidden="true" />
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
      </div>
    </div>
  )
}
