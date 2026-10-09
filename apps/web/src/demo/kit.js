// demo/kit.js: 자동 시연 도구. 가짜 커서, 강조 링, 부드러운 스크롤, 일시정지와 건너뛰기를 다룬다.
// 모든 대기 함수는 장면 번호(gen)가 바뀌면 SKIP을 던져 현재 장면을 즉시 끝낸다.
import { getLenis } from '../layout/scroll.js'
export const SKIP = Symbol('skip')
// Lenis가 켜져 있으면 같은 인스턴스로 즉시 이동해 내부 위치가 어긋나지 않게 한다
const jump = (y) => {
  const l = getLenis()
  if (l) l.scrollTo(y, { immediate: true, force: true })
  else window.scrollTo({ top: y, behavior: 'instant' })
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const real = (ms) => new Promise((r) => setTimeout(r, ms))

export function makeKit(S, gen) {
  const check = () => {
    if (S.gen !== gen || S.stop) throw SKIP
  }
  // 배속과 일시정지를 반영한 대기. 50ms 간격으로 장면 번호를 확인한다.
  const sleep = async (ms) => {
    let left = ms / S.speed
    while (left > 0) {
      check()
      const step = Math.min(50, left)
      await real(step)
      if (!S.paused) left -= step
    }
    check()
  }
  const waitFor = async (fn, timeout = 8000) => {
    const end = performance.now() + timeout
    while (performance.now() < end) {
      check()
      let v = null
      try { v = fn() } catch { v = null }
      if (v) return v
      await real(100)
    }
    return null
  }
  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
  const visible = (el) => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }
  const byText = (sel, texts, root = document) => {
    const list = Array.isArray(texts) ? texts : [texts]
    return $$(sel, root).find((e) => visible(e) && list.some((t) => e.textContent.trim().includes(t)))
  }
  const byExact = (sel, texts, root = document) => {
    const list = Array.isArray(texts) ? texts : [texts]
    return $$(sel, root).find((e) => visible(e) && list.includes(e.textContent.trim()))
  }

  const scrollToY = async (y, dur = 1100) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const to = Math.max(0, Math.min(max, y))
    const from = window.scrollY
    if (Math.abs(to - from) < 4) return
    const total = Math.max(500, Math.min(2400, dur + Math.abs(to - from) * 0.25)) / S.speed
    let el = 0
    let last = performance.now()
    while (el < total) {
      check()
      await real(16)
      const now = performance.now()
      if (!S.paused) el += now - last
      last = now
      jump(from + (to - from) * ease(Math.min(1, el / total)))
    }
    jump(to)
  }
  const scrollToEl = async (el, { at = 0.4, dur } = {}) => {
    if (!el) return
    const r = el.getBoundingClientRect()
    await scrollToY(window.scrollY + r.top - window.innerHeight * at, dur)
  }
  const ensureVisible = async (el) => {
    const r = el.getBoundingClientRect()
    if (r.top < 90 || r.bottom > window.innerHeight - 40) await scrollToEl(el, { at: 0.45 })
  }

  const moveCursor = async (x, y, dur = 700) => {
    check()
    const c = S.cursor
    if (!c) return
    c.style.transition = `transform ${Math.max(120, dur / S.speed)}ms cubic-bezier(.22,.8,.2,1)`
    c.style.transform = `translate(${x}px, ${y}px)`
    S.cx = x
    S.cy = y
    await sleep(dur)
  }
  const pointAt = async (el, { ring = true, dur = 700 } = {}) => {
    if (!el) return
    await ensureVisible(el)
    const r = el.getBoundingClientRect()
    if (ring) S.ringEl = el
    await moveCursor(r.left + Math.min(r.width * 0.55, r.width - 8), r.top + r.height * 0.55, dur)
  }
  const setRing = (el) => { S.ringEl = el || null }
  const click = async (el, { ring = true } = {}) => {
    if (!el) return false
    await pointAt(el, { ring })
    check()
    const c = S.cursor
    if (c) {
      c.classList.add('demo-press')
      const rp = document.createElement('span')
      rp.className = 'demo-ripple'
      rp.style.left = `${S.cx}px`
      rp.style.top = `${S.cy}px`
      S.layer.appendChild(rp)
      setTimeout(() => rp.remove(), 700)
      await real(140 / S.speed)
      c.classList.remove('demo-press')
    }
    el.click()
    await sleep(350)
    return true
  }
  return { sleep, waitFor, $, $$, byText, byExact, visible, scrollToY, scrollToEl, pointAt, moveCursor, click, setRing, check }
}
