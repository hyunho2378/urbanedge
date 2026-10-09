// app.js: UrbanEdge 운영 API. 키오스크(쓰기: X-Device-Key), 운영 화면(쓰기: X-Admin-Key), 읽기는 열려 있다.
import express from 'express'
import compression from 'compression'
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { TZ, BOOTHS, DEFAULT_CAMERA } from './db.js'
import { validateChecksum, randomCoupon, isComplete } from './coupon.js'
import { makeHistory } from './history.js'
import { stats } from './stats.js'
import { dailyCode, activeDates } from './daily.js'
import { makeExport } from './export.js'

const METHODS = ['card', 'samsungpay', 'cash', 'coupon']
const BOOTH_IDS = BOOTHS.map((b) => b.id)
const FRAME_ID = /^[a-z0-9][a-z0-9-]{0,40}$/
const PRODUCT_ID = /^[a-z0-9][a-z0-9_-]{0,30}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ms = (d) => (d ? new Date(d).getTime() : null)
const bad = (msg, status = 400) => Object.assign(new Error(msg), { status })
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const int = (v, d = 0) => (v !== null && v !== '' && Number.isFinite(Number(v)) ? Math.round(Number(v)) : d)
const safeEq = (a, b) => {
  const x = Buffer.from(String(a || ''))
  const y = Buffer.from(String(b || ''))
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y)
}
const todayKst = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
const kstToday = todayKst

// ---- 행 → 클라이언트 모양 ----
export const txOut = (r) => ({
  id: r.id,
  booth: r.booth,
  ts: ms(r.ts),
  method: r.method,
  product: r.product,
  amount: r.amount,
  discount: r.discount,
  coupon: r.coupon,
  cuts: r.cuts,
  frameId: r.frame_id,
  couponChannel: r.coupon_channel || null,
  status: r.status,
  refundedAt: ms(r.refunded_at),
  sim: r.sim,
  history: r.origin === 'history',
})
const productOut = (r) => ({ id: r.id, name: r.name, cuts: r.cuts, prints: r.prints, price: r.price, enabled: r.enabled })
const frameOut = (r) => ({ id: r.id, enabled: r.enabled, ...(r.custom ? { custom: r.custom } : {}) })
const couponOut = (r) => ({ code: r.code, label: r.label, kind: r.kind, discount: r.discount, uses: r.uses, maxUses: r.max_uses, date: r.date, active: r.active })
const boothOut = (r) => ({ step: r.step, lang: r.lang, cameraActive: r.camera_active, lastShot: ms(r.last_shot), online: r.online, error: null, lastSeen: ms(r.last_seen) })

