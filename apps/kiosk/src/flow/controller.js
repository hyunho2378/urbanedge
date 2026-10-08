import { useCallback, useEffect, useRef, useState } from 'react'
import { STEPS, STEP_IDS } from './steps.js'
import { FLOW, CAMERA_STEPS } from './config.js'
import { useCamera, samplesReady } from './camera.js'
import { DEFAULT_RETOUCH } from './retouch.js'
import { defaultFrameFor, ensureFonts, frameById, framesFor, renderPrint } from './frames.js'
import { ROOMS, roomById } from './rooms.js'

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
// 추가 필드(K2): room, setRoom(id), next(), back(), canNext, canBack, dir('forward'|'back'), introPage, setIntroPage,
//   setCuts(n), frame, frameId, setFrame(id), retouch, setRetouch(patch), camera, shots, selected, toggleSelect(i),
//   retake(), shoot, stamps, toggleStamp(id), message, setMessage(s), printProgress, printDone, speed.
// 옵션: useKioskController({ speed, step, lang, room, cameraMode }). speed가 1보다 작으면 촬영과 인화 연출이 빨라진다(개발 확인용).

const INITIAL_SHOOT = { index: 0, phase: 'idle', count: 0 }
const idx = (id) => STEP_IDS.indexOf(id)

// 단계별 기기 부품 안내. 인트로는 페이지에 따라 달라진다.
function zoneFor(step, introPage) {
  switch (step) {
    case 'attract':
    case 'guide':
    case 'ready':
    case 'shoot':
      return 'camera'
    case 'intro':
      return introPage === 1 ? 'camera' : introPage === 2 ? 'slot' : null
    case 'print':
    case 'finish':
      return 'slot'
    default:
      return null
  }
}

