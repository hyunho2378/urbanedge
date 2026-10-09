// ops/sim.js: 자동 운영. 화면에 떠 있는 키오스크가 손님처럼 진짜 흐름(언어, 상품, 결제, 컷, 프레임, 촬영, 인화, 완료)을 직접 돌린다.
// 결제는 그 순간의 시각(Date.now)으로 운영 저장소에 찍히므로 대시보드와 POS에 실시간으로 나타난다.
// 부스별 손님 수는 운영사 인터뷰의 비율(지하철 5 : 노래방 3 : 레트로 2)을 따른다.
// 키오스크를 직접 누르면 그 기기는 30초 동안 자동 운영을 멈춘다.
// 화면에는 자동 운영 표시를 따로 두지 않는다. 컨트롤러가 내보내는 값만 쓰므로 컨트롤러의 필드 이름을 바꾸면 여기도 고친다.
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { ops } from './store.js'
import { COUPON_ALPHABET, makeCoupon } from '../flow/coupon.js'

// ---- 켜기/끄기와 배속(모듈 상태) ----
let auto = { on: false, mult: 4, stopAt: 0 }
const subs = new Set()
const emit = () => subs.forEach((f) => f())
export const autoRun = {
  get: () => auto,
  subscribe: (f) => (subs.add(f), () => subs.delete(f)),
  start: () => ((auto = { ...auto, on: true }), emit()),
  stop: () => ((auto = { ...auto, on: false, stopAt: Date.now() }), emit()),
  setMult: (mult) => ((auto = { ...auto, mult }), emit()),
}
export const useAutoRun = () => useSyncExternalStore(autoRun.subscribe, autoRun.get, autoRun.get)
export const MULTS = [1, 4, 16]

// ---- 확률 ----
// 부스 인기 가중치(인터뷰: 지하철이 가장 많고, 노래방, 레트로 순). 1배속 기준 손님 사이 평균 쉬는 시간(초)은 가중치에 반비례한다.
export const BOOTH_WEIGHT = { subway: 5, karaoke: 3, retro: 2 }
const GAP_S = { subway: 15, karaoke: 65, retro: 125 }
const PAY_WEIGHT = [['card', 62], ['samsung', 18], ['cash', 12], ['coupon', 8]]
const rnd = (a, b) => a + Math.random() * (b - a)
const pick = (list) => list[Math.floor(Math.random() * list.length)]
function weighted(pairs) {
  const total = pairs.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [v, w] of pairs) if ((r -= w) <= 0) return v
  return pairs[0][0]
}
const expo = (mean) => -Math.log(1 - Math.random()) * mean

// 상품(가격표) 고르기: 켜 둔 상품 중 인기 순서로 가중
const PRODUCT_WEIGHT = { strip4: 3, grid4: 4, grid8: 1.5, premium: 1.5 }
export function pickProductId() {
  const list = ops.get().products.filter((p) => p.enabled)
  if (!list.length) return null
  return weighted(list.map((p) => [p.id, PRODUCT_WEIGHT[p.id] ?? 1]))
}

function randomCouponCode() {
  // 등록된 제휴 쿠폰이 있으면 그걸 먼저 쓰고, 없으면 웹사이트 스크래치 쿠폰 규칙에 맞는 코드를 만든다.
  const reg = ops.get().coupons.filter((c) => c.active && (!c.maxUses || c.uses < c.maxUses))
  if (reg.length && Math.random() < 0.6) return pick(reg).code
  const seven = Array.from({ length: 7 }, () => COUPON_ALPHABET[Math.floor(Math.random() * 32)]).join('')
  return makeCoupon(seven)
}

