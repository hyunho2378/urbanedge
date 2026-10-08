import { forwardRef } from 'react'
import { cx } from './cx.js'

// variant: primary(노랑 채움) | outline(노랑 1px 테두리, 전시회 사이트 버튼) | ghost | dark
// size: md | lg | kiosk(터치 120px)
const base =
  'ue-press inline-flex items-center justify-center gap-8 font-ui font-semibold whitespace-nowrap select-none ' +
  'transition-[transform,opacity,background-color,color] duration-fast ease-out ' +
  'disabled:opacity-40 disabled:pointer-events-none aria-disabled:opacity-40 aria-disabled:pointer-events-none'

const variants = {
  primary: 'bg-yellow text-text-onYellow hover:bg-yellow-hover active:bg-yellow-pressed',
  outline: 'border border-yellow text-yellow hover:bg-tint',
  ghost: 'text-text-pri hover:bg-tint',
  dark: 'bg-bg-raised text-text-pri border border-hairline hover:border-hairlineStrong',
}

const sizes = {
  md: 'min-h-48 px-24 text-body-sm rounded-md',
  lg: 'min-h-56 px-32 text-body rounded-md',
  kiosk: 'min-h-touch min-w-touch px-56 text-k-btn rounded-lg gap-16',
}

export const Button = forwardRef(function Button(
  { as: Tag = 'button', variant = 'primary', size = 'md', className, children, ...rest },
  ref,
) {
  const extra = Tag === 'button' && !rest.type ? { type: 'button' } : {}
  return (
    <Tag ref={ref} className={cx(base, variants[variant], sizes[size], className)} {...extra} {...rest}>
      {children}
    </Tag>
  )
})
