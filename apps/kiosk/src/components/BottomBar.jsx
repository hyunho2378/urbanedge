import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TouchButton } from './TouchButton.jsx'
import { StepRail } from './StepRail.jsx'
import { LensHint } from './LensHint.jsx'

// 하단 공통 바: 뒤로, 노선형 단계 레일, 다음. 주 행동은 항상 우하단에 둔다(PATTERNS 7).
// lens가 true이면 레일을 작게 줄이고 그 아래에 렌즈 방향 안내를 둔다.
export function BottomBar({ steps, step, room, lang, lens, back, next }) {
  return (
    <footer className="relative z-header flex h-160 shrink-0 items-center border-t border-hairline bg-bg-base px-64">
      <div className="grid w-full grid-cols-12 items-center gap-24">
        <div className="col-span-3">
          {back && !back.hidden && (
            <TouchButton variant="dark" icon={back.icon === undefined ? ChevronLeft : back.icon} onClick={back.onClick} disabled={back.disabled}>
              {back.label}
            </TouchButton>
          )}
        </div>
        <div className="col-span-6 min-w-0">
          {lens ? (
            <div className="flex flex-col items-stretch gap-4">
              <StepRail steps={steps} step={step} room={room} lang={lang} compact />
              <LensHint />
            </div>
          ) : (
            <StepRail steps={steps} step={step} room={room} lang={lang} />
          )}
        </div>
        <div className="col-span-3 flex justify-end">
          {next && !next.hidden && (
            <TouchButton
              variant="primary"
              iconRight={next.icon === undefined ? ChevronRight : next.icon}
              onClick={next.onClick}
              disabled={next.disabled}
              className={next.className}
            >
              {next.label}
            </TouchButton>
          )}
        </div>
      </div>
    </footer>
  )
}
