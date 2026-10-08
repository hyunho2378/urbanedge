// PlatformCanvas.jsx: 황리단선 승강장 장면(React Three Fiber). 프로시저럴 지오메트리 + 툰 셰이딩.
// 스크롤 진행(progress)이 시간이다(scroll-world의 "scroll drives time" 방식). 값은 지수 감쇠로 부드럽게 따라간다.
import '../lib/quiet.js'
import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { accentOf, inkOn, readPalette, ROOM_STATIONS, STATION } from '../lib/palette.js'
import * as T from '../lib/textures.js'
import { clamp01, damp, deviceTier, lerp, smooth, softwareOk, useFontsReady } from '../lib/env.js'

const PITCH = 4.0 // 문 간격
const DOORS = 8 // 차체의 문 수. 가운데 4개가 승강장(방)이다.
const ROOMS = ROOM_STATIONS.length
const TRAIN_LEN_HALF = (DOORS / 2) * PITCH + 0.6
const NOSE_X = TRAIN_LEN_HALF
const START_X = -58
const PLATFORM_EDGE_Z = 1.4
const TRAIN_FRONT_Z = 1.5
const CEIL_Y = 7.6

// ---------------------------------------------------------------- 재질과 텍스처
function useAssets(fontsReady, tier) {
  const P = useMemo(() => readPalette(), [])
  const assets = useMemo(() => {
    const grad = T.toonGradient()
    // 낮은 등급 기기는 그라디언트 맵 없이 Lambert 재질을 쓴다(조명 계산이 더 단순하다).
    const lit = (opts) => (tier === 'low' ? new THREE.MeshLambertMaterial(opts) : new THREE.MeshToonMaterial({ gradientMap: grad, ...opts }))
    const toon = (color, extra = {}) => lit({ color, ...extra })
    const tileW = T.tileTexture(P.tileWhite, P.tileGrout)
    const tileB = T.tileTexture(P.tileBlue, P.tileBlueGrout)
    const checker = T.checkerTexture(P.white.clone().lerp(P['text-sec'], 0.1), P['bg-elev'])
    const tactile = T.tactileTexture(P.yellow, P['yellow-pressed'], P['yellow-hover'])
    const track = T.trackTexture(P.track, P['bg-raised'])
    const glass = T.glassTexture(P.glass, P['text-pri'])
    const mark = T.markTexture(P['bg-base'])
    const blob = T.blobTexture()
    const spill = T.spillTexture()
    const board = T.boardTexture(P)
    const mats = {
      body: toon(P.white.clone().lerp(P['text-sec'], 0.1)),
      steel: toon(P.steel),
      steelDark: toon(P.steelDark),
      black: toon(P.tileBlack),
      yellow: toon(P.yellow),
      stripe: new THREE.MeshBasicMaterial({ color: P.yellow }),
      stripeDark: new THREE.MeshBasicMaterial({ color: P['bg-base'] }),
      under: toon(P['bg-panel']),
      ceiling: toon(P.ceiling),
      rail: toon(P['text-meta']),
      glass: new THREE.MeshBasicMaterial({ map: glass }),
      mark: new THREE.MeshBasicMaterial({ map: mark, transparent: true, depthWrite: false }),
      blob: new THREE.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false }),
      board: new THREE.MeshBasicMaterial({ map: board }),
      light: new THREE.MeshBasicMaterial({ color: P['text-pri'] }),
      red: toon(P['line-red']),
      cone: toon(P['line-red'].clone().lerp(P.yellow, 0.45)),
      white: toon(P.white.clone().lerp(P['text-sec'], 0.1)),
      pit: lit({ map: track, color: P.white }),
      floor: lit({ map: checker, color: P.white }),
      tactile: lit({ map: tactile, color: P.white }),
      tileW: lit({ map: tileW, color: P.white }),
      tileB: lit({ map: tileB, color: P.white }),
      mirror: new THREE.MeshBasicMaterial({ map: T.convexMirrorTexture(P) }),
      recess: new THREE.MeshBasicMaterial({ map: T.recessTexture(), transparent: true, depthWrite: false }),
      leaf: lit({ map: T.leafTexture(P.steel, P.glass, P['text-pri']) }),
      ao: new THREE.MeshBasicMaterial({ map: T.aoTexture(), transparent: true, depthWrite: false }),
      sheen: new THREE.MeshBasicMaterial({ map: spill, color: P.white, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }),
    }
    const leafL = new THREE.BoxGeometry(0.74, 2.2, 0.05).translate(0.37, 0, 0)
    const leafR = new THREE.BoxGeometry(0.74, 2.2, 0.05).translate(-0.37, 0, 0)
    return { grad, mats, leafL, leafR, tex: { tileW, tileB, checker, tactile, track, glass, mark, blob, spill, board } }
  }, [P, tier])
  const pills = useMemo(() => {
    void fontsReady // 글꼴이 로드되면 다시 그린다
    return {
      station: T.namePillTexture(P, { no: STATION.no, name: STATION.name, accent: P.yellow, ink: P['bg-base'], sub: `${STATION.no}  GYEONGJU METRO` }),
      doors: ROOM_STATIONS.map((s) => {
        const accent = accentOf(P, s.color)
        return { s, accent, tex: T.doorBadgeTexture(P, { no: s.no, name: s.name, accent, ink: inkOn(P, s.color) }) }
      }),
    }
  }, [P, fontsReady])
  useEffect(() => () => {
    Object.values(assets.mats).forEach((m) => { m.map?.dispose?.(); m.dispose() })
    Object.values(assets.tex).forEach((t) => t.dispose())
    assets.grad.dispose()
    assets.leafL.dispose()
    assets.leafR.dispose()
  }, [assets])
  useEffect(() => () => { pills.station.dispose(); pills.doors.forEach((d) => d.tex.dispose()) }, [pills])
  return { P, tier, ...assets, pills }
}

