import { useEffect, useRef, useState } from 'react'
import { cx } from './cx.js'

// 스크롤 진입 시 opacity와 translateY로 등장. JS 실패나 동작 줄이기에서는 항상 보인다.
export function Reveal({ as: Tag = 'div', delay = 0, className, children, ...rest }) {
  const ref = useRef(null)
  const [state, setState] = useState('visible') // visible | hidden | shown

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92) return undefined
    setState('hidden')
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState('shown')
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cx(
        'transition-[transform,opacity] duration-slow ease-out',
        state === 'hidden' && 'translate-y-24 opacity-0',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
