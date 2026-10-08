import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../components/cx.js'
import { typography } from '../tokens.js'
import { INK, hasHangul, lineRgb, tok } from './colors.js'
import { layoutNetwork, pointAtPath } from './geometry.js'
import { StationIconGroup } from './icons.jsx'
import { METRO_NETWORK } from './network.js'
import { useLangValue } from '../components/Bi.jsx'
import { TrainGlyph } from './TrainIcon.jsx'
import { useElementSize, useFontsTick, useReducedMotion } from './hooks.js'

const SELECTABLE = ['hub', 'platform', 'station']

// 역 정보를 라벨 명세로 바꾼다. 네트워크 데이터는 읽기 쉬운 필드만 두고 모양은 여기서 정한다.
// 영문 캡션은 { en, ko } 쌍으로 만들어 두 언어 폭 중 큰 쪽으로 상자를 잡는다(한영 전환 레이아웃 고정).
const CAPTION = (n) => ({ en: `PLATFORM ${n}`, ko: `${n}번 승강장` })
const CONCEPT_TAG = { en: 'CONCEPT STOP', ko: '후보 역' }
function withSpecs(network) {
  return {
    ...network,
    lines: network.lines.map((ln) => ({
      ...ln,
      stations: ln.stations.map((st) => {
        if (!st.label || st.labelSpec) return st
        let spec
        if (st.pill) spec = { pill: true, code: st.code, title: { en: st.label.toUpperCase(), ko: st.labelKo || st.label }, color: st.color || ln.color }
        else if (st.kind === 'platform') spec = { caption: CAPTION(st.platform), title: st.label, icon: st.icon, sub: st.labelKo, accent: st.accent }
        else spec = { chip: st.code, title: st.label, icon: st.kind === 'hub' ? null : st.icon, sub: st.labelKo, accent: st.accent || ln.color, tag: st.concept ? CONCEPT_TAG : undefined }
        if (typeof spec.title === 'string' && !hasHangul(spec.title)) spec = { ...spec, title: spec.title.toUpperCase() }
        return { ...st, labelSpec: spec }
      }),
    })),
  }
}

// SVG 안의 한영 한 쌍 텍스트. 두 개를 같은 자리에 두고 비활성 언어는 visibility: hidden으로 숨긴다.
function SvgBi({ lang, en, ko, x, y, fill, enStyle, koStyle, ...rest }) {
  return (
    <>
      <text x={x} y={y} fill={fill} visibility={lang === 'en' ? 'visible' : 'hidden'} style={enStyle} {...rest}>{en}</text>
      <text x={x} y={y} fill={fill} visibility={lang === 'ko' ? 'visible' : 'hidden'} style={koStyle} {...rest}>{ko}</text>
    </>
  )
}

function decideOrientation(mode, w, h, prev, asp) {
  if (mode === 'horizontal' || mode === 'vertical') return mode
  if (!w || !h) return prev || (w && w < 600 ? 'vertical' : 'horizontal')
  const ratio = w / h
  // 높이를 부모가 정하지 않고 aspect-ratio가 정한 경우에는 너비로 결정한다.
  // 방향을 바꾼 직후에는 크기가 아직 이전 방향의 비율이라 다시 뒤집히는 무한 루프가 생긴다. 어느 방향의 비율과 맞든 aspect-ratio가 정한 높이로 본다.
  const auto = prev && Object.values(asp).some((a) => Math.abs(h - w / a) < 2)
  if (!prev || auto) return w < 600 ? 'vertical' : 'horizontal'
  if (ratio > 1.3) return 'horizontal'
  if (ratio < 0.9) return 'vertical'
  return prev
}

const ASPECT = { horizontal: 1.9, vertical: 0.62 }

