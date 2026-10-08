// StripCanvas.jsx: 인화 스트립 3D. 종이는 구부러진 평면(정점 CPU 변형), 앞면은 합성한 캔버스 텍스처, 뒷면은 흰 종이.
import '../lib/quiet.js'
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { readPalette, css } from '../lib/palette.js'
import { blobTexture } from '../lib/textures.js'
import { damp, deviceTier, softwareOk } from '../lib/env.js'

const W = 2.4
const H = 3.6
const UE_PATH = 'M0 0H80V140H100V0H180V280H0ZM200 0H380V88H290V104H380V176H290V192H380V280H200Z'

function loadImage(src) {
  return new Promise((resolve) => {
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => resolve(im)
    im.onerror = () => resolve(null)
    im.src = src
  })
}

function cover(g, im, x, y, w, h) {
  const s = Math.max(w / im.width, h / im.height)
  const sw = w / s
  const sh = h / s
  g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h)
}

// 4x6 비율(1200x1800) 인화지: 2x2 사진 + 하단 UE 마크, 워드마크, 촬영 날짜
async function composeTexture(photos, P) {
  const imgs = await Promise.all(photos.map(loadImage))
  const c = document.createElement('canvas')
  c.width = 1200
  c.height = 1800
  const g = c.getContext('2d')
  g.fillStyle = css(P['bg-base'])
  g.fillRect(0, 0, c.width, c.height)
  const m = 54
  const gap = 36
  const cw = (c.width - m * 2 - gap) / 2
  const ch = cw * (4 / 3)
  for (let i = 0; i < 4; i++) {
    const x = m + (i % 2) * (cw + gap)
    const y = m + Math.floor(i / 2) * (ch + gap)
    const im = imgs[i % imgs.length]
    if (im) cover(g, im, x, y, cw, ch)
    else { g.fillStyle = css(P['bg-raised']); g.fillRect(x, y, cw, ch) }
  }
  const fy = m + 2 * ch + gap + 36
  g.save()
  g.translate(m, fy)
  const k = 0.3
  g.scale(k, k)
  g.fillStyle = css(P['text-pri'])
  g.fill(new Path2D(UE_PATH), 'evenodd')
  g.restore()
  g.fillStyle = css(P['text-pri'])
  g.textBaseline = 'alphabetic'
  g.font = '800 64px "Barlow Condensed", "Pretendard Variable", sans-serif'
  g.fillText('UrbanEdge', m + 160, fy + 52)
  g.fillStyle = css(P['text-meta'])
  g.font = '700 30px "Barlow Condensed", "Pretendard Variable", sans-serif'
  g.fillText('METROGRAPHY', m + 160, fy + 90)
  const d = new Date()
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  g.textAlign = 'right'
  g.fillStyle = css(P.yellow)
  g.font = '700 38px "Barlow Condensed", "Pretendard Variable", sans-serif'
  g.fillText(date, c.width - m, fy + 52)
  g.fillStyle = css(P['text-meta'])
  g.font = '700 28px "Barlow Condensed", "Pretendard Variable", sans-serif'
  g.fillText('GY-01 URBANEDGE', c.width - m, fy + 90)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function Strip({ photos, interactive, still, active, anim, onReady }) {
  const P = useMemo(() => readPalette(), [])
  const geo = useMemo(() => new THREE.PlaneGeometry(W, H, 18, 28), [])
  const base = useMemo(() => geo.attributes.position.array.slice(), [geo])
  const front = useRef()
  const group = useRef()
  const shadow = useRef()
  const blob = useMemo(() => blobTexture(), [])
  const frontMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: P.white, roughness: 0.5, clearcoat: 0.55, clearcoatRoughness: 0.35, side: THREE.FrontSide }), [P])
  const backMat = useMemo(() => new THREE.MeshStandardMaterial({ color: P.white.clone().lerp(P['text-sec'], 0.1), roughness: 0.8, side: THREE.BackSide }), [P])
  const invalidate = useThree((s) => s.invalidate)
  const key = photos.join('|')

  useEffect(() => {
    let live = true
    let tex
    composeTexture(photos, P).catch(() => null).then((t) => {
      if (!t) return
      if (!live) { t.dispose(); return }
      tex = t
      frontMat.map = t
      frontMat.emissiveMap = t
      frontMat.emissive = P.white
      frontMat.emissiveIntensity = 0.55
      frontMat.needsUpdate = true
      invalidate()
      onReady?.()
    })
    return () => { live = false; tex?.dispose() }
  }, [key, P, frontMat, invalidate, onReady, photos])
  useEffect(() => () => { geo.dispose(); frontMat.dispose(); backMat.dispose(); blob.dispose() }, [geo, frontMat, backMat, blob])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20)
    anim.t += dt
    const live = interactive && !still
    const tx = live ? anim.px : 0
    const ty = live ? anim.py : 0
    const px0 = anim.cx
    anim.cx = damp(anim.cx, tx, 5, dt)
    anim.cy = damp(anim.cy, ty, 5, dt)
    anim.vx = damp(anim.vx, (anim.cx - px0) / Math.max(dt, 0.001), 8, dt)
    const idle = live || active ? 1 : 0
    const float = still ? 0 : Math.sin(anim.t * 0.9) * 0.09 * idle
    const g = group.current
    g.rotation.y = anim.cx * 0.55 + (still ? -0.22 : Math.sin(anim.t * 0.5) * 0.06 * idle)
    g.rotation.x = anim.cy * 0.32 + (still ? 0.06 : 0)
    g.rotation.z = (still ? 0.05 : Math.sin(anim.t * 0.62) * 0.035 * idle) - anim.cx * 0.05
    g.position.set(anim.cx * 0.35, float, 0)
    shadow.current.position.set(anim.cx * 0.25, -2.55 - float * 0.4, 0.2)
    shadow.current.scale.setScalar(1 - float * 0.25)
    // 종이 휨: 가로 방향 곡률 + 포인터 속도에 따른 비틀림 + 아래로 처짐
    const pos = geo.attributes.position
    const a = pos.array
    const curl = 0.16 + Math.min(0.5, Math.abs(anim.vx) * 0.04) * Math.sign(anim.cx || 1)
    const twist = (anim.cy * 0.18 + anim.vx * 0.012)
    for (let i = 0; i < a.length; i += 3) {
      const x = base[i]
      const y = base[i + 1]
      const nx = x / (W / 2)
      const ny = y / (H / 2)
      a[i + 2] = (1 - nx * nx) * curl - ny * ny * 0.05 + nx * ny * twist + Math.sin(anim.t * 1.4 + ny * 2) * 0.012 * idle
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    const moving = Math.abs(anim.cx - tx) > 0.002 || Math.abs(anim.cy - ty) > 0.002 || Math.abs(anim.vx) > 0.01
    if (moving) state.invalidate()
  })
  return (
    <>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 1.6]} />
        <meshBasicMaterial map={blob} transparent depthWrite={false} opacity={0.8} />
      </mesh>
      <group ref={group}>
        <mesh ref={front} geometry={geo} material={frontMat} />
        <mesh geometry={geo} material={backMat} />
      </group>
    </>
  )
}

