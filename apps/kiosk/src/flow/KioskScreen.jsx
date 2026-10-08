import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Volume2 } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import '../components/kiosk.css'
import { LangContext } from '../components/lang.jsx'
import { StageContext } from '../components/stage.js'
import { Island } from '../components/Island.jsx'
import { PlatformEdge } from '../components/PlatformEdge.jsx'
import { KButton } from '../components/KButton.jsx'
import { IdleDialog } from '../components/IdleDialog.jsx'
import { CoachMark } from '../components/CoachMark.jsx'
import { COPY, tr } from './copy.js'
import { T } from '../components/lang.jsx'
import { FLOW, IDLE_OFF_STEPS } from './config.js'
import { roomById } from './rooms.js'
import Attract from './screens/Attract.jsx'
import Language from './screens/Language.jsx'
import Intro from './screens/Intro.jsx'
import Cuts from './screens/Cuts.jsx'
import Frame from './screens/Frame.jsx'
import Pay from './screens/Pay.jsx'
import Guide from './screens/Guide.jsx'
import Retouch from './screens/Retouch.jsx'
import Ready from './screens/Ready.jsx'
import Shoot from './screens/Shoot.jsx'
import Select from './screens/Select.jsx'
import Print from './screens/Print.jsx'
import Finish from './screens/Finish.jsx'

// KioskScreen.jsx: 1920x1080 캔버스 안에 들어가는 화면 전체.
// 부모(Stage)가 이 컴포넌트를 1920x1080 크기 박스에 넣고 scale로 맞춘다. 이 컴포넌트는 w-full h-full로 채운다.
// 구성: 단계별 전면 화면(전환 애니메이션), 위에 늘 떠 있는 라이브 액티비티(황리단선), 아래 가장자리의 승강장 신호(카메라 위치),
// 모서리의 뒤로와 다음 버튼, 화면 안 코치마크, 셔터 플래시, 무입력 대화상자.
const SCREENS = { attract: Attract, language: Language, intro: Intro, cuts: Cuts, frame: Frame, pay: Pay, guide: Guide, retouch: Retouch, ready: Ready, shoot: Shoot, select: Select, print: Print, finish: Finish }
const COACH_STEPS = ['cuts', 'frame', 'pay', 'retouch', 'ready', 'select', 'print']

// 단계별 하단 버튼 구성(문구는 노드로 두고 화면에서 <T />로 그린다)
function barConfig(ctrl) {
  const { step, canNext, canBack, pay } = ctrl
  const back = { node: COPY.common.back, onClick: ctrl.back, hidden: !canBack }
  const next = { node: COPY.common.next, onClick: ctrl.next, disabled: !canNext }
  switch (step) {
    case 'attract':
    case 'shoot':
      back.hidden = true
      next.hidden = true
      break
    case 'language':
      next.hidden = true
      break
    case 'frame':
      next.node = COPY.frame.use
      break
    case 'pay':
      next.node = COPY.pay.continue
      next.hidden = pay.status !== 'success'
      back.hidden = pay.status === 'processing' || pay.status === 'success'
      break
    case 'ready':
      next.node = COPY.ready.start
      break
    case 'select':
      back.node = COPY.select.retake
      back.hidden = false
      next.node = COPY.select.print
      break
    case 'print':
      back.hidden = true
      next.node = COPY.print.toFinish
      break
    case 'finish':
      back.hidden = true
      next.node = COPY.finish.toStart
      break
    default:
      break
  }
  return { back, next }
}

export default function KioskScreen({ ctrl, idleMs = FLOW.idleMs, idleGraceMs = FLOW.idleGraceMs }) {
  const { step, lang } = ctrl
  const t = useCallback((node, vars) => tr(node, lang, vars), [lang])
  const rootRef = useRef(null)
  const Screen = SCREENS[step]
  const bar = barConfig(ctrl)
  const room = roomById(ctrl.room)

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

  // ----- 코치마크: 단계마다 처음 한 번, 화면이 자리를 잡은 뒤에 -----
  const [coachReady, setCoachReady] = useState(false)
  useEffect(() => {
    setCoachReady(false)
    const id = setTimeout(() => setCoachReady(true), 900)
    return () => clearTimeout(id)
  }, [step])
  const coachOn = coachReady && COACH_STEPS.includes(step) && !ctrl.coachOff && !ctrl.coach.seen[step] && warnLeft == null && !(step === 'pay' && ctrl.pay.method)
  const doneCoach = useCallback(() => ctrl.markCoach(step), [ctrl, step])

  const onKeyDown = (e) => {
    bump()
    if (e.target.closest('[role="radiogroup"], [role="group"], [role="slider"], [role="listbox"], input, textarea')) return
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
  const edge = step === 'attract' || step === 'guide' || step === 'ready' || step === 'shoot' || (step === 'intro' && ctrl.introPage === 1) || (step === 'pay' && ctrl.pay.method === 'coupon' && ctrl.pay.view === 'scan')
  const edgeTone = step === 'intro' && ctrl.introPage === 1 ? 'ink' : 'yellow'
  const onYellow = step === 'language' || step === 'finish' || (step === 'intro' && (ctrl.introPage === 1 || ctrl.introPage === 4))
  const announceVars = { n: room.n, platform: room.title }
  const announceNode = COPY.island.announce[step]

  return (
    <LangContext.Provider value={lang}>
      <StageContext.Provider value={rootRef}>
        <div
          ref={rootRef}
          lang="en"
          tabIndex={-1}
          onPointerDownCapture={bump}
          onKeyDownCapture={onKeyDown}
          className="relative h-full w-full select-none overflow-hidden break-keep bg-bg-base font-sans text-text-pri outline-none"
        >
          <main key={step} className={cx('absolute inset-0', ctrl.dir === 'back' ? 'k-enter-back' : 'k-enter')}>
            <Screen ctrl={ctrl} />
          </main>

          <Island step={step} steps={ctrl.steps} lang={lang} announce={tr(announceNode, lang, announceVars)} />
          <p className={cx('kt-caption absolute z-header flex items-center gap-12', onYellow ? 'text-text-onYellow' : 'text-text-meta')} style={{ left: 64, top: 52 }} aria-live="polite">
            <Volume2 size={32} aria-hidden="true" />
            <T n={announceNode} v={announceVars} inline />
          </p>

          {edge && <PlatformEdge tone={edgeTone} coachId={step === 'ready' ? 'ready' : undefined} />}

          {bar.back && !bar.back.hidden && (
            <div className="absolute z-header" style={{ left: 40, bottom: edge ? 72 : 48 }}>
              <KButton tone={onYellow ? 'ghostInk' : 'ghost'} icon={ArrowLeft} onClick={bar.back.onClick}>
                <T n={bar.back.node} inline />
              </KButton>
            </div>
          )}
          {bar.next && !bar.next.hidden && (
            <div className="absolute z-header" style={{ right: 64, bottom: edge ? 72 : 48 }}>
              <KButton tone={onYellow ? 'ink' : 'primary'} iconRight={ArrowRight} onClick={bar.next.onClick} disabled={bar.next.disabled}>
                <T n={bar.next.node} inline />
              </KButton>
            </div>
          )}

          {coachOn && <CoachMark key={step} id={step} node={COPY.coach[step]} rootRef={rootRef} onDone={doneCoach} onSkip={ctrl.skipCoach} />}
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
      </StageContext.Provider>
    </LangContext.Provider>
  )
}
