import { useSyncExternalStore } from 'react'

// 메모리에만 두는 공유 표시. 스크래치 쿠폰은 더 이상 이 값을 쓰지 않는다(쿠폰은 실제 공유가 끝나야 열리며 상태는 ScratchCoupon 안에 있다).
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
