// env.js: 장면 공통 환경 훅. WebGL 지원, 동작 줄이기, 화면 안 여부, 터치 기기.
import { useEffect, useState } from 'react'

let glCache
// WebGL 사용 가능 여부. 소프트웨어 렌더러(major performance caveat)만 있는 기기는 쓰지 않는다.
// 테스트용으로 window.__UE_SCENES_FORCE_FALLBACK__ = true 이면 항상 false(포스터 경로를 강제한다).
export function hasWebGL() {
  if (typeof document === 'undefined') return false
  if (typeof window !== 'undefined' && window.__UE_SCENES_FORCE_FALLBACK__) return false
  if (glCache !== undefined) return glCache
  try {
    const c = document.createElement('canvas')
    const strict = !(typeof window !== 'undefined' && window.__UE_SCENES_ALLOW_SOFTWARE__)
    const gl = c.getContext('webgl2', { failIfMajorPerformanceCaveat: strict }) || c.getContext('webgl', { failIfMajorPerformanceCaveat: strict })
    glCache = !!gl
    gl?.getExtension?.('WEBGL_lose_context')?.loseContext?.()
  } catch {
    glCache = false
  }
  return glCache
}

// 기기 등급. 'low'는 단순 재질, DPR 1, 30fps로 그린다.
export function deviceTier() {
  if (typeof navigator === 'undefined') return 'high'
  const mem = navigator.deviceMemory
  const cores = navigator.hardwareConcurrency
  const coarse = isCoarse()
  if (mem && mem <= 2) return 'low'
  if (coarse && ((cores && cores <= 4) || (mem && mem <= 4))) return 'low'
  if (cores && cores <= 2) return 'low'
  return coarse ? 'mid' : 'high'
}

export const softwareOk = () => typeof window !== 'undefined' && !!window.__UE_SCENES_ALLOW_SOFTWARE__
export const isCoarse = () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return undefined
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduced
}

// IntersectionObserver. near는 미리 불러올 범위(rootMargin), visible은 실제로 보이는 여부.
export function useInView(ref, rootMargin = '320px') {
  const [state, setState] = useState({ near: false, visible: false })
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setState({ near: true, visible: true })
      return undefined
    }
    const a = new IntersectionObserver(([e]) => setState((s) => ({ ...s, near: s.near || e.isIntersecting })), { rootMargin })
    const b = new IntersectionObserver(([e]) => setState((s) => ({ ...s, visible: e.isIntersecting })), { threshold: 0.01 })
    a.observe(el)
    b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
  }, [ref, rootMargin])
  return state
}

export function usePageVisible() {
  const [v, setV] = useState(() => typeof document === 'undefined' || !document.hidden)
  useEffect(() => {
    const on = () => setV(!document.hidden)
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return v
}

export function useFontsReady() {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    let live = true
    const f = document.fonts
    if (!f) { setOk(true); return undefined }
    Promise.all([f.load('700 40px "Barlow Condensed"'), f.load('700 40px "Pretendard Variable"')]).catch(() => {}).then(() => f.ready).then(() => live && setOk(true))
    return () => { live = false }
  }, [])
  return ok
}

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
export const smooth = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t) }
export const lerp = (a, b, t) => a + (b - a) * t
export const damp = (cur, target, k, dt) => cur + (target - cur) * (1 - Math.exp(-k * dt))