// ---- 키오스크 한 대를 돌리는 훅 ----
// ctrl: useKioskController 반환값. 매 렌더마다 ref에 담아 두고 일정 간격으로 현재 단계를 보고 한 동작만 한다.
// 단계를 보고 움직이므로 사람이 중간에 눌러도 그 자리에서 이어 간다.
export function useAutoPilot(ctrl, booth) {
  const { on, mult } = useAutoRun()
  const ref = useRef(ctrl)
  ref.current = ctrl
  const mem = useRef({ pausedUntil: 0 })
  // 직접 만지면 이 기기는 30초 쉰다(Simulator가 기기를 누를 때 부른다)
  const pause = useRef(() => {
    mem.current.pausedUntil = Date.now() + 30000
  }).current

  useEffect(() => {
    if (!on) return undefined
    const m = mem.current
    // 손님 한 명의 선택(단계마다 한 번만 정한다)
    let c = null
    let busyUntil = 0
    let arriveAt = 0
    let refundAt = 0
    let refundId = null
    const fresh = () => ({ lang: null, product: null, method: null, code: null, tries: 0, failed: false, cuts: null, frame: false, stamped: false, hold: 0 })
    const scale = (ms) => ms / mult
    const busy = (ms) => {
      busyUntil = Date.now() + scale(ms)
    }

    const tick = () => {
      const k = ref.current
      const now = Date.now()
      // 환불 예약(전화로 도움받는 환불을 흉내): 인화 오류가 난 손님의 결제를 나중에 환불 처리
      if (refundId && now >= refundAt) {
        ops.refund(refundId)
        refundId = null
      }
      if (now < m.pausedUntil || now < busyUntil) return
      const step = k.step

      if (step === 'attract') {
        c = null
        if (!arriveAt) arriveAt = now + scale(Math.max(3000, expo(GAP_S[booth] * 1000)))
        if (now >= arriveAt) {
          arriveAt = 0
          c = fresh()
          k.next()
          busy(rnd(700, 1500))
        }
        return
      }
      if (!c) c = fresh()

      switch (step) {
        case 'language': {
          if (!c.lang) {
            c.lang = weighted([['en', 55], ['ko', 45]])
            k.setLang(c.lang)
            busy(rnd(900, 1800))
          } else {
            k.next()
            busy(rnd(600, 1200))
          }
          break
        }
        case 'pay': {
          const p = k.pay
          if (p.status === 'success' || p.status === 'processing') return
          if (!k.product && typeof k.setProduct === 'function') {
            c.product = pickProductId()
            if (c.product) {
              k.setProduct(c.product)
              busy(rnd(900, 1800))
              return
            }
          }
          if (p.status === 'failed') {
            k.payRetry()
            c.failed = true
            busy(rnd(700, 1200))
            return
          }
          if (!p.method) {
            c.method = weighted(PAY_WEIGHT)
            k.setPayMethod(c.method)
            busy(rnd(900, 1600))
            return
          }
          if (p.status !== 'waiting') return
          if (p.method === 'card' || p.method === 'samsung') {
            if (p.reader) return
            // 카드는 가끔 한 번 승인 실패 뒤 다시 시도한다
            const fail = !c.failed && Math.random() < 0.05
            k.payTap(!fail)
            busy(rnd(500, 900))
          } else if (p.method === 'cash') {
            k.payCash()
            busy(rnd(500, 900))
          } else if (p.method === 'coupon') {
            if (!c.code || p.couponError) c.code = randomCouponCode()
            k.applyCoupon(c.code)
            busy(rnd(900, 1500))
          }
          break
        }
        case 'cuts': {
          if (!k.cuts) {
            const prod = k.product || ops.get().products.find((x) => x.id === c.product)
            k.setCuts(prod?.cuts || (Math.random() < 0.75 ? 4 : 8))
            busy(rnd(900, 1800))
          } else {
            k.next()
            busy(rnd(600, 1200))
          }
          break
        }
        case 'frame': {
          if (!c.frame) {
            const list = k.framesForCuts ? k.framesForCuts(k.cuts || 4) : []
            if (list.length) k.setFrame(pick(list).id)
            c.frame = true
            busy(rnd(1200, 2600))
          } else {
            k.next()
            busy(rnd(600, 1200))
          }
          break
        }
        case 'guide': {
          k.next()
          busy(rnd(1200, 2400))
          break
        }
        case 'select': {
          const a = k.arrangement
          if (a.length && a.some((v) => v == null)) {
            const used = new Set(a.filter((v) => v != null))
            const free = k.shots.map((_, i) => i).filter((i) => !used.has(i))
            const slot = a.findIndex((v) => v == null)
            if (slot >= 0 && free.length) k.placeShot(free[0], slot)
            busy(rnd(500, 900))
          } else if (a.length) {
            k.next()
            busy(rnd(900, 1800))
          }
          break
        }
        case 'print': {
          if (!c.stamped && !k.printDone) {
            c.stamped = true
            if (Math.random() < 0.5) k.addStamp(pick(['retro', 'karaoke', 'subway']), rnd(0.25, 0.75), rnd(0.25, 0.7))
            busy(rnd(400, 900))
          } else if (k.printDone) {
            // 아주 가끔 인화가 잘못 나와 나중에 환불된다
            if (Math.random() < 0.03) {
              const t = ops.get().tx.find((x) => x.booth === booth && x.status === 'paid' && x.sim)
              if (t) {
                refundId = t.id
                refundAt = Date.now() + scale(rnd(20000, 60000))
              }
            }
            k.next()
            busy(rnd(1200, 2400))
          }
          break
        }
        case 'finish': {
          if (!c.hold) {
            c.hold = 1
            busy(rnd(3500, 7000))
          } else {
            k.next()
            busy(rnd(800, 1500))
          }
          break
        }
        default:
          break
      }
    }

    const id = setInterval(tick, Math.max(80, 400 / mult))
    return () => clearInterval(id)
  }, [on, mult, booth])

  // 멈추면 대기 화면으로 돌아간다
  const wasOn = useRef(on)
  useEffect(() => {
    if (wasOn.current && !on) ref.current.reset()
    wasOn.current = on
  }, [on])

  return pause
}

// 켜 있는 동안 컨트롤러 속도(촬영 카운트, 결제, 인화 시간)를 배속에 맞춘다. 꺼져 있으면 기본 속도를 그대로 쓴다.
export function autoSpeed(base, auto) {
  return auto.on ? 1 / auto.mult : base
}

export const isAutoOn = () => auto.on

// 자동 운영 중에 새로 기록된 결제에는 내부 표시(sim)를 붙인다. 화면에는 나타나지 않고, 환불 예약이 자기 결제를 찾는 데만 쓴다.
const seenTx = new Set(ops.get().tx.map((t) => t.id))
ops.subscribe(() => {
  for (const t of ops.get().tx.slice(0, 8)) {
    if (seenTx.has(t.id)) continue
    seenTx.add(t.id)
    // 구독자는 recordPayment 안의 set() 도중에 불린다. 그 자리에서 바로 PATCH하면 POST보다 먼저 서버에 가서 404가 되므로, POST가 줄에 들어간 다음에 보낸다.
    if (auto.on && !t.sim) queueMicrotask(() => ops.patchTx(t.id, { sim: true }))
  }
})

// 개발 서버에서만: 콘솔에서 저장소를 들여다볼 수 있게 한다(배포본에는 들어가지 않는다).
if (import.meta.env && import.meta.env.DEV && typeof window !== 'undefined') window.__ops = ops
