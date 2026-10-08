import { useEffect, useMemo, useRef, useState } from 'react'
import { drawFrame, ensureFonts } from '../flow/frames.js'
import { roomById } from '../flow/rooms.js'

// 프레임 합성 미리보기. photos는 { src, fx, fy } 배열(없는 칸은 번호 자리표시).
// maxW와 maxH 안에 프레임 비율대로 맞춰 그린다. 백킹 스토어는 표시 크기의 2배다.
export function FrameCanvas({ frame, photos, stamps = [], message = '', room, maxW, maxH, className, label }) {
  const ref = useRef(null)
  const [fontTick, setFontTick] = useState(0)
  const k = Math.min(maxW / frame.w, maxH / frame.h)
  const w = Math.round(frame.w * k)
  const h = Math.round(frame.h * k)
  const stampKey = stamps.join(',')
  const stampRooms = useMemo(() => stampKey.split(',').filter(Boolean).map(roomById), [stampKey])

  useEffect(() => {
    let live = true
    ensureFonts().then(() => live && setFontTick((n) => n + 1))
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    const s = c.width / frame.w
    ctx.setTransform(s, 0, 0, s, 0, 0)
    drawFrame(ctx, frame, { photos, stamps: stampRooms, message, room: roomById(room) })
  }, [frame, photos, stampRooms, message, room, fontTick, w])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      width={w * 2}
      height={h * 2}
      className={`k-canvas ${className || ''}`}
      style={{ width: w, height: h }}
    />
  )
}
