// scroll.js: 스무스 스크롤(Lenis) 인스턴스와 스크롤 보조 함수. 동작 줄이기에서는 인스턴스를 만들지 않고 기본 스크롤을 쓴다.
let lenis = null
const listeners = new Set()
let velocity = 0

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const setLenis = (l) => {
  lenis = l
}
export const getLenis = () => lenis

// 현재 스크롤 속도(px/frame 근사). 경고 테이프 띠가 스크롤에 반응할 때 쓴다.
export const getVelocity = () => velocity
export const setVelocity = (v) => {
  velocity = v
}

// 모달과 메뉴가 열릴 때 스크롤을 멈춘다.
export const lockScroll = () => lenis?.stop()
export const unlockScroll = () => lenis?.start()

export function scrollToId(id, { offset = 0 } = {}) {
  const el = typeof id === 'string' ? document.getElementById(id) : id
  if (!el) return
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ue-header-h')) || 64
  if (lenis && !prefersReducedMotion()) lenis.scrollTo(el, { offset: -(header + offset), duration: 1.2 })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - offset, behavior: 'auto' })
}

export const onScrollFrame = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const emitScrollFrame = (y, v) => listeners.forEach((fn) => fn(y, v))
