// Stage.jsx: 1920x1080 캔버스를 부모 너비에 맞춰 scale하는 16:9 박스.
// 내부 터치와 클릭 입력은 그대로 전달된다(transform은 좌표 변환을 브라우저가 처리한다).
import { useLayoutEffect, useRef, useState } from 'react'
import { cx, layout } from '@urbanedge/ds'

const { width: W, height: H } = layout.kiosk

export default function Stage({ children, className, label = 'UrbanEdge kiosk screen' }) {
  const ref = useRef(null)
  const [scale, setScale] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const update = () => setScale(el.clientWidth / W)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      className={cx('relative aspect-video w-full select-none overflow-hidden bg-black', className)}
      style={{ touchAction: 'manipulation', WebkitTouchCallout: 'none' }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: W, height: H, transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}
      >
        {children}
      </div>
    </div>
  )
}
