// buildingsLayer.js: MapLibre 사용자 정의 레이어(three.js)로 황리단길 건물 압출과 가게 신호탑(노랑 빛기둥)을 그린다.
// miri의 barsLayer.js 방식: MapLibre의 WebGL 컨텍스트를 three.js 렌더러가 빌려 쓰고, 원점 기준 미터 좌표를 MercatorCoordinate 행렬로 맞춘다.
// 건물은 전부 한 BufferGeometry(한 번의 draw call)이고 법선은 프래그먼트 셰이더가 미분으로 구한다(꼭짓점 속성을 줄여 모바일에서 가볍다).
// 색은 팔레트 토큰에서 온 sRGB 값을 그대로 uniform으로 넣는다(three의 색 관리를 거치지 않는다).
import {
  BufferGeometry, CylinderGeometry, DoubleSide, GreaterDepth, Float32BufferAttribute, Matrix4, Mesh, OctahedronGeometry, PerspectiveCamera,
  RingGeometry, Group, PlaneGeometry, Scene, ShaderMaterial, ShapeUtils, Uint32BufferAttribute, Vector2, Vector3, Vector4, WebGLRenderer, AdditiveBlending,
} from 'three'
import { to01, themeColors } from './palette.js'
import { toLocal } from './shop.js'

export const FLOOR_M = 3.2
export const DEFAULT_H = FLOOR_M * 2 // OSM에 높이 태그가 없는 건물의 예시 높이(2층)
export const BEAM_H = 90 // 신호탑 높이(m)

const BUILD_VS = `
attribute vec3 aInfo; // x: 높이(m), y: 색 변화(0~1), z: 1이면 가게 건물
uniform float uGrow;
varying vec3 vPos;
varying vec3 vInfo;
varying float vScale;
void main() {
  vec3 p = position;
  float d = length(p.xy);
  // 가게에서 바깥으로 퍼지는 솟아오름. 140m 띠 안에서 0에서 1로 자란다.
  float k = clamp((uGrow * 1000.0 - d) / 140.0, 0.0, 1.0);
  k = 1.0 - pow(1.0 - k, 3.0);
  // 반경 끝(470m 이후)에서는 낮아져 경계가 보이지 않는다.
  float edge = 1.0 - smoothstep(470.0, 620.0, d);
  float s = k * edge;
  p.z *= s;
  vScale = s;
  vInfo = aInfo;
  vPos = p;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`
const BUILD_FS = `
uniform vec3 uWall;
uniform vec3 uRoof;
uniform vec3 uShopWall;
uniform vec3 uShopRoof;
uniform float uDark;
varying vec3 vPos;
varying vec3 vInfo;
varying float vScale;
void main() {
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  float roof = step(0.6, abs(n.z));
  vec3 L = normalize(vec3(-0.55, 0.45, 0.72));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float h = max(vInfo.x * vScale, 0.01);
  float r = clamp(vPos.z / h, 0.0, 1.0);
  vec3 wall = mix(uWall, uShopWall, vInfo.z);
  vec3 top = mix(uRoof, uShopRoof, vInfo.z);
  vec3 base = mix(wall, top, roof);
  float tint = 0.93 + 0.14 * vInfo.y;
  float amb = mix(0.74, 0.5, uDark);
  float lit = amb + mix(0.3, 0.62, uDark) * diff;
  float grad = mix(mix(0.78, 1.0, r), 1.0, roof);
  vec3 c = base * lit * grad * tint;
  // 윗단 테두리 하이라이트: 벽 위 0.6m를 밝게 해 윤곽을 읽게 한다
  float lip = (1.0 - roof) * smoothstep(0.88, 1.0, r) * 0.22;
  c = mix(c, vec3(1.0), lip * mix(0.5, 0.35, uDark) * (1.0 - vInfo.z * 0.5));
  gl_FragColor = vec4(min(c, vec3(1.0)), 1.0);
}`
const BEAM_VS = `
uniform float uGrow;
uniform float uH;
varying float vH;
varying vec3 vN;
void main() {
  vec3 p = position;
  p.z *= uGrow;
  vH = clamp(position.z / uH, 0.0, 1.0);
  vN = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`
