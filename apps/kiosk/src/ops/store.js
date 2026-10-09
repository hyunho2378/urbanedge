// ops/store.js: 키오스크 3대(부스)와 운영 화면(카메라, POS, 결제, 대시보드)이 함께 쓰는 메모리 저장소.
// 서버와 localStorage 없이 한 탭 안에서만 산다. 새로고침하면 처음으로 돌아간다.
// 키오스크 쪽(controller)은 record*와 boothState를 쓰고, 운영 화면(OpsPanel)은 읽고 설정을 바꾼다.
// 이 파일의 공개 API는 두 작업이 같이 쓰므로 함수 이름과 모양을 바꾸지 않는다(추가만 한다).
import { useSyncExternalStore } from 'react'
import { allFrames } from '../flow/prints.js'
import { validateCoupon as checksumOk } from '../flow/coupon.js'

export const BOOTHS = [
  { id: 'retro', n: 1, name: { en: 'Retro Shot', ko: '레트로 샷' } },
  { id: 'karaoke', n: 2, name: { en: 'Karaoke Shot', ko: '노래방 샷' } },
  { id: 'subway', n: 3, name: { en: 'Subway Shot', ko: '지하철 샷' } },
]
export const METHODS = ['card', 'samsungpay', 'cash', 'coupon']
export const CAMERA_FILTERS = ['original', 'mono', 'film', 'warm', 'cool']
export const DEFAULT_CAMERA = { mirror: true, zoom: 1, brightness: 1, contrast: 1, warmth: 0, filter: 'original' }

let seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

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
    // 운영 화면에서 보고 있는 부스
    selectedBooth: 'subway',
    // 부스별 웹캠 MediaStream(키오스크가 실시간 카메라를 쓸 때만 채운다)
    stream: {},
  }
}

let state = initial()
const subs = new Set()
const emit = () => subs.forEach((f) => f())
const set = (fn) => {
  state = { ...state, ...fn(state) }
  emit()
  scheduleBroadcast()
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
  if (typeof BroadcastChannel === 'undefined' || channel) return () => {}
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
  get: () => state,
  subscribe: (f) => (subs.add(f), () => subs.delete(f)),

  // ---- 키오스크가 부르는 것 ----
  boothState: (booth, patch) => set((s) => ({ booth: { ...s.booth, [booth]: { ...s.booth[booth], ...patch } } })),
  recordPayment: ({ booth, method, amount, discount = 0, coupon = null, cuts = null, frameId = null, product = null, sim = false }) => {
    const t = { id: uid('tx'), booth, ts: Date.now(), method, amount, discount, coupon, cuts, frameId, product, sim, status: 'paid' }
    set((s) => ({ tx: [t, ...s.tx] }))
    return t.id
  },
  // 결제 뒤에 컷 수와 프레임이 정해지면 같은 거래에 붙인다.
  patchTx: (id, patch) => set((s) => ({ tx: s.tx.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
  recordFile: ({ booth, url, kind = 'shot' }) => {
    const f = { id: uid('f'), booth, ts: Date.now(), url, kind, settings: { ...state.camera[booth] } }
    set((s) => ({ files: [f, ...s.files].slice(0, 120) }))
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
  useCoupon: (code) => set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, uses: c.uses + 1 } : c)) })),

  // ---- 운영 화면이 부르는 것 ----
  setPrice: (price) => set(() => ({ price })),
  setProduct: (id, patch) => set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  addProduct: (p) => set((s) => ({ products: [...s.products, { enabled: true, prints: 2, ...p }] })),
  refund: (id) => set((s) => ({ tx: s.tx.map((t) => (t.id === id ? { ...t, status: 'refunded', refundedAt: Date.now() } : t)) })),
  setCamera: (booth, patch) => set((s) => ({ camera: { ...s.camera, [booth]: { ...s.camera[booth], ...patch } } })),
  resetCamera: (booth) => set((s) => ({ camera: { ...s.camera, [booth]: { ...DEFAULT_CAMERA } } })),
  addCoupon: (c) => set((s) => ({ coupons: [{ uses: 0, maxUses: 0, active: true, ...c }, ...s.coupons] })),
  toggleCoupon: (code) => set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c)) })),
  toggleFrame: (id) => set((s) => ({ frames: s.frames.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)) })),
  addFrame: (custom) => set((s) => ({ frames: [...s.frames, { id: custom.id, enabled: true, custom }] })),
  setBoothOnline: (booth, online) => ops.boothState(booth, { online }),
  selectBooth: (id) => set(() => ({ selectedBooth: id })),
  setStream: (booth, stream) => set((s) => ({ stream: { ...s.stream, [booth]: stream } })),
  // 지난 기록(올해 1월 1일부터 어제까지)을 불러온다. 월별, 연별 보기에 데이터가 생긴다. 화면에는 따로 표시하지 않는다.
  loadHistory: (rows) => set((s) => ({ tx: [...s.tx.filter((t) => !t.history), ...rows.map((r) => ({ ...r, history: true }))].sort((a, b) => b.ts - a.ts), hasSample: true })),
  clearHistory: () => set((s) => ({ tx: s.tx.filter((t) => !t.history), hasSample: false })),
  removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
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
    return { ok: true }
  },
  // 이전 이름(호환)
  loadSample: (rows) => ops.loadHistory(rows),
  clearSample: () => ops.clearHistory(),
}

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
