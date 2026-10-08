import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { paintRetouched, DEFAULT_RETOUCH } from './retouch.js'

// camera.js: 카메라 소스. live이면 getUserMedia 웹캠, 실패하거나 sample이면 팀 인화 사진(public/img/team).
// 미리보기와 촬영은 세로 3:4다. 인화 칸에 들어가는 비율과 같아서 보이는 대로 인화된다.
// 얼굴 영상은 서버로 보내지 않는다. 프레임은 canvas와 메모리에만 존재한다.

const TEAM = [1, 2, 3, 4, 5].map((n) => `/img/team/shot-${n}.jpg`)
export const CAPTURE = { w: 960, h: 1280 }

let imgCache = null
export function loadSamples() {
  if (!imgCache) {
    imgCache = TEAM.map((src) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = src
      return img
    })
  }
  return imgCache
}

let readyPromise = null
export function samplesReady() {
  if (!readyPromise) {
    const imgs = loadSamples()
    readyPromise = Promise.all(
      imgs.map((i) =>
        i.complete
          ? Promise.resolve()
          : new Promise((res) => {
              i.addEventListener('load', res, { once: true })
              i.addEventListener('error', res, { once: true })
            }),
      ),
    ).then(() => imgs)
  }
  return readyPromise
}

// 로딩이 끝난 팀 사진 배열(프레임 미리보기용). 로딩 중에는 빈 배열에서 시작해 채워진다.
export function useSamplePhotos() {
  const [, tick] = useState(0)
  useEffect(() => {
    let live = true
    samplesReady().then(() => live && tick((n) => n + 1))
    return () => {
      live = false
    }
  }, [])
  return loadSamples().filter((i) => i.complete && i.naturalWidth)
}

// 슬롯 수만큼 팀 사진을 돌려 채운다.
export const fillPhotos = (imgs, n) => (imgs.length ? Array.from({ length: n }, (_, i) => imgs[i % imgs.length]) : [])

const SCENE_MS = 5200

function drawScene(ctx, w, h, t, idx, alpha = 1, mirror = false) {
  const imgs = loadSamples()
  const img = imgs[((idx % imgs.length) + imgs.length) % imgs.length]
  if (!img.complete || !img.naturalWidth) return
  const sw = img.naturalWidth
  const sh = img.naturalHeight
  const z = 1.05 + 0.04 * Math.sin(t / 2600 + idx) + (idx >= imgs.length ? 0.12 : 0)
  const k = Math.max(w / sw, h / sh) * z
  const cw = w / k
  const ch = h / k
  const fx = 0.5 + 0.2 * Math.sin(t / 4200 + idx * 1.7)
  const fy = 0.4 + 0.15 * Math.cos(t / 5100 + idx)
  ctx.save()
  ctx.globalAlpha = alpha
  if (mirror) {
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(img, (sw - cw) * fx, (sh - ch) * fy, cw, ch, 0, 0, w, h)
  ctx.restore()
}

export function useCamera({ wanted, mode }) {
  const [status, setStatus] = useState('off') // off | starting | live | sample | fallback
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const stop = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    videoRef.current = null
  }, [])

  useEffect(() => {
    loadSamples()
    if (!wanted) {
      stop()
      setStatus('off')
      return undefined
    }
    if (mode !== 'live') {
      stop()
      setStatus('sample')
      return undefined
    }
    let dead = false
    setStatus('starting')
    const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : null
    if (!md || !md.getUserMedia) {
      setStatus('fallback')
      return undefined
    }
    // 권한 창이 열린 채 응답이 없으면 2초 뒤 샘플로 먼저 보여준다. 이후 허용되면 웹캠으로 바뀐다.
    const timer = setTimeout(() => {
      if (!dead) setStatus((s) => (s === 'starting' ? 'fallback' : s))
    }, 2000)
    md.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then(async (stream) => {
        if (dead) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        clearTimeout(timer)
        const v = document.createElement('video')
        v.muted = true
        v.playsInline = true
        v.srcObject = stream
        try {
          await v.play()
        } catch {
          /* 자동 재생이 막혀도 프레임은 읽힌다 */
        }
        if (dead) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        videoRef.current = v
        setStatus('live')
      })
      .catch(() => {
        if (dead) return
        clearTimeout(timer)
        setStatus('fallback')
      })
    return () => {
      dead = true
      clearTimeout(timer)
      stop()
    }
  }, [wanted, mode, stop])

  // 현재 소스를 w x h에 가득 채워 그린다. 웹캠은 거울처럼 좌우 반전한다.
  const drawSource = useCallback((ctx, w, h, t, idx) => {
    const v = videoRef.current
    if (v && v.readyState >= 2 && v.videoWidth) {
      const k = Math.max(w / v.videoWidth, h / v.videoHeight)
      const cw = w / k
      const ch = h / k
      ctx.save()
      ctx.translate(w, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(v, (v.videoWidth - cw) / 2, (v.videoHeight - ch) / 2, cw, ch, 0, 0, w, h)
      ctx.restore()
      return
    }
    if (idx != null) {
      const n = loadSamples().length
      drawScene(ctx, w, h, 0, idx, 1, idx >= n)
      return
    }
    const n = Math.floor(t / SCENE_MS)
    const frac = (t % SCENE_MS) / SCENE_MS
    drawScene(ctx, w, h, t, n)
    if (frac > 0.88) drawScene(ctx, w, h, t, n + 1, (frac - 0.88) / 0.12)
  }, [])

  const draw = useCallback(
    (ctx, w, h, t, retouch) => {
      paintRetouched(ctx, () => drawSource(ctx, w, h, t, null), w, h, retouch || DEFAULT_RETOUCH)
    },
    [drawSource],
  )

  // 촬영: 보정이 적용된 960x1280 캔버스와 미리보기 URL을 돌려준다.
  const capture = useCallback(
    (idx, retouch) => {
      const c = document.createElement('canvas')
      c.width = CAPTURE.w
      c.height = CAPTURE.h
      const ctx = c.getContext('2d')
      paintRetouched(ctx, () => drawSource(ctx, CAPTURE.w, CAPTURE.h, 0, idx), CAPTURE.w, CAPTURE.h, retouch || DEFAULT_RETOUCH)
      return { canvas: c, url: c.toDataURL('image/jpeg', 0.86), live: !!videoRef.current }
    },
    [drawSource],
  )

  return useMemo(() => ({ status, mode, isLive: status === 'live', draw, capture }), [status, mode, draw, capture])
}
