import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import '../components/kiosk.css'
import { LangContext } from '../components/lang.jsx'
import { TopBar } from '../components/TopBar.jsx'
import { BottomBar } from '../components/BottomBar.jsx'
import { IdleDialog } from '../components/IdleDialog.jsx'
import { COPY, tr } from './copy.js'
import { FLOW, IDLE_OFF_STEPS } from './config.js'
import Attract from './screens/Attract.jsx'
import Language from './screens/Language.jsx'
import Intro from './screens/Intro.jsx'
import Cuts from './screens/Cuts.jsx'
import Frame from './screens/Frame.jsx'
import Guide from './screens/Guide.jsx'
import Retouch from './screens/Retouch.jsx'
import Ready from './screens/Ready.jsx'
import Shoot from './screens/Shoot.jsx'
import Select from './screens/Select.jsx'
import Print from './screens/Print.jsx'
import Finish from './screens/Finish.jsx'

// KioskScreen.jsx: 1920x1080 캔버스 안에 들어가는 화면 전체.
// 부모(Stage)가 이 컴포넌트를 1920x1080 크기 박스에 넣고 scale로 맞춘다. 이 컴포넌트는 w-full h-full로 채운다.
// 구성: 상단 브랜드 바, 단계별 화면(전환 애니메이션), 하단 공통 바(뒤로, 노선형 레일, 다음), 셔터 플래시, 무입력 대화상자.
const SCREENS = { attract: Attract, language: Language, intro: Intro, cuts: Cuts, frame: Frame, guide: Guide, retouch: Retouch, ready: Ready, shoot: Shoot, select: Select, print: Print, finish: Finish }

// 단계별 하단 바 구성
function barConfig(ctrl, t) {
  const { step, introPage, canNext, canBack } = ctrl
  const back = { label: t(COPY.common.back), onClick: ctrl.back, disabled: !canBack, hidden: !canBack }
  const next = { label: t(COPY.common.next), onClick: ctrl.next, disabled: !canNext }
  let lens = false
  switch (step) {
    case 'language':
      next.hidden = true
      break
    case 'intro':
      lens = introPage === 1
      break
    case 'frame':
      break
    case 'guide':
      lens = true
      break
    case 'retouch':
      break
    case 'ready':
      lens = true
      next.label = t(COPY.ready.start)
      next.icon = null
      break
    case 'shoot':
      lens = true
      back.hidden = true
      next.hidden = true
      break
    case 'select':
      back.label = t(COPY.select.retake)
      back.icon = RotateCcw
      back.hidden = false
      back.disabled = false
      next.label = t(COPY.select.print)
      next.icon = null
      break
    case 'print':
      next.label = t(COPY.print.toFinish)
      break
    case 'finish':
      back.hidden = true
      next.label = t(COPY.finish.toStart)
      next.icon = RotateCcw
      break
    default:
      break
  }
  return { back, next, lens }
}

export default function KioskScreen({ ctrl, idleMs = FLOW.idleMs, idleGraceMs = FLOW.idleGraceMs }) {
  const { step, lang } = ctrl
  const t = useCallback((node, vars) => tr(node, lang, vars), [lang])
  const rootRef = useRef(null)
  const Screen = SCREENS[step]
  const bar = barConfig(ctrl, t)

  // ----- 무입력 감지: idleMs 뒤 대화상자, idleGraceMs 뒤 대기 화면 -----
  const lastRef = useRef(Date.now())
  const [warnLeft, setWarnLeft] = useState(null)
  const bump = useCallback(() => {
    lastRef.current = Date.now()
  }, [])
  const live = useRef(ctrl)
  live.current = ctrl
  useEffect(() => {
    const tick = () => {
      const c = live.current
      if (IDLE_OFF_STEPS.includes(c.step)) {
        lastRef.current = Date.now()
        setWarnLeft(null)
        return
      }
      const idle = Date.now() - lastRef.current
      if (idle >= idleMs + idleGraceMs) {
        setWarnLeft(null)
        lastRef.current = Date.now()
        c.reset()
      } else if (idle >= idleMs) {
        setWarnLeft(Math.max(1, Math.ceil((idleMs + idleGraceMs - idle) / 1000)))
      } else {
        setWarnLeft(null)
      }
    }
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [idleMs, idleGraceMs])
  useEffect(() => {
    bump()
  }, [step, bump])

  const onKeyDown = (e) => {
    bump()
    if (e.target.closest('[role="radiogroup"], [role="group"], input, textarea')) return
    if (e.key === 'ArrowRight' && bar.next && !bar.next.hidden && !bar.next.disabled) {
      e.stopPropagation()
      bar.next.onClick()
    } else if (e.key === 'ArrowLeft' && bar.back && !bar.back.hidden && !bar.back.disabled) {
      e.stopPropagation()
      bar.back.onClick()
    }
  }

  const shooting = step === 'shoot'
  const flashOn = shooting && ['shutter', 'rest', 'done'].includes(ctrl.shoot.phase)
  const full = step === 'attract'

  return (
    <LangContext.Provider value={lang}>
      <div
        ref={rootRef}
        lang={lang}
        tabIndex={-1}
        onPointerDownCapture={bump}
        onKeyDownCapture={onKeyDown}
        className="relative flex h-full w-full select-none flex-col overflow-hidden break-keep bg-bg-base font-sans text-text-pri outline-none"
      >
        {!full && <TopBar steps={ctrl.steps} step={step} room={ctrl.room} lang={lang} />}
        <main key={step} className={`relative min-h-0 flex-1 ${ctrl.dir === 'back' ? 'k-enter-back' : 'k-enter'}`}>
          <Screen ctrl={ctrl} />
        </main>
        {!full && <BottomBar steps={ctrl.steps} step={step} room={ctrl.room} lang={lang} lens={bar.lens} back={bar.back} next={bar.next} />}
        {flashOn && <div key={`flash-${ctrl.shoot.index}`} className="pointer-events-none absolute inset-0 z-overlay animate-flash bg-white" aria-hidden="true" />}
        {warnLeft != null && (
          <IdleDialog
            secondsLeft={warnLeft}
            onKeep={bump}
            onHome={() => {
              setWarnLeft(null)
              ctrl.reset()
            }}
          />
        )}
      </div>
    </LangContext.Provider>
  )
}
