import { useCallback, useEffect, useRef } from 'react'
import { cx } from '@urbanedge/ds'

// FrameCarousel: 가로로 밀어 고르는 프레임 목록. 가운데에 온 항목이 선택되고 커진다. 터치는 스크롤 스냅, 마우스는 끌기로 움직인다.
// items는 [{ id }], renderItem(item, active)이 각 항목을 그린다. itemW는 항목 폭, gap은 간격이다.
export function FrameCarousel({ items, activeId, onActive, renderItem, itemW = 460, gap = 56, height = 760, className, label }) {
  const ref = useRef(null)
  const nodes = useRef([])
  const raf = useRef(0)
  const mouse = useRef(null)
  const wasDrag = useRef(false)
  const activeRef = useRef(activeId)
  activeRef.current = activeId

  const pad = (1920 - itemW) / 2
  const step = itemW + gap

  const layout = useCallback(() => {
    const el = ref.current
    if (!el) return
    const center = el.scrollLeft + 1920 / 2
    let best = 0
    let bestD = Infinity
    items.forEach((_, i) => {
      const c = pad + i * step + itemW / 2
      const d = Math.abs(center - c)
      if (d < bestD) {
        bestD = d
        best = i
      }
      const n = nodes.current[i]
      if (n) {
        const k = Math.min(1, d / step)
        n.style.transform = `scale(${1 - 0.2 * k})`
        n.style.opacity = String(1 - 0.5 * k)
      }
    })
    if (items[best] && items[best].id !== activeRef.current) onActive(items[best].id)
  }, [items, pad, step, itemW, onActive])

  const onScroll = () => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(layout)
  }

  const scrollToIndex = useCallback(
    (i, smooth) => {
      const el = ref.current
      if (!el) return
      el.scrollTo({ left: pad + i * step + itemW / 2 - 1920 / 2, behavior: smooth ? 'smooth' : 'auto' })
    },
    [pad, step, itemW],
  )

  // 처음에는 선택된 항목을 가운데로 둔다.
  useEffect(() => {
    const i = Math.max(0, items.findIndex((x) => x.id === activeId))
    scrollToIndex(i, false)
    layout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // 마우스 끌기(터치는 브라우저 스크롤이 처리한다)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return
    wasDrag.current = false
    mouse.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false }
    ref.current.setPointerCapture(e.pointerId)
    ref.current.style.scrollSnapType = 'none'
  }
  const onPointerMove = (e) => {
    const m = mouse.current
    if (!m) return
    if (Math.abs(e.clientX - m.x) > 6) {
      m.moved = true
      wasDrag.current = true
    }
    const k = ref.current.getBoundingClientRect().width / (ref.current.offsetWidth || 1920)
    ref.current.scrollLeft = m.left - (e.clientX - m.x) / k
  }
  const onPointerUp = () => {
    if (!mouse.current) return
    ref.current.style.scrollSnapType = ''
    mouse.current = null
  }

  const onKey = (e) => {
    const i = items.findIndex((x) => x.id === activeId)
    if (e.key === 'ArrowRight' && i < items.length - 1) {
      e.preventDefault()
      e.stopPropagation()
      scrollToIndex(i + 1, true)
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault()
      e.stopPropagation()
      scrollToIndex(i - 1, true)
    }
  }

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      aria-orientation="horizontal"
      tabIndex={0}
      onScroll={onScroll}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKey}
      className={cx('k-noscroll flex overflow-x-auto overflow-y-hidden', className)}
      style={{ width: 1920, height, scrollSnapType: 'x mandatory', paddingLeft: pad, paddingRight: pad, gap, cursor: 'grab' }}
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          role="option"
          aria-selected={item.id === activeId}
          ref={(n) => {
            nodes.current[i] = n
          }}
          onClick={() => !wasDrag.current && scrollToIndex(i, true)}
          className="shrink-0 transition-[transform,opacity] duration-fast ease-out"
          style={{ width: itemW, scrollSnapAlign: 'center', willChange: 'transform, opacity' }}
        >
          {renderItem(item, item.id === activeId)}
        </div>
      ))}
    </div>
  )
}
