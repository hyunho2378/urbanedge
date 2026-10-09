import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { WebSocketServer } from 'ws'
import { listCameras, capture, readShot } from './camera/index.js'
import { listPrinters, print } from './printer.js'
import { buildReceipt, sendReceipt } from './receipt.js'
import { mockVan } from './pay/mock.js'
import { vanAdapter } from './pay/van-skeleton.js'

const PORT = Number(process.env.AGENT_PORT || 8790)
const ORIGINS = (process.env.AGENT_ORIGINS || 'https://urbanedge-kiosk.vercel.app,http://localhost:5173,http://127.0.0.1:5173').split(',')
const TOKEN = process.env.AGENT_TOKEN || '' // 설정하면 X-Agent-Token이 맞는 요청만 받는다
const adapters = { mock: mockVan, kicc: vanAdapter({ vendor: 'kicc', port: Number(process.env.KICC_PORT || 0) }), ksnet: vanAdapter({ vendor: 'ksnet', port: Number(process.env.KSNET_PORT || 0) }) }
const VAN = process.env.VAN || 'mock'

const json = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)) }
const readBody = (req) => new Promise((resolve, reject) => { const c = []; let n = 0; req.on('data', (d) => { n += d.length; if (n > 25e6) { reject(new Error('too_big')); req.destroy() } else c.push(d) }); req.on('end', () => { try { resolve(c.length ? JSON.parse(Buffer.concat(c).toString()) : {}) } catch (e) { reject(e) } }) })
const events = new Set()
const emit = (type, data) => { const m = JSON.stringify({ type, data, at: Date.now() }); for (const ws of events) if (ws.readyState === 1) ws.send(m) }

export function createAgent() {
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin
    if (origin && ORIGINS.includes(origin)) { res.setHeader('access-control-allow-origin', origin); res.setHeader('vary', 'origin'); res.setHeader('access-control-allow-headers', 'content-type,x-agent-token'); res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS'); res.setHeader('access-control-allow-private-network', 'true') }
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }
    if (origin && !ORIGINS.includes(origin)) return json(res, 403, { ok: false, error: 'origin_not_allowed' })
    if (TOKEN && req.headers['x-agent-token'] !== TOKEN && req.url !== '/health') return json(res, 401, { ok: false, error: 'bad_token' })
    const url = new URL(req.url, 'http://x')
    try {
      if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, agent: 'urbanedge-agent', version: '0.1.0', van: VAN, platform: process.platform, time: new Date().toISOString() })
      if (req.method === 'GET' && url.pathname === '/camera/devices') return json(res, 200, await listCameras())
      if (req.method === 'POST' && url.pathname === '/camera/capture') {
        const b = await readBody(req); const r = await capture({ index: b.index || 0 })
        if (r.ok && b.base64) r.base64 = await readShot(r.file)
        emit('camera.capture', { ok: r.ok, source: r.source }); return json(res, r.ok ? 200 : 503, r)
      }
      if (req.method === 'GET' && url.pathname === '/printers') return json(res, 200, await listPrinters())
      if (req.method === 'POST' && url.pathname === '/print') { const r = await print(await readBody(req)); emit('print', { ok: r.ok }); return json(res, r.ok ? 200 : 502, r) }
      if (req.method === 'POST' && url.pathname === '/receipt') {
        const b = await readBody(req); const bytes = buildReceipt(b); const r = await sendReceipt(bytes, { host: b.host, port: b.port })
        return json(res, r.ok ? 200 : 502, { ...r, preview: bytes.toString('hex').slice(0, 64) })
      }
      if (req.method === 'POST' && url.pathname === '/pay') {
        const b = await readBody(req); const ad = adapters[b.van || VAN]; if (!ad) return json(res, 400, { ok: false, error: 'unknown_van' })
        const r = await ad.approve(b); emit('pay', { ok: r.ok, amount: b.amount, approvalNo: r.approvalNo }); return json(res, r.ok ? 200 : 402, r)
      }
      if (req.method === 'POST' && url.pathname === '/pay/cancel') { const b = await readBody(req); const ad = adapters[b.van || VAN]; const r = await ad.cancel(b); return json(res, r.ok ? 200 : 502, r) }
      if (req.method === 'POST' && url.pathname === '/cash') { const b = await readBody(req); return json(res, 501, { ok: false, error: 'not_implemented', message: '지폐인식기(시리얼/USB HID)는 장비 모델 확인 뒤 연결한다.', received: b.amount ?? null }) }
      if (req.method === 'GET' && url.pathname === '/') return json(res, 200, { ok: true, endpoints: ['GET /health', 'GET /camera/devices', 'POST /camera/capture', 'GET /printers', 'POST /print', 'POST /receipt', 'POST /pay', 'POST /pay/cancel', 'POST /cash', 'WS /events'] })
      return json(res, 404, { ok: false, error: 'not_found' })
    } catch (e) { return json(res, 500, { ok: false, error: 'server', message: String(e.message || e) }) }
  })
  const wss = new WebSocketServer({ noServer: true })
  server.on('upgrade', (req, sock, head) => {
    const o = req.headers.origin
    if (req.url !== '/events' || (o && !ORIGINS.includes(o))) return sock.destroy()
    wss.handleUpgrade(req, sock, head, (ws) => { events.add(ws); ws.on('close', () => events.delete(ws)); ws.send(JSON.stringify({ type: 'hello', at: Date.now() })) })
  })
  return server
}

if (import.meta.url === `file://${process.argv[1]}`) createAgent().listen(PORT, '127.0.0.1', () => console.log(`UrbanEdge agent http://127.0.0.1:${PORT} (van=${VAN})`))