const tiled = (tex, w, h) => T.withRepeat(tex, w / 1.2, h / 1.2)

// ---------------------------------------------------------------- 애니메이터(공유 상태)
function Animator({ anim, props, onReady, onError }) {
  const { invalidate, camera, size } = useThree()
  const first = useRef(true)
  useEffect(() => { invalidate() }, [props.progress, props.activeRoom, props.focusRoom, props.still, invalidate])

  // 포인터와 기기 기울기
  useEffect(() => {
    if (!props.interactive || props.still) return undefined
    const el = anim.el
    const move = (e) => {
      const r = el.getBoundingClientRect()
      if (!r.width) return
      anim.px = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2))
      anim.py = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))
      anim.pointer = true
      invalidate()
    }
    const tilt = (e) => {
      if (anim.pointer && anim.pointerAt && performance.now() - anim.pointerAt < 1500) return
      if (e.gamma == null) return
      anim.px = Math.max(-1, Math.min(1, e.gamma / 28))
      anim.py = Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 28))
      invalidate()
    }
    const down = () => {
      anim.pointerAt = performance.now()
      const D = window.DeviceOrientationEvent
      if (D && typeof D.requestPermission === 'function' && !anim.tiltAsked) {
        anim.tiltAsked = true
        D.requestPermission().then((s) => { if (s === 'granted') window.addEventListener('deviceorientation', tilt) }).catch(() => {})
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    const D = window.DeviceOrientationEvent
    if (D && typeof D.requestPermission !== 'function') window.addEventListener('deviceorientation', tilt)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('deviceorientation', tilt)
    }
  }, [props.interactive, props.still, anim, invalidate])

  useFrame((state, delta) => {
    try {
      step(state, delta)
    } catch (err) {
      onError?.(err)
    }
  }, -1)
  const step = (state, delta) => {
    const dt = Math.min(delta, 1 / 20)
    const target = props.still ? 1 : clamp01(props.progress ?? 1)
    anim.p = props.still ? 1 : damp(anim.p, target, 5, dt)
    const p = anim.p
    // 열차: 감속은 등가속도(위치는 2차 ease-out)
    const enter = clamp01((p - 0.04) / 0.56)
    anim.trainX = START_X * (1 - enter) * (1 - enter)
    const brake = Math.sin(Math.PI * clamp01((p - 0.42) / 0.28))
    anim.brake = brake
    anim.speed = enter < 1 ? 1 - enter : 0
    anim.open = smooth((p - 0.66) / 0.14)
    for (let i = 0; i < ROOMS; i++) anim.glow[i] = smooth((p - 0.76 - i * 0.026) / 0.1)
    anim.live = !!props.active && !props.still
    if (anim.live) anim.t += dt
    // 보드 상태
    anim.phase = p < 0.1 ? 0 : p < 0.66 ? 1 : 2
    // 시차(포인터) 감쇠
    const live = props.interactive && !props.still
    anim.cx = damp(anim.cx, live ? anim.px : 0, 3.5, dt)
    anim.cy = damp(anim.cy, live ? anim.py : 0, 3.5, dt)

    // 카메라 구도: 가로가 좁으면 더 물러서고 문을 따라 이동한다.
    const asp = size.width / Math.max(1, size.height)
    const fov = asp < 0.9 ? 40 : asp < 1.5 ? 34 : 30
    const halfW = asp < 0.7 ? 3.9 : asp < 0.95 ? 5.6 : asp < 1.5 ? 8.4 : 10.8
    const portrait = asp < 0.95
    anim.portrait = portrait
    let dist = halfW / (Math.tan((fov * Math.PI) / 360) * asp)
    dist = Math.max(portrait ? 15 : 21, Math.min(46, dist))
    dist *= lerp(1.06, 0.97, smooth(p))
    let focusX = 0
    const idx = ROOM_STATIONS.findIndex((s) => s.id === (props.focusRoom || props.activeRoom))
    if (asp < 1.3) {
      focusX = idx >= 0 ? (idx - (ROOMS - 1) / 2) * PITCH : lerp(-4, -(ROOMS - 1) * PITCH * 0.3, smooth((p - 0.7) / 0.3))
      if (p < 0.7 && idx < 0) focusX = lerp(-4, -(ROOMS - 1) * PITCH * 0.15, smooth(enter))
    } else if (idx >= 0) focusX = (idx - (ROOMS - 1) / 2) * PITCH * 0.28
    anim.focusX = damp(anim.focusX ?? focusX, focusX, 3, dt)
    const sway = props.still || !props.active ? 0 : Math.sin(anim.t * 0.55) * 0.12
    camera.position.set(anim.focusX + anim.cx * 1.9 + sway, (portrait ? 4.2 : 5.0) - anim.cy * 0.7 + lerp(0.3, 0, smooth(p)), dist)
    camera.lookAt(anim.focusX + anim.cx * 0.5, portrait ? 2.9 : 1.9, 0)
    if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix() }

    // 아직 움직이는 중이면 다음 프레임을 요청한다(demand 모드)
    const hov = anim.hoverAnim
    anim.hoverAnim = false
    const moving = hov || Math.abs(p - target) > 0.0008 || Math.abs(anim.cx - (live ? anim.px : 0)) > 0.002 || Math.abs(anim.cy - (live ? anim.py : 0)) > 0.002 || Math.abs((anim.focusX ?? 0) - focusX) > 0.01 
    if (moving) state.invalidate()
    if (first.current) { first.current = false; requestAnimationFrame(() => onReady?.()) }
  }
  return null
}

