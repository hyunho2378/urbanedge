// 사용: API_URL=http://localhost:8787 DEVICE_KEY=... ADMIN_KEY=... node test/smoke.mjs
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { randomCoupon } from '../src/coupon.js'
const A = process.env.API_URL || 'http://localhost:8787'
const D = { 'content-type': 'application/json', 'x-device-key': process.env.DEVICE_KEY || 'devkey' }
const M = { 'content-type': 'application/json', 'x-admin-key': process.env.ADMIN_KEY || 'adminkey' }
const call = async (method, path, body, headers = {}) => {
  const r = await fetch(A + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  let j = null
  try { j = await r.json() } catch {}
  return { status: r.status, body: j }
}
const ok = (name) => console.log('ok  ', name)

// SSE 수신 준비
const events = []
const ctl = new AbortController()
fetch(A + '/api/stream', { signal: ctl.signal }).then(async (r) => {
  const rd = r.body.getReader(); const dec = new TextDecoder(); let buf = ''
  for (;;) { const { value, done } = await rd.read(); if (done) break; buf += dec.decode(value)
    let i; while ((i = buf.indexOf('\n\n')) >= 0) { const chunk = buf.slice(0, i); buf = buf.slice(i + 2)
      const t = /event: (\w+)/.exec(chunk)?.[1]; const d = /data: (.*)/.exec(chunk)?.[1]; if (t) events.push({ t, d: d ? JSON.parse(d) : null }) } }
}).catch(() => {})
await new Promise((r) => setTimeout(r, 300))

assert.equal((await call('GET', '/api/health')).body.ok, true); ok('health')
const st = (await call('GET', '/api/state')).body
assert.equal(st.products.length >= 4, true); assert.equal(st.frames.length >= 16, true); assert.ok(st.camera.retro); ok('state seeded')

// 인증
assert.equal((await call('POST', '/api/tx', { booth: 'subway', method: 'card', amount: 7000 }, { 'content-type': 'application/json' })).status, 401); ok('device key required')
assert.equal((await call('POST', '/api/products', { id: 'x', name: { en: 'x', ko: 'x' }, price: 1 }, D)).status, 401); ok('admin key required for admin writes')

// 결제 → DB → SSE
const id = randomUUID()
const t = await call('POST', '/api/tx', { id, booth: 'subway', method: 'card', amount: 7000, product: 'grid4', cuts: 4 }, D)
assert.equal(t.status, 201); assert.equal(t.body.id, id)
await call('POST', '/api/tx', { id, booth: 'subway', method: 'card', amount: 7000, product: 'grid4', cuts: 4 }, D) // 재시도
const list = (await call('GET', '/api/tx?limit=50')).body
assert.equal(list.filter((x) => x.id === id).length, 1); ok('tx stored once (idempotent)')
const p = await call('PATCH', `/api/tx/${id}`, { cuts: 8, frameId: 'classic-black' }, D)
assert.equal(p.body.frameId, 'classic-black')
assert.equal((await call('PATCH', `/api/tx/${id}`, { sim: true }, D)).body.sim, true); ok('tx patched (cuts, frame, sim)')
await new Promise((r) => setTimeout(r, 300))
assert.ok(events.some((e) => e.t === 'tx' && e.d.id === id), 'SSE tx event'); ok('SSE delivered tx')

// 통계
const s = (await call('GET', '/api/stats?range=today')).body
assert.ok(s.current.count >= 1 && s.current.revenue >= 7000); assert.ok(s.buckets.length >= 1); ok(`stats today: ${s.current.count} tx ${s.current.revenue} won`)

// 환불
assert.equal((await call('POST', `/api/tx/${id}/refund`, {}, D)).status, 401)
const rf = await call('POST', `/api/tx/${id}/refund`, {}, M); assert.equal(rf.body.status, 'refunded')
assert.equal((await call('POST', `/api/tx/${id}/refund`, {}, M)).status, 404); ok('refund once')

// 상품
await call('POST', '/api/products', { id: 'test9', name: { en: 'Test', ko: '시험' }, cuts: 6, price: 12345 }, M)
await call('PATCH', '/api/products/test9', { price: 12000 }, M)
assert.equal((await call('GET', '/api/products')).body.find((x) => x.id === 'test9').price, 12000)
await call('DELETE', '/api/products/test9', undefined, M); ok('products CRUD')

// 쿠폰
const batch = await call('POST', '/api/coupons/batch', { n: 3, discount: 3000, label: '시험' }, M)
assert.equal(batch.body.length, 3)
const code = batch.body[0].code
assert.deepEqual((await call('POST', '/api/coupons/check', { code, due: 7000 }, D)).body.discount, 3000)
assert.equal((await call('POST', '/api/coupons/redeem', { code }, D)).status, 200)
assert.equal((await call('POST', '/api/coupons/redeem', { code }, D)).status, 409)
assert.equal((await call('POST', '/api/coupons/check', { code, due: 7000 }, D)).body.ok, false); ok('single-use coupon')
const web = randomCoupon() // 웹사이트 쿠폰은 코드마다 한 번만 쓸 수 있으므로 매번 새 코드로 시험한다
assert.equal((await call('POST', '/api/coupons/check', { code: web, due: 7000 }, D)).body.discount, 7000)
assert.equal((await call('POST', '/api/coupons/redeem', { code: web }, D)).status, 200)
assert.equal((await call('POST', '/api/coupons/redeem', { code: web }, D)).status, 409); ok('website coupon once per code')

// 프레임, 카메라, 부스, 파일
assert.equal((await call('PUT', '/api/frames/classic-black', { enabled: false }, M)).body.enabled, false)
await call('PUT', '/api/frames/classic-black', { enabled: true }, M)
assert.equal((await call('POST', '/api/frames', { id: 'my-frame', name: { en: 'Mine', ko: '내 프레임' }, bg: '#111111', fg: '#ffffff', cuts: 4, base: 'classic-white' }, M)).status, 201); ok('frames')
const cam = await call('PUT', '/api/camera/retro', { brightness: 9, filter: 'mono', mirror: false }, M)
assert.equal(cam.body.brightness, 1.5); assert.equal(cam.body.filter, 'mono')
assert.equal((await call('GET', '/api/state')).body.camera.retro.filter, 'mono'); ok('camera settings persist (clamped)')
assert.equal((await call('PUT', '/api/booths/retro', { step: 'shoot', cameraActive: true, lang: 'ko' }, D)).body.step, 'shoot'); ok('booth heartbeat')
const tiny = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
assert.equal((await call('POST', '/api/files', { booth: 'retro', kind: 'shot', url: tiny }, D)).status, 201)
assert.equal((await call('GET', '/api/files?booth=retro')).body.length >= 1, true); ok('files')

// 지난 기록
const bf = await call('POST', '/api/history/backfill', {}, M); assert.ok(bf.body.inserted > 100); ok(`history backfill ${bf.body.inserted}`)
const yr = (await call('GET', '/api/stats?range=year')).body
assert.ok(yr.current.count > 100 && yr.buckets.some((b) => b.key.length === 7)); ok(`stats year ${yr.current.count} tx`)
const month = (await call('GET', '/api/stats?range=month')).body; assert.ok(month.unit === 'day'); ok('stats month')
assert.ok((await call('GET', '/api/stats?range=week')).body.previous); ok('stats week')

// 설정 내보내기/불러오기
const ex = (await call('GET', '/api/settings/export')).body
ex.products[0].price = 5500
assert.equal((await call('POST', '/api/settings/import', ex, M)).status, 200)
assert.equal((await call('GET', '/api/state')).body.products[0].price, 5500)
ex.products[0].price = 5000; await call('POST', '/api/settings/import', ex, M)
assert.equal((await call('POST', '/api/settings/import', { app: 'x' }, M)).status, 400); ok('settings export/import')

assert.equal((await call('DELETE', '/api/history', undefined, M)).body.ok, true); ok('history cleared')
assert.equal((await call('DELETE', '/api/sim', undefined, D)).status, 401)
assert.ok((await call('DELETE', '/api/sim', undefined, M)).body.deleted >= 1); ok('sim rows cleared')
ctl.abort()
console.log('ALL OK')
process.exit(0)