export function createApp({ pool, now = () => new Date(), secret = process.env.COUPON_SECRET || process.env.ADMIN_KEY, allowLegacy = process.env.ALLOW_LEGACY === '1', deviceKey = process.env.DEVICE_KEY, adminKey = process.env.ADMIN_KEY, origins = process.env.ALLOWED_ORIGINS, production = process.env.NODE_ENV === 'production' } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  // ---- SSE ----
  const clients = new Set()
  const broadcast = (type, data) => {
    const msg = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`
    for (const c of clients) c.write(msg)
  }

  // ---- CORS ----
  const allowed = new Set(
    (origins || 'https://urbanedge-kiosk.vercel.app,https://urbanedge-web.vercel.app').split(',').map((s) => s.trim()).filter(Boolean),
  )
  const originOk = (o) => !!o && (allowed.has(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o))
  app.use((req, res, next) => {
    const o = req.headers.origin
    if (originOk(o)) {
      res.setHeader('Access-Control-Allow-Origin', o)
      res.setHeader('Vary', 'Origin')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Device-Key, X-Admin-Key')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      res.setHeader('Access-Control-Max-Age', '600')
    }
    if (req.method === 'OPTIONS') return res.sendStatus(originOk(o) ? 204 : 403)
    next()
  })

  // ---- 요청 수 제한(IP마다 1분) ----
  const hits = new Map()
  setInterval(() => hits.clear(), 60_000).unref()
  app.use((req, res, next) => {
    if (req.path === '/api/stream' || req.path === '/api/health') return next()
    const write = req.method !== 'GET'
    const key = `${req.ip}|${write ? 'w' : 'r'}`
    const n = (hits.get(key) || 0) + 1
    hits.set(key, n)
    if (n > (write ? 1500 : 3000)) return res.status(429).json({ error: '요청이 너무 많다. 잠시 뒤에 다시 시도한다.' })
    next()
  })

  // SSE는 압축하지 않는다(조각이 모여서 늦게 도착하는 것을 막는다).
  app.use(compression({ filter: (req, res) => (req.path === '/api/stream' ? false : compression.filter(req, res)) }))
  app.use(express.json({ limit: '256kb' }))

  // ---- 인증 ----
  const keyOk = (configured, given) => (configured ? safeEq(configured, given) : !production)
  const admin = (req, _res, next) => {
    if (!adminKey && production) return next(bad('서버에 ADMIN_KEY가 설정되어 있지 않다.', 503))
    if (!keyOk(adminKey, req.get('x-admin-key'))) return next(bad('관리자 키가 맞지 않다.', 401))
    next()
  }
  const device = (req, _res, next) => {
    if (!deviceKey && production) return next(bad('서버에 DEVICE_KEY가 설정되어 있지 않다.', 503))
    // 관리자 키로도 기기 쓰기를 할 수 있다.
    if (keyOk(deviceKey, req.get('x-device-key')) || (adminKey && safeEq(adminKey, req.get('x-admin-key')))) return next()
    next(bad('기기 키가 맞지 않다.', 401))
  }

  const q = (text, params) => pool.query(text, params)

  // ---- 상태 ----
  async function loadState() {
    const [pr, fr, co, ca, bo, st] = await Promise.all([
      q('SELECT * FROM products ORDER BY sort'),
      q('SELECT * FROM frames ORDER BY sort'),
      q('SELECT * FROM coupons ORDER BY created_at DESC LIMIT 500'),
      q('SELECT * FROM camera_settings'),
      q('SELECT * FROM booths'),
      q("SELECT value FROM settings WHERE key='price'"),
    ])
    const camera = Object.fromEntries(BOOTH_IDS.map((id) => [id, { ...DEFAULT_CAMERA }]))
    for (const r of ca.rows) camera[r.booth] = { ...DEFAULT_CAMERA, ...r.settings }
    const booth = {}
    for (const r of bo.rows) booth[r.id] = boothOut(r)
    return {
      price: st.rows[0] ? Number(st.rows[0].value) : 7000,
      products: pr.rows.map(productOut),
      frames: fr.rows.map(frameOut),
      coupons: co.rows.map(couponOut),
      camera,
      booth,
      serverTime: Date.now(),
    }
  }
  const settingsChanged = (what) => broadcast('settings', { what, at: Date.now() })

  app.get('/api/health', wrap(async (_req, res) => {
    await q('SELECT 1')
    res.json({ ok: true, time: new Date().toISOString(), tz: TZ })
  }))
  app.get('/api/state', wrap(async (_req, res) => res.json(await loadState())))

  // ---- 실시간(SSE) ----
  app.get('/api/stream', (req, res) => {
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' })
    res.flushHeaders()
    res.write(`retry: 3000\nevent: hello\ndata: ${JSON.stringify({ at: Date.now() })}\n\n`)
    clients.add(res)
    const hb = setInterval(() => res.write(`: ping ${Date.now()}\n\n`), 20_000)
    req.on('close', () => {
      clearInterval(hb)
      clients.delete(res)
    })
  })

  // ---- 거래 ----
  const txFrom = (b) => {
    if (!BOOTH_IDS.includes(b.booth)) throw bad('booth는 retro, karaoke, subway 중 하나다.')
    if (!METHODS.includes(b.method)) throw bad('method가 맞지 않다.')
    return {
      id: b.id && UUID.test(b.id) ? b.id : randomUUID(),
      booth: b.booth,
      method: b.method,
      product: b.product ? String(b.product).slice(0, 31) : null,
      amount: Math.max(0, int(b.amount)),
      discount: Math.max(0, int(b.discount)),
      coupon: b.coupon ? String(b.coupon).slice(0, 20) : null,
      cuts: b.cuts == null ? null : int(b.cuts),
      frame_id: b.frameId ? String(b.frameId).slice(0, 41) : null,
      sim: !!b.sim,
      // 기기가 보낸 시각이 '지난 24시간 안, 미래로는 5분 안'이면 그 시각을 쓴다(인터넷이 끊긴 사이의 결제도 제 시각에 남는다). 아니면 서버 시각.
      ts: b.ts && Number(b.ts) > Date.now() - 24 * 3600_000 && Number(b.ts) < Date.now() + 5 * 60_000 ? new Date(Number(b.ts)) : new Date(),
    }
  }
  app.post('/api/tx', device, wrap(async (req, res) => {
    const t = txFrom(req.body || {})
    t.channel = await couponChannelOf(t.coupon)
    // 같은 id를 다시 보내도(재시도) 한 건만 남는다.
    const { rows } = await q(
      `INSERT INTO transactions (id, booth, ts, method, product, amount, discount, coupon, cuts, frame_id, sim, coupon_channel)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET id = EXCLUDED.id RETURNING *`,
      [t.id, t.booth, t.ts, t.method, t.product, t.amount, t.discount, t.coupon, t.cuts, t.frame_id, t.sim, t.channel],
    )
    const out = txOut(rows[0])
    broadcast('tx', out)
    res.status(201).json(out)
  }))
  app.patch('/api/tx/:id', device, wrap(async (req, res) => {
    if (!UUID.test(req.params.id)) throw bad('거래를 찾을 수 없다.', 404)
    const b = req.body || {}
    const { rows } = await q(
      `UPDATE transactions SET cuts = COALESCE($2, cuts), frame_id = COALESCE($3, frame_id), sim = COALESCE($4, sim) WHERE id = $1 RETURNING *`,
      [req.params.id, b.cuts == null ? null : int(b.cuts), b.frameId ? String(b.frameId).slice(0, 41) : null, b.sim == null ? null : !!b.sim],
    )
    if (!rows[0]) throw bad('거래를 찾을 수 없다.', 404)
    const out = txOut(rows[0])
    broadcast('tx', out)
    res.json(out)
  }))
  app.post('/api/tx/:id/refund', admin, wrap(async (req, res) => {
    if (!UUID.test(req.params.id)) throw bad('환불할 수 있는 거래가 없다.', 404)
    const { rows } = await q(`UPDATE transactions SET status='refunded', refunded_at=now() WHERE id=$1 AND status='paid' RETURNING *`, [req.params.id])
    if (!rows[0]) throw bad('환불할 수 있는 거래가 없다(없거나 이미 환불됨).', 404)
    const out = txOut(rows[0])
    broadcast('tx', out)
    res.json(out)
  }))
  app.get('/api/tx', wrap(async (req, res) => {
    const { from, to, booth, method } = req.query
    const limit = Math.min(Math.max(int(req.query.limit, 500), 1), 50000)
    const cond = []
    const p = []
    const add = (sql, v) => (p.push(v), cond.push(sql.replace('?', `$${p.length}`)))
    const date = (v) => {
      const d = new Date(Number.isNaN(Number(v)) ? v : Number(v))
      if (Number.isNaN(d.getTime())) throw bad('from, to 날짜 형식이 맞지 않다.')
      return d
    }
    if (from) add('ts >= ?', date(from))
    if (to) add('ts < ?', date(to))
    if (booth) add('booth = ?', String(booth))
    if (method) add('method = ?', String(method))
    p.push(limit)
    const { rows } = await q(`SELECT * FROM transactions ${cond.length ? 'WHERE ' + cond.join(' AND ') : ''} ORDER BY ts DESC LIMIT $${p.length}`, p)
    res.json(rows.map(txOut))
  }))
  app.get('/api/stats', wrap(async (req, res) => res.json(await stats(pool, String(req.query.range || 'today'), { includeHistory: req.query.history !== '0' }))))

  // ---- 지난 기록 ----
  app.post('/api/history/backfill', admin, wrap(async (req, res) => {
    const kstToday = todayKst()
    const yest = new Date(`${kstToday}T00:00:00Z`)
    yest.setUTCDate(yest.getUTCDate() - 1)
    const from = String(req.body?.from || `${kstToday.slice(0, 4)}-01-01`)
    const to = String(req.body?.to || yest.toISOString().slice(0, 10))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw bad('from, to는 YYYY-MM-DD 형식이다.')
    if (from > to) throw bad('from이 to보다 늦다.')
    if ((new Date(to) - new Date(from)) / 86_400_000 > 800) throw bad('기간이 너무 길다(최대 800일).')
    const { rows: prods } = await q('SELECT * FROM products ORDER BY sort')
    const rows = makeHistory({ from, to, products: prods })
    await q(`DELETE FROM transactions WHERE origin='history' AND ts >= ($1::date)::timestamp AT TIME ZONE $3::text AND ts < (($2::date + 1))::timestamp AT TIME ZONE $3::text`, [from, to, TZ])
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500)
      const params = []
      const values = chunk.map((r, k) => {
        params.push(r.id, r.booth, r.ts, r.method, r.product, r.amount, r.discount, r.coupon, r.cuts, r.status, r.status === 'refunded' ? r.ts : null)
        const o = k * 11
        return `($${o + 1},$${o + 2},$${o + 3},$${o + 4},$${o + 5},$${o + 6},$${o + 7},$${o + 8},$${o + 9},$${o + 10},$${o + 11},'history')`
      })
      await q(`INSERT INTO transactions (id, booth, ts, method, product, amount, discount, coupon, cuts, status, refunded_at, origin) VALUES ${values.join(',')}`, params)
    }
    broadcast('history', { count: rows.length, from, to })
    res.json({ ok: true, inserted: rows.length, from, to })
  }))
  app.delete('/api/history', admin, wrap(async (_req, res) => {
    const r = await q(`DELETE FROM transactions WHERE origin='history'`)
    broadcast('history', { count: 0, cleared: true })
    res.json({ ok: true, deleted: r.rowCount })
  }))

  // 자동 운영(sim)으로 들어간 거래만 지운다.
  app.delete('/api/sim', admin, wrap(async (_req, res) => {
    const r = await q(`DELETE FROM transactions WHERE sim = true`)
    broadcast('history', { cleared: true, sim: true })
    res.json({ ok: true, deleted: r.rowCount })
  }))

  // ---- 상품 ----
  const productBody = (b, partial = false) => {
    const o = {}
    if (b.name !== undefined) {
      if (!b.name || typeof b.name !== 'object') throw bad('name은 { en, ko } 모양이다.')
      o.name = { en: String(b.name.en ?? '').slice(0, 60), ko: String(b.name.ko ?? '').slice(0, 60) }
    }
    for (const k of ['cuts', 'prints', 'price']) {
      if (b[k] === undefined) continue
      const n = int(b[k], NaN)
      if (!Number.isFinite(n) || n < 0 || n > 1_000_000) throw bad(`${k} 값이 맞지 않다.`)
      o[k] = n
    }
    if (b.enabled !== undefined) o.enabled = !!b.enabled
    if (!partial && (o.name === undefined || o.price === undefined)) throw bad('name과 price가 필요하다.')
    return o
  }
  app.get('/api/products', wrap(async (_req, res) => res.json((await q('SELECT * FROM products ORDER BY sort')).rows.map(productOut))))
  app.post('/api/products', admin, wrap(async (req, res) => {
    const b = req.body || {}
    if (!PRODUCT_ID.test(b.id || '')) throw bad('id는 영문 소문자, 숫자, -, _만 쓴다.')
    const o = productBody(b)
    const { rows } = await q(
      `INSERT INTO products (id, name, cuts, prints, price, enabled) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, cuts=EXCLUDED.cuts, prints=EXCLUDED.prints, price=EXCLUDED.price, enabled=EXCLUDED.enabled RETURNING *`,
      [b.id, o.name, o.cuts ?? 4, o.prints ?? 2, o.price, o.enabled ?? true],
    )
    settingsChanged('products')
    res.status(201).json(productOut(rows[0]))
  }))
  app.patch('/api/products/:id', admin, wrap(async (req, res) => {
    const o = productBody(req.body || {}, true)
    const keys = Object.keys(o)
    if (!keys.length) throw bad('바꿀 값이 없다.')
    const sets = keys.map((k, i) => `${k} = $${i + 2}`)
    const { rows } = await q(`UPDATE products SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, [req.params.id, ...keys.map((k) => o[k])])
    if (!rows[0]) throw bad('상품을 찾을 수 없다.', 404)
    settingsChanged('products')
    res.json(productOut(rows[0]))
  }))
  app.delete('/api/products/:id', admin, wrap(async (req, res) => {
    await q('DELETE FROM products WHERE id=$1', [req.params.id])
    settingsChanged('products')
    res.json({ ok: true })
  }))
  app.put('/api/price', admin, wrap(async (req, res) => {
    const n = int(req.body?.price, NaN)
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) throw bad('price 값이 맞지 않다.')
    await q(`INSERT INTO settings (key, value) VALUES ('price', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [JSON.stringify(n)])
    settingsChanged('price')
    res.json({ price: n })
  }))

  // ---- 프레임 ----
  app.put('/api/frames/:id', admin, wrap(async (req, res) => {
    const { rows } = await q('UPDATE frames SET enabled=$2 WHERE id=$1 RETURNING *', [req.params.id, !!req.body?.enabled])
    if (!rows[0]) throw bad('프레임을 찾을 수 없다.', 404)
    settingsChanged('frames')
    res.json(frameOut(rows[0]))
  }))
  app.post('/api/frames', admin, wrap(async (req, res) => {
    const c = req.body?.custom || req.body
    if (!c || !FRAME_ID.test(c.id || '')) throw bad('프레임 id는 영문 소문자, 숫자, -만 쓴다.')
    const custom = {
      id: c.id,
      name: c.name && typeof c.name === 'object' ? { en: String(c.name.en ?? '').slice(0, 40), ko: String(c.name.ko ?? '').slice(0, 40) } : String(c.name ?? c.id).slice(0, 40),
      bg: String(c.bg ?? '#ffffff').slice(0, 16),
      fg: String(c.fg ?? '#111111').slice(0, 16),
      cuts: int(c.cuts, 4),
      base: c.base ? String(c.base).slice(0, 41) : undefined,
    }
    const { rows } = await q(`INSERT INTO frames (id, enabled, custom) VALUES ($1,true,$2) ON CONFLICT (id) DO UPDATE SET custom=EXCLUDED.custom RETURNING *`, [custom.id, custom])
    settingsChanged('frames')
    res.status(201).json(frameOut(rows[0]))
  }))

  // ---- 쿠폰 ----
  const couponIns = (c) => q(
    `INSERT INTO coupons (code, label, kind, discount, max_uses, date, active) VALUES ($1,$2,$3,$4,$5,$6,true)
     ON CONFLICT (code) DO UPDATE SET label=EXCLUDED.label, discount=EXCLUDED.discount, date=EXCLUDED.date, active=true RETURNING *`,
    [c.code, String(c.label ?? '').slice(0, 60), ['single', 'daily'].includes(c.kind) ? c.kind : 'single', Math.max(0, int(c.discount)), Math.max(0, int(c.maxUses)), c.date || null],
  )
  app.get('/api/coupons', wrap(async (_req, res) => res.json((await q('SELECT * FROM coupons ORDER BY created_at DESC LIMIT 500')).rows.map(couponOut))))
  app.post('/api/coupons', admin, wrap(async (req, res) => {
    const b = req.body || {}
    if (!isComplete(b.code || '')) throw bad('쿠폰 코드는 UE-XXXX-XXXX 형식이다.')
    const { rows } = await couponIns(b)
    settingsChanged('coupons')
    res.status(201).json(couponOut(rows[0]))
  }))
  app.post('/api/coupons/batch', admin, wrap(async (req, res) => {
    const n = Math.min(Math.max(int(req.body?.n, 10), 1), 200)
    const out = []
    for (let i = 0; i < n; i++) {
      const { rows } = await couponIns({ code: randomCoupon(), label: req.body?.label ?? '', kind: 'single', discount: req.body?.discount, maxUses: 1 })
      out.push(couponOut(rows[0]))
    }
    settingsChanged('coupons')
    res.status(201).json(out)
  }))
  app.patch('/api/coupons/:code/toggle', admin, wrap(async (req, res) => {
    const { rows } = await q('UPDATE coupons SET active = NOT active WHERE code=$1 RETURNING *', [req.params.code])
    if (!rows[0]) throw bad('쿠폰을 찾을 수 없다.', 404)
    settingsChanged('coupons')
    res.json(couponOut(rows[0]))
  }))
  // ---- 하루마다 바뀌는 코드(웹사이트 + 제휴처) ----
  const adminOk = (req) => !!adminKey && safeEq(adminKey, req.get('x-admin-key'))
  async function channels() {
    const { rows: w } = await q(`SELECT value FROM settings WHERE key='web_discount'`)
    const web = { channel: 'web', label: '웹사이트', discount: w[0] ? Number(w[0].value) : 1000 }
    const { rows } = await q('SELECT * FROM partners WHERE active ORDER BY created_at')
    return [web, ...rows.map((r) => ({ channel: r.id, label: r.label, discount: r.discount }))]
  }
  // 코드 하나가 지금 받아 주는 날짜의 어느 채널 코드인지 찾는다.
  async function findDaily(code) {
    if (!secret) return null
    const dates = activeDates(now())
    for (const ch of await channels()) for (const d of dates) if (dailyCode(secret, ch.channel, d) === code) return { ...ch, date: d }
    return null
  }
  async function couponChannelOf(code) {
    if (!code) return null
    code = String(code).toUpperCase().trim()
    const d = await findDaily(code)
    if (d) return d.channel
    const { rows } = await q('SELECT kind FROM coupons WHERE code=$1', [code])
    if (rows[0]) return 'single'
    return validateChecksum(code) ? 'legacy' : null
  }
  app.get('/api/coupons/today', wrap(async (req, res) => {
    const date = activeDates(now())[0]
    const all = await channels()
    const isAdmin = adminOk(req)
    const list = (isAdmin ? all : all.filter((c) => c.channel === 'web')).map((c) => ({ channel: c.channel, label: c.label, code: dailyCode(secret, c.channel, date), discount: c.discount }))
    res.set('Cache-Control', 'no-store')
    res.json({ date, codes: list })
  }))
  app.put('/api/coupons/web', admin, wrap(async (req, res) => {
    const n = int(req.body?.discount, NaN)
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) throw bad('discount 값이 맞지 않다.')
    await q(`INSERT INTO settings (key, value) VALUES ('web_discount', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [JSON.stringify(n)])
    settingsChanged('coupons')
    res.json({ discount: n })
  }))
  const partnerOut = (r) => ({ id: r.id, label: r.label, discount: r.discount, active: r.active })
  app.get('/api/partners', admin, wrap(async (_req, res) => res.json((await q('SELECT * FROM partners ORDER BY created_at')).rows.map(partnerOut))))
  app.post('/api/partners', admin, wrap(async (req, res) => {
    const b = req.body || {}
    if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(b.id || '') || b.id === 'web' || b.id === 'single' || b.id === 'legacy') throw bad('id는 영문 소문자, 숫자, -만 쓰고 web, single, legacy는 쓸 수 없다.')
    if (!b.label) throw bad('label이 필요하다.')
    const { rows } = await q(
      `INSERT INTO partners (id, label, discount, active) VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, discount=EXCLUDED.discount, active=EXCLUDED.active RETURNING *`,
      [b.id, String(b.label).slice(0, 40), Math.max(0, int(b.discount)), b.active !== false],
    )
    settingsChanged('coupons')
    res.status(201).json(partnerOut(rows[0]))
  }))
  app.patch('/api/partners/:id', admin, wrap(async (req, res) => {
    const b = req.body || {}
    const { rows } = await q(
      `UPDATE partners SET label = COALESCE($2, label), discount = COALESCE($3, discount), active = COALESCE($4, active) WHERE id=$1 RETURNING *`,
      [req.params.id, b.label ? String(b.label).slice(0, 40) : null, b.discount == null ? null : Math.max(0, int(b.discount)), b.active == null ? null : !!b.active],
    )
    if (!rows[0]) throw bad('제휴처를 찾을 수 없다.', 404)
    settingsChanged('coupons')
    res.json(partnerOut(rows[0]))
  }))
  app.delete('/api/partners/:id', admin, wrap(async (req, res) => {
    await q('DELETE FROM partners WHERE id=$1', [req.params.id])
    settingsChanged('coupons')
    res.json({ ok: true })
  }))

  // 확인(소모하지 않음). 결과 { ok, discount, label, channel }
  async function couponCheck(code, due) {
    code = String(code || '').toUpperCase().trim()
    const cap = (n) => (due != null ? Math.min(n, due) : n)
    const dl = await findDaily(code)
    if (dl) return { ok: true, discount: cap(dl.discount), label: dl.label, kind: 'daily', channel: dl.channel }
    const { rows } = await q('SELECT * FROM coupons WHERE code=$1 AND active', [code])
    const c = rows[0]
    if (c) {
      if (c.kind === 'daily' && c.date !== kstToday()) return { ok: false }
      if (c.max_uses && c.uses >= c.max_uses) return { ok: false }
      return { ok: true, discount: cap(c.discount), label: c.label, kind: c.kind, channel: 'single' }
    }
    if (allowLegacy && validateChecksum(code)) {
      const used = await q('SELECT 1 FROM coupon_redemptions WHERE code=$1', [code])
      if (used.rowCount) return { ok: false, used: true }
      return { ok: true, discount: due ?? 0, label: 'web', kind: 'web', channel: 'legacy' }
    }
    return { ok: false }
  }
  app.post('/api/coupons/check', device, wrap(async (req, res) => res.json(await couponCheck(req.body?.code, req.body?.due == null ? null : int(req.body.due)))))
  app.post('/api/coupons/redeem', device, wrap(async (req, res) => {
    const code = String(req.body?.code || '').toUpperCase().trim()
    const txId = req.body?.txId && UUID.test(req.body.txId) ? req.body.txId : null
    // 하루 코드는 그날 여러 번 쓸 수 있다(채널은 거래에 남는다).
    const dl = await findDaily(code)
    if (dl) return res.json({ ok: true, channel: dl.channel })
    const reg = await q('SELECT 1 FROM coupons WHERE code=$1', [code])
    if (reg.rowCount) {
      const { rows } = await q(`UPDATE coupons SET uses = uses + 1 WHERE code=$1 AND active AND (max_uses = 0 OR uses < max_uses) RETURNING *`, [code])
      if (!rows[0]) throw bad('이미 다 쓴 쿠폰이거나 꺼져 있다.', 409)
      settingsChanged('coupons')
      return res.json({ ok: true, coupon: couponOut(rows[0]), channel: 'single' })
    }
    if (!allowLegacy || !validateChecksum(code)) throw bad('쿠폰 코드가 맞지 않다.', 404)
    const r = await q('INSERT INTO coupon_redemptions (code, tx_id) VALUES ($1,$2) ON CONFLICT (code) DO NOTHING', [code, txId])
    if (!r.rowCount) throw bad('이미 사용한 쿠폰이다.', 409)
    res.json({ ok: true, web: true, channel: 'legacy' })
  }))

  // ---- 내보내기 ----
  app.get('/api/export', admin, wrap(async (req, res) => {
    const f = await makeExport(pool, { format: String(req.query.format || 'csv'), range: String(req.query.range || 'today'), kind: String(req.query.kind || 'tx') })
    res.set({
      'Content-Type': f.mime,
      'Content-Disposition': `attachment; filename="export.${f.filename.split('.').pop()}"; filename*=UTF-8''${encodeURIComponent(f.filename)}`,
      'Content-Length': String(f.body.length),
      'Cache-Control': 'no-store',
      'Access-Control-Expose-Headers': 'Content-Disposition',
    })
    res.send(f.body)
  }))

  // ---- 카메라와 부스 ----
  const CAM = { zoom: [1, 1.6], brightness: [0.7, 1.5], contrast: [0.8, 1.4], warmth: [-1, 1] }
  app.put('/api/camera/:booth', admin, wrap(async (req, res) => {
    if (!BOOTH_IDS.includes(req.params.booth)) throw bad('없는 부스다.', 404)
    const b = req.body || {}
    const s = {}
    if (b.mirror !== undefined) s.mirror = !!b.mirror
    if (b.filter !== undefined) {
      if (!['original', 'mono', 'film', 'warm', 'cool'].includes(b.filter)) throw bad('filter 값이 맞지 않다.')
      s.filter = b.filter
    }
    for (const [k, [lo, hi]] of Object.entries(CAM)) {
      if (b[k] === undefined) continue
      const n = Number(b[k])
      if (!Number.isFinite(n)) throw bad(`${k} 값이 맞지 않다.`)
      s[k] = Math.min(hi, Math.max(lo, n))
    }
    const { rows } = await q(
      `INSERT INTO camera_settings (booth, settings) VALUES ($1,$2)
       ON CONFLICT (booth) DO UPDATE SET settings = camera_settings.settings || EXCLUDED.settings RETURNING settings`,
      [req.params.booth, s],
    )
    const settings = { ...DEFAULT_CAMERA, ...rows[0].settings }
    broadcast('camera', { booth: req.params.booth, settings })
    res.json(settings)
  }))
  app.put('/api/booths/:id', device, wrap(async (req, res) => {
    if (!BOOTH_IDS.includes(req.params.id)) throw bad('없는 부스다.', 404)
    const b = req.body || {}
    const { rows } = await q(
      `UPDATE booths SET step = COALESCE($2, step), lang = COALESCE($3, lang), camera_active = COALESCE($4, camera_active),
              online = COALESCE($5, online), last_shot = COALESCE($6, last_shot), last_seen = now()
        WHERE id = $1 RETURNING *`,
      [req.params.id, b.step ? String(b.step).slice(0, 24) : null, b.lang === 'ko' || b.lang === 'en' ? b.lang : null, b.cameraActive == null ? null : !!b.cameraActive, b.online == null ? null : !!b.online, b.lastShot ? new Date(Number(b.lastShot)) : null],
    )
    broadcast('booth', { id: req.params.id, ...boothOut(rows[0]) })
    res.json(boothOut(rows[0]))
  }))

  // ---- 저장 폴더(작은 썸네일) ----
  app.post('/api/files', device, wrap(async (req, res) => {
    const b = req.body || {}
    if (!BOOTH_IDS.includes(b.booth)) throw bad('booth가 맞지 않다.')
    const url = String(b.url || '')
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(url)) throw bad('url은 이미지 data URL이다.')
    if (url.length > 40_000) throw bad('썸네일이 너무 크다(40KB 이하).', 413)
    const kind = b.kind === 'print' ? 'print' : 'shot'
    const { rows } = await q('INSERT INTO files (booth, kind, thumb) VALUES ($1,$2,$3) RETURNING id, booth, ts, kind, thumb', [b.booth, kind, url])
    await q(`DELETE FROM files WHERE booth=$1 AND id NOT IN (SELECT id FROM files WHERE booth=$1 ORDER BY ts DESC LIMIT 60)`, [b.booth])
    const out = { id: rows[0].id, booth: rows[0].booth, ts: ms(rows[0].ts), kind: rows[0].kind, url: rows[0].thumb }
    broadcast('file', out)
    res.status(201).json(out)
  }))
  app.get('/api/files', wrap(async (req, res) => {
    const p = []
    let where = ''
    if (req.query.booth) {
      p.push(String(req.query.booth))
      where = 'WHERE booth = $1'
    }
    const { rows } = await q(`SELECT id, booth, ts, kind, thumb FROM files ${where} ORDER BY ts DESC LIMIT 120`, p)
    res.json(rows.map((r) => ({ id: r.id, booth: r.booth, ts: ms(r.ts), kind: r.kind, url: r.thumb })))
  }))

  // ---- 설정 내보내기/불러오기(클라이언트 exportSettings와 같은 모양) ----
  app.get('/api/settings/export', wrap(async (_req, res) => {
    const s = await loadState()
    res.json({ app: 'urbanedge-ops', version: 1, exportedAt: new Date().toISOString(), price: s.price, products: s.products, frames: s.frames, coupons: s.coupons, camera: s.camera })
  }))
  app.post('/api/settings/import', admin, wrap(async (req, res) => {
    const o = req.body
    if (!o || o.app !== 'urbanedge-ops') throw bad('UrbanEdge 설정 파일이 아니다.')
    if (o.products && (!Array.isArray(o.products) || o.products.some((p) => !p || !PRODUCT_ID.test(p.id || '') || !Number.isFinite(Number(p.price)))))
      throw bad('상품 목록에 읽을 수 없는 줄이 있다.')
    const c = await pool.connect()
    try {
      await c.query('BEGIN')
      if (Number.isFinite(Number(o.price))) await c.query(`INSERT INTO settings (key, value) VALUES ('price', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [JSON.stringify(Number(o.price))])
      if (Array.isArray(o.products)) {
        await c.query('DELETE FROM products')
        for (const p of o.products) {
          const n = productBody({ ...p, name: p.name && typeof p.name === 'object' ? p.name : { en: p.id, ko: p.id } })
          await c.query('INSERT INTO products (id, name, cuts, prints, price, enabled) VALUES ($1,$2,$3,$4,$5,$6)', [p.id, n.name, n.cuts ?? 4, n.prints ?? 2, n.price, n.enabled ?? true])
        }
      }
      if (Array.isArray(o.frames)) {
        for (const f of o.frames) {
          if (!FRAME_ID.test(f?.id || '')) continue
          await c.query(`INSERT INTO frames (id, enabled, custom) VALUES ($1,$2,$3) ON CONFLICT (id) DO UPDATE SET enabled=EXCLUDED.enabled, custom=COALESCE(EXCLUDED.custom, frames.custom)`, [f.id, !!f.enabled, f.custom || null])
        }
      }
      if (Array.isArray(o.coupons)) {
        for (const k of o.coupons) {
          if (!isComplete(k?.code || '')) continue
          await c.query(
            `INSERT INTO coupons (code, label, kind, discount, uses, max_uses, date, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
             ON CONFLICT (code) DO UPDATE SET label=EXCLUDED.label, kind=EXCLUDED.kind, discount=EXCLUDED.discount, uses=EXCLUDED.uses, max_uses=EXCLUDED.max_uses, date=EXCLUDED.date, active=EXCLUDED.active`,
            [k.code, String(k.label ?? '').slice(0, 60), k.kind === 'daily' ? 'daily' : 'single', Math.max(0, int(k.discount)), Math.max(0, int(k.uses)), Math.max(0, int(k.maxUses)), k.date || null, k.active !== false],
          )
        }
      }
      if (o.camera && typeof o.camera === 'object') {
        for (const id of BOOTH_IDS) {
          if (o.camera[id]) await c.query('INSERT INTO camera_settings (booth, settings) VALUES ($1,$2) ON CONFLICT (booth) DO UPDATE SET settings=EXCLUDED.settings', [id, { ...DEFAULT_CAMERA, ...o.camera[id] }])
        }
      }
      await c.query('COMMIT')
    } catch (e) {
      await c.query('ROLLBACK').catch(() => {})
      throw e
    } finally {
      c.release()
    }
    settingsChanged('all')
    res.json({ ok: true })
  }))

  app.use('/api', (_req, _res, next) => next(bad('없는 주소다.', 404)))
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || (err.type === 'entity.too.large' ? 413 : 500)
    if (status === 500) console.error('[error]', err.message)
    res.status(status).json({ error: status >= 500 ? '서버에서 처리하지 못했다.' : err.message })
  })
  return { app, broadcast, clients }
}
