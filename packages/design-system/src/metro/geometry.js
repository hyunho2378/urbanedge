// geometry.js: 옥틸리니어 노선도 레이아웃 엔진 (순수 함수, DOM 없음)
// 방식: (1) 역 좌표(격자)를 화면 픽셀로 옮기고 (2) 인접한 두 역을 수평/수직 + 45도 한 번 꺾임으로 잇고
// (3) 꺾임마다 원호(필렛)로 둥글게 만든 뒤 (4) 노선별 평행 이동(lane)으로 나란한 선을 만들고
// (5) 역명판 위치를 후보 8방향에서 충돌 비용이 가장 작은 곳으로 정하고 (6) 컨테이너에 맞는 최대 격자 크기를 이분 탐색한다.
// 근거는 docs/CREDITS.md: Nöllenburg & Wolff 2011, Bast et al. 2020 (개념만 사용, 코드 복사 없음).
import { typography } from '../tokens.js'
import { hasHangul } from './colors.js'

const EPS = 1e-6
const sgn = (v) => (v > EPS ? 1 : v < -EPS ? -1 : 0)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const TRANSPOSE = { n: 'w', w: 'n', s: 'e', e: 's', ne: 'sw', sw: 'ne', nw: 'nw', se: 'se' }
export const transposeDir = (d) => TRANSPOSE[d] || d

// ---------- 글자 폭 측정 ----------
let _ctx = null
const cache = new Map()
export function measureText(text, px, weight = 600, family = typography.family.label, tracking = 0) {
  const key = `${text}|${px}|${weight}|${family}|${tracking}`
  if (cache.has(key)) return cache.get(key)
  let w
  if (typeof document !== 'undefined') {
    if (!_ctx) _ctx = document.createElement('canvas').getContext('2d')
    _ctx.font = `${weight} ${px}px ${family}`
    w = _ctx.measureText(text).width + tracking * px * text.length
  } else w = text.length * px * 0.54 + tracking * px * text.length
  cache.set(key, w)
  return w
}

// ---------- 라우팅: 두 점을 수평/수직 + 45도 한 번 꺾임으로 잇는다 ----------
export function routePoints(a, b, mode = 'diag-first') {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const adx = Math.abs(dx)
  const ady = Math.abs(dy)
  if (adx < EPS || ady < EPS || Math.abs(adx - ady) < 0.01) return [a, b]
  const d = Math.min(adx, ady)
  const sx = sgn(dx)
  const sy = sgn(dy)
  const bend = mode === 'straight-first' ? { x: b.x - sx * d, y: b.y - sy * d } : { x: a.x + sx * d, y: a.y + sy * d }
  return [a, bend, b]
}

