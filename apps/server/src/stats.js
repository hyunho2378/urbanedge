// stats.js: 기간별 매출 통계를 SQL로 계산한다(한국 시간 기준).
// range: today(시간대별) | week(요일별, 월요일 시작) | month(일별) | year(월별)
// previous: 직전 같은 기간의 같은 시점까지(어제 같은 시각, 지난주 같은 시점, 지난달 같은 날까지, 작년 같은 날까지).
import { TZ } from './db.js'

const UNIT = { today: 'hour', week: 'day', month: 'day', year: 'month' }
const LABEL = { hour: 'HH24', day: 'MM-DD', month: 'YYYY-MM' }
const START = {
  today: `date_trunc('day', now() AT TIME ZONE $1)`,
  week: `date_trunc('week', now() AT TIME ZONE $1)`,
  month: `date_trunc('month', now() AT TIME ZONE $1)`,
  year: `date_trunc('year', now() AT TIME ZONE $1)`,
}
const SHIFT = { today: `interval '1 day'`, week: `interval '7 days'`, month: `interval '1 month'`, year: `interval '1 year'` }

export async function stats(pool, range = 'today', opts = {}) {
  if (!UNIT[range]) throw Object.assign(new Error('range는 today, week, month, year 중 하나다.'), { status: 400 })
  const unit = UNIT[range]
  const lbl = LABEL[unit]
  const { rows: b } = await pool.query(
    `SELECT ${START[range]} AT TIME ZONE $1 AS cur_start,
            now() AS cur_end,
            (${START[range]} - ${SHIFT[range]}) AT TIME ZONE $1 AS prev_start,
            ((${START[range]} - ${SHIFT[range]}) + (now() - (${START[range]} AT TIME ZONE $1))) AT TIME ZONE $1 AS prev_end`,
    [TZ],
  )
  const w = b[0]
  const hist = opts.includeHistory === false ? `AND origin <> 'history'` : ''
  const totals = async (from, to) => {
    const { rows } = await pool.query(
      `SELECT count(*) FILTER (WHERE status='paid')::int AS count,
              coalesce(sum(amount) FILTER (WHERE status='paid'),0)::int AS revenue,
              count(*) FILTER (WHERE status='refunded')::int AS refund_count,
              coalesce(sum(CASE WHEN status='refunded' THEN amount ELSE 0 END),0)::int AS refund_amount
         FROM transactions WHERE ts >= $1 AND ts < $2 ${hist}`,
      [from, to],
    )
    const r = rows[0]
    return { count: r.count, revenue: r.revenue, avg: r.count ? Math.round(r.revenue / r.count) : 0, refundCount: r.refund_count, refundAmount: r.refund_amount }
  }
  const group = async (col) => {
    const { rows } = await pool.query(
      `SELECT ${col} AS key, count(*)::int AS count, coalesce(sum(amount),0)::int AS revenue
         FROM transactions WHERE status='paid' AND ts >= $1 AND ts < $2 ${hist}
        GROUP BY 1 ORDER BY revenue DESC`,
      [w.cur_start, w.cur_end],
    )
    return rows
  }
  const [current, previous, byBooth, byProduct, byMethod] = await Promise.all([
    totals(w.cur_start, w.cur_end),
    totals(w.prev_start, w.prev_end),
    group('booth'),
    group(`coalesce(product,'-')`),
    group('method'),
  ])
  const { rows: buckets } = await pool.query(
    `SELECT to_char(date_trunc('${unit}', ts AT TIME ZONE $3::text), '${lbl}') AS key, booth,
            count(*)::int AS count, coalesce(sum(amount),0)::int AS revenue
       FROM transactions WHERE status='paid' AND ts >= $1 AND ts < $2 ${hist}
      GROUP BY 1, 2 ORDER BY 1, 2`,
    [w.cur_start, w.cur_end, TZ],
  )
  return { range, unit, tz: TZ, from: w.cur_start, to: w.cur_end, previousFrom: w.prev_start, previousTo: w.prev_end, current, previous, byBooth, byProduct, byMethod, buckets }
}