// 주기적으로 프레임을 요청한다(화면 안에 있고 동작 줄이기가 아닐 때만)
function Ticker({ active, fps }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!active) return undefined
    let id
    let last = 0
    const loop = (t) => {
      id = requestAnimationFrame(loop)
      if (t - last >= 1000 / fps - 2) { last = t; invalidate() }
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [active, fps, invalidate])
  return null
}

// ---------------------------------------------------------------- 승강장
function Platform({ A, anim }) {
  const { mats, tex } = A
  const X = 48
  const floorMat = useMemo(() => { const m = mats.floor.clone(); m.map = T.withRepeat(tex.checker, (X * 2) / 1.8, (34 - PLATFORM_EDGE_Z) / 1.8); return m }, [mats, tex])
  const tactMat = useMemo(() => { const m = mats.tactile.clone(); m.map = T.withRepeat(tex.tactile, (X * 2) / 0.7, 1); return m }, [mats, tex])
  const sideMat = useMemo(() => { const m = mats.tileW.clone(); m.map = tiled(tex.tileW, X * 2, 1.2); return m }, [mats, tex])
  const pitMat = useMemo(() => { const m = mats.pit.clone(); m.map = T.withRepeat(tex.track, (X * 2) / 0.9, 1); return m }, [mats, tex])
  const wallMat = useMemo(() => { const m = mats.tileB.clone(); m.map = tiled(tex.tileB, X * 2, 9); return m }, [mats, tex])
  const sleeperZ = (PLATFORM_EDGE_Z - -3.2)
  useEffect(() => () => { [floorMat, tactMat, sideMat, pitMat, wallMat].forEach((m) => { m.map?.dispose(); m.dispose() }) }, [floorMat, tactMat, sideMat, pitMat, wallMat])
  void anim
  return (
    <group>
      {/* 승강장 바닥(체커) */}
      <mesh position={[0, -0.05, (34 + PLATFORM_EDGE_Z) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={floorMat}>
        <planeGeometry args={[X * 2, 34 - PLATFORM_EDGE_Z]} />
      </mesh>
      {/* 승강장 옆면(흰 타일) */}
      <mesh position={[0, -0.65, PLATFORM_EDGE_Z]} material={sideMat}>
        <planeGeometry args={[X * 2, 1.2]} />
      </mesh>
      {/* 열차 불빛이 바닥에 비친 부드러운 광택 */}
      <mesh position={[0, 0.006, PLATFORM_EDGE_Z + 3.6]} rotation={[-Math.PI / 2, 0, 0]} material={mats.sheen}><planeGeometry args={[X * 2, 4.4]} /></mesh>
      {/* 노란 점자 블록 */}
      <mesh position={[0, 0.0, PLATFORM_EDGE_Z + 0.4]} rotation={[-Math.PI / 2, 0, 0]} material={tactMat}>
        <planeGeometry args={[X * 2, 0.7]} />
      </mesh>
      <mesh position={[0, -0.02, PLATFORM_EDGE_Z + 0.04]} material={mats.yellow}>
        <boxGeometry args={[X * 2, 0.1, 0.08]} />
      </mesh>
      {/* 선로 바닥과 레일 */}
      <mesh position={[0, -1.2, (PLATFORM_EDGE_Z - 3.2) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={pitMat}>
        <planeGeometry args={[X * 2, sleeperZ]} />
      </mesh>
      {[-0.55, 0.85].map((z) => (
        <mesh key={z} position={[0, -1.06, z]} material={mats.rail}>
          <boxGeometry args={[X * 2, 0.16, 0.14]} />
        </mesh>
      ))}
      {/* 터널 뒷벽(파란 타일 + 검정 띠) */}
      <mesh position={[0, 3.4, -3.2]} material={wallMat}>
        <planeGeometry args={[X * 2, 9]} />
      </mesh>
      <mesh position={[0, 2.35, -3.18]} material={mats.black}>
        <boxGeometry args={[X * 2, 0.35, 0.05]} />
      </mesh>
      {/* 천장과 조명 */}
      <mesh position={[0, CEIL_Y + 0.15, 3]} material={mats.ceiling}>
        <boxGeometry args={[X * 2, 0.3, 14]} />
      </mesh>
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} position={[-42 + i * 7, CEIL_Y - 0.04, 3.8]} material={mats.light}>
          <boxGeometry args={[3.2, 0.06, 0.3]} />
        </mesh>
      ))}
    </group>
  )
}

