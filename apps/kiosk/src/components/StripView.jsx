import { useMemo } from 'react'
import { StripPreview } from '@urbanedge/brand'
import { cx } from '@urbanedge/ds'

// StripView: B 작업의 StripPreview를 인화 시트 비율로 크기를 맞춰 보여 준다(스트립형은 같은 스트립 두 장이 한 용지에 들어간다).
// frame은 FRAMES 항목이다. width 또는 height 중 하나로 크기를 정한다.
export function stripAspect(frame) {
  if (!frame) return 2 / 3
  return (frame.layout === 'twin' ? frame.paper.w * 2 : frame.paper.w) / frame.paper.h
}

export function StripView({ frame, photos, date, roomId, message, width, height, scale = 0.5, className, label, children }) {
  const aspect = stripAspect(frame)
  const w = width ?? Math.round(height * aspect)
  const h = height ?? Math.round(width / aspect)
  const list = useMemo(() => photos, [photos])
  return (
    <div className={cx('relative', className)} style={{ width: w, height: h }}>
      <StripPreview frameId={frame.id} photos={list} date={date} roomId={roomId} message={message} mode="sheet" scale={scale} alt={label} className="k-photo-edge" style={{ width: w, height: h }} />
      {children}
    </div>
  )
}
