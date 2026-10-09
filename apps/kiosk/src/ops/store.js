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
}

export const ops = {
  get: () => state,
  subscribe: (f) => (subs.add(f), () => subs.delete(f)),

  // ---- 키오스크가 부르는 것 ----
  boothState: (booth, patch) => set((s) => ({ booth: { ...s.booth, [booth]: { ...s.booth[booth], ...patch } } })),
  recordPayment: ({ booth, method, amount, discount = 0, coupon = null, cuts = null, frameId = null }) => {
    const t = { id: uid('tx'), booth, ts: Date.now(), method, amount, discount, coupon, cuts, frameId, status: 'paid' }
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
  checkCoupon: (code) => {
    const c = state.coupons.find((x) => x.code === code && x.active)
    if (c) {
      if (c.kind === 'daily' && c.date !== today()) return { ok: false }
      if (c.maxUses && c.uses >= c.maxUses) return { ok: false }
      return { ok: true, discount: c.discount, label: c.label }
    }
    if (checksumOk(code)) return { ok: true, discount: state.price, label: 'web' }
    return { ok: false }
  },
  useCoupon: (code) => set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, uses: c.uses + 1 } : c)) })),

  // ---- 운영 화면이 부르는 것 ----
  setPrice: (price) => set(() => ({ price })),
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
  loadSample: (rows) => set((s) => ({ tx: [...s.tx, ...rows.map((r) => ({ ...r, sample: true }))].sort((a, b) => b.ts - a.ts), hasSample: true })),
  clearSample: () => set((s) => ({ tx: s.tx.filter((t) => !t.sample), hasSample: false })),
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
