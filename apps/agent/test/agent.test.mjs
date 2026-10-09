// 에이전트를 실제로 띄워 모든 엔드포인트를 호출하고 증거를 test/evidence.json에 남긴다.
import { createAgent } from '../src/server.js'
import { renderToPdf } from '../src/printer.js'
import { WebSocket } from 'ws'
import zlib from 'node:zlib'
import { writeFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const crc = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return (b) => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 } })()
function png(w, h) { // 노랑 바탕에 검정 대각선 시험 이미지
  const raw = Buffer.alloc((w * 3 + 1) * h)
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; const d = Math.abs(x - y * w / h) < 6; raw[o] = d ? 0 : 255; raw[o + 1] = d ? 0 : 212; raw[o + 2] = d ? 0 : 0 } }
  const chunk = (t, d) => { const b = Buffer.concat([Buffer.from(t), d]); const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(b)); return Buffer.concat([l, b, c]) }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
let pass = 0, fail = 0; const ev = {}
const ok = (name, cond, info) => { (cond ? pass++ : fail++); console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); ev[name] = { pass: !!cond, info } }

const srv = createAgent(); await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}`
const g = async (p, o) => { const r = await fetch(base + p, o); return { s: r.status, j: await r.json().catch(() => null) } }
const post = (p, b, h = {}) => g(p, { method: 'POST', headers: { 'content-type': 'application/json', ...h }, body: JSON.stringify(b) })

const h = await g('/health'); ok('health', h.s === 200 && h.j.ok, h.j)
const bad = await g('/health', { headers: { origin: 'https://evil.example' } }); ok('CORS 거부(허용 목록 밖 origin)', bad.s === 403, bad.j)
const okOrigin = await fetch(base + '/health', { headers: { origin: 'https://urbanedge-kiosk.vercel.app' } }); ok('CORS 허용(키오스크 origin)', okOrigin.headers.get('access-control-allow-origin') === 'https://urbanedge-kiosk.vercel.app')

const cams = await g('/camera/devices'); ok('camera/devices 응답 형태', cams.s === 200 && 'webcam' in cams.j && 'dslr' in cams.j, cams.j)
const cap = await post('/camera/capture', { base64: false }); ev['camera/capture 결과'] = cap.j
ok('camera/capture 응답(성공 또는 이유 있는 실패)', cap.j && (cap.j.ok === true || typeof cap.j.error === 'string'), cap.j)
if (cap.j?.ok) ok('camera/capture 파일 생성', existsSync(cap.j.file) && statSync(cap.j.file).size > 1000, { file: cap.j.file, bytes: cap.j.bytes })

const pr = await g('/printers'); ok('printers(lpstat)', pr.s === 200 && Array.isArray(pr.j.printers), pr.j)
const img = png(600, 900)
const dry = await post('/print', { pngBase64: img.toString('base64'), copies: 2, printer: 'DNP_DS620', media: 'Custom.4x6in', dryRun: true })
ok('print dryRun 명령줄', dry.s === 200 && /^lp -d DNP_DS620 -n 2 -o media=Custom\.4x6in -o fit-to-page /.test(dry.j.command), dry.j)
const badPng = await post('/print', { pngBase64: Buffer.from('hello').toString('base64') }); ok('print: PNG가 아니면 거절', badPng.j.error === 'not_png')
const pdfOut = join(here, 'print-proof.pdf'); const rp = await renderToPdf(dry.j.file, pdfOut)
ok('CUPS 필터로 PNG→PDF 변환(프린터 없이 인쇄 파이프라인 증명)', rp.ok && existsSync(pdfOut), rp)
if (rp.ok) { try { ev['pdf 확인'] = execFileSync('/usr/bin/file', [pdfOut]).toString().trim() } catch {} }
const real = await post('/print', { pngBase64: img.toString('base64'), copies: 1 }); ev['lp 실제 호출(프린터 없음)'] = real.j
ok('print: 프린터가 없으면 실패를 정직하게 보고', pr.j.printers.length ? real.j.ok : real.j.ok === false, real.j)

const rc = await post('/receipt', { shop: 'UrbanEdge 황리단길', lines: [['4컷 스트립', '5,000'], ['쿠폰', '-1,000']], total: 4000, method: '신용카드', cardMasked: '4579-12**-****-3456', approvalNo: '12345678', tid: 'UE-MOCK-0001' })
ok('receipt ESC/POS 바이트 생성', rc.s === 200 && rc.j.bytes > 100 && rc.j.preview.startsWith('1b40'), rc.j)
const iconv = (await import('iconv-lite')).default; const buf = Buffer.from(iconv.encode('합계', 'cp949')); ok('CP949 한글 인코딩 (합계 = c7d5 b0e8)', buf.toString('hex') === 'c7d5b0e8', buf.toString('hex'))
const rcNet = await post('/receipt', { total: 1000, host: '127.0.0.1', port: 9 }); ok('receipt 네트워크 프린터 연결 실패를 보고', rcNet.j.ok === false && typeof rcNet.j.error === 'string', rcNet.j)

const pay = await post('/pay', { amount: 5000, installment: 0 })
ok('pay(mock) 승인 필드', pay.s === 200 && pay.j.ok && /^\d{8}$/.test(pay.j.approvalNo) && /^\d{4}-\d{2}\*\*-\*{4}-\d{4}$/.test(pay.j.cardMasked) && pay.j.issuer && pay.j.tid && pay.j.installmentLabel === '일시불', pay.j)
ok('pay: 응답에 원번호(PAN) 없음', !JSON.stringify(pay.j).match(/\d{16}/))
const pay3 = await post('/pay', { amount: 30000, installment: 3 }); ok('pay 할부 3개월', pay3.j.installmentLabel === '3개월')
const payBad = await post('/pay', { amount: -1 }); ok('pay: 금액 오류 거절', payBad.s === 402 && payBad.j.code === 'E101')
const cancel = await post('/pay/cancel', { approvalNo: pay.j.approvalNo, amount: 5000 }); ok('pay/cancel(mock)', cancel.j.ok && cancel.j.originalApprovalNo === pay.j.approvalNo)
const kicc = await post('/pay', { amount: 5000, van: 'kicc' }); ok('pay(kicc 뼈대): 미설정이면 NOT_CONFIGURED', kicc.j.code === 'NOT_CONFIGURED', kicc.j)
const cash = await post('/cash', { amount: 5000 }); ok('cash: 미구현을 정직하게 보고(501)', cash.s === 501)

const ws = new WebSocket(base.replace('http', 'ws') + '/events'); const got = []; ws.on('message', (m) => got.push(JSON.parse(m))); await new Promise((r) => ws.on('open', r))
await post('/pay', { amount: 1000 }); await new Promise((r) => setTimeout(r, 300)); ws.close()
ok('WebSocket /events: hello와 pay 이벤트', got.some((e) => e.type === 'hello') && got.some((e) => e.type === 'pay'), got.map((e) => e.type))

writeFileSync(join(here, 'evidence.json'), JSON.stringify(ev, null, 2))
srv.close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0)
