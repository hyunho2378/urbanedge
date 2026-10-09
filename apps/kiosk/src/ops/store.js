// ops/store.js: 키오스크 3대(부스)와 운영 화면(카메라, POS, 결제, 대시보드)이 함께 쓰는 메모리 저장소.
// VITE_API_URL이 있으면 운영 서버(apps/server)와 연결된다: 시작할 때 서버 상태를 받아 오고, 모든 변경을 서버로 보내고,
// 실시간 스트림(SSE)으로 다른 키오스크와 운영 화면의 변경을 받는다. 서버에 닿지 않으면 메모리에서 계속 동작하고 다시 보낸다.
// VITE_API_URL이 없으면 서버 없이 이 탭 메모리에서만 산다(새로고침하면 처음으로 돌아간다). localStorage는 쓰지 않는다.
// 키오스크 쪽(controller)은 record*와 boothState를 쓰고, 운영 화면(OpsPanel)은 읽고 설정을 바꾼다.
// 이 파일의 공개 API는 두 작업이 같이 쓰므로 함수 이름과 모양을 바꾸지 않는다(추가만 한다).
import { useSyncExternalStore } from 'react'
import { allFrames } from '../flow/prints.js'
import { validateCoupon as checksumOk } from '../flow/coupon.js'
import { api, apiEnabled, ApiError, openStream, createQueue, downloadFile } from './api.js'

export const BOOTHS = [
  { id: 'subway', n: 1, name: { en: 'Subway Shot', ko: '지하철 샷' } },
  { id: 'karaoke', n: 2, name: { en: 'Karaoke Shot', ko: '노래방 샷' } },
  { id: 'retro', n: 3, name: { en: 'Retro Shot', ko: '레트로 샷' } },
]
export const METHODS = ['card', 'samsungpay', 'cash', 'coupon']
export const CAMERA_FILTERS = ['original', 'mono', 'film', 'warm', 'cool']
export const DEFAULT_CAMERA = { mirror: true, zoom: 1, brightness: 1, contrast: 1, warmth: 0, filter: 'original' }

let seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`
const newId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : uid('tx'))

function initial() {
  return {
    price: 7000,
    // 상품(가격표). 키오스크 결제 화면이 이 목록에서 고르고, 운영 화면에서 이름/가격/사용 여부를 바꾼다.
    // { id, name:{en,ko}, cuts, prints, price, enabled }
    products: [
      { id: 'strip4', name: { en: '4-cut strip', ko: '4컷 스트립' }, cuts: 4, prints: 2, price: 5000, enabled: true },
      { id: 'grid4', name: { en: '4-cut photo', ko: '4컷 사진' }, cuts: 4, prints: 2, price: 7000, enabled: true },
      { id: 'grid8', name: { en: '8-cut photo', ko: '8컷 사진' }, cuts: 8, prints: 2, price: 9000, enabled: true },
      { id: 'premium', name: { en: 'Platform frame', ko: '승강장 프레임' }, cuts: 4, prints: 4, price: 10000, enabled: true },
    ],
    // 거래: { id, booth, ts, method, amount, discount, coupon, cuts, frameId, status: 'paid'|'refunded', sample?: true }
    tx: [],
    // 저장 폴더: { id, booth, ts, url, settings }  (촬영 컷과 인화본)
    files: [],
    // 쿠폰: { code, label, kind: 'single'|'daily'|'checksum', discount, uses, maxUses, date?, active }
    coupons: [],
    // 프레임 켜고 끄기와 추가 프레임: { id, enabled, custom?: {...} }
    frames: allFrames().map((f) => ({ id: f.id, enabled: true })),
    // 부스별 카메라 설정
    camera: Object.fromEntries(BOOTHS.map((b) => [b.id, { ...DEFAULT_CAMERA }])),
    // 부스별 현재 상태(키오스크가 계속 알린다): { step, lang, cameraActive, lastShot, online, error }
    booth: Object.fromEntries(BOOTHS.map((b) => [b.id, { step: 'attract', lang: 'en', cameraActive: false, lastShot: null, online: true, error: null }])),
    // 샘플 데이터가 섞여 있는지(대시보드에 '샘플' 표시를 붙이는 데 쓴다)
    hasSample: false,
    // 서버 연결 상태(운영 화면이 표시에 쓸 수 있다)
    remote: { enabled: apiEnabled, connected: false, hydrated: false, queued: 0, failing: false, lastError: null },
    // 프레임별 판매(서버 없이 이 탭의 거래로 계산). 서버가 있으면 /api/stats의 byFrame을 쓴다.
    frameSales: [],
    // 운영 화면에서 보고 있는 부스
    selectedBooth: 'subway',
    // 부스별 웹캠 MediaStream(키오스크가 실시간 카메라를 쓸 때만 채운다)
    stream: {},
  }
}

let state = initial()
const subs = new Set()
const emit = () => subs.forEach((f) => f())
// 프레임별 판매(서버 없이 동작할 때 이 탭의 거래로 계산한다). 서버가 있으면 /api/stats의 byFrame을 쓴다.
export function computeFrameSales(tx, frames) {
  const names = {}
  for (const f of allFrames()) names[f.id] = f.name?.ko || f.id
  for (const f of frames || []) if (f.custom?.name) names[f.id] = typeof f.custom.name === 'string' ? f.custom.name : f.custom.name.ko || f.id
  const m = new Map()
  let sum = 0
  for (const t of tx) {
    if (t.status !== 'paid') continue
    const k = t.frameId || '-'
    const r = m.get(k) || { key: k, name: k === '-' ? '프레임 미선택' : names[k] || k, count: 0, revenue: 0 }
    r.count += 1
    r.revenue += t.amount || 0
    sum += t.amount || 0
    m.set(k, r)
  }
  return [...m.values()].sort((a, b) => b.revenue - a.revenue).map((r) => ({ ...r, share: sum ? Math.round((r.revenue / sum) * 1000) / 10 : 0 }))
}
let fsKey = null
const set = (fn) => {
  state = { ...state, ...fn(state) }
  if (state.tx !== fsKey?.tx || state.frames !== fsKey?.frames) {
    fsKey = { tx: state.tx, frames: state.frames }
    state = { ...state, frameSales: computeFrameSales(state.tx, state.frames) }
  }
  emit()
  scheduleBroadcast()
}

// ---- 서버 연결 ----
const patchRemote = (p) => {
  // /dashboard 화면은 synced 값이 있으면 '실시간'으로 표시한다. 서버와 연결되어 있으면 값을 채운다.
  const synced = 'connected' in p ? (p.connected ? Date.now() : null) : state.synced
  state = { ...state, synced, remote: { ...state.remote, ...p } }
  emit()
}
const queue = apiEnabled ? createQueue({ onChange: patchRemote }) : null
const pendingTx = new Set() // 서버에 아직 닿지 않은 거래 id(다시 받아 올 때 지우지 않는다)
const lastLocalBooth = {} // 이 탭이 방금 바꾼 부스(스트림이 되돌려 주는 옛 값으로 덮지 않는다)
const timers = {}
const push = (method, path, body, kind = 'admin', cbs) => queue?.push(method, path, body, kind, cbs)
// 설정 변경은 실패하면 서버 값으로 되돌린다.
const adminPush = (method, path, body) => push(method, path, body, 'admin', { fail: () => refetchSoon() })
// 같은 키의 변경을 모아 한 번만 보낸다(입력창에서 글자를 칠 때마다 보내지 않는다).
function debounced(key, patch, ms, send) {
  const t = (timers[key] ||= { patch: {} })
  t.patch = { ...t.patch, ...patch }
  clearTimeout(t.id)
  t.id = setTimeout(() => {
    const p = t.patch
    delete timers[key]
    send(p)
  }, ms)
}
const mergeTx = (local, server) => {
  const ids = new Set(server.map((t) => t.id))
  return [...local.filter((t) => pendingTx.has(t.id) && !ids.has(t.id)), ...server].sort((a, b) => b.ts - a.ts)
}
const upsertTx = (t) =>
  set((s) => {
    const i = s.tx.findIndex((x) => x.id === t.id)
    if (i < 0) return { tx: [t, ...s.tx].sort((a, b) => b.ts - a.ts) }
    const next = s.tx.slice()
    next[i] = { ...next[i], ...t }
    return { tx: next }
  })
const fileOf = (f) => ({ ...f, settings: { ...DEFAULT_CAMERA, ...(state.camera[f.booth] || {}) } })

async function hydrate() {
  const from = new Date(new Date().getFullYear(), 0, 1).getTime() - 3 * 86400000
  const [st, tx, files] = await Promise.all([api('GET', '/api/state'), api('GET', `/api/tx?from=${from}&limit=30000`), api('GET', '/api/files')])
  set((s) => {
    const booth = { ...s.booth }
    for (const [id, b] of Object.entries(st.booth || {})) if (!lastLocalBooth[id] || Date.now() - lastLocalBooth[id] > 3000) booth[id] = { ...booth[id], ...b }
    return {
      price: st.price,
      products: st.products,
      frames: st.frames,
      coupons: st.coupons,
      camera: { ...s.camera, ...st.camera },
      booth,
      tx: mergeTx(s.tx, tx),
      files: files.map(fileOf),
      hasSample: tx.some((t) => t.history),
      synced: Date.now(),
      remote: { ...s.remote, connected: true, hydrated: true, lastError: null },
    }
  })
}
let refetchTimer = null
function refetchSoon() {
  if (!apiEnabled || refetchTimer) return
  refetchTimer = setTimeout(async () => {
    refetchTimer = null
    // 아직 보낼 것이 남아 있으면 기다린다(옛 서버 값으로 방금 바꾼 값을 덮지 않는다).
    if (queue && queue.size > 0) return refetchSoon()
    try {
      await hydrate()
    } catch (e) {
      patchRemote({ connected: false, lastError: e.message })
    }
  }, 250)
}
function startRemote() {
  const boot = async () => {
    try {
      await hydrate()
    } catch (e) {
      patchRemote({ connected: false, lastError: e.message })
      setTimeout(boot, 5000)
    }
  }
  boot()
  openStream({
    open: () => {
      patchRemote({ connected: true })
      if (state.remote.hydrated) refetchSoon()
    },
    error: () => patchRemote({ connected: false }),
    tx: (t) => upsertTx(t),
    file: (f) => set((s) => (s.files.some((x) => x.id === f.id) ? {} : { files: [fileOf(f), ...s.files].slice(0, 120) })),
    booth: ({ id, ...b }) => {
      if (Date.now() - (lastLocalBooth[id] || 0) < 2500) return
      set((s) => ({ booth: { ...s.booth, [id]: { ...s.booth[id], ...b } } }))
    },
    camera: ({ booth, settings }) => {
      if (timers[`cam:${booth}`]) return
      set((s) => ({ camera: { ...s.camera, [booth]: settings } }))
    },
    settings: () => refetchSoon(),
    history: () => refetchSoon(),
  })
}

// ---- 탭 사이 동기화 ----
// 운영 데모 탭(host)이 상태를 BroadcastChannel로 내보내고, /dashboard 탭(viewer)은 받아서 보여 주기만 한다.
// viewer는 보내지 않으므로 되돌아오는 메시지(에코)가 생기지 않는다. 서버나 localStorage는 쓰지 않는다.
const SYNC_KEYS = ['price', 'products', 'tx', 'frames', 'coupons', 'camera', 'booth', 'selectedBooth', 'hasSample']
let channel = null
let role = null
let timer = null
function scheduleBroadcast() {
  if (role !== 'host' || timer) return
  timer = setTimeout(() => {
    timer = null
    postSnapshot()
  }, 120)
}
function postSnapshot() {
  if (!channel || role !== 'host') return
  const snap = {}
  for (const k of SYNC_KEYS) snap[k] = state[k]
  try {
    channel.postMessage({ type: 'snapshot', snap })
  } catch {
    /* 직렬화할 수 없는 값은 보내지 않는다 */
  }
}
// 'host'는 키오스크가 있는 탭, 'viewer'는 /dashboard 같은 보기 전용 탭. 돌려주는 함수로 멈춘다.
export function startSync(r) {
  // 서버가 연결되어 있으면 모든 탭이 서버에서 직접 받으므로 탭 사이 복사가 필요 없다.
  if (apiEnabled || typeof BroadcastChannel === 'undefined' || channel) return () => {}
  role = r
  channel = new BroadcastChannel('urbanedge-ops')
  channel.onmessage = (e) => {
    const m = e.data
    if (role === 'viewer' && m?.type === 'snapshot') {
      state = { ...state, ...m.snap, synced: Date.now() }
      emit()
    }
    if (role === 'host' && m?.type === 'hello') postSnapshot()
  }
  if (role === 'viewer') channel.postMessage({ type: 'hello' })
  else postSnapshot()
  return () => {
    channel?.close()
    channel = null
    role = null
  }
}

export const ops = {
  remote: { enabled: apiEnabled },
  get: () => state,
  subscribe: (f) => (subs.add(f), () => subs.delete(f)),

  // ---- 키오스크가 부르는 것 ----
  boothState: (booth, patch) => {
    set((s) => ({ booth: { ...s.booth, [booth]: { ...s.booth[booth], ...patch } } }))
    if (!queue) return
    lastLocalBooth[booth] = Date.now()
    const api_ = {}
    for (const k of ['step', 'lang', 'cameraActive', 'online', 'lastShot']) if (patch[k] !== undefined && patch[k] !== null) api_[k] = patch[k]
    if (!Object.keys(api_).length) return
    // 부스 상태는 1초에 한 번만 보낸다.
    debounced(`booth:${booth}`, api_, 800, (p) => push('PUT', `/api/booths/${booth}`, p, 'device'))
  },
  recordPayment: ({ booth, method, amount, discount = 0, coupon = null, cuts = null, frameId = null, product = null, sim = false, pay = null }) => {
    const t = { id: newId(), booth, ts: Date.now(), method, amount, discount, coupon, cuts, frameId, product, sim, pay, status: 'paid' }
    set((s) => ({ tx: [t, ...s.tx] }))
    if (queue) {
      pendingTx.add(t.id)
      push('POST', '/api/tx', t, 'device', { done: () => pendingTx.delete(t.id), fail: () => pendingTx.delete(t.id) })
    }
    return t.id
  },
  // 결제 뒤에 컷 수와 프레임이 정해지면 같은 거래에 붙인다.
  patchTx: (id, patch) => {
    set((s) => ({ tx: s.tx.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
    if (queue && (patch.cuts != null || patch.frameId || patch.sim !== undefined)) push('PATCH', `/api/tx/${id}`, { cuts: patch.cuts, frameId: patch.frameId, sim: patch.sim }, 'device')
  },
  recordFile: ({ booth, url, kind = 'shot' }) => {
    const f = { id: uid('f'), booth, ts: Date.now(), url, kind, settings: { ...state.camera[booth] } }
    set((s) => ({ files: [f, ...s.files].slice(0, 120) }))
    if (queue && typeof url === 'string' && url.length <= 40000) push('POST', '/api/files', { booth, url, kind }, 'device')
  },
  // 쿠폰 확인: 등록 쿠폰 먼저, 없으면 웹사이트 스크래치 쿠폰(체크섬) 규칙. 결과 { ok, discount, label }
  // due: 지금 내야 할 금액. 웹사이트 쿠폰은 이 금액 전액을 깎는다(없으면 기본 가격).
  checkCoupon: (code, due) => {
    const c = state.coupons.find((x) => x.code === code && x.active)
    if (c) {
      if (c.kind === 'daily' && c.date !== today()) return { ok: false }
      if (c.maxUses && c.uses >= c.maxUses) return { ok: false }
      return { ok: true, discount: c.discount, label: c.label }
    }
    if (checksumOk(code)) return { ok: true, discount: due ?? state.price, label: 'web' }
    return { ok: false }
  },
  // 서버가 있으면 서버가 확인한다(한 번만 쓰는 코드, 오늘 날짜 코드). 서버에 닿지 않으면 이 화면의 목록으로 확인한다.
  checkCouponAsync: async (code, due) => {
    if (!queue) return ops.checkCoupon(code, due)
    try {
      return await api('POST', '/api/coupons/check', { code, due }, 'device')
    } catch (e) {
      if (e instanceof ApiError) return { ok: false }
      return ops.checkCoupon(code, due)
    }
  },
  useCoupon: (code) => {
    set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, uses: c.uses + 1 } : c)) }))
    push('POST', '/api/coupons/redeem', { code }, 'device')
  },

  // ---- 내보내기와 오늘의 코드 ----
  // format: csv | xlsx | hwpx | pdf. kind: 'tx'(거래내역) | 'summary'(요약). 'sales'는 'tx'로 본다. 서버가 없으면 csv만 이 탭의 거래로 만든다.
  download: async (format, { range = 'today', kind = 'tx' } = {}) => {
    const k = kind === 'summary' ? 'summary' : 'tx'
    if (queue) return downloadFile(`/api/export?format=${encodeURIComponent(format)}&range=${encodeURIComponent(range)}&kind=${k}`, `UrbanEdge_${range}.${format}`)
    if (format !== 'csv') throw new Error('엑셀, 한글, PDF 내보내기는 서버에 연결되어 있을 때 쓸 수 있다.')
    const head = ['시각', '부스', '상품', '프레임', '결제수단', '카드사', '카드번호', '승인번호', '할부', '받은금액', '거스름돈', '쿠폰', '쿠폰코드', '쿠폰채널', '금액', '할인', '상태']
    const cell = (v) => (/[",\r\n]/.test(String(v ?? '')) ? `"${String(v ?? '').replace(/"/g, '""')}"` : String(v ?? ''))
    const lines = [head.join(',')]
    for (const t of state.tx) lines.push([new Date(t.ts).toLocaleString('sv-SE'), t.booth, t.product || '', t.frameId || '', t.method, (t.pay && t.pay.brand) || '', (t.pay && t.pay.masked) || '', (t.pay && t.pay.approval) || '', (t.pay && t.pay.installment) || '', t.pay && t.pay.received != null ? t.pay.received : '', t.pay && t.pay.change != null ? t.pay.change : '', t.coupon || '', (t.pay && t.pay.code) || '', t.couponChannel || (t.pay && t.pay.channel) || '', t.amount, t.discount || 0, t.status === 'refunded' ? '환불' : '결제'].map(cell).join(','))
    const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `UrbanEdge_${range}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    return a.download
  },
  // 서버의 오늘 코드 { date, codes: [{ channel, label, code, discount }] }. 관리자 키가 있으면 제휴처 코드까지 온다.
  todayCoupons: async () => {
    if (!apiEnabled) throw new Error('서버에 연결되어 있지 않다.')
    return api('GET', '/api/coupons/today', undefined, 'admin')
  },

  // ---- 운영 화면이 부르는 것 ----
  setPrice: (price) => {
    set(() => ({ price }))
    debounced('price', { price }, 400, (p) => adminPush('PUT', '/api/price', p))
  },
  setProduct: (id, patch) => {
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
    if (queue) debounced(`product:${id}`, patch, 500, (p) => adminPush('PATCH', `/api/products/${id}`, p))
  },
  addProduct: (p) => {
    const row = { enabled: true, prints: 2, ...p }
    set((s) => ({ products: [...s.products, row] }))
    adminPush('POST', '/api/products', row)
  },
  refund: (id) => {
    set((s) => ({ tx: s.tx.map((t) => (t.id === id ? { ...t, status: 'refunded', refundedAt: Date.now() } : t)) }))
    adminPush('POST', `/api/tx/${id}/refund`, {})
  },
  setCamera: (booth, patch) => {
    set((s) => ({ camera: { ...s.camera, [booth]: { ...s.camera[booth], ...patch } } }))
    if (queue) debounced(`cam:${booth}`, patch, 400, (p) => adminPush('PUT', `/api/camera/${booth}`, p))
  },
  resetCamera: (booth) => {
    set((s) => ({ camera: { ...s.camera, [booth]: { ...DEFAULT_CAMERA } } }))
    if (queue) debounced(`cam:${booth}`, { ...DEFAULT_CAMERA }, 100, (p) => adminPush('PUT', `/api/camera/${booth}`, p))
  },
  addCoupon: (c) => {
    set((s) => ({ coupons: [{ uses: 0, maxUses: 0, active: true, ...c }, ...s.coupons] }))
    adminPush('POST', '/api/coupons', c)
  },
  toggleCoupon: (code) => {
    set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c)) }))
    adminPush('PATCH', `/api/coupons/${encodeURIComponent(code)}/toggle`, {})
  },
  toggleFrame: (id) => {
    const next = !state.frames.find((f) => f.id === id)?.enabled
    set((s) => ({ frames: s.frames.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)) }))
    adminPush('PUT', `/api/frames/${id}`, { enabled: next })
  },
  addFrame: (custom) => {
    set((s) => ({ frames: [...s.frames, { id: custom.id, enabled: true, custom }] }))
    adminPush('POST', '/api/frames', custom)
  },
  setBoothOnline: (booth, online) => ops.boothState(booth, { online }),
  selectBooth: (id) => set(() => ({ selectedBooth: id })),
  setStream: (booth, stream) => set((s) => ({ stream: { ...s.stream, [booth]: stream } })),
  // 지난 기록(올해 1월 1일부터 어제까지)을 불러온다. 월별, 연별 보기에 데이터가 생긴다. 화면에는 따로 표시하지 않는다.
  // 서버가 있으면 서버가 같은 기간의 기록을 만들어 저장한다(rows는 쓰지 않는다). 다 들어가면 스트림이 알려 주고 다시 받아 온다.
  loadHistory: (rows) => {
    if (queue) return adminPush('POST', '/api/history/backfill', {})
    set((s) => ({ tx: [...s.tx.filter((t) => !t.history), ...rows.map((r) => ({ ...r, history: true }))].sort((a, b) => b.ts - a.ts), hasSample: true }))
  },
  clearHistory: () => {
    set((s) => ({ tx: s.tx.filter((t) => !t.history), hasSample: false }))
    adminPush('DELETE', '/api/history')
  },
  removeProduct: (id) => {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
    adminPush('DELETE', `/api/products/${id}`)
  },
  // 설정 내보내기/불러오기: 상품, 프레임, 쿠폰, 카메라, 가격을 JSON 한 파일로.
  exportSettings: () => ({
    app: 'urbanedge-ops',
    version: 1,
    exportedAt: new Date().toISOString(),
    price: state.price,
    products: state.products,
    frames: state.frames.map((f) => ({ id: f.id, enabled: f.enabled, ...(f.custom ? { custom: f.custom } : {}) })),
    coupons: state.coupons,
    camera: state.camera,
  }),
  importSettings: (obj) => {
    if (!obj || obj.app !== 'urbanedge-ops') return { ok: false, error: 'UrbanEdge 설정 파일이 아니다.' }
    const prods = Array.isArray(obj.products) ? obj.products : null
    if (prods && prods.some((p) => !p || typeof p.id !== 'string' || !Number.isFinite(Number(p.price)))) return { ok: false, error: '상품 목록에 읽을 수 없는 줄이 있다.' }
    const known = new Set(allFrames().map((f) => f.id))
    set((s) => ({
      price: Number.isFinite(Number(obj.price)) ? Number(obj.price) : s.price,
      products: prods ? prods.map((p) => ({ prints: 2, enabled: true, cuts: 4, name: { en: p.id, ko: p.id }, ...p, price: Number(p.price) })) : s.products,
      frames: Array.isArray(obj.frames)
        ? [...s.frames.map((f) => { const m = obj.frames.find((x) => x.id === f.id); return m ? { ...f, enabled: !!m.enabled } : f }), ...obj.frames.filter((x) => x.custom && !known.has(x.id) && !s.frames.some((f) => f.id === x.id)).map((x) => ({ id: x.id, enabled: !!x.enabled, custom: x.custom }))]
        : s.frames,
      coupons: Array.isArray(obj.coupons) ? obj.coupons : s.coupons,
      camera: obj.camera && typeof obj.camera === 'object' ? { ...s.camera, ...obj.camera } : s.camera,
    }))
    adminPush('POST', '/api/settings/import', obj)
    return { ok: true }
  },
  // 이전 이름(호환)
  loadSample: (rows) => ops.loadHistory(rows),
  clearSample: () => ops.clearHistory(),
}

if (apiEnabled && typeof window !== 'undefined') startRemote()

export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const enabledFrameIds = () => new Set(state.frames.filter((f) => f.enabled).map((f) => f.id))

// React에서 읽기: const price = useOps((s) => s.price)
export function useOps(selector = (s) => s) {
  return useSyncExternalStore(ops.subscribe, () => selector(state), () => selector(state))
}

// 카메라 설정을 CSS filter/transform으로 바꾼다(미리보기와 저장 둘 다 같은 값을 쓴다).
export function cameraCss(c = DEFAULT_CAMERA) {
  const tone = { original: '', mono: 'grayscale(1)', film: 'sepia(0.25) saturate(0.9)', warm: 'sepia(0.2) saturate(1.15)', cool: 'hue-rotate(-12deg) saturate(0.95)' }[c.filter] || ''
  const warmth = c.warmth > 0 ? `sepia(${(c.warmth * 0.4).toFixed(2)})` : c.warmth < 0 ? `hue-rotate(${(c.warmth * 20).toFixed(0)}deg)` : ''
  return {
    filter: `brightness(${c.brightness}) contrast(${c.contrast}) ${warmth} ${tone}`.trim(),
    transform: `scale(${c.mirror ? -c.zoom : c.zoom}, ${c.zoom})`,
  }
}