const BEAM_FS = `
uniform vec3 uColor;
uniform float uPulse;
uniform float uAlpha;
varying float vH;
varying vec3 vN;
void main() {
  float a = pow(1.0 - vH, 1.35) * uAlpha * (0.8 + 0.2 * uPulse);
  gl_FragColor = vec4(uColor, a);
}`
const FLAT_VS = `
attribute float aS;
uniform float uGrow;
varying float vS;
void main() {
  vec3 p = position;
  p.z *= uGrow;
  vS = aS;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`
const FLAT_FS = `
uniform vec3 uColor;
uniform float uAlpha;
uniform float uReveal; // 이 거리(m)보다 먼 부분은 그리지 않는다(내 경로가 뻗어 나가는 연출)
uniform float uGlow;   // 1이면 뻗는 끝(머리) 근처를 밝게 한다
varying float vS;
void main() {
  if (vS > uReveal) discard;
  float g = uGlow * smoothstep(46.0, 0.0, uReveal - vS);
  vec3 c = mix(uColor, vec3(1.0), g * 0.75);
  gl_FragColor = vec4(c, uAlpha);
}`
const GLOW_VS = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const GLOW_FS = `
uniform vec3 uColor;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  float a = pow(clamp(1.0 - r, 0.0, 1.0), 2.2) * uAlpha;
  float core = smoothstep(0.22, 0.0, r) * uAlpha;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core), a + core);
}`

