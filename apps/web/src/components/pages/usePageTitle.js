import { useEffect } from 'react'

// 페이지 제목을 탭 제목에 반영한다. 언어가 바뀌면 다시 설정한다.
export function usePageTitle(title) {
  useEffect(() => {
    if (!title) return undefined
    const prev = document.title
    document.title = `${title} | UrbanEdge Metrography`
    return () => {
      document.title = prev
    }
  }, [title])
}
