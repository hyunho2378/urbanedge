import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import '../components/kiosk.css'
import { LangContext, T } from '../components/lang.jsx'
import { StageContext } from '../components/stage.js'
import { TopRail } from '../components/TopRail.jsx'
import { LensCue } from '../components/LensCue.jsx'
import { KButton } from '../components/KButton.jsx'
import { IdleDialog } from '../components/IdleDialog.jsx'
import { COPY } from './copy.js'
import { FLOW, IDLE_OFF_STEPS } from './config.js'
import Attract from './screens/Attract.jsx'
import Language from './screens/Language.jsx'
import Intro from './screens/Intro.jsx'
import Cuts from './screens/Cuts.jsx'
import Frame from './screens/Frame.jsx'
import Pay from './screens/Pay.jsx'
import Guide from './screens/Guide.jsx'
import Shoot from './screens/Shoot.jsx'
import Select from './screens/Select.jsx'
import Print from './screens/Print.jsx'
import Finish from './screens/Finish.jsx'

// KioskScreen.jsx v3: 1920x1080 캔버스 안에 들어가는 화면 전체(docs/KIOSK_V3.md).
// 부모(Stage)가 이 컴포넌트를 1920x1080 박스에 넣고 scale로 맞춘다.
// 구성: 위 길찾기 표지(TopRail), 단계 화면(초점 하나), 왼쪽 아래 뒤로(글자 버튼), 오른쪽 아래 주 행동(노란 알약 하나),
// 카메라 단계에서만 화면 아래 가운데의 렌즈 신호, 셔터 플래시, 무입력 대화상자. 하단 바와 화면을 덮는 코치마크는 없다.
const SCREENS = { attract: Attract, language: Language, intro: Intro, cuts: Cuts, frame: Frame, pay: Pay, guide: Guide, shoot: Shoot, select: Select, print: Print, finish: Finish }
const NO_RAIL = ['attract', 'shoot']

// 단계별 모서리 버튼(문구는 노드로 두고 <T />로 그린다)
function barConfig(ctrl) {
  const { step, canNext, canBack, pay } = ctrl
  const back = { node: COPY.common.back, onClick: ctrl.back, hidden: !canBack }
  const next = { node: COPY.common.next, onClick: ctrl.next, disabled: !canNext }
  switch (step) {
    case 'attract':
    case 'shoot':
    case 'language':
      back.hidden = step !== 'language'
      next.hidden = true
      break
    case 'frame':
      next.node = COPY.frame.use
      break
    case 'pay': {
      const waiting = pay.status === 'waiting'
      back.node = pay.method ? COPY.pay.change : COPY.common.back
      back.hidden = pay.status === 'processing' || pay.status === 'success' || !!pay.reader
      next.disabled = false
      if (pay.status === 'success') next.node = COPY.pay.continue
      else if (waiting && !pay.reader && (pay.method === 'card' || pay.method === 'samsung')) Object.assign(next, { node: pay.method === 'card' ? COPY.pay.simInsert : COPY.pay.simPhone, onClick: () => ctrl.payTap(true) })
      else if (waiting && pay.method === 'cash') Object.assign(next, { node: COPY.pay.simBill, onClick: ctrl.payCash })
      else if (waiting && pay.method === 'coupon' && pay.view === 'scan') Object.assign(next, { node: COPY.pay.simScan, onClick: () => ctrl.applyCoupon(ctrl.demoCoupon) })
      else next.hidden = true
      break
    }
    case 'guide':
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
      next.hidden = !ctrl.printDone
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
  const rootRef = useRef(null)
  const Screen = SCREENS[step]
  const bar = barConfig(ctrl)

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
    if (e.target.closest('[role="radiogroup"], [role="group"], [role="slider"], [role="listbox"], input, textarea')) return
    if (e.key === 'ArrowRight' && bar.next && !bar.next.hidden && !bar.next.disabled) {
      e.stopPropagation()
      bar.next.onClick()
    } else if (e.key === 'ArrowLeft' && bar.back && !bar.back.hidden) {
      e.stopPropagation()
      bar.back.onClick()
    }
  }

  const shooting = step === 'shoot'
  const flashOn = shooting && ['shutter', 'rest', 'done'].includes(ctrl.shoot.phase)
  const lensCue = step === 'guide' || step === 'shoot' || (step === 'pay' && ctrl.pay.method === 'coupon' && ctrl.pay.view === 'scan' && ctrl.pay.status === 'waiting')

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

          {!NO_RAIL.includes(step) && <TopRail ctrl={ctrl} showLang={step !== 'language'} />}
          {lensCue && <LensCue node={shooting ? COPY.common.lookLens : COPY.common.lensCue} />}

          {bar.back && !bar.back.hidden && (
            <div className="absolute z-header" style={{ left: 120, bottom: 56 }}>
              <KButton tone="ghost" className="!px-0" icon={ArrowLeft} onClick={bar.back.onClick}>
                <T n={bar.back.node} inline />
              </KButton>
            </div>
          )}
          {bar.next && !bar.next.hidden && (
            <div className="absolute z-header" style={{ right: 120, bottom: 56 }}>
              <KButton tone="primary" iconRight={ArrowRight} onClick={bar.next.onClick} disabled={bar.next.disabled}>
                <T n={bar.next.node} inline />
              </KButton>
            </div>
          )}

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