// 건물 지오메트리. data는 baked buildings.json. 좌표는 정수 데시미터(원점 기준, x 동쪽, y 북쪽).
export function buildBuildingGeometry(data) {
  const pos = []
  const info = []
  const idx = []
  let v = 0
  const unit = data.unit === 'dm' ? 0.1 : 1
  for (const b of data.buildings) {
    const m = b.p.length / 2
    if (m < 3) continue
    const h = b.h ?? (b.l ? b.l * FLOOR_M : DEFAULT_H)
    const tint = ((b.id * 2654435761) >>> 0) / 4294967295
    const kind = b.id === data.shopBuilding ? 1 : 0
    const ring = []
    for (let i = 0; i < m; i++) ring.push([b.p[i * 2] * unit, b.p[i * 2 + 1] * unit])
    // 벽: 모서리마다 사각형 하나
    for (let i = 0; i < m; i++) {
      const [x0, y0] = ring[i]
      const [x1, y1] = ring[(i + 1) % m]
      pos.push(x0, y0, 0, x1, y1, 0, x1, y1, h, x0, y0, h)
      for (let k = 0; k < 4; k++) info.push(h, tint, kind)
      idx.push(v, v + 1, v + 2, v, v + 2, v + 3)
      v += 4
    }
    // 지붕
    const contour = ring.map(([x, y]) => new Vector2(x, y))
    const tri = ShapeUtils.triangulateShape(contour, [])
    const roofStart = v
    for (const [x, y] of ring) { pos.push(x, y, h); info.push(h, tint, kind) }
    v += m
    for (const t of tri) idx.push(roofStart + t[0], roofStart + t[1], roofStart + t[2])
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('aInfo', new Float32BufferAttribute(info, 3))
  g.setIndex(new Uint32BufferAttribute(idx, 1))
  return g
}

// 경로 리본: 선을 폭 있는 띠(사각형 + 꼭짓점 원판)로 만든다. 건물에 가려도 읽히도록 일반 패스와 "가려진 부분" 패스를 둘 다 그린다.
export function buildRibbonGeometry(pts, halfW, z) {
  const pos = []
  const idx = []
  const aS = []
  let v = 0
  let acc = 0
  const cum = [0]
  for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(acc) }
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i]
    const dx = bx - ax, dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    const nx = (-dy / len) * halfW, ny = (dx / len) * halfW
    pos.push(ax + nx, ay + ny, z, ax - nx, ay - ny, z, bx - nx, by - ny, z, bx + nx, by + ny, z)
    aS.push(cum[i - 1], cum[i - 1], cum[i], cum[i])
    idx.push(v, v + 1, v + 2, v, v + 2, v + 3)
    v += 4
  }
  pts.forEach(([x, y], i) => {
    const c = v
    pos.push(x, y, z)
    aS.push(cum[i])
    v++
    const N = 18
    for (let k = 0; k < N; k++) { const a = (k / N) * Math.PI * 2; pos.push(x + Math.cos(a) * halfW, y + Math.sin(a) * halfW, z); aS.push(cum[i]); v++ }
    for (let k = 0; k < N; k++) idx.push(c, c + 1 + k, c + 1 + ((k + 1) % N))
  })
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('aS', new Float32BufferAttribute(aS, 1))
  g.setIndex(new Uint32BufferAttribute(idx, 1))
  g.userData.total = acc
  g.userData.cum = cum
  return g
}
export function buildDiscGeometry(pts, r, z) {
  const pos = []
  const idx = []
  let v = 0
  for (const [x, y] of pts) {
    const c = v
    pos.push(x, y, z)
    v++
    const N = 28
    for (let k = 0; k < N; k++) { const a = (k / N) * Math.PI * 2; pos.push(x + Math.cos(a) * r, y + Math.sin(a) * r, z); v++ }
    for (let k = 0; k < N; k++) idx.push(c, c + 1 + k, c + 1 + ((k + 1) % N))
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setIndex(new Uint32BufferAttribute(idx, 1))
  return g
}

export function createBuildingsLayer({ id, MercatorCoordinate, origin, data, route, theme, reducedMotion, onFrame }) {
  const originMc = MercatorCoordinate.fromLngLat(origin, 0)
  const s = originMc.meterInMercatorCoordinateUnits()
  const local = new Matrix4().makeTranslation(originMc.x, originMc.y, originMc.z).scale(new Vector3(s, -s, s))

  let map = null, renderer = null, scene = null, camera = null
  let bGeo = null, bMat = null, ringMesh = null, ringMesh2 = null, capMesh = null
  const mats = []
  const routeMats = [] // { mat, role, ghost }
  let routeOn = true, routeAlpha = 0, beaconK = 1
  // 내 위치 경로(me): 리본 두 겹 + 머리 광채 + 도착 섬광
  let beacon = null
  let meGroup = null, meGlow = null, meCoreMesh = null, burst = null
  const meMats = []
  let meLine = null, meTotal = 0, meCum = null, meProg = 0, meVisible = false, flareT = 0
  let grow = 0, growTarget = 0, lastT = 0, active = true, tick = null
  let curTheme = theme
  let reduced = !!reducedMotion

  const col = (c) => new Vector3(...to01(c))
  const applyColors = () => {
    if (!bMat) return
    const c = themeColors(curTheme)
    bMat.uniforms.uWall.value.copy(col(c.wall))
    bMat.uniforms.uRoof.value.copy(col(c.roof))
    bMat.uniforms.uShopWall.value.copy(col(c.yellow))
    bMat.uniforms.uShopRoof.value.copy(col(c.yellowHi))
    bMat.uniforms.uDark.value = c.dark ? 1 : 0
    for (const m of mats) m.uniforms.uColor.value.copy(col(c.yellowHi))
    for (const r of meMats) r.mat.uniforms.uColor.value.copy(col(r.role === 'casing' ? c.lineCase : c.routeLine))
    if (meGlow) meGlow.material.uniforms.uColor.value.copy(col(c.yellowHi))
    if (burst) burst.material.uniforms.uColor.value.copy(col(c.yellowHi))
    for (const r of routeMats) {
      const map_ = { casing: c.lineCase, line: c.routeLine, ring: c.stationRing, dot: c.stationFill }
      r.mat.uniforms.uColor.value.copy(col(map_[r.role]))
    }
  }

  // 내 경로 위에서 시작점으로부터 거리 d(m)에 있는 점
  function headAt(d) {
    if (!meLine || !meCum) return [0, 0]
    let i = 1
    while (i < meCum.length - 1 && meCum[i] < d) i++
    const t = Math.max(0, Math.min(1, (d - meCum[i - 1]) / ((meCum[i] - meCum[i - 1]) || 1)))
    return [meLine[i - 1][0] + (meLine[i][0] - meLine[i - 1][0]) * t, meLine[i - 1][1] + (meLine[i][1] - meLine[i - 1][1]) * t]
  }

  function schedulePulse() {
    if (tick || reduced || !active || grow < 0.05) return
    tick = setTimeout(() => { tick = null; if (active && map && grow >= 0.05) map.triggerRepaint() }, 40) // 약 25fps. 모바일 부담을 줄인다
  }

  const layer = {
    id,
    type: 'custom',
    renderingMode: '3d',
    onAdd(m, gl) {
      map = m
      camera = new PerspectiveCamera()
      scene = new Scene()
      renderer = new WebGLRenderer({ canvas: m.getCanvas(), context: gl, antialias: false })
      renderer.autoClear = false
      bGeo = buildBuildingGeometry(data)
      const c = themeColors(curTheme)
      bMat = new ShaderMaterial({
        vertexShader: BUILD_VS, fragmentShader: BUILD_FS, side: DoubleSide,
        uniforms: { uGrow: { value: grow }, uWall: { value: col(c.wall) }, uRoof: { value: col(c.roof) }, uShopWall: { value: col(c.yellow) }, uShopRoof: { value: col(c.yellowHi) }, uDark: { value: c.dark ? 1 : 0 } },
      })
      const bm = new Mesh(bGeo, bMat)
      bm.frustumCulled = false
      scene.add(bm)

      // 신호탑: 가운데 심지 + 위로 옅어지는 빛기둥 + 바닥 파동 + 꼭대기 마름모
      const flat = (extra = {}) => {
        const mt = new ShaderMaterial({ vertexShader: FLAT_VS, fragmentShader: FLAT_FS, transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms: { uGrow: { value: grow }, uColor: { value: col(c.yellowHi) }, uAlpha: { value: 1 }, uReveal: { value: 1e9 }, uGlow: { value: 0 }, ...extra } })
        mats.push(mt)
        return mt
      }
      const coreGeo = new CylinderGeometry(0.55, 0.55, BEAM_H, 8, 1, true)
      coreGeo.rotateX(Math.PI / 2)
      coreGeo.translate(0, 0, BEAM_H / 2)
      const core = new Mesh(coreGeo, flat())
      const beamGeo = new CylinderGeometry(3.2, 7.5, BEAM_H, 28, 1, true)
      beamGeo.rotateX(Math.PI / 2)
      beamGeo.translate(0, 0, BEAM_H / 2)
      const beamMat = new ShaderMaterial({ vertexShader: BEAM_VS, fragmentShader: BEAM_FS, transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, uniforms: { uGrow: { value: grow }, uH: { value: BEAM_H }, uColor: { value: col(c.yellowHi) }, uPulse: { value: 1 }, uAlpha: { value: 0.6 } } })
      mats.push(beamMat)
      const beam = new Mesh(beamGeo, beamMat)
      const ringGeo = new RingGeometry(0.86, 1, 64)
      ringMesh = new Mesh(ringGeo, flat())
      ringMesh2 = new Mesh(ringGeo, flat())
      ringMesh.position.z = 0.4
      ringMesh2.position.z = 0.4
      const capGeo = new OctahedronGeometry(2.6, 0)
      capGeo.scale(1, 1, 1.5)
      capMesh = new Mesh(capGeo, flat())
      capMesh.position.z = BEAM_H + 3
      // 신호탑은 묶음으로 두어 멀리서 볼 때 같이 커진다(줌이 낮을수록 더 크게 그려 항상 보이게 한다)
      beacon = new Group()
      for (const o of [core, beam, ringMesh, ringMesh2, capMesh]) { o.frustumCulled = false; o.renderOrder = 2; beacon.add(o) }
      scene.add(beacon)
      layer._beamMat = beamMat
      // 경로 리본과 정거장 점(3D에서만). 가려진 부분은 옅게 비쳐 보인다.
      const lp = route.line.map(([lng, lat]) => toLocal(lng, lat))
      const sp = route.stations.map(([lng, lat]) => toLocal(lng, lat))
      const mk = (geo, role, ghost, order) => {
        const params = {
          vertexShader: FLAT_VS, fragmentShader: FLAT_FS, transparent: true, depthWrite: false, side: DoubleSide,
          uniforms: { uGrow: { value: 1 }, uColor: { value: col(c.yellowHi) }, uAlpha: { value: 0 }, uReveal: { value: 1e9 }, uGlow: { value: 0 } },
        }
        if (ghost) params.depthFunc = GreaterDepth
        const mt = new ShaderMaterial(params)
        routeMats.push({ mat: mt, role, ghost })
        const me = new Mesh(geo, mt)
        me.frustumCulled = false
        me.renderOrder = order
        scene.add(me)
      }
      const gCase = buildRibbonGeometry(lp, 3.6, 0.6)
      const gLine = buildRibbonGeometry(lp, 2.2, 0.7)
      const gRing = buildDiscGeometry(sp, 4.2, 0.8)
      const gDot = buildDiscGeometry(sp, 2.6, 0.9)
      for (const ghost of [false, true]) {
        mk(gCase, 'casing', ghost, 3)
        mk(gLine, 'line', ghost, 4)
        mk(gRing, 'ring', ghost, 5)
        mk(gDot, 'dot', ghost, 6)
      }
      // 내 위치 경로용 묶음, 머리 광채, 도착 섬광 고리
      meGroup = new Group()
      scene.add(meGroup)
      const gp = new PlaneGeometry(1, 1)
      meGlow = new Mesh(gp, new ShaderMaterial({ vertexShader: GLOW_VS, fragmentShader: GLOW_FS, transparent: true, depthWrite: false, depthTest: false, blending: AdditiveBlending, uniforms: { uColor: { value: col(c.yellowHi) }, uAlpha: { value: 0 } } }))
      meGlow.position.z = 2.5
      meGlow.renderOrder = 8
      meGlow.frustumCulled = false
      meGlow.visible = false
      scene.add(meGlow)
      burst = new Mesh(new RingGeometry(0.9, 1, 64), new ShaderMaterial({ vertexShader: FLAT_VS, fragmentShader: FLAT_FS, transparent: true, depthWrite: false, blending: AdditiveBlending, uniforms: { uGrow: { value: 1 }, uColor: { value: col(c.yellowHi) }, uAlpha: { value: 0 }, uReveal: { value: 1e9 }, uGlow: { value: 0 } } }))
      burst.position.z = 0.6
      burst.renderOrder = 7
      burst.frustumCulled = false
      scene.add(burst)
      applyColors()
      m.triggerRepaint()
    },
    onRemove() {
      // 스타일 교체나 지도 제거 때 불린다.
      if (tick) clearTimeout(tick)
      tick = null
      bGeo?.dispose(); bMat?.dispose()
      for (const m of mats) m.dispose()
      for (const r of routeMats) r.mat.dispose()
      for (const r of meMats) r.mat.dispose()
      meGlow?.material.dispose(); burst?.material.dispose()
      mats.length = 0
      routeMats.length = 0
      meMats.length = 0
      meGroup = null; meGlow = null; burst = null; meLine = null
      scene?.traverse((o) => { o.geometry?.dispose?.() })
      renderer?.dispose()
      renderer = null; scene = null; camera = null
    },
    render(gl, args) {
      if (!renderer || !scene) return
      const main = args?.defaultProjectionData?.mainMatrix || args?.modelViewProjectionMatrix
      if (!main) return
      const now = performance.now()
      const dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0.016
      lastT = now
      let moving = false
      if (reduced) grow = growTarget
      else if (Math.abs(growTarget - grow) > 0.002) {
        // 올라올 때는 1.1초 안팎, 내려갈 때는 더 빠르게
        const speed = growTarget > grow ? 0.95 : 2.2
        grow += Math.sign(growTarget - grow) * Math.min(Math.abs(growTarget - grow), dt * speed)
        moving = true
      } else grow = growTarget
      const full = new Matrix4().fromArray(main).multiply(local)
      camera.projectionMatrix.copy(full)
      camera.projectionMatrixInverse.copy(full).invert()
      if (grow > 0.001) {
        const bz = map.getZoom()
        beaconK = Math.max(1, Math.min(4.5, 2 ** (17.4 - bz)))
        beacon.scale.setScalar(beaconK)
        const t = now / 1000
        const beamGrow = Math.min(1, Math.max(0, (grow - 0.15) / 0.55))
        bMat.uniforms.uGrow.value = grow
        for (const m of mats) m.uniforms.uGrow.value = beamGrow
        layer._beamMat.uniforms.uPulse.value = reduced ? 1 : 0.5 + 0.5 * Math.sin(t * 2.2)
        // 바닥 파동 두 겹. transform만 바꾼다(크기와 투명도)
        const ph = reduced ? 0.55 : (t * 0.5) % 1
        const ph2 = reduced ? 0.9 : (t * 0.5 + 0.5) % 1
        const setRing = (mesh, p) => { const rs = 7 + p * 34; mesh.scale.set(rs, rs, 1); mesh.material.uniforms.uAlpha.value = (1 - p) * 0.75 * beamGrow }
        setRing(ringMesh, ph); setRing(ringMesh2, ph2)
        capMesh.rotation.z = reduced ? 0 : t * 0.9
        capMesh.material.uniforms.uAlpha.value = beamGrow
        const ra = routeOn ? Math.min(1, grow * 2.5) : 0
        // 내 위치 경로: 뻗은 거리(uReveal)와 투명도. 가려진 부분은 옅게 비친다.
        const showMe = meVisible && meLine ? Math.min(1, grow * 2.5) : 0
        for (const r of meMats) { r.mat.uniforms.uAlpha.value = r.ghost ? showMe * 0.38 : showMe; r.mat.uniforms.uReveal.value = meProg * meTotal }
        if (meGlow) {
          const on = meVisible && meLine && meProg > 0.002 && meProg < 0.999 && showMe > 0
          meGlow.visible = !!on
          if (on) {
            const hp = headAt(meProg * meTotal)
            meGlow.position.set(hp[0], hp[1], 2.5)
            const gs = 46
            meGlow.scale.set(gs, gs, 1)
            meGlow.material.uniforms.uAlpha.value = 0.95
          }
        }
        if (flareT > 0) {
          flareT = Math.max(0, flareT - dt / 1.7)
          const f = flareT
          burst.material.uniforms.uAlpha.value = f * 0.9
          const rs = (8 + (1 - f) * 120) * beaconK
          burst.scale.set(rs, rs, 1)
          layer._beamMat.uniforms.uAlpha.value = 0.6 + f * 0.7
          moving = true
        } else if (burst) burst.material.uniforms.uAlpha.value = 0
        for (const r of routeMats) r.mat.uniforms.uAlpha.value = r.ghost ? ra * 0.38 : ra
        renderer.resetState()
        renderer.render(scene, camera)
        if (onFrame) {
          const proj = (z) => {
            const v4 = new Vector4(0, 0, z, 1).applyMatrix4(full)
            if (v4.w <= 0) return null
            const cv = map.getCanvas()
            return [((v4.x / v4.w) + 1) / 2 * cv.clientWidth, (1 - (v4.y / v4.w)) / 2 * cv.clientHeight]
          }
          const base = proj(0)
          const top = proj((BEAM_H + 6) * beamGrow * beaconK)
          onFrame(base && top ? [top[0] - base[0], top[1] - base[1]] : null, grow, base)
        }
        schedulePulse()
      } else onFrame?.(null, 0)
      if (moving) map.triggerRepaint()
    },
  }

  return {
    layer,
    setGrow(v) { growTarget = v; if (reduced) grow = v; map?.triggerRepaint() },
    setTheme(t) { curTheme = t; applyColors(); map?.triggerRepaint() },
    setReduced(v) { reduced = !!v },
    setRoute(v) { routeOn = !!v; map?.triggerRepaint() },
    // 내 위치 경로 설정(lng,lat 배열). 그리기 전에 한 번 부른다.
    setMeRoute(lonlat) {
      if (!scene || !meGroup) return
      for (const r of meMats) { meGroup.remove(r.mesh); r.mesh.geometry.dispose(); r.mat.dispose() }
      meMats.length = 0
      meLine = null; meCum = null; meTotal = 0; meProg = 0
      if (!lonlat || lonlat.length < 2) { map?.triggerRepaint(); return }
      meLine = lonlat.map(([lng, lat]) => toLocal(lng, lat))
      const c = themeColors(curTheme)
      for (const [role, hw, z, ord] of [['casing', 3.6, 0.65, 3.2], ['line', 2.2, 0.75, 4.2]]) {
        const geo = buildRibbonGeometry(meLine, hw, z)
        meTotal = geo.userData.total
        meCum = geo.userData.cum
        for (const ghost of [false, true]) {
          const params = {
            vertexShader: FLAT_VS, fragmentShader: FLAT_FS, transparent: true, depthWrite: false, side: DoubleSide,
            uniforms: { uGrow: { value: 1 }, uColor: { value: col(role === 'casing' ? c.lineCase : c.routeLine) }, uAlpha: { value: 0 }, uReveal: { value: 0 }, uGlow: { value: role === 'line' ? 1 : 0 } },
          }
          if (ghost) params.depthFunc = GreaterDepth
          const mat = new ShaderMaterial(params)
          const mesh = new Mesh(geo, mat)
          mesh.frustumCulled = false
          mesh.renderOrder = ord
          meGroup.add(mesh)
          meMats.push({ mat, mesh, role, ghost })
        }
      }
      map?.triggerRepaint()
    },
    setMeProgress(p) { meProg = Math.max(0, Math.min(1, p)); map?.triggerRepaint() },
    setMeVisible(v) { meVisible = !!v; map?.triggerRepaint() },
    flare() { flareT = reduced ? 0.0001 : 1; map?.triggerRepaint() },
    setActive(v) { active = v; if (v) map?.triggerRepaint() },
    getGrow: () => grow,
  }
}