// ---------- 둥근 모서리 경로 ----------
export function buildPath(input, radius) {
  const P = []
  for (const p of input) {
    const q = P[P.length - 1]
    if (q && Math.hypot(p.x - q.x, p.y - q.y) < 0.01) q.ids = [...(q.ids || []), ...(p.ids || [])]
    else P.push({ x: p.x, y: p.y, ids: [...(p.ids || [])] })
  }
  const n = P.length
  const dir = []
  const len = []
  for (let i = 0; i < n - 1; i += 1) {
    const dx = P[i + 1].x - P[i].x
    const dy = P[i + 1].y - P[i].y
    const l = Math.hypot(dx, dy)
    len.push(l)
    dir.push([dx / l, dy / l])
  }
  const trim = new Array(n).fill(0)
  const rad = new Array(n).fill(0)
  for (let i = 1; i < n - 1; i += 1) {
    const d1 = dir[i - 1]
    const d2 = dir[i]
    const dot = d1[0] * d2[0] + d1[1] * d2[1]
    const phi = Math.acos(clamp(dot, -1, 1))
    if (phi < 0.01) continue
    const tn = Math.tan(phi / 2)
    const maxT = Math.min(len[i - 1] * (i - 1 === 0 ? 1 : 0.5), len[i] * (i === n - 2 ? 1 : 0.5))
    let t = radius * tn
    let r = radius
    if (t > maxT) { t = maxT; r = t / tn }
    trim[i] = t
    rad[i] = r
  }
  const prims = []
  const vdist = new Array(n).fill(0)
  let cum = 0
  for (let i = 0; i < n - 1; i += 1) {
    const ts = trim[i]
    const te = trim[i + 1]
    const d = dir[i]
    const x0 = P[i].x + d[0] * ts
    const y0 = P[i].y + d[1] * ts
    const x1 = P[i + 1].x - d[0] * te
    const y1 = P[i + 1].y - d[1] * te
    const l = Math.max(0, len[i] - ts - te)
    prims.push({ type: 'L', x0, y0, x1, y1, len: l, dx: d[0], dy: d[1] })
    cum += l
    if (i + 1 < n - 1) {
      if (trim[i + 1] > 0) {
        const d2 = dir[i + 1]
        const cross = d[0] * d2[1] - d[1] * d2[0]
        const sigma = cross > 0 ? 1 : -1
        const r = rad[i + 1]
        const cxx = x1 + sigma * -d[1] * r
        const cyy = y1 + sigma * d[0] * r
        const a0 = Math.atan2(y1 - cyy, x1 - cxx)
        const phi = Math.acos(clamp(d[0] * d2[0] + d[1] * d2[1], -1, 1))
        const x2 = P[i + 1].x + d2[0] * trim[i + 1]
        const y2 = P[i + 1].y + d2[1] * trim[i + 1]
        const al = r * phi
        prims.push({ type: 'A', cx: cxx, cy: cyy, r, a0, sweep: sigma * phi, sigma, x0: x1, y0: y1, x1: x2, y1: y2, len: al })
        vdist[i + 1] = cum + al / 2
        cum += al
      } else vdist[i + 1] = cum
    }
  }
  vdist[n - 1] = cum
  return { prims, vdist, total: cum, verts: P }
}

function evalPrim(pr, o, s) {
  if (pr.type === 'L') {
    return { x: pr.x0 + pr.dx * s - pr.dy * o, y: pr.y0 + pr.dy * s + pr.dx * o, angle: Math.atan2(pr.dy, pr.dx) }
  }
  const th = pr.a0 + pr.sweep * (pr.len ? s / pr.len : 0)
  const rr = pr.r - pr.sigma * o
  return { x: pr.cx + rr * Math.cos(th), y: pr.cy + rr * Math.sin(th), angle: th + (pr.sigma * Math.PI) / 2 }
}

export function pointAtPath(prims, o, dist) {
  let rem = Math.max(0, dist)
  for (let i = 0; i < prims.length; i += 1) {
    const pr = prims[i]
    if (rem <= pr.len + 1e-6 || i === prims.length - 1) return evalPrim(pr, o, Math.min(rem, pr.len))
    rem -= pr.len
  }
  return { x: 0, y: 0, angle: 0 }
}

const f2 = (v) => Math.round(v * 100) / 100
export function pathD(prims, o) {
  const live = prims.filter((p) => p.len > 0.01)
  if (!live.length) return ''
  const s = evalPrim(live[0], o, 0)
  let d = `M${f2(s.x)} ${f2(s.y)}`
  for (const pr of live) {
    const e = evalPrim(pr, o, pr.len)
    if (pr.type === 'L') d += `L${f2(e.x)} ${f2(e.y)}`
    else {
      const rr = Math.max(0.1, pr.r - pr.sigma * o)
      d += `A${f2(rr)} ${f2(rr)} 0 0 ${pr.sigma > 0 ? 1 : 0} ${f2(e.x)} ${f2(e.y)}`
    }
  }
  return d
}

function samplePath(prims, o, step) {
  const out = []
  let off = 0
  for (const pr of prims) {
    if (pr.len <= 0.01) continue
    const k = Math.max(1, Math.ceil(pr.len / step))
    for (let i = 0; i <= k; i += 1) { const p = evalPrim(pr, o, (pr.len * i) / k); out.push(p.x, p.y) }
    off += pr.len
  }
  return out
}