export function useKioskController(options = {}) {
  const speed = options.speed ?? 1
  const [step, setStepState] = useState(options.step || 'attract')
  const [dir, setDir] = useState('forward')
  const [lang, setLang] = useState(options.lang || 'ko')
  const [room, setRoom] = useState(options.room || ROOMS[0].id)
  const [cameraMode, setCameraMode] = useState(options.cameraMode || 'sample')
  const [introPage, setIntroPage] = useState(0)
  const [cuts, setCutsState] = useState(null)
  const [frameId, setFrameId] = useState(null)
  const [retouch, setRetouchState] = useState(DEFAULT_RETOUCH)
  const [shots, setShots] = useState([])
  const [selected, setSelected] = useState([])
  const [shoot, setShoot] = useState(INITIAL_SHOOT)
  const [flashing, setFlashing] = useState(false)
  const [stamps, setStamps] = useState([])
  const [message, setMessageState] = useState('')
  const [printProgress, setPrintProgress] = useState(0)
  const [printDone, setPrintDone] = useState(false)
  const [printUrl, setPrintUrl] = useState(null)

  const camera = useCamera({ wanted: CAMERA_STEPS.includes(step), mode: cameraMode })

  // 비동기 흐름이 항상 최신 값을 읽도록 참조를 둔다.
  const live = useRef({})
  live.current = { step, cuts, frameId, retouch, shots, selected, stamps, message, room, lang, camera, speed, printDone, printUrl, introPage }

  useEffect(() => {
    samplesReady()
  }, [])

  const go = useCallback((id) => {
    setDir(idx(id) >= idx(live.current.step) ? 'forward' : 'back')
    live.current.step = id
    setStepState(id)
  }, [])

  // ---------- 선택 상태 ----------

  const setCuts = useCallback((n) => {
    setCutsState(n)
    setShots([])
    setSelected([])
    setFrameId((cur) => (cur && framesFor(n).some((f) => f.id === cur) ? cur : defaultFrameFor(n).id))
  }, [])

  const setFrame = useCallback((id) => setFrameId(id), [])
  const setRetouch = useCallback((patch) => setRetouchState((r) => ({ ...r, ...patch })), [])
  const toggleStamp = useCallback((id) => setStamps((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])), [])
  const setMessage = useCallback((s) => setMessageState(Array.from(s).slice(0, FLOW.messageMax).join('')), [])

  const toggleSelect = useCallback((i) => {
    if (live.current.cuts !== 8) return
    setSelected((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : cur.length < FLOW.slots ? [...cur, i] : cur))
  }, [])

  // ---------- 인화 합성 ----------

  const composeUrl = useCallback(async (over = {}) => {
    const L = { ...live.current, ...over }
    const frame = frameById(L.frameId) || defaultFrameFor(L.cuts || 4)
    const sel = L.selected.length ? L.selected : [0, 1, 2, 3]
    const photos = sel.slice(0, FLOW.slots).map((i) => (L.shots[i] ? { src: L.shots[i].canvas } : null))
    await ensureFonts()
    const canvas = renderPrint(frame, { photos, room: roomById(L.room), stamps: L.stamps.map(roomById), message: L.message, lang: L.lang })
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  const fillSampleShots = useCallback(async (n) => {
    await samplesReady()
    const L = live.current
    const arr = Array.from({ length: n }, (_, k) => L.camera.capture(k, L.retouch))
    setShots(arr)
    return arr
  }, [])

  // ---------- 이동 ----------

  const reset = useCallback(() => {
    setCutsState(null)
    setFrameId(null)
    setRetouchState(DEFAULT_RETOUCH)
    setShots([])
    setSelected([])
    setShoot(INITIAL_SHOOT)
    setFlashing(false)
    setStamps([])
    setMessageState('')
    setPrintProgress(0)
    setPrintDone(false)
    setPrintUrl(null)
    setIntroPage(0)
    setLang('ko')
    go('attract')
  }, [go])

  const startPrintState = useCallback(() => {
    setPrintProgress(0)
    setPrintDone(false)
    setPrintUrl(null)
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
      const L = live.current
      let c = L.cuts
      if (i >= idx('frame') && !c) {
        c = 4
        setCutsState(4)
      }
      if (i >= idx('frame')) {
        const f = frameById(L.frameId)
        if (!f || !f.cuts.includes(c)) setFrameId(defaultFrameFor(c).id)
      }
      const full = c === 4 ? [0, 1, 2, 3] : [0, 2, 4, 6]
      const fromShots = i >= idx('select') && id !== 'shoot'
      const needShots = fromShots && L.shots.length < (c || 4)
      if (fromShots && L.selected.length < FLOW.slots) setSelected(id === 'select' && c === 8 ? [0, 3] : full)
      if (id === 'intro') setIntroPage(0)
      if (id === 'print') startPrintState()
      if (id === 'finish') {
        setPrintProgress(1)
        setPrintDone(true)
      }
      go(id)
      if (needShots) {
        fillSampleShots(c || 4).then((arr) => {
          if (id !== 'finish') return
          const fid = frameById(live.current.frameId) ? live.current.frameId : defaultFrameFor(c).id
          composeUrl({ shots: arr, cuts: c, selected: full, frameId: fid }).then(setPrintUrl)
        })
      } else if (id === 'finish' && !L.printUrl) {
        composeUrl({ cuts: c, selected: L.selected.length >= FLOW.slots ? L.selected : full }).then(setPrintUrl)
      }
    },
    [go, reset, fillSampleShots, composeUrl, startPrintState],
  )

  const retake = useCallback(() => {
    setShots([])
    setSelected([])
    go('ready')
  }, [go])

  const next = useCallback(() => {
    const L = live.current
    switch (L.step) {
      case 'attract':
        go('language')
        break
      case 'language':
        setIntroPage(0)
        go('intro')
        break
      case 'intro':
        if (L.introPage < 2) setIntroPage(L.introPage + 1)
        else go('cuts')
        break
      case 'cuts':
        if (L.cuts) go('frame')
        break
      case 'frame':
        go('guide')
        break
      case 'guide':
        go('retouch')
        break
      case 'retouch':
        go('ready')
        break
      case 'ready':
        go('shoot')
        break
      case 'select':
        if (L.selected.length === FLOW.slots) {
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
      case 'intro':
        if (L.introPage > 0) setIntroPage(L.introPage - 1)
        else go('language')
        break
      case 'cuts':
        setIntroPage(2)
        go('intro')
        break
      case 'frame':
        go('cuts')
        break
      case 'guide':
        go('frame')
        break
      case 'retouch':
        go('guide')
        break
      case 'ready':
        go('retouch')
        break
      case 'select':
        retake()
        break
      default:
        break
    }
  }, [go, reset, retake])

  // ---------- 촬영 시퀀스 ----------

  useEffect(() => {
    if (step !== 'shoot') return undefined
    const n = live.current.cuts || 4
    let dead = false
    const timers = []
    const wait = (ms) =>
      new Promise((res) => {
        timers.push(setTimeout(res, ms * live.current.speed))
      })
    setShots([])
    setSelected([])
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
        setShots((cur) => [...cur, shot])
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
      setSelected(n === 4 ? [0, 1, 2, 3] : [])
      go('select')
    })()
    return () => {
      dead = true
      timers.forEach(clearTimeout)
      setFlashing(false)
    }
  }, [step, go])

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
        composeUrl().then((url) => {
          if (dead) return
          setPrintUrl(url)
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
  const canNext = (() => {
    switch (step) {
      case 'cuts':
        return !!cuts
      case 'frame':
        return !!frame
      case 'select':
        return selected.length === FLOW.slots
      case 'print':
        return printDone
      case 'shoot':
      case 'language':
        return false
      default:
        return true
    }
  })()
  const canBack = !['attract', 'shoot', 'print', 'finish'].includes(step)
  const cameraActive = CAMERA_STEPS.includes(step) && ['live', 'sample', 'fallback'].includes(camera.status)

  return {
    step,
    steps: STEPS,
    goTo,
    reset,
    lang,
    setLang,
    cuts,
    hintZone: zoneFor(step, introPage),
    flashing,
    printUrl,
    cameraActive,
    cameraMode,
    setCameraMode,
    // 추가 필드
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
    retouch,
    setRetouch,
    camera,
    shots,
    selected,
    toggleSelect,
    retake,
    shoot,
    stamps,
    toggleStamp,
    message,
    setMessage,
    printProgress,
    printDone,
    speed,
  }
}
