import { useEffect, useRef, useState } from 'react'

// 미디어 쿼리 구독. 서버 렌더가 없으므로 첫 렌더에서 바로 읽는다.
export function useMedia(query) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false)
  const [on, setOn] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const h = () => setOn(mq.matches)
    h()
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [query])
  return on
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')

// 화면에 들어오면 true(한 번 true가 되면 유지). 지도와 iframe처럼 무거운 것을 늦게 올릴 때 쓴다.
export function useNearView(rootMargin = '320px 0px') {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, seen])
  return [ref, seen]
}

// 요소가 화면 안에 있는 동안 true
export function useInView(options) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), options)
    io.observe(el)
    return () => io.disconnect()
  }, [options])
  return [ref, inView]
}

// 여러 구간(섹션)을 지나는 스크롤 위치를 소수 인덱스로 돌려준다. 값이 3.4이면 네 번째 구간을 40% 지난 위치다.
// TrainTrack의 current에 그대로 넣으면 열차가 구간 사이를 따라 움직인다.
export function useScrollStops(refs, anchor = 0.42) {
  const [cur, setCur] = useState(0)
  useEffect(() => {
    let raf = 0
    const calc = () => {
      const y = window.innerHeight * anchor
      const tops = refs.map((r) => (r.current ? r.current.getBoundingClientRect().top : Infinity))
      let i = 0
      for (let k = 0; k < tops.length; k++) if (tops[k] <= y) i = k
      const nextTop = tops[i + 1]
      const t = nextTop != null && Number.isFinite(nextTop) ? Math.min(1, Math.max(0, (y - tops[i]) / (nextTop - tops[i]))) : 0
      const v = Math.round((i + t) * 100) / 100
      setCur((p) => (Math.abs(p - v) > 0.004 ? v : p))
    }
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(calc)
    }
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    calc()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor])
  return cur
}
