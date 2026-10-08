import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// 경로가 바뀌면 맨 위로 이동하고 본문에 포커스를 옮긴다(스크린리더와 키보드 사용자용).
// 뒤로 가기(POP)는 브라우저 복원에 맡기고, 해시 이동은 해당 요소로 보낸다.
export default function ScrollToTop({ mainId = 'main' }) {
  const { pathname, hash } = useLocation()
  const type = useNavigationType()
  const prev = useRef(pathname)

  useEffect(() => {
    if (prev.current === pathname) return
    prev.current = pathname
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    if (type !== 'POP') window.scrollTo(0, 0)
    document.getElementById(mainId)?.focus({ preventScroll: true })
  }, [pathname, hash, type, mainId])

  return null
}
