import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { paintRetouched, DEFAULT_RETOUCH } from './retouch.js'
import { ops, cameraCss } from '../ops/store.js'

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

// 웹캠 스트림은 키오스크 여러 대가 한 탭에서 같이 쓴다(3대 데모). 참조 수를 세어 마지막 사용자가 놓을 때 끈다.
const shared = { stream: null, video: null, pending: null, users: 0 }
function acquireStream() {
  shared.users++
  if (shared.video) return Promise.resolve(shared.video)
  if (shared.pending) return shared.pending
  const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : null
  if (!md || !md.getUserMedia) return Promise.reject(new Error('no media'))
  shared.pending = md
    .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
    .then(async (stream) => {
      const v = document.createElement('video')
      v.muted = true
      v.playsInline = true
      v.srcObject = stream
      try {
        await v.play()
      } catch {
        /* 자동 재생이 막혀도 프레임은 읽힌다 */
      }
      shared.stream = stream
      shared.video = v
      shared.pending = null
      if (shared.users <= 0) releaseStream(true)
      return v
    })
    .catch((e) => {
      shared.pending = null
      throw e
    })
  return shared.pending
}
function releaseStream(force = false) {
  if (!force) shared.users = Math.max(0, shared.users - 1)
  if (shared.users > 0 || !shared.stream) return
  shared.stream.getTracks().forEach((t) => t.stop())
  shared.stream = null
  shared.video = null
}

// booth가 있으면 운영 화면의 부스별 카메라 설정(좌우 반전, 확대, 밝기, 대비, 색온도, 필터)을 미리보기와 촬영에 같이 쓴다.
export function useCamera({ wanted, mode, booth = null }) {
  const [status, setStatus] = useState('off') // off | starting | live | sample | fallback
  const videoRef = useRef(null)
  const holding = useRef(false)

  const stop = useCallback(() => {
    if (holding.current) releaseStream()
    if (holding.current && booth) ops.setStream(booth, null)
    holding.current = false
    videoRef.current = null
  }, [booth])

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
    // 권한 창이 열린 채 응답이 없으면 2초 뒤 샘플로 먼저 보여준다. 이후 허용되면 웹캠으로 바뀐다.
    const timer = setTimeout(() => {
      if (!dead) setStatus((s) => (s === 'starting' ? 'fallback' : s))
    }, 2000)
    holding.current = true
    acquireStream()
      .then((v) => {
        if (dead) return
        clearTimeout(timer)
        videoRef.current = v
        // 운영 화면 카메라가 같은 스트림을 보여 줄 수 있게 부스별로 알린다.
        if (booth) ops.setStream(booth, shared.stream)
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
  }, [wanted, mode, stop, booth])

  const boothRef = useRef(booth)
  boothRef.current = booth

  // 현재 소스를 w x h에 가득 채워 그린다. 웹캠은 거울처럼 좌우 반전한다.
  const drawSource = useCallback((ctx, w, h, t, idx) => {
    const set = boothRef.current ? ops.get().camera[boothRef.current] : null
    if (set) {
      // 운영 화면 설정: 필터는 보정 필터 뒤에 잇고, 확대는 가운데 기준, 좌우 반전은 웹캠 기본(거울)에서 켜고 끈다.
      const base = ctx.filter && ctx.filter !== 'none' ? ctx.filter : ''
      ctx.save()
      ctx.filter = `${base} ${cameraCss(set).filter}`.trim()
      ctx.translate(w / 2, h / 2)
      ctx.scale(set.zoom || 1, set.zoom || 1)
      ctx.translate(-w / 2, -h / 2)
      if (!set.mirror) {
        ctx.translate(w, 0)
        ctx.scale(-1, 1)
      }
      drawRaw(ctx, w, h, t, idx)
      ctx.restore()
      return
    }
    drawRaw(ctx, w, h, t, idx)
  }, [])

  const drawRaw = (ctx, w, h, t, idx) => {
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
  }

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
