// 하루 코드, 프레임별 매출, 내보내기 시험(가짜 시계). DATABASE_URL이 PGlite 소켓이나 Postgres를 가리켜야 한다.
// 사용: DATABASE_URL=postgres://localhost:54329/postgres PGSSL=off node test/daily.mjs
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { makePool, migrate } from '../src/db.js'
import { createApp } from '../src/app.js'
import { dailyCode } from '../src/daily.js'
import { randomCoupon } from '../src/coupon.js'

const ok = (n) => console.log('ok  ', n)
const SECRET = 'test-secret'
const pool = makePool()
await migrate(pool)
let clock = new Date('2026-10-09T05:00:00Z') // 한국 14시
const { app } = createApp({ pool, secret: SECRET, deviceKey: 'dev', adminKey: 'adm', now: () => clock, allowLegacy: false, production: true })
const server = app.listen(0)
const A = `http://127.0.0.1:${server.address().port}`
const D = { 'content-type': 'application/json', 'x-device-key': 'dev' }
const M = { 'content-type': 'application/json', 'x-admin-key': 'adm' }
const call = async (method, p, body, h = {}) => {
  const r = await fetch(A + p, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) })
  let j = null
  try { j = await r.clone().json() } catch {}
  return { status: r.status, body: j, res: r }
}

// 1. 오늘 코드: 공개는 웹만, 관리자는 전체
await call('POST', '/api/partners', { id: 'olive', label: '올리브 카페', discount: 1500 }, M)
const pub = (await call('GET', '/api/coupons/today')).body
assert.equal(pub.date, '2026-10-09'); assert.equal(pub.codes.length, 1); assert.equal(pub.codes[0].channel, 'web')
assert.equal(pub.codes[0].code, dailyCode(SECRET, 'web', '2026-10-09'))
const adm = (await call('GET', '/api/coupons/today', undefined, M)).body
assert.equal(adm.codes.length, 2); const olive = adm.codes.find((c) => c.channel === 'olive'); assert.equal(olive.discount, 1500)
assert.notEqual(olive.code, pub.codes[0].code); ok('today codes (public: web only, admin: all)')

// 2. 사용과 채널 기록
const chk = (await call('POST', '/api/coupons/check', { code: olive.code, due: 7000 }, D)).body
assert.equal(chk.ok, true); assert.equal(chk.discount, 1500); assert.equal(chk.channel, 'olive')
assert.equal((await call('POST', '/api/coupons/check', { code: pub.codes[0].code, due: 500 }, D)).body.discount, 500)
const tx1 = randomUUID()
await call('POST', '/api/tx', { id: tx1, booth: 'subway', method: 'coupon', product: 'grid4', amount: 5500, discount: 1500, coupon: olive.code, frameId: 'classic-black' }, D)
const t = (await call('GET', '/api/tx?limit=5')).body.find((x) => x.id === tx1)
assert.equal(t.couponChannel, 'olive'); ok('check, cap by due, tx channel recorded')
assert.equal((await call('POST', '/api/coupons/redeem', { code: olive.code }, D)).status, 200)
assert.equal((await call('POST', '/api/coupons/redeem', { code: olive.code }, D)).status, 200); ok('daily code reusable same day')

// 3. 자정 회전, 어제 코드 유예(02시까지)
clock = new Date('2026-10-09T15:30:00Z') // 한국 10-10 00:30
assert.equal((await call('GET', '/api/coupons/today')).body.codes[0].code, dailyCode(SECRET, 'web', '2026-10-10'))
assert.equal((await call('POST', '/api/coupons/check', { code: olive.code, due: 7000 }, D)).body.ok, true, 'grace: yesterday ok at 00:30')
clock = new Date('2026-10-09T17:10:00Z') // 한국 02:10
assert.equal((await call('POST', '/api/coupons/check', { code: olive.code, due: 7000 }, D)).body.ok, false, 'yesterday rejected after 02:00')
const newOlive = (await call('GET', '/api/coupons/today', undefined, M)).body.codes.find((c) => c.channel === 'olive')
assert.notEqual(newOlive.code, olive.code); assert.equal((await call('POST', '/api/coupons/check', { code: newOlive.code, due: 7000 }, D)).body.ok, true); ok('rotation at KST midnight, 02:00 grace')
clock = new Date('2026-10-09T05:00:00Z')

// 4. 이전 체크섬 코드는 기본으로 꺼져 있다
assert.equal((await call('POST', '/api/coupons/check', { code: 'UE-AAAA-AAAA', due: 7000 }, D)).body.ok, false)
assert.equal((await call('POST', '/api/coupons/check', { code: randomCoupon(), due: 7000 }, D)).body.ok, false)
assert.equal((await call('POST', '/api/coupons/redeem', { code: randomCoupon() }, D)).status, 404); ok('legacy checksum codes rejected (ALLOW_LEGACY off)')

