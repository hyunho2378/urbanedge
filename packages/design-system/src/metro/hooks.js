import { useEffect, useLayoutEffect, useState } from 'react'

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect

// 요소 크기를 ResizeObserver로 추적한다. 첫 페인트 전에 측정한다.
export function useElementSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useIso(() => {
    const el = ref.current
    if (!el) return undefined
    const set = (w, h) => setSize((p) => (Math.abs(p.w - w) < 0.5 && Math.abs(p.h - h) < 0.5 ? p : { w, h }))
    // 패딩을 포함한 레이아웃 크기. transform에 영향을 받지 않는 offset 값을 쓴다.
    set(el.offsetWidth, el.offsetHeight)
    if (typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => set(el.offsetWidth, el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false))
  useEffect(() => {
    if (!window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

// 웹폰트가 로드된 뒤 글자 폭 측정을 다시 하기 위한 카운터
export function useFontsTick() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => alive && setTick((t) => t + 1))
    return () => { alive = false }
  }, [])
  return tick
}