// ---------- 라벨 ----------
const FAMILY_LABEL = typography.family.label
const FAMILY_SANS = typography.family.sans

const T = (t) => (typeof t === 'string' ? { en: t, ko: t } : t)
// 영어와 한국어 중 넓은 쪽 폭. 한영 전환에도 라벨 상자가 움직이지 않게 한다.
const wBi = (t, px, wt, fam, tr) => {
  const b = T(t)
  return Math.max(measureText(b.en, px, wt, fam, tr), measureText(b.ko, px, wt, FAMILY_SANS, 0))
}

function makeRows(spec, f, wrapTitle) {
  const rows = []
  if (spec.pill) {
    const h = f * 1.9
    const circle = f * 1.4
    const tw = wBi(spec.title, f * 0.95, 700, FAMILY_LABEL, 0.1)
    rows.push({ type: 'pill', w: f * 0.5 + circle + f * 0.55 + tw + f * 0.8, h, circle, text: T(spec.title), code: spec.code, color: spec.color, tw })
    if (spec.sub) rows.push({ type: 'sub', text: spec.sub, w: measureText(spec.sub, f * 0.86, 500, FAMILY_SANS), h: f * 1.15 })
    return rows
  }
  if (spec.chip) {
    const h = f * 1.45
    const tw = measureText(spec.chip, f * 0.9, 700, FAMILY_LABEL, 0.04)
    rows.push({ type: 'chip', text: spec.chip, accent: spec.accent, w: tw + f * 1.1, h, tw })
  } else if (spec.caption) {
    rows.push({ type: 'cap', text: T(spec.caption), w: wBi(spec.caption, f * 0.78, 600, FAMILY_LABEL, 0.16), h: f * 0.95 })
  }
  const tsize = f * 1.12
  const iconW = spec.icon ? tsize * 1.15 + f * 0.35 : 0
  const lines = wrapTitle ? wrapTitle : [spec.title]
  lines.forEach((t, i) => {
    const tw = measureText(t, tsize, 700, FAMILY_LABEL, 0.06)
    rows.push({ type: 'title', text: t, icon: i === 0 ? spec.icon : null, accent: spec.accent, w: tw + (i === 0 ? iconW : 0), h: tsize * 1.18, tw, tsize, iconW: i === 0 ? iconW : 0 })
  })
  if (spec.sub) rows.push({ type: 'sub', text: spec.sub, w: measureText(spec.sub, f * 0.86, 500, FAMILY_SANS), h: f * 1.15 })
  if (spec.tag) {
    const tw = wBi(spec.tag, f * 0.74, 700, FAMILY_LABEL, 0.14)
    rows.push({ type: 'tag', text: T(spec.tag), w: tw + f * 1.0, h: f * 1.3, tw })
  }
  return rows
}

function splitTitle(t) {
  const i = t.indexOf(' ')
  if (i < 0) return null
  const parts = t.split(' ')
  let best = null
  let bestDiff = 1e9
  for (let k = 1; k < parts.length; k += 1) {
    const a = parts.slice(0, k).join(' ')
    const b = parts.slice(k).join(' ')
    const diff = Math.abs(a.length - b.length)
    if (diff < bestDiff) { bestDiff = diff; best = [a, b] }
  }
  return best
}

function labelVariants(spec, f) {
  if (!spec) return []
  const out = []
  const mk = (rows, wrapped) => {
    const gap = f * 0.14
    const w = Math.max(...rows.map((r) => r.w))
    const h = rows.reduce((s, r) => s + r.h, 0) + gap * (rows.length - 1)
    return { rows, w, h, gap, wrapped }
  }
  out.push(mk(makeRows(spec, f), false))
  if (!spec.pill) {
    const sp = splitTitle(spec.title)
    if (sp) out.push(mk(makeRows(spec, f, sp), true))
  }
  return out
}

