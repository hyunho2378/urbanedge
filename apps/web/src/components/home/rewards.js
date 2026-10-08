import { useSyncExternalStore } from 'react'

// 메모리에만 두는 보상 상태. 공유 시트를 열었다 닫으면 스크래치 쿠폰이 열린다(정직 시스템). 저장소를 쓰지 않으므로 새로고침하면 초기화된다.
let shared = false
let revealed = false
const subs = new Set()
const emit = () => subs.forEach((f) => f())
const subscribe = (f) => {
  subs.add(f)
  return () => subs.delete(f)
}
export const markShared = () => {
  if (shared) return
  shared = true
  emit()
}
export const markRevealed = () => {
  if (revealed) return
  revealed = true
  emit()
}
export const useShared = () => useSyncExternalStore(subscribe, () => shared, () => false)
export const useRevealed = () => useSyncExternalStore(subscribe, () => revealed, () => false)
