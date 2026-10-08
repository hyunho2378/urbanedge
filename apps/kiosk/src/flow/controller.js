import { useCallback, useEffect, useRef, useState } from 'react'
import { STEPS, STEP_IDS } from './steps.js'
import { FLOW, CAMERA_STEPS, PRICE } from './config.js'
import { useCamera, samplesReady } from './camera.js'
import { DEFAULT_RETOUCH } from './retouch.js'
import { composeSheet, copiesOf, defaultFrameFor, ensureFonts, frameById, framesFor, overlayStamps, slotCount } from './prints.js'
import { ROOMS } from './rooms.js'
import { DEMO_COUPON, validateCoupon } from './coupon.js'

// controller.js: 키오스크 상태 컨트롤러 계약. K2(flow)가 실제 구현으로 교체한다.
// K1(device, Simulator 페이지)은 아래 반환 필드만 사용한다. 필드 이름과 의미를 바꾸지 않는다.
//
//   step            현재 단계 id (steps.js)
//   steps           STEPS
//   goTo(id)        단계로 이동 (시뮬레이터 점프용)
//   reset()         attract로 복귀하고 모든 선택을 초기화
//   lang, setLang   'ko' | 'en'
//   cuts            4 | 8 | null
//   hintZone        'camera' | 'card' | 'slot' | 'screen' | null  기기의 실제 부품을 가리키는 안내 (K1이 외형에서 강조)
//   flashing        촬영 순간 true (K1이 LED 바를 밝힌다)
//   printUrl        인화 결과 이미지 data URL 또는 null (K1이 출구 슬롯에서 종이를 내민다)
//   cameraActive    카메라가 켜진 상태면 true (K1이 렌즈 표시등을 켠다)
//   cameraMode, setCameraMode   'live'(웹캠) | 'sample'(샘플 이미지)
//
// v2 추가 필드(K2): 기본 언어는 'en'이고 reset()이 'en'으로 되돌린다.
//   room, setRoom(id), next(), back(), canNext, canBack, dir('forward'|'back'), introPage, setIntroPage,
//   setCuts(n), frame, frameId, setFrame(id), slots, retouch, setRetouch(patch), camera, shots, arrangement, selected,
//   placeShot(shotIdx, slotIdx), swapSlots(a, b), clearSlot(i), retake(), shoot, stamps, addStamp(room, x, y), moveStamp(i, x, y),
//   removeStamp(i), clearStamps(), message, setMessage(s), printProgress, printDone, finalStrip(canvas), date, speed,
//   pay { method, status, coupon, couponError, cash, view }, setPayMethod(m), payTap(ok), payCash(), applyCoupon(code),
//   payRetry(), payBack(), setCouponView(v), coach { seen, off }, markCoach(id), skipCoach(), coachOff.
//   pay 단계의 hintZone은 'card'(쿠폰 QR 스캔 중에는 'camera')다.
// 옵션: useKioskController({ speed, step, lang, room, cameraMode }). speed가 1보다 작으면 촬영과 인화 연출이 빨라진다(개발 확인용).

const INITIAL_SHOOT = { index: 0, phase: 'idle', count: 0 }
// reader: null | 'in'(카드가 투입구에 들어감 / 휴대폰이 단말기에 닿음) | 'out'(승인 뒤 카드를 빼는 중)
const INITIAL_PAY = { method: null, status: 'choose', coupon: null, couponError: false, cash: 0, view: 'type', reader: null }
const idx = (id) => STEP_IDS.indexOf(id)

function zoneFor(step, introPage, pay) {
  switch (step) {
    case 'attract':
    case 'guide':
    case 'shoot':
      return 'camera'
    case 'intro':
      return null
    case 'pay':
      return pay.method === 'coupon' && pay.view === 'scan' ? 'camera' : 'card'
    case 'print':
    case 'finish':
      return 'slot'
    default:
      return null
  }
}

// v3: 탑승 안내는 한 장이다(네 정거장 노선). 렌즈와 단말기 안내는 해당 단계 옆 칸의 팁으로 옮겼다(docs/KIOSK_V3.md).
export const INTRO_PAGES = 1

