// 키오스크 앱이 가져다 쓸 클라이언트. 에이전트가 없으면 fallback(브라우저 모의)로 넘어가도록 available()로 먼저 확인한다.
// 연결 방법(제안): apps/kiosk/src/flow/controller.js의 결제 성공 지점에서 agent.pay({ amount, installment })를 호출하고
// 응답의 issuer, cardMasked, approvalNo, installmentLabel, tid를 ops.recordPayment({ ...pay })에 넘긴다. 카메라는 camera.js의 촬영 지점에서 agent.capture()를 쓴다.
const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AGENT_URL) || 'http://127.0.0.1:8790'
const call = async (path, body, token) => {
  const r = await fetch(BASE + path, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json', ...(token ? { 'x-agent-token': token } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({ ok: false, error: 'bad_json' })); return { status: r.status, ...j }
}
export const agent = {
  async available() { try { const r = await Promise.race([call('/health'), new Promise((_, rej) => setTimeout(() => rej(new Error('t')), 800))]); return !!r.ok } catch { return false } },
  health: () => call('/health'), cameras: () => call('/camera/devices'),
  capture: (o = {}) => call('/camera/capture', { base64: true, ...o }),
  printers: () => call('/printers'), print: (o) => call('/print', o),
  receipt: (o) => call('/receipt', o), pay: (o) => call('/pay', o), cancel: (o) => call('/pay/cancel', o),
  events(onMsg) { const ws = new WebSocket(BASE.replace(/^http/, 'ws') + '/events'); ws.onmessage = (e) => onMsg(JSON.parse(e.data)); return ws },
}