function Pillar({ x, A, children, z = 4.6, anim, frame = false }) {
  const g = useRef()
  const { mats, tex } = A
  const lower = useMemo(() => { const m = mats.tileW.clone(); m.map = tiled(tex.tileW, 1.0, 3.7); return m }, [mats, tex])
  const upper = useMemo(() => { const m = mats.tileB.clone(); m.map = tiled(tex.tileB, 1.0, CEIL_Y - 4.0); return m }, [mats, tex])
  useEffect(() => () => { lower.map.dispose(); upper.map.dispose(); lower.dispose(); upper.dispose() }, [lower, upper])
  useFrame(() => { if (frame && anim) g.current.position.x = x * (anim.portrait ? 1.5 : 1) })
  return (
    <group ref={g} position={[x, 0, z]}>
      <mesh position={[0, 1.85, 0]} material={lower}><boxGeometry args={[1, 3.7, 1]} /></mesh>
      <mesh position={[0, 3.85, 0]} material={mats.black}><boxGeometry args={[1.03, 0.3, 1.03]} /></mesh>
      <mesh position={[0, 4.0 + (CEIL_Y - 4.0) / 2, 0]} material={upper}><boxGeometry args={[1, CEIL_Y - 4.0, 1]} /></mesh>
      <mesh position={[0, 0.06, 0]} material={mats.black}><boxGeometry args={[1.08, 0.12, 1.08]} /></mesh>
      <mesh position={[0.1, 0.012, 0.75]} rotation={[-Math.PI / 2, 0, 0]} material={mats.blob}><planeGeometry args={[2.4, 1.8]} /></mesh>
      <mesh position={[0, 0.9, 0.508]} material={mats.ao}><planeGeometry args={[1, 1.5]} /></mesh>
      {children}
    </group>
  )
}

function StationSign({ A }) {
  const plane = useRef()
  return (
    <mesh ref={plane} position={[0, 2.3, 0.54]}>
      <planeGeometry args={[1.9, 0.633]} />
      <meshBasicMaterial map={A.pills.station} transparent />
    </mesh>
  )
}

function ConvexMirrors({ A }) {
  const rings = [[-0.22, 1.95, 0.5], [0.2, 1.45, 0.5], [-0.12, 0.98, 0.5]]
  return (
    <group position={[0, 0, 0.51]}>
      {rings.map(([x, y], i) => (
        <group key={i} position={[x, y, 0]}>
          <mesh material={A.mats.red}><circleGeometry args={[0.2, 24]} /></mesh>
          <mesh position={[0, 0, 0.004]} material={A.mats.mirror}><circleGeometry args={[0.16, 24]} /></mesh>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- 벤치(노란 플라스틱 의자)
class Soft extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

function Poster({ src, x, y, rot = 0, frame }) {
  const tex = useTexture(src)
  useMemo(() => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4 }, [tex])
  return (
    <group position={[x, y, -3.1]} rotation={[0, 0, rot]}>
      <mesh material={frame}><boxGeometry args={[2.2, 2.9, 0.08]} /></mesh>
      <mesh position={[0, 0, 0.045]}><planeGeometry args={[2.0, 2.7]} /><meshBasicMaterial map={tex} /></mesh>
    </group>
  )
}

function Bench({ A, x = 0, z = 5.4 }) {
  const { mats } = A
  return (
    <group position={[x, 0, z]}>
      {[-0.5, 0.5].map((sx) => (
        <group key={sx} position={[sx, 0, 0]}>
          <RoundedBox args={[0.86, 0.09, 0.8]} radius={0.04} smoothness={2} position={[0, 0.58, 0]} rotation={[0.05, 0, 0]} material={mats.yellow} />
          <RoundedBox args={[0.86, 0.5, 0.08]} radius={0.04} smoothness={2} position={[0, 0.92, -0.38]} rotation={[-0.2, 0, 0]} material={mats.yellow} />
        </group>
      ))}
      <mesh position={[0, 0.46, 0]} material={mats.black}><boxGeometry args={[2.2, 0.1, 0.12]} /></mesh>
      {[-0.95, 0.95].map((sx) => (
        <mesh key={sx} position={[sx, 0.22, 0]} material={mats.black}><boxGeometry args={[0.1, 0.46, 0.78]} /></mesh>
      ))}
      <mesh position={[0, 0.013, 0.1]} rotation={[-Math.PI / 2, 0, 0]} material={mats.blob}><planeGeometry args={[3.2, 1.8]} /></mesh>
    </group>
  )
}

function Cone({ A, x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.04, 0]} material={A.mats.black}><boxGeometry args={[0.6, 0.08, 0.6]} /></mesh>
      <mesh position={[0, 0.42, 0]} material={A.mats.black}><coneGeometry args={[0.24, 0.74, 20]} /></mesh>
      <mesh position={[0, 0.36, 0]} material={A.mats.white}><cylinderGeometry args={[0.15, 0.17, 0.12, 20]} /></mesh>
      <mesh position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]} material={A.mats.blob}><planeGeometry args={[1.4, 1.2]} /></mesh>
    </group>
  )
}