export function useKioskController(options = {}) {
  const speed = options.speed ?? 1
  const [step, setStepState] = useState(options.step || 'attract')
  const [dir, setDir] = useState('forward')
  const [lang, setLang] = useState(options.lang || 'en')
  const [room, setRoom] = useState(options.room || ROOMS[0].id)
  const [cameraMode, setCameraMode] = useState(options.cameraMode || 'sample')
  const [introPage, setIntroPage] = useState(0)
  const [cuts, setCutsState] = useState(null)
  const [frameId, setFrameIdState] = useState(null)
  const [retouch, setRetouchState] = useState(DEFAULT_RETOUCH)
  const [shots, setShots] = useState([])
  const [arrangement, setArrangementState] = useState([])
  const [shoot, setShoot] = useState(INITIAL_SHOOT)
  const [flashing, setFlashing] = useState(false)
  const [stamps, setStamps] = useState([])
  const [message, setMessageState] = useState('')
  const [printProgress, setPrintProgress] = useState(0)
  const [printDone, setPrintDone] = useState(false)
  const [printUrl, setPrintUrl] = useState(null)
  const [finalStrip, setFinalStrip] = useState(null)
  const [pay, setPay] = useState(INITIAL_PAY)
  const [coach, setCoach] = useState({ seen: {}, off: false })
  const [date, setDate] = useState(() => new Date())

  const camera = useCamera({ wanted: CAMERA_STEPS.includes(step), mode: cameraMode })

  // 비동기 흐름이 항상 최신 값을 읽도록 참조를 두고, 세터는 참조도 바로 갱신한다.
  const live = useRef({})
  live.current = { ...live.current, step, cuts, frameId, retouch, shots, arrangement, stamps, message, room, lang, camera, speed, printDone, printUrl, introPage, pay, date }
  const sync = (patch) => {
    live.current = { ...live.current, ...patch }
  }

  useEffect(() => {
    samplesReady()
  }, [])

  const go = useCallback((id) => {
    setDir(idx(id) >= idx(live.current.step) ? 'forward' : 'back')
    sync({ step: id })
    setStepState(id)
  }, [])

  // ---------- 선택 상태 ----------

  const setFrame = useCallback((id) => {
    sync({ frameId: id })
    setFrameIdState(id)
  }, [])

  const setCuts = useCallback(
    (n) => {
      sync({ cuts: n, shots: [], arrangement: [] })
      setCutsState(n)
      setShots([])
      setArrangementState([])
      const cur = frameById(live.current.frameId)
      if (!cur || cur.cuts !== n) setFrame(defaultFrameFor(n).id)
    },
    [setFrame],
  )

  const setRetouch = useCallback((patch) => setRetouchState((r) => ({ ...r, ...patch })), [])
  const setMessage = useCallback((s) => {
    const v = Array.from(s).slice(0, FLOW.messageMax).join('')
    sync({ message: v })
    setMessageState(v)
  }, [])

  const setArrangement = useCallback((a) => {
    sync({ arrangement: a })
    setArrangementState(a)
  }, [])

  const initArrangement = useCallback(
    (n) => {
      const f = frameById(live.current.frameId) || defaultFrameFor(live.current.cuts || 4)
      const slots = slotCount(f, n)
      setArrangement(Array.from({ length: slots }, (_, i) => (i < n ? i : null)))
    },
    [setArrangement],
  )

  // 컷을 칸에 놓는다. 이미 다른 칸에 있으면 그 칸과 자리를 바꾸고, 칸이 차 있으면 밀려난 컷은 트레이로 돌아간다.
  const placeShot = useCallback(
    (shotIdx, slotIdx) => {
      const a = [...live.current.arrangement]
      if (slotIdx < 0 || slotIdx >= a.length) return
      const from = a.indexOf(shotIdx)
      const prev = a[slotIdx]
      a[slotIdx] = shotIdx
      if (from >= 0 && from !== slotIdx) a[from] = prev ?? null
      setArrangement(a)
    },
    [setArrangement],
  )
  const swapSlots = useCallback(
    (i, j) => {
      const a = [...live.current.arrangement]
      if (i === j || i < 0 || j < 0 || i >= a.length || j >= a.length) return
      ;[a[i], a[j]] = [a[j], a[i]]
      setArrangement(a)
    },
    [setArrangement],
  )
  const clearSlot = useCallback(
    (i) => {
      const a = [...live.current.arrangement]
      if (i < 0 || i >= a.length) return
      a[i] = null
      setArrangement(a)
    },
    [setArrangement],
  )

  const addStamp = useCallback((roomId, x, y) => {
    setStamps((s) => [...s, { room: roomId, x, y, rot: ((s.length * 37) % 13) - 6 }])
  }, [])
  const moveStamp = useCallback((i, x, y) => setStamps((s) => s.map((st, k) => (k === i ? { ...st, x, y } : st))), [])
  const removeStamp = useCallback((i) => setStamps((s) => s.filter((_, k) => k !== i)), [])
  const clearStamps = useCallback(() => setStamps([]), [])

  // 코치마크: 단계마다 처음 한 번만 보여 준다(메모리에만 둔다).
  const markCoach = useCallback((id) => setCoach((c) => ({ ...c, seen: { ...c.seen, [id]: true } })), [])
  const skipCoach = useCallback(() => setCoach((c) => ({ ...c, off: true })), [])

  // ---------- 결제 시뮬레이션 ----------

  const timers = useRef([])
  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms * live.current.speed)
    timers.current.push(id)
  }, [])
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  const patchPay = useCallback((patch) => {
    const next = { ...live.current.pay, ...patch }
    sync({ pay: next })
    setPay(next)
  }, [])

  const setPayMethod = useCallback((m) => patchPay({ method: m, status: 'waiting', couponError: false, cash: 0, view: 'type', coupon: null, reader: null }), [patchPay])
  const payBack = useCallback(() => patchPay({ ...INITIAL_PAY }), [patchPay])
  const payRetry = useCallback(() => patchPay({ status: 'waiting', couponError: false, cash: 0, reader: null }), [patchPay])
  const setCouponView = useCallback((v) => patchPay({ view: v }), [patchPay])

  const finishPay = useCallback(
    (ok) => {
      patchPay({ status: 'processing' })
      later(() => {
        const card = live.current.pay.method === 'card'
        // 카드는 승인 뒤 투입구에서 다시 올라온다(reader 'out'). 실패하면 바로 빠진다.
        patchPay({ status: ok ? 'success' : 'failed', reader: card && ok ? 'out' : null })
      }, FLOW.payMs)
    },
    [patchPay, later],
  )
  // 카드: 투입구에 꽂는 순간(reader 'in') 뒤 FLOW.readerMs 동안 읽고 승인 요청. 삼성페이도 같은 순서로 단말기에 닿는다.
  const payTap = useCallback((ok = true) => {
    const p = live.current.pay
    if ((p.method !== 'card' && p.method !== 'samsung') || p.status !== 'waiting' || p.reader) return
    patchPay({ reader: 'in' })
    later(() => finishPay(ok), FLOW.readerMs)
  }, [finishPay, patchPay, later])
  const payCash = useCallback(() => {
    const p = live.current.pay
    if (p.method !== 'cash' || p.status !== 'waiting') return
    // 지폐는 5,000원 한 장, 이어서 1,000원씩 들어간다(합계 7,000원). cash는 0부터 1 비율이다.
    const paid = Math.round(p.cash * PRICE.base)
    const bill = paid < 5000 ? 5000 : 1000
    const cash = Math.min(1, (paid + bill) / PRICE.base)
    patchPay({ cash })
    if (cash >= 1) later(() => finishPay(true), 300)
  }, [patchPay, finishPay, later])
  const applyCoupon = useCallback(
    (code) => {
      const p = live.current.pay
      if (p.method !== 'coupon' || p.status !== 'waiting') return false
      if (!validateCoupon(code)) {
        patchPay({ couponError: true })
        return false
      }
      patchPay({ coupon: code, couponError: false })
      finishPay(true)
      return true
    },
    [patchPay, finishPay],
  )
  // 결제 완료 화면은 잠시 보여 준 뒤 포즈 안내로 넘어간다.
  useEffect(() => {
    if (step !== 'pay' || pay.status !== 'success') return undefined
    const id = setTimeout(() => {
      if (live.current.step === 'pay') go('cuts')
    }, FLOW.payDoneMs * live.current.speed)
    return () => clearTimeout(id)
  }, [step, pay.status, go])

  // ---------- 인화 합성 ----------

  const composeUrl = useCallback(async (over = {}) => {
    const L = { ...live.current, ...over }
    const f = frameById(L.frameId) || defaultFrameFor(L.cuts || 4)
    const photos = L.arrangement.map((i) => (i != null && L.shots[i] ? L.shots[i].canvas : null)).filter(Boolean)
    await ensureFonts()
    const base = await composeSheet({ frameId: f.id, photos, date: L.date, roomId: L.room, message: L.message })
    const canvas = L.stamps.length ? overlayStamps(base, L.stamps, copiesOf(f, 'sheet')) : base
    return { canvas, url: canvas.toDataURL('image/jpeg', 0.92) }
  }, [])

  const fillSampleShots = useCallback(async (n) => {
    await samplesReady()
    const L = live.current
    const arr = Array.from({ length: n }, (_, k) => L.camera.capture(k, L.retouch))
    sync({ shots: arr })
    setShots(arr)
    return arr
  }, [])

  // ---------- 이동 ----------

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    sync({ cuts: null, frameId: null, shots: [], arrangement: [], stamps: [], message: '', pay: INITIAL_PAY, printDone: false, printUrl: null })
    setCutsState(null)
    setFrameIdState(null)
    setRetouchState(DEFAULT_RETOUCH)
    setShots([])
    setArrangementState([])
    setShoot(INITIAL_SHOOT)
    setFlashing(false)
    setStamps([])
    setMessageState('')
    setPrintProgress(0)
    setPrintDone(false)
    setPrintUrl(null)
    setFinalStrip(null)
    setPay(INITIAL_PAY)
    setCoach({ seen: {}, off: false })
    setIntroPage(0)
    setLang('en')
    setDate(new Date())
    go('attract')
  }, [go])

  const startPrintState = useCallback(() => {
    sync({ printDone: false, printUrl: null })
    setPrintProgress(0)
    setPrintDone(false)
    setPrintUrl(null)
    setFinalStrip(null)
  }, [])

  // 시뮬레이터 점프: 건너뛴 단계의 선택을 기본값으로 채운다.
  const goTo = useCallback(
    (id) => {
      const i = idx(id)
      if (i < 0) return
      if (id === 'attract') {
        reset()
        return
      }
      let c = live.current.cuts
      if (i >= idx('frame') && !c) {
        c = 4
        setCuts(4)
      }
      if (i >= idx('frame')) {
        const f = frameById(live.current.frameId)
        if (!f || f.cuts !== c) setFrame(defaultFrameFor(c).id)
      }
      if (i > idx('pay') && live.current.pay.status !== 'success') patchPay({ method: 'card', status: 'success' })
      if (id === 'pay' && live.current.pay.status === 'success') patchPay({ ...INITIAL_PAY })
      if (id === 'intro') setIntroPage(0)
      const wantsShots = i >= idx('select') && id !== 'shoot'
      const needShots = wantsShots && live.current.shots.length < (c || 4)
      if (id === 'print') startPrintState()
      if (id === 'finish') {
        sync({ printDone: true })
        setPrintProgress(1)
        setPrintDone(true)
      }
      go(id)
      if (needShots) {
        fillSampleShots(c || 4).then(() => {
          initArrangement(c || 4)
          if (id === 'select') {
            const a = live.current.arrangement
            if (a.length > 2) setArrangement(a.map((v, k) => (k === a.length - 1 ? null : v)))
          }
          if (id === 'finish') composeUrl().then((r) => {
            setPrintUrl(r.url)
            setFinalStrip(r.canvas)
          })
        })
      } else if (wantsShots && live.current.arrangement.length === 0) {
        initArrangement(c || 4)
      } else if (id === 'finish' && !live.current.printUrl) {
        composeUrl().then((r) => {
          setPrintUrl(r.url)
          setFinalStrip(r.canvas)
        })
      }
    },
    [go, reset, setCuts, setFrame, patchPay, fillSampleShots, initArrangement, setArrangement, composeUrl, startPrintState],
  )

  // ?step=으로 시작하면 그 단계에 필요한 상태(컷 수, 프레임, 결제, 촬영 컷)를 goTo와 같은 방식으로 채운다.
  useEffect(() => {
    if (options.step && options.step !== 'attract') goTo(options.step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const retake = useCallback(() => {
    sync({ shots: [], arrangement: [] })
    setShots([])
    setArrangementState([])
    go('guide')
  }, [go])

  const next = useCallback(() => {
    const L = live.current
    switch (L.step) {
      case 'attract':
        go('language')
        break
      case 'language':
        go(L.pay.status === 'success' ? 'cuts' : 'pay')
        break
      case 'cuts':
        if (L.cuts) go('frame')
        break
      case 'frame':
        go('guide')
        break
      case 'pay':
        if (L.pay.status === 'success') go('cuts')
        break
      case 'guide':
        go('shoot')
        break
      case 'select':
        if (L.arrangement.length && L.arrangement.every((v) => v != null)) {
          startPrintState()
          go('print')
        }
        break
      case 'print':
        if (L.printDone) go('finish')
        break
      case 'finish':
        reset()
        break
      default:
        break
    }
  }, [go, reset, startPrintState])

  const back = useCallback(() => {
    const L = live.current
    switch (L.step) {
      case 'language':
        reset()
        break
      case 'frame':
        go('cuts')
        break
      case 'pay':
        if (L.pay.method && !['processing', 'success'].includes(L.pay.status) && !L.pay.reader) payBack()
        else if (!L.pay.method) go('language')
        break
      case 'guide':
        go('frame')
        break
      case 'select':
        retake()
        break
      default:
        break
    }
  }, [go, reset, retake, payBack])

  // ---------- 촬영 시퀀스 ----------

  useEffect(() => {
    if (step !== 'shoot') return undefined
    const n = live.current.cuts || 4
    let dead = false
    const tms = []
    const wait = (ms) =>
      new Promise((res) => {
        tms.push(setTimeout(res, ms * live.current.speed))
      })
    sync({ shots: [], arrangement: [] })
    setShots([])
    setArrangementState([])
    ;(async () => {
      setShoot({ index: 0, phase: 'intro', count: 0 })
      await wait(FLOW.introMs)
      if (dead) return
      for (let i = 0; i < n; i++) {
        for (let c = FLOW.secondsPerShot; c >= 1; c--) {
          setShoot({ index: i, phase: 'count', count: c })
          await wait(1000)
          if (dead) return
        }
        setShoot({ index: i, phase: 'shutter', count: 0 })
        setFlashing(true)
        const L = live.current
        const shot = L.camera.capture(i, L.retouch)
        const nextShots = [...live.current.shots, shot]
        sync({ shots: nextShots })
        setShots(nextShots)
        await wait(FLOW.flashMs)
        if (dead) return
        setFlashing(false)
        if (i < n - 1) {
          setShoot({ index: i, phase: 'rest', count: 0 })
          await wait(FLOW.restMs)
          if (dead) return
        }
      }
      setShoot({ index: n - 1, phase: 'done', count: 0 })
      await wait(FLOW.doneMs)
      if (dead) return
      initArrangement(n)
      go('select')
    })()
    return () => {
      dead = true
      tms.forEach(clearTimeout)
      setFlashing(false)
    }
  }, [step, go, initArrangement])

  // ---------- 인화 진행 ----------

  useEffect(() => {
    if (step !== 'print' || live.current.printDone) return undefined
    const started = performance.now()
    const dur = FLOW.printMs * live.current.speed
    let dead = false
    const timer = setInterval(() => {
      const p = Math.min(1, (performance.now() - started) / dur)
      setPrintProgress(p)
      if (p >= 1) {
        clearInterval(timer)
        composeUrl().then((r) => {
          if (dead) return
          sync({ printDone: true, printUrl: r.url })
          setFinalStrip(r.canvas)
          setPrintUrl(r.url)
          setPrintDone(true)
        })
      }
    }, 200)
    return () => {
      dead = true
      clearInterval(timer)
    }
  }, [step, composeUrl])

  // ---------- 계약 필드 ----------

  const frame = frameById(frameId)
  const slots = slotCount(frame, cuts || 4)
  const selected = arrangement.filter((v) => v != null)
  const full = arrangement.length > 0 && arrangement.every((v) => v != null)
  const canNext = (() => {
    switch (step) {
      case 'cuts':
        return !!cuts
      case 'frame':
        return !!frame
      case 'pay':
        return pay.status === 'success'
      case 'select':
        return full
      case 'print':
        return printDone
      case 'shoot':
      case 'language':
        return false
      default:
        return true
    }
  })()
  const canBack = !['attract', 'shoot', 'print', 'finish', 'cuts'].includes(step)
  const cameraActive = CAMERA_STEPS.includes(step) && ['live', 'sample', 'fallback'].includes(camera.status)

  return {
    step,
    steps: STEPS,
    goTo,
    reset,
    lang,
    setLang,
    cuts,
    hintZone: zoneFor(step, introPage, pay),
    flashing,
    printUrl,
    cameraActive,
    cameraMode,
    setCameraMode,
    // v2 추가 필드
    room,
    setRoom,
    next,
    back,
    canNext,
    canBack,
    dir,
    introPage,
    setIntroPage,
    setCuts,
    frame,
    frameId,
    setFrame,
    slots,
    retouch,
    setRetouch,
    camera,
    shots,
    arrangement,
    selected,
    placeShot,
    swapSlots,
    clearSlot,
    retake,
    shoot,
    stamps,
    addStamp,
    moveStamp,
    removeStamp,
    clearStamps,
    message,
    setMessage,
    printProgress,
    printDone,
    finalStrip,
    date,
    speed,
    pay,
    setPayMethod,
    payTap,
    payCash,
    applyCoupon,
    payRetry,
    payBack,
    setCouponView,
    coach,
    markCoach,
    skipCoach,
    coachOff: coach.off,
    demoCoupon: DEMO_COUPON,
    framesForCuts: framesFor,
  }
}
