import { forwardRef } from 'react'
import { Button, cx } from '@urbanedge/ds'

// 키오스크 터치 버튼: 디자인시스템 Button의 kiosk 크기(최소 120px)를 그대로 쓴다.
// variant: primary(화면당 하나의 주 행동) | outline | dark | ghost
export const TouchButton = forwardRef(function TouchButton(
  { variant = 'outline', icon: Icon, iconRight: IconRight, className, children, ...rest },
  ref,
) {
  return (
    <Button ref={ref} size="kiosk" variant={variant} className={cx('ue-press', className)} {...rest}>
      {Icon && <Icon size={44} strokeWidth={2.5} aria-hidden="true" />}
      <span>{children}</span>
      {IconRight && <IconRight size={44} strokeWidth={2.5} aria-hidden="true" />}
    </Button>
  )
})