// ---------------------------------------------------------------- 전광판
function Board({ A, anim, active, focus }) {
  const tex = A.tex.board
  const key = useRef('')
  useFrame(() => {
    const idx = Math.max(0, ROOM_STATIONS.findIndex((s) => s.id === (focus || active)))
    const blink = anim.live ? Math.floor(anim.t * 1.4) % 2 : 1
    const k = `${anim.phase}:${idx}:${blink}`
    if (k === key.current) return
    key.current = k
    const boarding = ROOM_STATIONS[idx]
    const next = ROOM_STATIONS[(idx + 1) % ROOM_STATIONS.length]
    try { T.drawBoard(tex, A.P, { phase: anim.phase, boarding, next, blink }) } catch { /* 글꼴 지연 등으로 실패해도 다음 프레임에 다시 그린다 */ key.current = '' }
  })
  return (
    <group position={[0, 5.55, 3.2]}>
      <mesh material={A.mats.black}><boxGeometry args={[5.2, 1.4, 0.3]} /></mesh>
      <mesh position={[0, 0, 0.16]} material={A.mats.board}><planeGeometry args={[4.9, 1.1]} /></mesh>
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, (CEIL_Y - 5.55) / 2 + 0.35, 0]} material={A.mats.steelDark}><boxGeometry args={[0.07, CEIL_Y - 5.55 - 0.2, 0.07]} /></mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- 열차
function bodyGeometry() {
  // 단면(z, y)을 만들어 x축 방향으로 밀어낸다. 둥근 지붕.
  const w = 1.5
  const h = 3.5
  const r = 0.9
  const s = new THREE.Shape()
  s.moveTo(-w, 0)
  s.lineTo(w, 0)
  s.lineTo(w, h - r)
  s.quadraticCurveTo(w, h, w - r, h)
  s.lineTo(-w + r, h)
  s.quadraticCurveTo(-w, h, -w, h - r)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: TRAIN_LEN_HALF * 2, bevelEnabled: false, curveSegments: 6 })
  g.rotateY(Math.PI / 2)
  g.translate(-TRAIN_LEN_HALF, 0, 0)
  return g
}

function noseGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.lineTo(2.0, 0)
  s.quadraticCurveTo(2.5, 0.2, 2.35, 1.3)
  s.quadraticCurveTo(1.9, 3.0, 0.9, 3.5)
  s.lineTo(0, 3.5)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: 3, bevelEnabled: false, curveSegments: 8 })
  g.translate(0, 0, -1.5)
  g.translate(TRAIN_LEN_HALF - 0.01, 0, 0)
  return g
}

function Windows({ A }) {
  const ref = useRef()
  const mark = useRef()
  const n = (DOORS - 1) * 2
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let k = 0
    for (let b = 0; b < DOORS - 1; b++) {
      const cx = (b - (DOORS - 1) / 2 + 0.5) * PITCH
      for (const o of [-0.58, 0.58]) { m.makeTranslation(cx + o, 2.0, TRAIN_FRONT_Z + 0.012); ref.current.setMatrixAt(k++, m) }
      m.makeTranslation(cx, 1.12, TRAIN_FRONT_Z + 0.014)
      mark.current.setMatrixAt(b, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
    mark.current.instanceMatrix.needsUpdate = true
  }, [])
  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} material={A.mats.glass} frustumCulled={false}>
        <planeGeometry args={[0.98, 1.1]} />
      </instancedMesh>
      <instancedMesh ref={mark} args={[undefined, undefined, DOORS - 1]} material={A.mats.mark} frustumCulled={false}>
        <planeGeometry args={[0.66, 0.5]} />
      </instancedMesh>
    </>
  )
}

