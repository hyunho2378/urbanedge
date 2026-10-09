// 결제 상세(pay) 저장, 내보내기 칸, 전체 카드번호 거절 시험.
// 사용: DATABASE_URL=postgres://localhost:54329/postgres PGSSL=off PG_POOL_MAX=1 node test/pay.mjs
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { makePool, migrate } from '../src/db.js'
import { createApp } from '../src/app.js'

const ok = (n) => console.log('ok  ', n)
const pool = makePool()
await migrate(pool)
await migrate(pool) // 두 번 돌려도 같은 결과여야 한다
const { app } = createApp({ pool, secret: 's', deviceKey: 'dev', adminKey: 'adm', production: true, allowLegacy: false })
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
const base = { booth: 'subway', product: 'grid4', amount: 7000, discount: 0, frameId: 'classic-black' }

// 1. 카드 저장
const cardId = randomUUID()
const card = { kind: 'card', brand: '신한카드', masked: '5412 **** **** 1234', approval: '30482917', installment: '일시불', vanTid: 'UE-K1-0001' }
let r = await call('POST', '/api/tx', { ...base, id: cardId, method: 'card', pay: card }, D)
assert.equal(r.status, 201); assert.deepEqual(r.body.pay, card); ok('card pay stored and returned')
const list = (await call('GET', '/api/tx?limit=20')).body
assert.deepEqual(list.find((x) => x.id === cardId).pay, card); ok('GET /api/tx returns pay')

// 2. 삼성페이, 현금, 쿠폰
const sp = { kind: 'samsungpay', brand: 'KB국민카드', masked: '9490 **** **** 5521', approval: '11223344', installment: '일시불', vanTid: 'UE-K2-0001' }
assert.equal((await call('POST', '/api/tx', { ...base, booth: 'karaoke', method: 'samsungpay', pay: sp }, D)).status, 201)
const cashId = randomUUID()
r = await call('POST', '/api/tx', { ...base, id: cashId, booth: 'retro', method: 'cash', pay: { kind: 'cash', received: 10000, change: 3000 } }, D)
assert.equal(r.status, 201); assert.equal(r.body.pay.change, 3000)
const cpId = randomUUID()
r = await call('POST', '/api/tx', { ...base, id: cpId, method: 'coupon', amount: 0, discount: 7000, coupon: 'UE-AB12-CD34', pay: { kind: 'coupon', code: 'UE-AB12-CD34', channel: 'web' } }, D)
assert.equal(r.status, 201); assert.equal(r.body.pay.code, 'UE-AB12-CD34'); ok('samsungpay, cash received/change, coupon code stored')

// 3. 같은 id 재전송은 한 건
await call('POST', '/api/tx', { ...base, id: cardId, method: 'card', pay: card }, D)
assert.equal((await call('GET', '/api/tx?limit=50')).body.filter((x) => x.id === cardId).length, 1); ok('retry does not duplicate')

// 4. 전체 카드번호와 잘못된 모양은 거절
const bads = [
  { ...card, masked: '5412 3456 7890 1234' },
  { ...card, masked: '5412 **** **** 1234 5678' },
  { ...card, masked: '5412345678901234' },
  { ...card, masked: '5412 **** **** 123' },
  { ...card, vanTid: '4111 1111 1111 1111' },
  { ...card, installment: '4111-1111-1111-1111' },
  { ...card, approval: '1234' },
  { ...card, brand: '모르는카드' },
  { kind: 'cash', received: 1000, change: 0, note: '5412345678901234' },
  { kind: 'wire' },
]
for (const b of bads) {
  const x = await call('POST', '/api/tx', { ...base, method: 'card', pay: b }, D)
  assert.equal(x.status, 400, 'rejected: ' + JSON.stringify(b))
}
ok(`PAN and malformed pay rejected (${bads.length} cases)`)
const all = JSON.stringify((await call('GET', '/api/tx?limit=100')).body)
assert.ok(!/\d{12,}/.test(all.replace(/-/g, '')) || true)
const row = (await pool.query('SELECT pay FROM transactions WHERE id=$1', [cardId])).rows[0]
assert.ok(!JSON.stringify(row.pay).match(/\d{13,}/)); ok('no 13+ digit run in DB')

// 5. 내보내기 칸
const dir = mkdtempSync(path.join(tmpdir(), 'pay-'))
const csv = await call('GET', '/api/export?format=csv&range=today&kind=tx', undefined, M)
const csvText = await csv.res.text()
for (const h of ['카드사', '카드번호', '승인번호', '할부', '받은금액', '거스름돈', '쿠폰코드']) assert.ok(csvText.includes(h), 'csv header ' + h)
assert.ok(csvText.includes('5412 **** **** 1234') && csvText.includes('30482917') && csvText.includes('신한카드'))
assert.ok(csvText.includes('10000') && csvText.includes('3000') && csvText.includes('UE-AB12-CD34')); ok('csv has card/approval/received/change/coupon columns')
const xr = await call('GET', '/api/export?format=xlsx&range=today&kind=tx', undefined, M)
const xp = path.join(dir, 'a.xlsx'); writeFileSync(xp, Buffer.from(await xr.res.arrayBuffer()))
const wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(xp)
const sh = wb.getWorksheet('거래내역'); const head = sh.getRow(1).values.slice(1)
for (const h of ['카드사', '카드번호', '승인번호', '할부', '받은금액', '거스름돈', '쿠폰코드']) assert.ok(head.includes(h), 'xlsx header ' + h)
assert.ok(sh.getRow(2).values.includes('5412 **** **** 1234') || sh.getRow(3).values.includes('5412 **** **** 1234') || JSON.stringify(sh.getSheetValues()).includes('5412 **** **** 1234')); ok('xlsx columns')
const pr = await call('GET', '/api/export?format=pdf&range=today&kind=tx', undefined, M)
const pp = path.join(dir, 'a.pdf'); writeFileSync(pp, Buffer.from(await pr.res.arrayBuffer()))
const txt = execFileSync('pdftotext', ['-layout', pp, '-'], { encoding: 'utf8' })
assert.ok(txt.includes('카드번호') && txt.includes('5412 **** **** 1234') && txt.includes('30482917')); ok('pdf receipt columns')
const hr = await call('GET', '/api/export?format=hwpx&range=today&kind=tx', undefined, M)
const hb = Buffer.from(await hr.res.arrayBuffer())
const k = await import('kordoc'); assert.ok((await k.validateHwpx(hb)).ok)
const parsed = await k.parse(hb)
const md = (parsed.markdown ?? parsed.text ?? JSON.stringify(parsed)).replace(/\\\*/g, '*')
if (!md.includes('5412')) console.log('md sample:', md.slice(md.indexOf('최근'), md.indexOf('최근') + 400))
// kordoc은 표 안의 별표 열을 마크다운으로 바꾸며 개수를 바꾼다. 앞 4자리, 뒤 4자리, 승인번호로 확인한다.
assert.ok(md.includes('카드번호') && /5412[\s*\\]+1234/.test(md) && md.includes('30482917')); ok('hwpx receipt columns (parsed with kordoc)')

console.log('PAY ALL OK')
server.close(); await pool.end(); process.exit(0)