function legsFor(geo, from, to) {
  if (!from || !to) return null
  const dist = (li, id) => geo.lines[li].idsDist[id]
  if (from.li === to.li) return [{ li: from.li, a: dist(from.li, from.id), b: dist(to.li, to.id) }]
  const fromNodes = Object.keys(geo.lines[from.li].idsDist)
  const shared = fromNodes.find((id) => id in geo.lines[to.li].idsDist && geo.nodes.find((n) => n.node.id === id))
  if (!shared) return [{ li: to.li, a: dist(to.li, to.id), b: dist(to.li, to.id), jump: true }]
  return [
    { li: from.li, a: dist(from.li, from.id), b: dist(from.li, shared) },
    { li: to.li, a: dist(to.li, shared), b: dist(to.li, to.id) },
  ]
}

export function TransitMap({
  network = METRO_NETWORK,
  visited = [],
  orientation = 'auto',
  activeId,
  defaultActiveId = null,
  onSelect,
  animateTrain = true,
  className,
  'aria-label': ariaLabel,
}) {
  const rootRef = useRef(null)
  const size = useElementSize(rootRef)
  const fontsTick = useFontsTick()
  const reduced = useReducedMotion()
  const lang = useLangValue()
  const net = useMemo(() => withSpecs(network), [network])
  const [orient, setOrient] = useState(orientation === 'vertical' ? 'vertical' : 'horizontal')
  useLayoutEffect(() => {
    const next = decideOrientation(orientation, size.w, size.h, orient, ASPECT)
    if (next !== orient) setOrient(next)
  }, [orientation, size.w, size.h, orient])
  const [inner, setInner] = useState(defaultActiveId)
  const active = activeId !== undefined ? activeId : inner

  const s = Math.min(size.w, size.h * 1.5)
  const fontPx = Math.max(12, Math.min(28, 11 + s / 150))
  const geo = useMemo(() => {
    if (size.w < 60 || size.h < 60) return null
    // 라벨이 어떤 격자 크기에서도 들어가지 않으면 글자를 줄여 다시 배치한다.
    let fp = fontPx
    let g = layoutNetwork(net, { orientation: orient, width: size.w, height: size.h, fontPx: fp })
    for (let k = 0; k < 4 && !g.fits && fp > 10; k += 1) {
      fp = Math.max(10, fp * 0.88)
      g = layoutNetwork(net, { orientation: orient, width: size.w, height: size.h, fontPx: fp })
    }
    return g
  }, [net, orient, size.w, size.h, fontPx, fontsTick])

  // ---- 열차 ----
  const trainRef = useRef(null)
  const trainPos = useRef(null) // { li, id }
  const anim = useRef(0)
  const geoRef = useRef(null)
  geoRef.current = geo

  const targetOf = useCallback((g, id, prefer) => {
    if (!g || !id) return null
    const n = g.nodes.find((x) => x.node.id === id)
    if (!n) return null
    const li = prefer != null && n.node.lineIdx.includes(prefer) ? prefer : n.node.lineIdx[0]
    return { li, id }
  }, [])

  const place = useCallback((g, li, dist, back) => {
    const el = trainRef.current
    if (!el || !g) return
    const L = g.lines[li]
    const p = pointAtPath(L.prims, L.laneO, dist)
    let deg = (((p.angle + (back ? Math.PI : 0)) * 180) / Math.PI) % 360
    if (deg > 180) deg -= 360
    if (deg <= -180) deg += 360
    let flip = 1
    if (Math.abs(deg) > 90) { deg += deg > 0 ? -180 : 180; flip = -1 }
    const k = (g.lw * 3.7) / 32
    el.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${deg.toFixed(1)}) scale(${(k * flip).toFixed(3)} ${k.toFixed(3)})`)
    el.style.opacity = '1'
  }, [])

  // 레이아웃이 바뀌면 열차를 현재 논리 위치에 즉시 다시 놓는다.
  useLayoutEffect(() => {
    if (!geo) return
    if (!trainPos.current && active) trainPos.current = targetOf(geo, active)
    const cur = trainPos.current
    if (cur && geo.lines[cur.li] && cur.id in geo.lines[cur.li].idsDist) place(geo, cur.li, geo.lines[cur.li].idsDist[cur.id], false)
    else if (trainRef.current) trainRef.current.style.opacity = '0'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo])

  // 선택이 바뀌면 열차가 노선을 따라 이동한다.
  useEffect(() => {
    const g = geoRef.current
    if (!g || !active) return undefined
    const from = trainPos.current
    const to = targetOf(g, active, from ? from.li : undefined)
    if (!to) return undefined
    if (!from || !animateTrain || reduced) {
      trainPos.current = to
      place(g, to.li, g.lines[to.li].idsDist[to.id], false)
      return undefined
    }
    const legs = legsFor(g, from, to)
    const lens = legs.map((l) => Math.abs(l.b - l.a))
    const total = lens.reduce((a, b) => a + b, 0)
    if (total < 1 || legs[0].jump) {
      trainPos.current = to
      place(g, to.li, g.lines[to.li].idsDist[to.id], false)
      return undefined
    }
    const dur = Math.max(520, Math.min(1400, 420 + total * 1.6))
    const t0 = performance.now()
    cancelAnimationFrame(anim.current)
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2)
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur)
      let s2 = ease(t) * total
      let k = 0
      while (k < legs.length - 1 && s2 > lens[k]) { s2 -= lens[k]; k += 1 }
      const leg = legs[k]
      const dir = leg.b >= leg.a ? 1 : -1
      place(g, leg.li, leg.a + dir * Math.min(s2, lens[k]), dir < 0)
      if (t < 1) anim.current = requestAnimationFrame(step)
    }
    anim.current = requestAnimationFrame(step)
    trainPos.current = to
    return () => cancelAnimationFrame(anim.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, animateTrain, reduced])

  // ---- 선택과 키보드 ----
  const items = useMemo(() => (geo ? geo.nodes.filter((n) => SELECTABLE.includes(n.kind)) : []), [geo])
  const refs = useRef({})
  const [focusId, setFocusId] = useState(null)
  const [kbd, setKbd] = useState(false)
  const rovingId = focusId || active || (items[0] && items[0].node.id)

  const select = useCallback(
    (n) => {
      if (activeId === undefined) setInner(n.node.id)
      if (onSelect) onSelect(n.node.id, { station: n.node.st, kind: n.kind, platform: n.node.st.platform || null })
    },
    [activeId, onSelect],
  )
  const onKey = (e, idx) => {
    const k = e.key
    let to = null
    if (k === 'ArrowRight' || k === 'ArrowDown') to = (idx + 1) % items.length
    else if (k === 'ArrowLeft' || k === 'ArrowUp') to = (idx - 1 + items.length) % items.length
    else if (k === 'Home') to = 0
    else if (k === 'End') to = items.length - 1
    if (to != null) {
      e.preventDefault()
      const id = items[to].node.id
      setFocusId(id)
      refs.current[id] && refs.current[id].focus()
    } else if (k === 'Enter' || k === ' ') {
      e.preventDefault()
      select(items[idx])
    }
  }

  const visitedSet = useMemo(() => new Set(visited), [visited])
  const activeNode = geo && active ? geo.nodes.find((n) => n.node.id === active) : null
  const dimZone = activeNode && activeNode.kind === 'platform'

  const labelFont = typography.family.label
  const sansFont = typography.family.sans
  const lw = geo ? geo.lw : 8
  const f = geo ? geo.fontPx : 13

  const renderLabel = (n, isActive) => {
    const lb = n.label
    if (!lb) return null
    let y = lb.y
    const out = []
    lb.rows.forEach((r, i) => {
      const x0 = lb.align === 'left' ? lb.x : lb.align === 'right' ? lb.x + lb.w - r.w : lb.x + (lb.w - r.w) / 2
      const cy = y + r.h / 2
      if (r.type === 'chip') {
        out.push(
          <g key={i}>
            <rect x={x0 + r.h * 0.06} y={y + r.h * 0.06} width={r.w - r.h * 0.12} height={r.h * 0.88} rx={r.h * 0.44} fill={tok('white')} stroke={lineRgb(r.accent)} strokeWidth={r.h * 0.12} />
            <text x={x0 + r.w / 2} y={cy + f * 0.9 * 0.355} textAnchor="middle" fill={INK} style={{ fontFamily: labelFont, fontSize: f * 0.9, fontWeight: 800, letterSpacing: '0.03em', fontVariantNumeric: 'tabular-nums' }}>{r.text}</text>
          </g>,
        )
      } else if (r.type === 'cap') {
        out.push(<SvgBi key={i} lang={lang} en={r.text.en} ko={r.text.ko} x={x0} y={cy + f * 0.78 * 0.35} fill={tok('text-meta')} enStyle={{ fontFamily: labelFont, fontSize: f * 0.78, fontWeight: 600, letterSpacing: '0.16em' }} koStyle={{ fontFamily: sansFont, fontSize: f * 0.8, fontWeight: 600 }} />)
      } else if (r.type === 'title') {
        out.push(
          <g key={i}>
            {r.icon && <StationIconGroup name={r.icon} cx={x0 + r.tsize * 0.575} cy={cy} size={r.tsize * 1.1} stroke={lineRgb(r.accent)} strokeWidth={2.4} />}
            <text x={x0 + r.iconW} y={cy + r.tsize * 0.35} fill={tok(n.node.st.concept ? 'text-sec' : 'text-pri')} style={{ fontFamily: hasHangul(r.text) ? sansFont : labelFont, fontSize: r.tsize, fontWeight: 700, letterSpacing: '0.06em', paintOrder: 'stroke', stroke: tok('bg-base'), strokeWidth: 3, strokeLinejoin: 'round' }}>{r.text}</text>
          </g>,
        )
      } else if (r.type === 'sub') {
        out.push(<text key={i} x={x0} y={cy + f * 0.86 * 0.35} fill={tok('text-meta')} style={{ fontFamily: sansFont, fontSize: f * 0.86, fontWeight: 500, paintOrder: 'stroke', stroke: tok('bg-base'), strokeWidth: 3, strokeLinejoin: 'round' }}>{r.text}</text>)
      } else if (r.type === 'tag') {
        out.push(
          <g key={i}>
            <rect x={x0} y={y} width={r.w} height={r.h} rx={r.h / 2} fill={tok('bg-raised')} />
            <SvgBi lang={lang} en={r.text.en} ko={r.text.ko} x={x0 + f * 0.5} y={cy + f * 0.74 * 0.35} fill={tok('text-sec')} enStyle={{ fontFamily: labelFont, fontSize: f * 0.74, fontWeight: 700, letterSpacing: '0.14em' }} koStyle={{ fontFamily: sansFont, fontSize: f * 0.78, fontWeight: 650 }} />
          </g>,
        )
      } else if (r.type === 'pill') {
        const cd = r.circle
        out.push(
          <g key={i}>
            <rect x={x0} y={y} width={r.w} height={r.h} rx={r.h / 2} fill={lineRgb(r.color)} />
            <circle cx={x0 + r.h / 2} cy={cy} r={cd / 2} fill={INK} />
            <circle cx={x0 + r.h / 2} cy={cy} r={cd * 0.42} fill="none" stroke={lineRgb(r.color)} strokeOpacity="0.55" strokeWidth={Math.max(1, cd * 0.05)} />
            <text x={x0 + r.h / 2} y={cy + cd * 0.6 * 0.355} textAnchor="middle" fill={lineRgb(r.color)} style={{ fontFamily: labelFont, fontSize: cd * 0.6, fontWeight: 800, letterSpacing: '-0.02em' }}>{r.code}</text>
            <SvgBi lang={lang} en={r.text.en} ko={r.text.ko} x={x0 + r.h / 2 + cd / 2 + f * 0.55} y={cy + f * 0.95 * 0.35} fill={INK} enStyle={{ fontFamily: labelFont, fontSize: f * 0.95, fontWeight: 700, letterSpacing: '0.1em' }} koStyle={{ fontFamily: sansFont, fontSize: f * 0.95, fontWeight: 700 }} />
          </g>,
        )
      }
      y += r.h + lb.gap
    })
    return <g opacity={n.node.st.concept ? 0.82 : activeNode && !isActive && n.kind !== 'hub' ? 0.8 : 1}>{out}</g>
  }

  const renderMarker = (n, isActive) => {
    const st = n.node.st
    const accent = st.accent || 'yellow'
    if (n.kind === 'hub') {
      const pts = Object.values(n.pts)
      const xs = pts.map((p) => p.x)
      const ys = pts.map((p) => p.y)
      const a = { x: Math.min(...xs), y: Math.min(...ys) }
      const b = { x: Math.max(...xs), y: Math.max(...ys) }
      const cap = lw * 2.7
      return (
        <g>
          {isActive && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tok('text-pri')} strokeWidth={cap + lw * 1.7} strokeLinecap="round" />}
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tok('bg-base')} strokeWidth={cap + lw * 0.8} strokeLinecap="round" />
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tok('text-pri')} strokeWidth={cap + lw * 0.3} strokeLinecap="round" />
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tok('white')} strokeWidth={cap - lw * 0.1} strokeLinecap="round" />
          {Object.entries(n.pts).map(([li, p]) => (
            <g key={li}>
              <circle cx={p.x} cy={p.y} r={lw * 0.78} fill={lineRgb(geo.lines[li].ref.color)} />
              <circle cx={p.x} cy={p.y} r={lw * 0.34} fill={tok('white')} />
            </g>
          ))}
        </g>
      )
    }
    if (n.kind === 'platform') {
      return (
        <g>
          {isActive && <rect x={n.cx - lw * 2.6} y={n.cy - lw * 2.6} width={lw * 5.2} height={lw * 5.2} rx={lw * 1.25} fill="none" stroke={tok('text-pri')} strokeWidth={lw * 0.3} />}
          <rect x={n.cx - lw * 2.05} y={n.cy - lw * 2.05} width={lw * 4.1} height={lw * 4.1} rx={lw * 0.95} fill={tok('bg-base')} />
          <rect x={n.cx - lw * 1.82} y={n.cy - lw * 1.82} width={lw * 3.64} height={lw * 3.64} rx={lw * 0.8} fill={tok('white')} />
          <rect x={n.cx - lw * 1.48} y={n.cy - lw * 1.48} width={lw * 2.96} height={lw * 2.96} rx={lw * 0.56} fill={lineRgb(accent)} />
          <text x={n.cx} y={n.cy + lw * 2.2 * 0.355} textAnchor="middle" fill={INK} style={{ fontFamily: labelFont, fontSize: lw * 2.2, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{st.platform}</text>
        </g>
      )
    }
    if (n.kind === 'station') {
      const concept = !!st.concept
      const isVisited = visitedSet.has(n.node.id)
      const big = st.complex ? 1.22 : 1
      const R = lw * 2.05 * big
      return (
        <g>
          {isActive && <circle cx={n.cx} cy={n.cy} r={R + lw * 0.8} fill="none" stroke={tok('text-pri')} strokeWidth={lw * 0.3} />}
          <circle cx={n.cx} cy={n.cy} r={R + lw * 0.2} fill={tok('bg-base')} />
          {st.complex && <circle cx={n.cx} cy={n.cy} r={R - lw * 0.08} fill={tok('white')} />}
          {st.complex && <circle cx={n.cx} cy={n.cy} r={R - lw * 0.42} fill={tok('bg-base')} />}
          <circle cx={n.cx} cy={n.cy} r={(st.complex ? R - lw * 0.56 : R - lw * 0.08)} fill={concept ? tok('bg-panel') : lineRgb(accent)} />
          <circle cx={n.cx} cy={n.cy} r={(st.complex ? R - lw * 1.06 : R - lw * 0.62)} fill={concept ? tok('bg-panel') : tok('white')} />
          {concept && <circle cx={n.cx} cy={n.cy} r={R - lw * 0.35} fill="none" stroke={tok('text-meta')} strokeWidth={lw * 0.26} strokeDasharray={`${lw * 0.55} ${lw * 0.45}`} />}
          {st.icon && <StationIconGroup name={st.icon} cx={n.cx} cy={n.cy} size={lw * 1.7 * (st.complex ? 1.06 : 1)} stroke={concept ? tok('text-sec') : INK} strokeWidth={2.5} />}
          {isVisited && (
            <g>
              <circle cx={n.cx + R * 0.74} cy={n.cy - R * 0.74} r={lw * 0.95} fill={tok('bg-base')} />
              <circle cx={n.cx + R * 0.74} cy={n.cy - R * 0.74} r={lw * 0.78} fill={tok('state-success')} />
              <StationIconGroup name="check" cx={n.cx + R * 0.74} cy={n.cy - R * 0.74} size={lw * 1.0} stroke={INK} strokeWidth={3.4} />
            </g>
          )}
        </g>
      )
    }
    return null
  }

  const hitOf = (n) => {
    const r = Math.max(22, (n.m.x1 - n.m.x0) / 2 + 6)
    if (n.kind === 'hub') {
      const pts = Object.values(n.pts)
      const xs = pts.map((p) => p.x)
      const ys = pts.map((p) => p.y)
      return <line x1={Math.min(...xs)} y1={Math.min(...ys)} x2={Math.max(...xs)} y2={Math.max(...ys)} stroke="transparent" strokeWidth={Math.max(44, lw * 2.7 + 14)} strokeLinecap="round" />
    }
    return <circle cx={n.cx} cy={n.cy} r={r} fill="transparent" />
  }

  const idxOf = (n) => items.findIndex((x) => x === n)

  return (
    <div ref={rootRef} className={cx('relative h-full w-full', className)} style={{ aspectRatio: ASPECT[orient] }}>
      {geo && (
        <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="absolute inset-0 block animate-fade-in" role="group" aria-label={ariaLabel || net.title || 'Route map'} style={{ overflow: 'visible' }}>
          {/* 역사 영역: 플랫폼 선 아래 넓은 면 */}
          {geo.lines.map((L, i) => L.ref.zone && L.d && <path key={`z${i}`} d={L.d} fill="none" stroke={tok('bg-panel')} strokeWidth={lw * 2.9} strokeLinecap="round" strokeLinejoin="round" />)}
          {/* 선 덮개와 본선 */}
          {geo.lines.map((L, i) => <path key={`c${i}`} d={L.d} fill="none" stroke={tok('bg-base')} strokeWidth={lw + 3.4} strokeLinecap="butt" strokeLinejoin="round" />)}
          {geo.lines.map((L, i) => {
            const dim = dimZone && L.ref.zone && !activeNode.node.lineIdx.includes(i)
            const col = lineRgb(L.ref.color)
            const cf = L.conceptFrom
            const common = { d: L.d, fill: 'none', strokeWidth: lw, strokeLinejoin: 'round' }
            if (cf == null) return <path key={`l${i}`} {...common} stroke={col} strokeLinecap="butt" style={{ opacity: dim ? 0.32 : 1, transition: 'opacity 320ms var(--ue-ease-out)' }} />
            const dash = lw * 0.9
            const pairs = Math.ceil((L.total - cf) / (dash * 2)) + 1
            return (
              <g key={`l${i}`}>
                <path {...common} stroke={col} strokeLinecap="butt" strokeDasharray={`${cf} ${L.total * 2}`} />
                <path {...common} stroke={col} strokeOpacity="0.5" strokeLinecap="butt" strokeDasharray={`0 ${cf} ${Array.from({ length: pairs }, () => `${dash} ${dash}`).join(' ')}`} />
              </g>
            )
          })}
          {/* 종점 틱 */}
          {geo.nodes.flatMap((n) => n.ticks.map((t, i) => {
            const px = -Math.sin(t.angle) * lw * 1.35
            const py = Math.cos(t.angle) * lw * 1.35
            const col = lineRgb(geo.lines[t.li].ref.color)
            return (
              <g key={`${n.node.id}-t${i}`}>
                {t.stub && <line x1={t.sx} y1={t.sy} x2={t.x} y2={t.y} stroke={col} strokeWidth={lw} />}
                <line x1={t.x - px} y1={t.y - py} x2={t.x + px} y2={t.y + py} stroke={tok('bg-base')} strokeWidth={lw * 0.55 + 3} strokeLinecap="round" />
                <line x1={t.x - px} y1={t.y - py} x2={t.x + px} y2={t.y + py} stroke={col} strokeWidth={lw * 0.55} strokeLinecap="round" />
              </g>
            )
          }))}
          {/* 역, 플랫폼, 라벨 */}
          {geo.nodes.map((n) => {
            const sel = SELECTABLE.includes(n.kind)
            const isActive = active === n.node.id
            const idx = idxOf(n)
            const label = n.label
            const body = (
              <>
                {renderMarker(n, isActive)}
                {renderLabel(n, isActive)}
              </>
            )
            if (!sel) return <g key={n.node.id}>{body}</g>
            const st0 = n.node.st
            const aria = lang === 'ko'
              ? `${st0.platform ? `${st0.platform}번 승강장, ` : st0.code ? `${st0.code}, ` : ''}${st0.labelKo || st0.label}${st0.concept ? ', 후보 역' : ''}${visitedSet.has(st0.id) ? ', 방문함' : ''}`
              : `${st0.platform ? `Platform ${st0.platform}, ` : st0.code ? `${st0.code}, ` : ''}${st0.label}${st0.concept ? ', concept stop' : ''}${visitedSet.has(st0.id) ? ', visited' : ''}`
            return (
              <g
                key={n.node.id}
                ref={(el) => { refs.current[n.node.id] = el }}
                role="button"
                tabIndex={rovingId === n.node.id ? 0 : -1}
                aria-label={aria}
                aria-pressed={isActive}
                className="ue-press cursor-pointer outline-none"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                onClick={() => select(n)}
                onKeyDown={(e) => { setKbd(true); onKey(e, idx) }}
                onPointerDown={() => setKbd(false)}
                onFocus={() => setFocusId(n.node.id)}
                onBlur={() => setFocusId(null)}
              >
                {hitOf(n)}
                {label && <rect x={label.x - 4} y={label.y - 3} width={label.w + 8} height={label.h + 6} fill="transparent" />}
                {body}
                {kbd && focusId === n.node.id && (
                  n.kind === 'hub'
                    ? <rect x={n.m.x0 - 4} y={n.m.y0 - 4} width={n.m.x1 - n.m.x0 + 8} height={n.m.y1 - n.m.y0 + 8} rx={lw * 1.6} fill="none" stroke={tok('focus')} strokeWidth="2.5" />
                    : <circle cx={n.cx} cy={n.cy} r={lw * 3.1} fill="none" stroke={tok('focus')} strokeWidth="2.5" />
                )}
              </g>
            )
          })}
          {/* 열차 */}
          <g ref={trainRef} style={{ opacity: 0, pointerEvents: 'none' }}>
            <TrainGlyph color="yellow" />
          </g>
        </svg>
      )}
    </div>
  )
}