export default function StripCanvas({ photos, interactive = true, active = true, still = false, onReady, onError, onLost, onRestored }) {
  const tier = useMemo(() => deviceTier(), [])
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, tier === 'low' ? 1 : tier === 'mid' ? 1.5 : 2)
  const P = useMemo(() => readPalette(), [])
  const wrap = useRef(null)
  const anim = useMemo(() => ({ t: 0, px: 0, py: 0, cx: 0, cy: 0, vx: 0 }), [])
  useEffect(() => {
    if (!interactive || still) return undefined
    const el = wrap.current
    const move = (e) => {
      const r = el.getBoundingClientRect()
      if (!r.width) return
      anim.px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2))
      anim.py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))
    }
    const tilt = (e) => { if (e.gamma != null) { anim.px = Math.max(-1, Math.min(1, e.gamma / 28)); anim.py = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 28)) } }
    window.addEventListener('pointermove', move, { passive: true })
    const D = window.DeviceOrientationEvent
    if (D && typeof D.requestPermission !== 'function') window.addEventListener('deviceorientation', tilt)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('deviceorientation', tilt) }
  }, [interactive, still, anim])
  return (
    <div ref={wrap} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop="demand"
        flat
        dpr={dpr}
        camera={{ fov: 30, near: 0.5, far: 60, position: [0, 0.1, 8.6] }}
        gl={{ antialias: tier !== 'low', alpha: true, powerPreference: tier === 'low' ? 'default' : 'high-performance', failIfMajorPerformanceCaveat: !softwareOk() }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(P.black, 0)
          gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost?.() })
          gl.domElement.addEventListener('webglcontextrestored', () => { onRestored?.(); invalidate() })
        }}
      >
        <hemisphereLight args={[P.white, P['bg-raised'], 1.2]} />
        <directionalLight position={[3, 5, 8]} intensity={1.8} />
        <directionalLight position={[-6, -2, 4]} intensity={0.4} />
        <Strip photos={photos} interactive={interactive} still={still} active={active} anim={anim} onReady={onReady} />
        <FrameTicker active={active && !still} fps={tier === 'low' ? 30 : tier === 'mid' ? 40 : 60} />
      </Canvas>
    </div>
  )
}

function FrameTicker({ active, fps }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!active) return undefined
    let id
    let last = 0
    const loop = (t) => { id = requestAnimationFrame(loop); if (t - last >= 1000 / fps - 2) { last = t; invalidate() } }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [active, fps, invalidate])
  return null
}
