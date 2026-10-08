import { useEffect, useRef, useState } from 'react'

// 요소가 화면에 들어오면 true. 한 번 true가 되면 유지한다(무거운 장면과 지도를 늦게 불러올 때 쓴다).
export function useNearViewport(margin = '300px') {
  const ref = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, near]
}

// 요소 너비 추적(transform 이동 거리를 계산할 때 쓴다)
export function useWidth() {
  const ref = useRef(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    setW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

// 스크롤 구간 진행률 0..1. 요소 상단이 화면 하단에 닿을 때 0, 요소 하단이 화면 하단에 닿을 때 1이다.
export function useSectionProgress(ref, { sticky = false } = {}) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let raf = 0
    const calc = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = sticky ? r.height - vh : r.height + vh
      const done = sticky ? -r.top : vh - r.top
      setP(Math.min(1, Math.max(0, total <= 0 ? 0 : done / total)))
    }
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(calc)
    }
    calc()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [ref, sticky])
  return p
}

export const useMedia = (query) => {
  const [m, setM] = useState(() => (typeof window === 'undefined' ? false : window.matchMedia(query).matches))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return m
}
