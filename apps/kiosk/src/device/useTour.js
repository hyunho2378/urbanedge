// useTour.js: 코치마크 투어의 열림과 단계를 URL(?tour=)로만 관리한다. 저장소를 쓰지 않는다.
//   ?tour=0  투어 끔
//   ?tour=N  N번째 단계(1부터)에서 열림
//   값 없음  autoOpen이 true이면 1단계에서 열림
import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useTour({ total, autoOpen }) {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tour')
  const n = raw == null ? null : Number.parseInt(raw, 10)
  const open = n == null || Number.isNaN(n) ? Boolean(autoOpen) : n > 0
  const index = n && n > 0 ? Math.min(n, total) - 1 : 0

  const write = useCallback(
    (value) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tour', String(value))
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return {
    open,
    index,
    go: (i) => write(Math.max(0, Math.min(total - 1, i)) + 1),
    start: () => write(1),
    close: () => write(0),
  }
}
