// useMedia.js: CSS 미디어 쿼리 일치 여부를 구독한다(저장소 없음).
import { useEffect, useState } from 'react'

export function useMedia(query, initial = false) {
  const [on, setOn] = useState(() => (typeof window === 'undefined' ? initial : window.matchMedia(query).matches))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const h = () => setOn(mq.matches)
    h()
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [query])
  return on
}
