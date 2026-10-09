// demo/demoKit.js: 시연 도구 모음. 가짜 커서로 움직이고 누르고 입력하고, 강조 테두리와 자막을 그린다.
// 실제 사용자 조작과 같은 DOM 이벤트(pointerdown, click)를 쓰므로 키오스크와 운영 화면은 시연 여부를 모른다.
export const STOP = Symbol('demo-stop')

export function createKit({ cursor, layer, ring, speed = 1, isStopped, isPaused }) {
  const guard = () => {
    if (isStopped()) throw STOP
  }
  // 100ms 단위로 쪼개 기다린다. 일시정지 중에는 시간이 흐르지 않는다.
  const sleepReal = async (ms) => {
    let left = ms
    let last = performance.now()
    while (left > 0) {
      guard()
      await new Promise((r) => setTimeout(r, Math.min(80, left)))
      const now = performance.now()
      if (!isPaused()) left -= now - last
      last = now
    }
  }
  const sleep = (ms) => sleepReal(ms / speed)

  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
  const isVisible = (el) => {
    if (!el) return false
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim()
  const labelOf = (el) => norm((el.getAttribute('aria-label') || '') + ' ' + (el.textContent || ''))
  const byText = (sel, text, root = document) => $$(sel, root).find((el) => isVisible(el) && labelOf(el).includes(text))
  const btn = (text, root = document) => byText('button, [role=tab], [role=radio], [role=menuitem]', text, root)

  const waitFor = async (fn, timeout = 8000) => {
    const t0 = performance.now()
    while (performance.now() - t0 < timeout) {
      let v = null
      try {
        v = fn()
      } catch {
        v = null
      }
      if (v) return v
      await sleepReal(100)
    }
    return null
  }

  // ----- 커서 -----
  let cx = window.innerWidth * 0.6
  let cy = window.innerHeight * 0.8
  const setCursor = (x, y, ms) => {
    cx = x
    cy = y
    cursor.style.transition = `transform ${Math.round(ms / speed)}ms cubic-bezier(.22,.61,.36,1)`
    cursor.style.transform = `translate(${x - 4}px, ${y - 2}px)`
  }
  setCursor(cx, cy, 0)

  const ripple = (x, y) => {
    const d = document.createElement('div')
    d.style.cssText = `position:absolute;left:${x - 24}px;top:${y - 24}px;width:48px;height:48px;border-radius:50%;border:3px solid #FFD400;background:rgba(255,212,0,.25);pointer-events:none`
    layer.appendChild(d)
    const a = d.animate([{ transform: 'scale(.35)', opacity: 1 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 560, easing: 'ease-out' })
    a.onfinish = () => d.remove()
  }

  // ----- 강조 테두리: 대상을 따라다닌다 -----
  let ringTarget = null
  let ringPad = 8
  const trackRing = () => {
    if (ringTarget && ringTarget.isConnected) {
      const r = ringTarget.getBoundingClientRect()
      ring.style.opacity = '1'
      ring.style.transform = `translate(${r.left - ringPad}px, ${r.top - ringPad}px)`
      ring.style.width = `${r.width + ringPad * 2}px`
      ring.style.height = `${r.height + ringPad * 2}px`
    } else ring.style.opacity = '0'
    requestAnimationFrame(trackRing)
  }
  requestAnimationFrame(trackRing)
  const highlight = (el, pad = 8) => {
    ringTarget = el || null
    ringPad = pad
    if (!el) ring.style.opacity = '0'
  }

  // ----- 이동, 누르기 -----
  const reveal = async (el) => {
    const r = el.getBoundingClientRect()
    if (r.top >= 70 && r.bottom <= window.innerHeight - 70 && r.left >= 0 && r.right <= window.innerWidth) return
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
    let last = -1e9
    let same = 0
    for (let i = 0; i < 30 && same < 3; i++) {
      const t = el.getBoundingClientRect().top
      same = Math.abs(t - last) < 0.5 ? same + 1 : 0
      last = t
      await sleepReal(60)
    }
  }
  const moveTo = async (el, { dx = 0.5, dy = 0.5, ms = 800 } = {}) => {
    const r = el.getBoundingClientRect()
    setCursor(r.left + r.width * dx, r.top + r.height * dy, ms)
    await sleep(ms + 60)
  }
  const hover = async (el, opts) => {
    await reveal(el)
    await moveTo(el, opts)
  }
  const fire = (el, type, init = {}) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerType: 'mouse', clientX: cx, clientY: cy, ...init }))
  const click = async (el, opts) => {
    await hover(el, opts)
    ripple(cx, cy)
    await sleep(140)
    fire(el, 'pointerdown')
    fire(el, 'pointerup')
    el.click()
    await sleep(260)
  }

  // ----- 입력 -----
  const setNative = (el, value) => {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, String(value))
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
  }
  // 슬라이더나 숫자칸 값을 조금씩 바꿔 움직임이 보이게 한다.
  const slide = async (el, to, steps = 12) => {
    await hover(el, { dx: 0.3 })
    ripple(cx, cy)
    const from = Number(el.value)
    for (let i = 1; i <= steps; i++) {
      setNative(el, from + ((to - from) * i) / steps)
      await sleep(45)
    }
    await sleep(250)
  }
  const typeNumber = async (el, value) => {
    await hover(el)
    ripple(cx, cy)
    el.focus()
    await sleep(200)
    setNative(el, value)
    await sleep(350)
  }
  const key = (k, opts = {}) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...opts }))

  return { reveal, sleep, sleepReal, $, $$, isVisible, byText, btn, waitFor, click, hover, moveTo, slide, typeNumber, setNative, key, highlight, norm }
}