// 5. 프레임별 매출(이전 실행이 남아 있어도 되게 변화량으로 확인)
const s0 = (await call('GET', '/api/stats?range=today')).body
const b0 = Object.fromEntries(s0.byFrame.map((r) => [r.key, r]))
for (const [f, n] of [['classic-black', 2], ['ticket', 1], [null, 1]]) for (let i = 0; i < n; i++) await call('POST', '/api/tx', { booth: 'karaoke', method: 'card', product: 'grid4', amount: 7000, frameId: f }, D)
await call('POST', '/api/frames', { id: 'mine', name: { en: 'Mine', ko: '내 프레임' }, bg: '#000', fg: '#fff', cuts: 4, base: 'classic-white' }, M)
await call('POST', '/api/tx', { booth: 'retro', method: 'card', product: 'strip4', amount: 5000, frameId: 'mine' }, D)
const s = (await call('GET', '/api/stats?range=today')).body
for (const r of ['week', 'month', 'year']) assert.ok(Array.isArray((await call('GET', `/api/stats?range=${r}`)).body.byFrame))
const bf = Object.fromEntries(s.byFrame.map((r) => [r.key, r]))
const d = (k, f) => (bf[k]?.[f] || 0) - (b0[k]?.[f] || 0)
assert.equal(d('classic-black', 'count'), 2); assert.equal(bf['classic-black'].name, '클래식 블랙'); assert.equal(bf.mine.name, '내 프레임'); assert.equal(d('ticket', 'revenue'), 7000); assert.equal(d('mine', 'revenue'), 5000)
assert.ok(s.byFrame.every((r) => typeof r.share === 'number')); assert.ok(s.byCouponChannel.some((r) => r.key === 'olive')); ok('byFrame (names, share), byCouponChannel')

// 6. 내보내기
assert.equal((await call('GET', '/api/export?format=csv&range=today')).status, 401)
const get = async (q) => { const r = await fetch(`${A}/api/export?${q}`, { headers: { 'x-admin-key': 'adm' } }); return { r, b: Buffer.from(await r.arrayBuffer()) } }
const csv = await get('format=csv&range=today&kind=tx')
assert.equal(csv.b[0], 0xef); assert.equal(csv.b[1], 0xbb); assert.equal(csv.b[2], 0xbf)
const csvText = csv.b.toString('utf8'); assert.ok(csvText.includes('시각,부스,상품,프레임,결제수단,쿠폰,쿠폰채널,금액,할인,상태')); assert.ok(csvText.includes('올리브 카페')); assert.ok(decodeURIComponent(csv.r.headers.get('content-disposition')).includes('UrbanEdge_매출_오늘_거래'))
const csvS = (await get('format=csv&range=today&kind=summary')).b.toString('utf8'); assert.ok(/프레임별,클래식 블랙,\d+/.test(csvS)); ok('csv (BOM, columns, Korean filename, summary)')
const x = await get('format=xlsx&range=today'); const wb = new ExcelJS.Workbook(); await wb.xlsx.load(x.b)
assert.deepEqual(wb.worksheets.map((w) => w.name), ['요약', '거래내역']); assert.ok(wb.getWorksheet('거래내역').rowCount >= 6); assert.equal(wb.getWorksheet('거래내역').getRow(1).getCell(1).font.bold, true); ok('xlsx (요약, 거래내역)')
const h = await get('format=hwpx&range=today&kind=tx')
const k = await import('kordoc')
assert.ok((await k.validateHwpx(h.b)).ok)
const parsed = await k.parse(h.b); const md = parsed.markdown ?? parsed.text ?? JSON.stringify(parsed)
assert.ok(md.includes('매출'), 'hwpx parsed contains 매출'); assert.ok(md.includes('클래식 블랙')); ok(`hwpx parses with kordoc (${h.b.length} bytes)`)
const pdf = await get('format=pdf&range=today&kind=tx')
const dir = mkdtempSync(path.join(tmpdir(), 'ue-')); const f = path.join(dir, 'a.pdf'); writeFileSync(f, pdf.b)
const txt = execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' })
assert.ok(txt.includes('매출') && txt.includes('클래식 블랙')); assert.ok(pdf.b.subarray(0, 4).toString() === '%PDF'); ok(`pdf text extracts 매출 (${pdf.b.length} bytes)`)
assert.equal((await call('GET', '/api/export?format=zip&range=today', undefined, M)).status, 400); ok('bad format 400')

console.log('DAILY ALL OK')
server.close(); await pool.end(); process.exit(0)
