// ops/Dashboard.jsx: 매출 현황판. 미리(재난 담당자 콘솔)의 구성을 따른다.
// 제목줄(날짜, 제목, 오른쪽 버튼) → 1행(매출 요약, 시간대별 매출, 확인할 일) → 2행(부스별 현황, 실시간 결제) → 3행(상품별, 결제수단).
// 색은 검정, 흰색, 노랑만 쓴다. 점, 색 테두리, 큰 숫자 강조는 쓰지 않고 줄 정보를 늘려 보여 준다.
// 전체화면(TV 모드)은 같은 구성을 키우고 한 화면에 맞춘다. /dashboard 페이지는 항상 TV 모드다.
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Download, History, LogOut, Maximize2, Trash2 } from 'lucide-react'
import { allFrames } from '../flow/prints.js'
import { BOOTHS, METHODS, ops, useOps } from './store.js'
import { exportSales } from './exportSales.js'
import { makeHistoryTx } from './history.js'
import { METHOD_LABEL, STEP_LABEL, Tabs, compact, hhmmss, relTime, useL, useLangCode, won } from './ui.jsx'

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
const p2 = (n) => String(n).padStart(2, '0')

function DateLine({ now }) {
  const lang = useLangCode()
  const d = new Date(now)
  const dow = (lang === 'ko' ? DOW_KO : DOW_EN)[d.getDay()]
  const date = lang === 'ko' ? `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${dow}요일` : `${dow}, ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
  return (
    <time className="op-dateline op-num" dateTime={d.toISOString()}>
      {date} <strong>{p2(d.getHours())}:{p2(d.getMinutes())}:{p2(d.getSeconds())}</strong>
    </time>
  )
}

function pctText(cur, prev) {
  if (!prev) return '—'
  const pct = Math.round(((cur - prev) / prev) * 100)
  return `${pct > 0 ? '+' : ''}${pct}%`
}

function Head({ title, link, onLink }) {
  return (
    <div className="op-card-head">
      <h3 className="op-h3">{title}</h3>
      {link ? (
        <button type="button" className="op-more" onClick={onLink}>
          {link}
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

// 줄 정보: 왼쪽에 이름과 보조 줄, 오른쪽에 값
function Row({ label, sub, value, onClick }) {
  const inner = (
    <>
      <span className="op-info-l">
        <span className="op-info-label">{label}</span>
        {sub ? <span className="op-info-sub">{sub}</span> : null}
      </span>
      <span className="op-info-v op-num">{value}</span>
      {onClick ? <ChevronRight size={14} aria-hidden="true" className="op-info-go" /> : null}
    </>
  )
  return <li>{onClick ? <button type="button" className="op-info op-info-btn" onClick={onClick}>{inner}</button> : <div className="op-info">{inner}</div>}</li>
}

function buildSeries(range, paid, now, lang, boothId) {
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
  const series = buckets.map((b) => ({ ...b, v: 0, c: 0 }))
  for (const t of paid) {
    if (boothId !== 'all' && t.booth !== boothId) continue
    const s = series.find((x) => x.k === keyOf(t.ts))
    if (s) {
      s.v += t.amount
      s.c += 1
    }
  }
  return series
}

// 막대 차트: 검정 막대, 지금 시각만 노랑(검정 외곽선). 값은 지금 막대와 가장 큰 막대에만 적는다.
function Bars({ series, nowKey, title, unit }) {
  const lang = useLangCode()
  const max = Math.max(1, ...series.map((s) => s.v))
  const topK = series.reduce((m, s) => (s.v > m.v ? s : m), { v: 0 }).k
  const dense = series.length > 14
  const summary = series.filter((s) => s.v).map((s) => `${s.label}${unit} ${won(s.v)}`).join(', ') || '0'
  return (
    <div className="op-chart" role="img" aria-label={`${title}: ${summary}`}>
      <div className="op-chart-bars">
        {series.map((s, i) => {
          const hot = s.k === nowKey
          const showVal = s.v > 0 && (hot || s.k === topK) && !(dense && !hot && s.k !== topK)
          return (
            <div key={s.k} className="op-col" title={`${s.label}${unit} ${won(s.v)} · ${s.c}`}>
              <div className="op-col-area">
                {showVal ? <span className="op-col-val op-num">{compact(s.v, lang)}</span> : null}
                <div className={`op-col-bar ${hot ? 'op-col-hot' : ''}`} style={{ height: `${s.v ? Math.max(3, (s.v / max) * 100) : 0}%` }} />
              </div>
              <span className={`op-col-label ${hot ? 'op-col-label-hot' : ''}`}>{!dense || i === 0 || (i + 1) % 5 === 0 || hot ? s.label : ''}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const isTyping = (el) => !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)

// 내보내기 메뉴: CSV는 이 화면에서 바로 만든다. 나머지는 운영 서버가 만든다.
function ExportMenu({ range, rows, L }) {
  const [open, setOpen] = useState(false)
  const remote = useOps((s) => s.remote)
  const [msg, setMsg] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const off = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false) } }
    document.addEventListener('pointerdown', off)
    document.addEventListener('keydown', key, true)
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', key, true) }
  }, [open])
  const server = !!remote?.connected && typeof ops.download === 'function'
  const run = async (fmt) => {
    setMsg('')
    try {
      if (fmt === 'csv' && !server) exportSales(rows, range)
      else await ops.download(fmt, { range, kind: 'sales' })
      setOpen(false)
    } catch (e) {
      setMsg(L('Export failed. Try again.', '내보내지 못했다. 다시 시도해 주세요.'))
    }
  }
  const items = [
    { id: 'csv', label: 'CSV', ok: true },
    { id: 'xlsx', label: L('Excel (.xlsx)', '엑셀 (.xlsx)'), ok: server },
    { id: 'hwpx', label: L('Hangul (.hwpx)', '한글 (.hwpx)'), ok: server },
    { id: 'pdf', label: 'PDF', ok: server },
  ]
  return (
    <div className="op-menu-wrap" ref={ref}>
      <button type="button" className="op-btn op-btn-sm" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <Download size={16} aria-hidden="true" />
        {L('Export', '내보내기')}
      </button>
      {open ? (
        <div className="op-menu" role="menu" aria-label={L('Export format', '내보내기 형식')}>
          {items.map((it) => (
            <button key={it.id} type="button" role="menuitem" disabled={!it.ok} onClick={() => run(it.id)}>
              {it.label}
            </button>
          ))}
          {!server ? <small>{L('Excel, Hangul and PDF need the server. It is not connected.', '엑셀, 한글, PDF는 서버가 있어야 한다. 지금은 연결되지 않았다.')}</small> : null}
          {msg ? <small>{msg}</small> : null}
        </div>
      ) : null}
    </div>
  )
}

export default function Dashboard({ tv: tvForced = false, connected = true, onGo, onExit }) {
  const L = useL()
  const lang = useLangCode()
  const [range, setRange] = useState('today')
  const [chartBooth, setChartBooth] = useState('all')
  const all = useOps((s) => s.tx)
  const products = useOps((s) => s.products)
  const coupons = useOps((s) => s.coupons)
  const booth = useOps((s) => s.booth)
  const sel = useOps((s) => s.selectedBooth)
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
  // 전체화면에서는 내용 높이를 재서 화면 높이에 맞게 확대 비율을 정한다(너비 기준 1280에서 1.0).
  const innerRef = useRef(null)
  const [vp, setVp] = useState(() => `${window.innerWidth}x${window.innerHeight}`)
  useEffect(() => {
    const f = () => setVp(`${window.innerWidth}x${window.innerHeight}`)
    window.addEventListener('resize', f)
    document.addEventListener('fullscreenchange', f)
    return () => { window.removeEventListener('resize', f); document.removeEventListener('fullscreenchange', f) }
  }, [])
  useEffect(() => {
    if (!tv) { setZoom(1); return undefined }
    const id = requestAnimationFrame(() => {
      const el = innerRef.current
      if (!el) return
      const cap = Math.max(0.8, Math.min(2, window.innerWidth / 1280))
      const avail = window.innerHeight - 40
      const h = el.getBoundingClientRect().height
      if (!h) return
      const want = Math.max(0.8, Math.min(cap, zoom * (avail / h)))
      if (Math.abs(want - zoom) / zoom > 0.03) setZoom(want)
    })
    return () => cancelAnimationFrame(id)
  }, [tv, zoom, vp, range, all.length, minute]) // eslint-disable-line react-hooks/exhaustive-deps
  // 브라우저 전체화면을 먼저 시도하고, 막혀 있으면(iframe 등) 같은 탭 안에서 화면을 가득 채운다.
  const toggleFull = () => {
    if (document.fullscreenElement) return void document.exitFullscreen?.()
    if (pseudo) return setPseudo(false)
    const el = wrap.current
    if (!el?.requestFullscreen) return setPseudo(true)
    el.requestFullscreen().catch(() => setPseudo(true))
  }
  // 나가기: 전체화면이면 전체화면을 끝내고, /dashboard 페이지면 운영 화면으로 돌아간다.
  const exitFull = () => {
    if (document.fullscreenElement) return void document.exitFullscreen?.()
    if (pseudo) return setPseudo(false)
    onExit?.()
  }
  // F: 전체화면 켜고 끄기, Esc: 나가기. 입력칸에 글을 쓰는 중에는 쓰지 않는다.
  const fnRef = useRef({})
  fnRef.current = { toggleFull, exitFull, on, tvForced }
  useEffect(() => {
    const k = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      const f = fnRef.current
      if (e.key === 'f' || e.key === 'F' || e.key === 'ㄹ') { e.preventDefault(); f.toggleFull() }
      else if (e.key === 'Escape' && (f.on || f.tvForced)) { e.preventDefault(); f.exitFull() }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const start = useMemo(() => rangeStart(range, new Date()), [range, dayKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const data = useMemo(() => {
    const t0 = Date.now()
    const prevStart = prevStartOf(range, start)
    return {
      cur: summarize(all.filter((t) => t.ts >= start)),
      prev: summarize(all.filter((t) => t.ts >= prevStart && t.ts < prevStart + (t0 - start))),
      month: summarize(all.filter((t) => t.ts >= rangeStart('month'))),
      year: summarize(all.filter((t) => t.ts >= rangeStart('year'))),
      today: summarize(all.filter((t) => t.ts >= rangeStart('today'))),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, range, start, minute])
  const { cur, prev, month, year } = data

  const series = useMemo(() => buildSeries(range, cur.paid, Date.now(), lang, chartBooth), [cur, range, lang, chartBooth, minute]) // eslint-disable-line react-hooks/exhaustive-deps
  const nd = new Date(now)
  const nowKey = range === 'today' ? Math.min(23, Math.max(10, nd.getHours())) : range === 'week' ? (nd.getDay() + 6) % 7 : range === 'month' ? nd.getDate() : nd.getMonth() + 1
  const unit = range === 'today' ? L('h', '시') : range === 'year' ? L('', '월') : range === 'month' ? L('', '일') : ''
  const chartTitle = { today: L('Revenue by hour', '시간대별 매출'), week: L('Revenue by day', '요일별 매출'), month: L('Revenue by day', '일별 매출'), year: L('Revenue by month', '월별 매출') }[range]
  const vs = { today: L('vs. same time yesterday', '어제 같은 시각 대비'), week: L('vs. last week', '지난주 대비'), month: L('vs. last month', '지난달 대비'), year: L('vs. last year', '작년 대비') }[range]
  const pageTitle = { today: L("Today's status", '오늘의 현황'), week: L("This week's status", '이번 주 현황'), month: L("This month's status", '이번 달 현황'), year: L("This year's status", '올해 현황') }[range]
  const rangeName = { today: L('Today', '오늘'), week: L('This week', '이번 주'), month: L('This month', '이번 달'), year: L('This year', '올해') }[range]

  const feedStart = rangeStart('today', nd)
  const feed = useMemo(() => all.filter((t) => t.ts >= feedStart && !t.history).slice(0, tv ? 4 : 8), [all, feedStart, tv])

  const mLabel = (m) => METHOD_LABEL[m]?.[lang] || METHOD_LABEL[m]?.ko || m
  const methodLine = METHODS.map((m) => ({ m, c: cur.paid.filter((t) => t.method === m).length })).filter((x) => x.c).map((x) => `${mLabel(x.m)} ${x.c}`).join(' · ') || '—'
  const dayOfMonth = nd.getDate()
  const dayOfYear = Math.max(1, Math.floor((now - rangeStart('year')) / 86400000) + 1)

  const byBooth = BOOTHS.map((b) => {
    const p = cur.paid.filter((t) => t.booth === b.id)
    const mine = all.filter((t) => t.booth === b.id && !t.history && t.status === 'paid')
    const todayN = mine.filter((t) => t.ts >= feedStart).length
    return { ...b, v: p.reduce((a, t) => a + t.amount, 0), c: p.length, last: mine[0], todayN }
  })
  const prodRows = [...products.map((p) => ({ id: p.id, name: p.name[lang] || p.name.ko, price: p.price })), { id: null, name: L('Other', '기타') }]
    .map((p) => {
      const rows = cur.paid.filter((t) => (t.product || null) === p.id)
      return { ...p, c: rows.length, v: rows.reduce((a, t) => a + t.amount, 0) }
    })
    .filter((p) => p.c || p.id)
  const methodRows = METHODS.map((m) => {
    const rows = cur.paid.filter((t) => t.method === m)
    return { m, c: rows.length, v: rows.reduce((a, t) => a + t.amount, 0) }
  })

  // 프레임별 판매: 거래에 붙은 frameId로 묶는다(이름은 프레임 목록에서 찾는다)
  const frameDefs = useOps((s) => s.frames)
  const frameName = (id) => {
    const real = allFrames().find((f) => f.id === id)
    if (real) return real.name?.[lang] || real.name?.ko || id
    return frameDefs.find((f) => f.id === id)?.custom?.name || id
  }
  const frameRows = useMemo(() => {
    const m = new Map()
    for (const t of cur.paid) {
      const k = t.frameId || null
      const r = m.get(k) || { id: k, c: 0, v: 0 }
      r.c += 1
      r.v += t.amount
      m.set(k, r)
    }
    return [...m.values()].sort((a, b) => b.c - a.c || b.v - a.v)
  }, [cur])
  const frameTotal = frameRows.reduce((a, r) => a + r.c, 0)
  // 많이 팔린 순으로 보여 주고, 나머지는 '그 외'로 묶어 카드가 길어지지 않게 한다
  const frameLimit = tv ? 5 : 10
  const frameShown = frameRows.length > frameLimit ? [...frameRows.slice(0, frameLimit - 1), { id: '__rest', c: frameRows.slice(frameLimit - 1).reduce((a, r) => a + r.c, 0), v: frameRows.slice(frameLimit - 1).reduce((a, r) => a + r.v, 0), n: frameRows.length - frameLimit + 1 }] : frameRows
  // 쿠폰 사용: 웹사이트 쿠폰과 제휴처별로 묶는다
  const couponRows = useMemo(() => {
    const m = new Map()
    for (const t of cur.paid) {
      if (!t.coupon) continue
      const found = coupons.find((c) => c.code === t.coupon)
      const k = found?.label || L('Website coupon', '웹사이트 쿠폰')
      const r = m.get(k) || { k, c: 0, v: 0 }
      r.c += 1
      r.v += t.discount || 0
      m.set(k, r)
    }
    return [...m.values()].sort((a, b) => b.c - a.c)
  }, [cur, coupons, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  // 확인할 일: 데이터에서 바로 뽑는다
  const todayRefunds = all.filter((t) => t.status === 'refunded' && !t.history && (t.refundedAt || t.ts) >= feedStart)
  const offline = BOOTHS.filter((b) => !booth[b.id].online)
  const lowCoupons = coupons.filter((c) => c.active && c.maxUses > 0 && c.uses >= c.maxUses - 1)
  const offProducts = products.filter((p) => !p.enabled)
  const paying = BOOTHS.filter((b) => booth[b.id].step === 'pay')
  const todo = []
  if (todayRefunds.length) todo.push({ id: 'refund', label: L('Refunds to review', '환불 내역 확인'), sub: todayRefunds.map((t) => `P${BOOTHS.find((b) => b.id === t.booth)?.n} ${hhmmss(t.refundedAt || t.ts)}`).slice(0, 2).join(' · '), value: `${todayRefunds.length}${L('', '건')}`, go: 'pos' })
  if (offline.length) todo.push({ id: 'off', label: L('Offline booths', '연결 끊긴 부스'), sub: offline.map((b) => b.name[lang] || b.name.ko).join(', '), value: `${offline.length}${L('', '곳')}`, go: null })
  if (lowCoupons.length) todo.push({ id: 'cp', label: L('Coupons almost used up', '쿠폰 소진 임박'), sub: lowCoupons.slice(0, 2).map((c) => c.code).join(' · '), value: `${lowCoupons.length}${L('', '개')}`, go: 'coupon' })
  if (offProducts.length) todo.push({ id: 'prod', label: L('Products switched off', '판매 중지 상품'), sub: offProducts.slice(0, 2).map((p) => p.name[lang] || p.name.ko).join(' · '), value: `${offProducts.length}${L('', '개')}`, go: 'products' })
  if (!hasHistory) todo.push({ id: 'hist', label: L('Monthly and yearly figures are empty', '월·연 통계가 비어 있음'), sub: L('Load past records to fill them', '지난 기록을 불러오면 채워진다'), value: L('Load', '불러오기'), go: 'history' })
  if (paying.length) todo.push({ id: 'pay', label: L('Paying now', '지금 결제 중'), sub: paying.map((b) => b.name[lang] || b.name.ko).join(', '), value: `${paying.length}${L('', '곳')}`, go: null })

  const doGo = (id) => {
    if (id === 'history') return ops.loadHistory(makeHistoryTx({ products }))
    if (id) onGo?.(id)
  }

  return (
    <div ref={wrap} className={`op-dash ${tv ? 'op-tv' : ''} ${pseudo ? 'op-pseudo' : ''}`}>
      <div ref={innerRef} className="op-dash-in" style={tv ? { zoom } : undefined}>
        <header className="op-dash-head">
          <div>
            {tv ? <p className="op-hint">{L('Press F or Esc to exit', 'F 또는 Esc로 나가기')}</p> : null}
            <DateLine now={now} />
            <h2 className="op-h2">
              {pageTitle}
              <span className={`op-live ${connected ? '' : 'op-live-off'}`}>{connected ? L('Live', '실시간') : L('Waiting', '연결 대기')}</span>
            </h2>
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
            <ExportMenu range={range} rows={all.filter((t) => t.ts >= start)} L={L} />
            {tv ? (
              <button type="button" className="op-exit" onClick={exitFull} aria-label={L('Exit (F or Esc)', '나가기 (F 또는 Esc)')}>
                <LogOut size={18} aria-hidden="true" />
                {L('Exit', '나가기')}
              </button>
            ) : (
              <button type="button" className="op-btn op-btn-dark op-btn-sm" onClick={toggleFull} aria-pressed={on}>
                <Maximize2 size={16} aria-hidden="true" />
                {L('Full screen (F)', '전체화면 (F)')}
              </button>
            )}
          </div>
        </header>

        <div className="op-r1">
          <section className="op-card op-card-inv" aria-label={L('Revenue summary', '매출 요약')}>
            <Head title={L('Revenue summary', '매출 요약')} link={L('Sales', '거래·환불')} onLink={() => onGo?.('pos')} />
            <p className="op-sum-label">{rangeName} {L('revenue', '매출')}</p>
            <p className="op-sum-value op-num">{won(cur.revenue)}</p>
            <p className="op-sum-sub op-num">
              {vs} {pctText(cur.revenue, prev.revenue)}
            </p>
            <ul className="op-info-list">
              <Row label={L('Payments', '결제 건수')} sub={methodLine} value={`${cur.count.toLocaleString()}${L('', '건')}`} />
              <Row label={L('Average ticket', '객단가')} sub={`${vs} ${pctText(cur.avg, prev.avg)}`} value={won(cur.avg)} />
              <Row label={L('Refunds', '환불')} sub={cur.refunds ? won(cur.refundAmount) : L('None', '없음')} value={`${cur.refunds}${L('', '건')}`} />
              <Row label={L('Month to date', '이번 달 누계')} sub={`${L('Daily avg.', '일평균')} ${won(month.revenue / dayOfMonth)}`} value={won(month.revenue)} />
              <Row label={L('Year to date', '올해 누계')} sub={`${L('Daily avg.', '일평균')} ${won(year.revenue / dayOfYear)}`} value={won(year.revenue)} />
            </ul>
          </section>

          <section className="op-card" aria-label={chartTitle}>
            <Head title={chartTitle} link={L('Sales', '거래·환불')} onLink={() => onGo?.('pos')} />
            <p className="op-sub-line op-num">
              {L('Highest', '가장 많은 때')} {series.reduce((m, s) => (s.v > m.v ? s : m), { v: 0, label: '—' }).label}
              {series.some((s) => s.v) ? unit : ''} · {L('Total', '합계')} {won(series.reduce((a, s) => a + s.v, 0))}
            </p>
            <Bars series={series} nowKey={nowKey} title={chartTitle} unit={unit} />
            <div className="op-chips" role="radiogroup" aria-label={L('Booth filter', '부스 필터')}>
              {[{ id: 'all', label: L('All', '전체') }, ...BOOTHS.map((b) => ({ id: b.id, label: b.name[lang] || b.name.ko }))].map((c) => (
                <button key={c.id} type="button" role="radio" aria-checked={chartBooth === c.id} className="op-chip-btn" onClick={() => setChartBooth(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          <section className="op-card" aria-label={L('To check', '확인할 일')}>
            <Head title={L('To check', '확인할 일')} />
            {todo.length ? (
              <ul className="op-info-list">
                {todo.map((t) => (
                  <Row key={t.id} label={t.label} sub={t.sub} value={t.value} onClick={t.go ? () => doGo(t.go) : undefined} />
                ))}
              </ul>
            ) : (
              <p className="op-empty">{L('Nothing to check right now.', '지금 확인할 일이 없다.')}</p>
            )}
          </section>
        </div>

        <div className="op-r2">
          <section className="op-card" aria-label={L('Booths', '부스별 현황')}>
            <Head title={L('Booths', '부스별 현황')} />
            <div className="op-table-wrap">
              <table className="op-table op-table-plain">
                <thead>
                  <tr>
                    <th>{L('Booth', '부스')}</th>
                    <th>{L('Status', '상태')}</th>
                    <th>{L('Last payment', '마지막 결제')}</th>
                    <th className="op-right">{L('Today', '오늘')}</th>
                    <th className="op-right">{rangeName} {L('revenue', '매출')}</th>
                    <th className="op-right">{L('Share', '비중')}</th>
                  </tr>
                </thead>
                <tbody>
                  {byBooth.map((b) => {
                    const s = booth[b.id]
                    const step = s.cameraActive ? L('Shooting', '촬영 중') : STEP_LABEL[s.step]?.[lang] || STEP_LABEL[s.step]?.ko || s.step
                    return (
                      <tr key={b.id} className={`op-tr-btn ${sel === b.id ? 'op-tr-sel' : ''}`} onClick={() => ops.selectBooth(b.id)}>
                        <td className="op-strong">
                          <button type="button" className="op-link-btn" aria-pressed={sel === b.id} onClick={() => ops.selectBooth(b.id)}>
                            P{b.n} {b.name[lang] || b.name.ko}
                          </button>
                        </td>
                        <td>{s.online ? step : <span className="op-pill">{L('Offline', '연결 끊김')}</span>}</td>
                        <td className="op-num">{b.last ? `${hhmmss(b.last.ts)} · ${relTime(b.last.ts, now, lang)}` : '—'}</td>
                        <td className="op-num op-right">
                          {b.todayN}
                          {L('', '건')}
                        </td>
                        <td className="op-num op-right">{won(b.v)}</td>
                        <td className="op-num op-right">{cur.revenue ? Math.round((b.v / cur.revenue) * 100) : 0}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="op-card" aria-label={L('Live payments', '실시간 결제')}>
            <Head title={L('Live payments', '실시간 결제')} link={L('Sales', '거래·환불')} onLink={() => onGo?.('pos')} />
            {feed.length ? (
              <div className="op-table-wrap" aria-live="polite">
                <table className="op-table op-table-plain">
                  <thead>
                    <tr>
                      <th>{L('Time', '시각')}</th>
                      <th>{L('Booth', '부스')}</th>
                      <th>{L('Product', '상품')}</th>
                      <th>{L('Method', '결제수단')}</th>
                      <th>{L('Coupon', '쿠폰')}</th>
                      <th className="op-right">{L('Amount', '금액')}</th>
                      <th>{L('Status', '상태')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feed.map((t) => {
                      const pr = products.find((x) => x.id === t.product)
                      const label = pr ? pr.name[lang] || pr.name.ko : t.cuts ? `${t.cuts}${L(' cuts', '컷')}` : '—'
                      const b = BOOTHS.find((x) => x.id === t.booth)
                      return (
                        <tr key={t.id} className={`${now - t.ts < 4000 ? 'op-new' : ''} ${t.status === 'refunded' ? 'op-refunded' : ''}`}>
                          <td className="op-num">{hhmmss(t.ts)}</td>
                          <td>P{b?.n} {b ? b.name[lang] || b.name.ko : ''}</td>
                          <td className="op-strong">{label}</td>
                          <td>{mLabel(t.method)}</td>
                          <td className="op-mono">{t.coupon || '—'}</td>
                          <td className="op-num op-right">{won(t.amount)}</td>
                          <td>{t.status === 'refunded' ? <span className="op-pill">{L('Refunded', '환불됨')}</span> : L('Paid', '완료')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="op-empty">{L('No payments yet today. A payment on any kiosk appears here at once.', '오늘 결제가 아직 없다. 키오스크에서 결제하면 바로 여기에 나타난다.')}</p>
            )}
          </section>
        </div>

        <h3 className="op-sec-title">{L('Sales breakdown', '판매 분석')} · {rangeName}</h3>
        <div className="op-r3">
          <section className="op-card" aria-label={L('Sales by product', '상품별 판매')}>
            <Head title={L('Sales by product', '상품별 판매')} />
            <table className="op-table op-table-plain">
              <thead>
                <tr>
                  <th>{L('Product', '상품')}</th>
                  <th className="op-right">{L('Price', '가격')}</th>
                  <th className="op-right">{L('Sold', '판매')}</th>
                  <th className="op-right">{L('Revenue', '매출')}</th>
                  <th>{L('Share', '비중')}</th>
                </tr>
              </thead>
              <tbody>
                {prodRows.map((p) => (
                  <tr key={p.id || 'other'}>
                    <td className="op-strong">{p.name}</td>
                    <td className="op-num op-right">{p.price ? won(p.price) : '—'}</td>
                    <td className="op-num op-right">
                      {p.c}
                      {L('', '건')}
                    </td>
                    <td className="op-num op-right">{won(p.v)}</td>
                    <td>
                      <span className="op-share op-num">
                        <i style={{ width: `${cur.revenue ? (p.v / cur.revenue) * 100 : 0}%` }} />
                        {cur.revenue ? Math.round((p.v / cur.revenue) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="op-card" aria-label={L('Sales by frame', '프레임별 판매')}>
            <Head title={L('Sales by frame', '프레임별 판매')} />
            {frameRows.length ? (
              <table className="op-table op-table-plain">
                <thead>
                  <tr>
                    <th>{L('Frame', '프레임')}</th>
                    <th className="op-right">{L('Sold', '판매')}</th>
                    <th className="op-right">{L('Revenue', '매출')}</th>
                    <th>{L('Share', '비중')}</th>
                  </tr>
                </thead>
                <tbody>
                  {frameShown.map((r) => (
                    <tr key={r.id || 'none'}>
                      <td className="op-strong">{r.id === '__rest' ? `${L('Others', '그 외')} ${r.n}${L(' frames', '종')}` : r.id ? frameName(r.id) : L('Not chosen', '미선택')}</td>
                      <td className="op-num op-right">{r.c}{L('', '건')}</td>
                      <td className="op-num op-right">{won(r.v)}</td>
                      <td>
                        <span className="op-share op-num">
                          <i style={{ width: `${frameTotal ? (r.c / frameTotal) * 100 : 0}%` }} />
                          {frameTotal ? Math.round((r.c / frameTotal) * 100) : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="op-empty">{L('No frame sales in this period.', '이 기간에 팔린 프레임이 없다.')}</p>
            )}
          </section>
          <section className="op-card" aria-label={L('Payment methods', '결제수단')}>
            <Head title={L('Payment methods', '결제수단')} />
            <table className="op-table op-table-plain">
              <thead>
                <tr>
                  <th>{L('Method', '결제수단')}</th>
                  <th className="op-right">{L('Payments', '건수')}</th>
                  <th className="op-right">{L('Amount', '금액')}</th>
                  <th>{L('Share', '비중')}</th>
                </tr>
              </thead>
              <tbody>
                {methodRows.map((x) => (
                  <tr key={x.m}>
                    <td className="op-strong">{mLabel(x.m)}</td>
                    <td className="op-num op-right">
                      {x.c}
                      {L('', '건')}
                    </td>
                    <td className="op-num op-right">{won(x.v)}</td>
                    <td>
                      <span className="op-share op-num">
                        <i style={{ width: `${cur.count ? (x.c / cur.count) * 100 : 0}%` }} />
                        {cur.count ? Math.round((x.c / cur.count) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {couponRows.length ? (
              <>
                <h4 className="op-h3">{L('Coupon use by channel', '쿠폰 사용 채널')}</h4>
                <ul className="op-info-list">
                  {couponRows.map((r) => (
                    <Row key={r.k} label={r.k} sub={`${L('Discounted', '할인')} ${won(r.v)}`} value={`${r.c}${L('', '건')}`} />
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}
