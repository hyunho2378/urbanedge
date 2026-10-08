import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { emitScrollFrame, prefersReducedMotion, setLenis, setVelocity } from './scroll.js'

// Lenis 스무스 스크롤. 동작 줄이기가 켜져 있으면 쓰지 않는다. 터치 기기는 기본 관성 스크롤을 그대로 둔다.
export default function SmoothScroll() {
  useEffect(() => {
    let raf = 0
    let lenis = null
    let last = window.scrollY
    const frame = (t) => {
      lenis?.raf(t)
      const y = window.scrollY
      const v = y - last
      last = y
      setVelocity(v)
      emitScrollFrame(y, v)
      raf = requestAnimationFrame(frame)
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const start = () => {
      if (mq.matches) {
        lenis?.destroy()
        lenis = null
        setLenis(null)
        return
      }
      if (!lenis) {
        lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 })
        setLenis(lenis)
      }
    }
    start()
    mq.addEventListener('change', start)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      mq.removeEventListener('change', start)
      lenis?.destroy()
      setLenis(null)
    }
  }, [])
  return null
}
