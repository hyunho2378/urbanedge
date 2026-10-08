import { useEffect } from 'react'
import { useLangValue } from '@urbanedge/ds'

// 페이지 제목을 탭 제목에 반영한다. title은 { en, ko } 또는 문자열이다.
export function usePageTitle(title) {
  const lang = useLangValue()
  const text = title && typeof title === 'object' ? title[lang] ?? title.en : title
  useEffect(() => {
    if (!text) return undefined
    const prev = document.title
    document.title = `${text} | Gyeongju Metro, UrbanEdge`
    return () => {
      document.title = prev
    }
  }, [text])
}