function Door({ i, A, anim, onSelect, interactive, hover, activeId, focusId }) {
  const x = i * PITCH
  const roomIdx = Math.round(i + (ROOMS - 1) / 2)
  const room = roomIdx >= 0 && roomIdx < ROOMS ? A.pills.doors[roomIdx] : null
  const left = useRef()
  const right = useRef()
  const badge = useRef()
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: A.P.interior }), [A.P])
  const spillMat = useMemo(() => (room ? new THREE.MeshBasicMaterial({ map: A.tex.spill, color: room.accent, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }) : null), [A, room])
  const ledMat = useMemo(() => (room ? new THREE.MeshBasicMaterial({ color: A.P.steelDark }) : null), [A.P, room])
  const tmp = useMemo(() => new THREE.Color(), [])
  const boost = useRef(0)
  useEffect(() => () => { glowMat.dispose(); spillMat?.dispose(); ledMat?.dispose() }, [glowMat, spillMat, ledMat])
  useFrame((_, dt) => {
    const sx = 1 - 0.86 * anim.open
    left.current.scale.x = sx
    right.current.scale.x = sx
    if (room) {
      const isOn = hover.current === room.s.id || activeId === room.s.id || focusId === room.s.id
      const target = isOn ? 1 : 0
      boost.current = damp(boost.current, target, 10, Math.min(dt, 0.05))
      if (Math.abs(boost.current - target) > 0.01) anim.hoverAnim = true
      const g = anim.glow[roomIdx]
      tmp.copy(A.P.interior).lerp(room.accent, Math.min(1, g * (0.9 + 0.1 * boost.current)))
      glowMat.color.copy(tmp)
      ledMat.color.copy(A.P.steelDark).lerp(room.accent, g)
      spillMat.opacity = g * anim.open * (0.55 + 0.4 * boost.current)
      const sc = smooth((anim.p - 0.78 - roomIdx * 0.02) / 0.08) * (1 + 0.16 * boost.current)
      badge.current.scale.setScalar(Math.max(0.0001, sc))
      badge.current.position.y = 3.05 + 0.1 * boost.current
    }
  })
  return (
    <group position={[x, 0, TRAIN_FRONT_Z]}>
      {/* 개구부 안쪽: 노선 색 빛과 가장자리 어둠(깊이감) */}
      <mesh position={[0, 1.18, 0.006]} material={glowMat}><planeGeometry args={[1.5, 2.2]} /></mesh>
      <mesh position={[0, 1.18, 0.012]} material={A.mats.recess}><planeGeometry args={[1.5, 2.2]} /></mesh>
      {room && <mesh position={[0, 2.56, 0.09]} material={ledMat}><boxGeometry args={[0.7, 0.07, 0.04]} /></mesh>}
      {/* 문짝 둘: 바깥 모서리에서 접히듯 열린다. 창은 텍스처에 구워 한 번에 그린다 */}
      <mesh ref={left} position={[-0.75, 1.18, 0.03]} material={A.mats.leaf} geometry={A.leafL} />
      <mesh ref={right} position={[0.75, 1.18, 0.03]} material={A.mats.leaf} geometry={A.leafR} />
      {room && <mesh position={[0, 0.03, 1.3]} rotation={[-Math.PI / 2, 0, 0]} material={spillMat}><planeGeometry args={[1.9, 2.6]} /></mesh>}
      {room && (
        <mesh ref={badge} position={[0, 3.05, 0.03]} scale={0.0001}>
          <planeGeometry args={[1.5, 0.56]} />
          <meshBasicMaterial map={room.tex} transparent depthWrite={false} />
        </mesh>
      )}
      {room && interactive && (
        <mesh
          position={[0, 1.55, 0.12]}
          onClick={(e) => { e.stopPropagation(); if (anim.open > 0.15 || anim.p >= 0.99) onSelect?.(room.s.id) }}
          onPointerOver={(e) => { e.stopPropagation(); hover.current = room.s.id; anim.hoverAnim = true; document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { if (hover.current === room.s.id) hover.current = null; anim.hoverAnim = true; document.body.style.cursor = '' }}
        >
          <planeGeometry args={[2.2, 3.7]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

function Train({ A, anim, onSelect, interactive, hover, activeId, focusId }) {
  const group = useRef()
  const body = useMemo(bodyGeometry, [])
  const nose = useMemo(noseGeometry, [])
  const doors = useMemo(() => Array.from({ length: DOORS }, (_, k) => k - (DOORS - 1) / 2), [])
  useEffect(() => () => { body.dispose(); nose.dispose() }, [body, nose])
  const frames = useMemo(() => {
    const top = []
    const sides = []
    const sill = []
    for (const d of doors) {
      const x = d * PITCH
      top.push(new THREE.BoxGeometry(1.66, 0.14, 0.08).translate(x, 2.34, TRAIN_FRONT_Z + 0.04))
      for (const fx of [-0.8, 0.8]) sides.push(new THREE.BoxGeometry(0.1, 2.34, 0.08).translate(x + fx, 1.18, TRAIN_FRONT_Z + 0.04))
      sill.push(new THREE.BoxGeometry(1.5, 0.08, 0.08).translate(x, 0.04, TRAIN_FRONT_Z + 0.04))
    }
    const steel = mergeGeometries([...top, ...sides])
    const dark = mergeGeometries(sill)
    const wheels = []
    for (let k = 0; k < 4; k++) for (const wx of [-1.0, 1.0]) wheels.push(new THREE.CylinderGeometry(0.28, 0.28, 2.0, 12).rotateX(Math.PI / 2).translate((k - 1.5) * 2 * PITCH + wx * 0.9, -0.9, 0.1))
    const bogies = mergeGeometries(wheels)
    ;[...top, ...sides, ...sill, ...wheels].forEach((g) => g.dispose())
    return { steel, dark, bogies }
  }, [doors])
  useEffect(() => () => { frames.steel.dispose(); frames.dark.dispose(); frames.bogies.dispose() }, [frames])
  const sparkA = useRef()
  const sparkB = useRef()
  useFrame(() => {
    const g = group.current
    if (anim.live) A.tex.glass.offset.x = (anim.t * 0.018) % 1
    const jitter = anim.brake * Math.sin(anim.t * 70) * 0.004
    g.position.set(anim.trainX, jitter, -0.35)
    g.rotation.z = -0.006 * anim.brake
    const s = anim.brake * (anim.speed > 0.02 ? 1 : 0)
    ;[sparkA, sparkB].forEach((r, n) => { if (r.current) { r.current.visible = s > 0.2 && Math.sin(anim.t * 40 + n * 2) > -0.2; r.current.scale.setScalar(0.4 + 0.4 * Math.abs(Math.sin(anim.t * 55 + n))) } })
  })
  return (
    <group ref={group}>
      <mesh geometry={body} material={A.mats.body} />
      <mesh geometry={nose} material={A.mats.body} />
      {/* 차대와 대차 */}
      <mesh position={[0, -0.34, 0.1]} material={A.mats.under}><boxGeometry args={[TRAIN_LEN_HALF * 2 + 2.4, 0.6, 2.3]} /></mesh>
      <mesh geometry={frames.bogies} material={A.mats.steelDark} />
      <mesh geometry={frames.steel} material={A.mats.steel} />
      <mesh geometry={frames.dark} material={A.mats.steelDark} />
      {/* 황리단 노란 줄무늬와 검정 가는 줄 */}
      <mesh position={[0, 0.72, TRAIN_FRONT_Z + 0.004]} material={A.mats.stripe}><planeGeometry args={[TRAIN_LEN_HALF * 2, 0.3]} /></mesh>
      <mesh position={[0, 0.5, TRAIN_FRONT_Z + 0.005]} material={A.mats.stripeDark}><planeGeometry args={[TRAIN_LEN_HALF * 2, 0.05]} /></mesh>
      <mesh position={[0, 2.85, TRAIN_FRONT_Z + 0.004]} material={A.mats.stripe}><planeGeometry args={[TRAIN_LEN_HALF * 2, 0.06]} /></mesh>
      {/* 선두 측창과 헤드라이트 */}
      <mesh position={[TRAIN_LEN_HALF + 1.15, 1.95, TRAIN_FRONT_Z + 0.35]} material={A.mats.glass}><planeGeometry args={[1.1, 1.0]} /></mesh>
      <mesh position={[TRAIN_LEN_HALF + 2.34, 0.9, 0.95]} material={A.mats.light}><boxGeometry args={[0.1, 0.22, 0.4]} /></mesh>
      <mesh position={[TRAIN_LEN_HALF + 2.34, 0.9, -0.95]} material={A.mats.light}><boxGeometry args={[0.1, 0.22, 0.4]} /></mesh>
      <Windows A={A} />
      {[-1.5, -0.5, 0.5, 1.5].map((k) => (
        <mesh key={k} position={[k * PITCH, 3.62, -0.1]} material={A.mats.steel}><boxGeometry args={[2.0, 0.22, 1.2]} /></mesh>
      ))}
      {doors.map((d) => (
        <Door key={d} i={d} A={A} anim={anim} onSelect={onSelect} interactive={interactive} hover={hover} activeId={activeId} focusId={focusId} />
      ))}
      {/* 제동 불꽃 */}
      <mesh ref={sparkA} position={[-3 * PITCH + 0.9 - 0.5 * PITCH, -0.75, 1.3]} visible={false}><planeGeometry args={[0.5, 0.5]} /><meshBasicMaterial color={A.P['yellow-hover']} transparent opacity={0.9} /></mesh>
      <mesh ref={sparkB} position={[1.5 * PITCH + 0.4, -0.75, 1.3]} visible={false}><planeGeometry args={[0.4, 0.4]} /><meshBasicMaterial color={A.P.yellow} transparent opacity={0.9} /></mesh>
      <mesh position={[0, -1.18, 0.9]} rotation={[-Math.PI / 2, 0, 0]} material={A.mats.blob}><planeGeometry args={[TRAIN_LEN_HALF * 2 + 6, 4.4]} /></mesh>
    </group>
  )
}

// ---------------------------------------------------------------- 조립
function World({ A, anim, props }) {
  const hover = useRef(null)
  const { interactive, activeRoom, focusRoom, onSelectRoom } = props
  const select = (id) => onSelectRoom?.(id)
  return (
    <>
      <color attach="background" args={[A.P.bg]} />
      <fog attach="fog" args={[A.P.bg, 42, 80]} />
      <hemisphereLight args={[A.P.white, A.P['bg-raised'], 1.0]} />
      <directionalLight position={[6, 12, 14]} intensity={1.15} color={A.P.white} />
      <directionalLight position={[-10, 4, 6]} intensity={0.3} color={A.P.white} />
      <Platform A={A} anim={anim} />
      {[-36.4, -22.4, 22.4, 36.4].map((x) => <Pillar key={x} x={x} A={A} />)}
      <Pillar x={-7.6} A={A} anim={anim} frame><StationSign A={A} /></Pillar>
      <Pillar x={7.6} A={A} anim={anim} frame><ConvexMirrors A={A} /></Pillar>
      {A.tier !== 'low' && (
      <Soft><Suspense fallback={null}>
        <Poster src="/img/team/shot-1.jpg" x={-5.6} y={5.5} rot={0.03} frame={A.mats.black} />
        <Poster src="/img/team/shot-3.jpg" x={5.6} y={5.5} rot={-0.025} frame={A.mats.black} />
      </Suspense></Soft>
      )}
      <Bench A={A} />
      <Cone A={A} x={5.4} z={5.6} />
      <Cone A={A} x={-5.6} z={6.4} />
      <Board A={A} anim={anim} active={activeRoom} focus={focusRoom} />
      <Train A={A} anim={anim} onSelect={select} interactive={interactive} hover={hover} activeId={activeRoom} focusId={focusRoom} />
    </>
  )
}

export default function PlatformCanvas({ progress = 1, interactive = true, activeRoom = null, focusRoom = null, onSelectRoom, quality = 'auto', active = true, still = false, onReady, onError, onLost, onRestored }) {
  const fontsReady = useFontsReady()
  const tier = useMemo(() => (quality === 'low' ? 'low' : deviceTier()), [quality])
  const cap = quality === 'medium' ? 1.5 : quality === 'high' ? 2 : quality === 'low' ? 1 : tier === 'low' ? 1 : tier === 'mid' ? 1.5 : 2
  const maxDpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, cap)
  const floorDpr = tier === 'low' ? 0.75 : 1
  const [dpr, setDpr] = useState(maxDpr)
  const anim = useMemo(() => ({ p: 0, trainX: START_X, brake: 0, speed: 1, open: 0, glow: Array.from({ length: ROOMS }, () => 0), t: 0, phase: 0, px: 0, py: 0, cx: 0, cy: 0, focusX: undefined, el: null, hoverAnim: false, live: false }), [])
  const props = { progress, interactive, activeRoom, focusRoom, onSelectRoom, active, still }
  useEffect(() => { anim.p = still ? 1 : anim.p }, [still, anim])
  useEffect(() => () => { if (typeof document !== 'undefined') document.body.style.cursor = '' }, [])
  return (
    <div ref={(el) => { anim.el = el }} style={{ position: 'absolute', inset: 0 }}>
      <Canvas
        frameloop="demand"
        flat
        dpr={dpr}
        camera={{ fov: 30, near: 0.5, far: 140, position: [0, 5.0, 24] }}
        gl={{ antialias: tier !== 'low', powerPreference: tier === 'low' ? 'default' : 'high-performance', alpha: false, stencil: false, failIfMajorPerformanceCaveat: !softwareOk() }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        onCreated={({ gl, invalidate, scene, camera }) => {
          if (typeof window !== 'undefined' && window.__UE_SCENES_DEBUG__) {
            window.__ueGl = gl
            window.__ueShot = () => { gl.render(scene, camera); return gl.domElement.toDataURL('image/jpeg', 0.82) }
          }
          const el = gl.domElement
          // 컨텍스트가 사라지면 포스터를 보이고, 복원되면 다시 그린다.
          el.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost?.() })
          el.addEventListener('webglcontextrestored', () => { onRestored?.(); invalidate() })
        }}
      >
        <SceneInner fontsReady={fontsReady} tier={tier} anim={anim} props={props} onReady={onReady} onError={onError} setDpr={setDpr} maxDpr={maxDpr} floorDpr={floorDpr} />
      </Canvas>
    </div>
  )
}

function SceneInner({ fontsReady, tier, anim, props, onReady, onError, setDpr, maxDpr, floorDpr }) {
  const A = useAssets(fontsReady, tier)
  return (
    <>
      <Animator anim={anim} props={props} onReady={onReady} onError={onError} />
      <Ticker active={props.active && !props.still} fps={tier === 'low' ? 30 : tier === 'mid' ? 40 : 60} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(floorDpr, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
      />
      <World A={A} anim={anim} props={props} />
    </>
  )
}
