import { forwardRef } from 'react'
import { cx } from '@urbanedge/ds'

// 키오스크 버튼: 높이 120 이상의 알약. 화면당 주 행동은 tone="primary" 하나다.
//   primary 노랑 면, ink 검정 면(노랑 바탕 위), soft 어두운 면, ghost 글자만
const TONES = {
  primary: 'bg-yellow text-text-onYellow',
  ink: 'bg-bg-base text-text-pri',
  soft: 'bg-bg-raised text-text-pri',
  ghost: 'bg-transparent text-text-pri',
  ghostInk: 'bg-transparent text-text-onYellow',
}

export const KButton = forwardRef(function KButton({ tone = 'primary', icon: Icon, iconRight: IconRight, className, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        'ue-press kt-btn inline-flex min-h-touch min-w-touch select-none items-center justify-center gap-16 rounded-pill px-48 transition-[transform,opacity,background-color] duration-fast ease-out disabled:pointer-events-none disabled:opacity-40',
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={40} strokeWidth={2.4} aria-hidden="true" />}
      <span className="inline-grid">{children}</span>
      {IconRight && <IconRight size={40} strokeWidth={2.4} aria-hidden="true" />}
    </button>
  )
})
