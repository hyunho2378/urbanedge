import { useEffect, useRef, useState } from 'react'
import { composeStrip, SAMPLE_PHOTO_URLS } from './compose.js'
import { getFrame } from './frames/index.js'

const ids = new WeakMap()
let idSeq = 0
const keyOf = (item) => {
  if (item == null) return 'x'
  if (typeof item === 'string') return item
  if (!ids.has(item)) ids.set(item, `o${++idSeq}`)
  return ids.get(item)
}

// StripPreview: composeStrip 결과를 canvas로 보여 준다. photos를 생략하면 팀 샘플 사진(/img/team/shot-1..5.jpg)을 쓴다.
// props: frameId, photos, date, roomId, stamp, message, mode('sheet'|'single'), scale(0.5), alt, className, style, onReady(canvas)
export function StripPreview({ frameId = 'signature', photos, date, roomId, stamp, message, mode = 'sheet', scale = 0.5, alt, className, style, onReady }) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)
  const frame = getFrame(frameId)
  const list = photos && photos.length ? photos : SAMPLE_PHOTO_URLS
  const key = [frameId, mode, scale, String(date instanceof Date ? date.toDateString() : date), roomId, stamp, message, list.map(keyOf).join('|')].join('::')

  useEffect(() => {
    let alive = true
    const ctrl = new AbortController()
    composeStrip({ frameId, photos: list, date, roomId, stamp, message, mode, scale, signal: ctrl.signal })
      .then((c) => {
        const el = ref.current
        if (!alive || !el) return
        el.width = c.width
        el.height = c.height
        el.getContext('2d').drawImage(c, 0, 0)
        setReady(true)
        onReady?.(c)
      })
      .catch(() => {})
    return () => {
      alive = false
      ctrl.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const copies = frame.layout === 'twin' && mode === 'sheet' ? 2 : 1
  const w = frame.paper.w * copies
  const h = frame.paper.h
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={alt || `${frame.name.en} print preview`}
      className={className}
      data-ready={ready ? 'true' : 'false'}
      style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: `${w} / ${h}`, ...style }}
    />
  )
}
