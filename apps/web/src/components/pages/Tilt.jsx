import { useRef } from 'react'
import { cx } from '@urbanedge/ds'
import { useReducedMotion } from './hooks.js'

// 포인터를 따라 기울어지는 인화 카드. 터치에서는 누르고 끄는 동안 기운다. 동작 줄이기에서는 정지.
export function Tilt({ children, className, max = 10, as: Tag = 'div', ...rest }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const move = (e) => {
    const el = ref.current
    if (!el || reduce) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translate3d(0,0,0)`
  }
  const leave = () => {
    if (ref.current) ref.current.style.transform = ''
  }
  return (
    <Tag
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerCancel={leave}
      className={cx('transition-transform duration-base ease-out will-change-transform', className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