const DEFAULT_PREFS = ['e', 's', 'n', 'w', 'se', 'ne', 'sw', 'nw']
const ALIGN = { e: 'left', ne: 'left', se: 'left', w: 'right', nw: 'right', sw: 'right', n: 'center', s: 'center' }

function candidateRect(dir, v, m, gap) {
  const cx = (m.x0 + m.x1) / 2
  const cy = (m.y0 + m.y1) / 2
  const g2 = gap * 0.7
  switch (dir) {
    case 'e': return { x: m.x1 + gap, y: cy - v.h / 2 }
    case 'w': return { x: m.x0 - gap - v.w, y: cy - v.h / 2 }
    case 'n': return { x: cx - v.w / 2, y: m.y0 - gap - v.h }
    case 's': return { x: cx - v.w / 2, y: m.y1 + gap }
    case 'ne': return { x: m.x1 + g2, y: m.y0 - g2 - v.h }
    case 'nw': return { x: m.x0 - g2 - v.w, y: m.y0 - g2 - v.h }
    case 'se': return { x: m.x1 + g2, y: m.y1 + g2 }
    default: return { x: m.x0 - g2 - v.w, y: m.y1 + g2 }
  }
}

// ---------- 전체 레이아웃 ----------
export function layoutNetwork(network, opts) {
  const { orientation, width: W, height: H, fontPx } = opts
  const vertical = orientation === 'vertical'
  const lw = fontPx * 0.62
  const pitch = lw * 1.22
  const padOuter = Math.max(10, fontPx * 0.7)

  // 1) 정규화
  const nodes = new Map()
  const order = []
  const lines = network.lines.map((ln, li) => {
    const list = ln.stations.map((st) => {
      let node = nodes.get(st.id)
      if (!node) {
        const X = vertical ? (st.vx != null ? st.vx : st.y) : st.x
        const Y = vertical ? (st.vx != null ? st.vy : st.x) : st.y
        const hintRaw = vertical ? st.vLabelDir || (st.labelDir ? transposeDir(st.labelDir) : null) : st.labelDir
        node = { id: st.id, st, X, Y, hint: hintRaw, lineIdx: [], pts: {}, kind: st.kind || (st.hidden ? 'hidden' : 'station') }
        nodes.set(st.id, node)
        if (node.kind !== 'hidden') order.push(node)
      }
      if (!node.lineIdx.includes(li)) node.lineIdx.push(li)
      return node
    })
    if (list.length > 1) {
      list[0].terms = [...(list[0].terms || []), { li, end: 'start' }]
      list[list.length - 1].terms = [...(list[list.length - 1].terms || []), { li, end: 'end' }]
    }
    return { ref: ln, nodes: list, laneO: (ln.lane || 0) * pitch }
  })
  const all = [...nodes.values()]
  const minX = Math.min(...all.map((n) => n.X))
  const maxX = Math.max(...all.map((n) => n.X))
  const minY = Math.min(...all.map((n) => n.Y))
  const maxY = Math.max(...all.map((n) => n.Y))
  const spanX = Math.max(0.0001, maxX - minX)
  const spanY = Math.max(0.0001, maxY - minY)
  const maxLane = Math.max(0, ...lines.map((l) => Math.abs(l.laneO)))
  const rCenter = Math.max(lw * 2.6, maxLane + lw * 1.7)

  const build = (g, ox, oy) => {
    const toPx = (n) => ({ x: ox + (n.X - minX) * g, y: oy + (n.Y - minY) * g })
    const outLines = lines.map((ln) => {
      const verts = []
      ln.nodes.forEach((node, idx) => {
        const p = toPx(node)
        if (idx === 0) { verts.push({ ...p, ids: [node.id] }); return }
        const a = toPx(ln.nodes[idx - 1])
        const pts = routePoints(a, p, node.st.approach || 'diag-first')
        pts.slice(1).forEach((q, k, arr) => verts.push({ x: q.x, y: q.y, ids: k === arr.length - 1 ? [node.id] : [] }))
      })
      const path = buildPath(verts, rCenter)
      const idsDist = {}
      path.verts.forEach((v, vi) => v.ids.forEach((id) => { idsDist[id] = path.vdist[vi] }))
      const ci = ln.nodes.findIndex((nd) => nd.st.concept)
      const conceptFrom = ci > 0 ? idsDist[ln.nodes[ci - 1].id] : null
      return { ref: ln.ref, laneO: ln.laneO, conceptFrom, prims: path.prims, total: path.total, idsDist, d: pathD(path.prims, ln.laneO), samples: samplePath(path.prims, ln.laneO, Math.max(4, lw * 0.9)) }
    })
    // 노드 위치
    const nodeOut = order.map((node) => {
      const pts = {}
      node.lineIdx.forEach((li) => {
        const L = outLines[li]
        const dist = L.idsDist[node.id]
        const p = pointAtPath(L.prims, L.laneO, dist)
        pts[li] = { ...p, dist }
      })
      const arr = Object.values(pts)
      const cx = arr.reduce((s, p) => s + p.x, 0) / arr.length
      const cy = arr.reduce((s, p) => s + p.y, 0) / arr.length
      let m
      let kind = node.kind
      if (kind === 'hub' && arr.length < 2) kind = 'station'
      if (kind === 'hub') {
        const infl = lw * 1.5
        m = { x0: Math.min(...arr.map((p) => p.x)) - infl, x1: Math.max(...arr.map((p) => p.x)) + infl, y0: Math.min(...arr.map((p) => p.y)) - infl, y1: Math.max(...arr.map((p) => p.y)) + infl }
      } else if (kind === 'terminus') {
        const r = lw * 1.4
        m = { x0: cx - r, x1: cx + r, y0: cy - r, y1: cy + r }
      } else {
        const r0 = kind === 'platform' ? lw * 1.95 : lw * 2.05
        const r = (node.terms || []).length ? r0 + lw * 1.5 : r0
        m = { x0: cx - r, x1: cx + r, y0: cy - r, y1: cy + r }
      }
      const rMark = kind === 'terminus' ? 0 : kind === 'platform' ? lw * 1.95 : lw * 2.05
      const ticks = kind === 'hub' || kind === 'hidden' ? [] : (node.terms || []).map((t) => {
        const p = pts[t.li]
        const out = t.end === 'end' ? p.angle : p.angle + Math.PI
        const off = rMark + (rMark ? lw * 0.55 : 0)
        return { x: p.x + Math.cos(out) * off, y: p.y + Math.sin(out) * off, sx: p.x, sy: p.y, angle: out, stub: rMark > 0, li: t.li }
      })
      return { node, kind, cx, cy, pts, m, ticks, angle: arr[0].angle }
    })
    // 지오메트리 경계
    let gx0 = 1e9, gy0 = 1e9, gx1 = -1e9, gy1 = -1e9
    const grow = (x, y, r) => { gx0 = Math.min(gx0, x - r); gx1 = Math.max(gx1, x + r); gy0 = Math.min(gy0, y - r); gy1 = Math.max(gy1, y + r) }
    outLines.forEach((L) => { for (let i = 0; i < L.samples.length; i += 2) grow(L.samples[i], L.samples[i + 1], lw * 0.6) })
    nodeOut.forEach((n) => { gx0 = Math.min(gx0, n.m.x0); gx1 = Math.max(gx1, n.m.x1); gy0 = Math.min(gy0, n.m.y0); gy1 = Math.max(gy1, n.m.y1) })
    const G = { x0: gx0, y0: gy0, x1: gx1, y1: gy1 }

    // 라벨 배치
    const placed = []
    const markers = nodeOut.filter((n) => n.kind !== 'hub').map((n) => n.m)
    const hubMarkers = nodeOut.filter((n) => n.kind === 'hub').map((n) => n.m)
    const samples = outLines.flatMap((L) => L.samples)
    const prio = (n) => (n.kind === 'hub' ? 0 : n.node.hint ? 1 : 2)
    const queue = [...nodeOut].filter((n) => n.node.st.label).sort((a, b) => prio(a) - prio(b))
    const gap = lw * 1.0
    const hit = (r, m) => !(r.x + r.w < m.x0 - 2 || r.x > m.x1 + 2 || r.y + r.h < m.y0 - 2 || r.y > m.y1 + 2)
    queue.forEach((n) => {
      const spec = n.node.st.labelSpec
      if (!spec) return
      const variants = labelVariants(spec, fontPx)
      const prefs = n.node.hint ? [n.node.hint, ...DEFAULT_PREFS.filter((d) => d !== n.node.hint)] : DEFAULT_PREFS
      let best = null
      variants.forEach((v) => {
        prefs.forEach((dir, pi) => {
          const pos = candidateRect(dir, v, n.m, gap)
          const r = { x: pos.x, y: pos.y, w: v.w, h: v.h }
          let cost = pi * 6 + (v.wrapped ? 6 : 0)
          for (const pl of placed) if (!(r.x + r.w < pl.x - 3 || r.x > pl.x + pl.w + 3 || r.y + r.h < pl.y - 2 || r.y > pl.y + pl.h + 2)) cost += 1e5
          for (const m of markers) if (m !== n.m && hit(r, m)) cost += 1e5
          for (const m of hubMarkers) if (m !== n.m && hit(r, m)) cost += 1e5
          const mx = lw * 0.5 + 2
          for (let i = 0; i < samples.length; i += 2) {
            const sx = samples[i]
            const sy = samples[i + 1]
            if (sx > r.x - mx && sx < r.x + r.w + mx && sy > r.y - mx && sy < r.y + r.h + mx) { cost += 5e3; break }
          }
          const ext = Math.max(0, G.x0 - r.x) + Math.max(0, r.x + r.w - G.x1) + Math.max(0, G.y0 - r.y) + Math.max(0, r.y + r.h - G.y1)
          cost += ext * 0.1
          if (!best || cost < best.cost) best = { cost, v, r, dir }
        })
      })
      if (best) {
        placed.push(best.r)
        n.label = { ...best.r, rows: best.v.rows, gap: best.v.gap, align: ALIGN[best.dir], dir: best.dir, wrapped: best.v.wrapped }
      }
    })
    // 전체 경계(라벨 포함)
    let ux0 = G.x0, uy0 = G.y0, ux1 = G.x1, uy1 = G.y1
    nodeOut.forEach((n) => { if (n.label) { ux0 = Math.min(ux0, n.label.x); uy0 = Math.min(uy0, n.label.y); ux1 = Math.max(ux1, n.label.x + n.label.w); uy1 = Math.max(uy1, n.label.y + n.label.h) } })
    return { lines: outLines, nodes: nodeOut, U: { x0: ux0, y0: uy0, x1: ux1, y1: uy1 }, G }
  }

  // 2) 최대 격자 크기 이분 탐색
  const availW = Math.max(40, W - padOuter * 2)
  const availH = Math.max(40, H - padOuter * 2)
  let lo = 6
  let hi = Math.max(20, fontPx * 9)
  const fits = (g) => { const b = build(g, 0, 0); return b.U.x1 - b.U.x0 <= availW && b.U.y1 - b.U.y0 <= availH }
  if (!fits(lo)) hi = lo
  else for (let i = 0; i < 14; i += 1) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid }
  const g = lo
  const fitsAll = fits(lo)
  const first = build(g, 0, 0)
  const ox = (W - (first.U.x1 - first.U.x0)) / 2 - first.U.x0
  const oy = (H - (first.U.y1 - first.U.y0)) / 2 - first.U.y0
  const final = build(g, ox, oy)
  return { ...final, W, H, g, lw, pitch, fontPx, vertical, fits: fitsAll }
}
