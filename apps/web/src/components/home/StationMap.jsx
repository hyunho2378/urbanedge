import { useEffect, useMemo, useRef } from 'react'
import { cx } from '@urbanedge/ds'
import { LINE, ROOMS, STATION } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { prefersReducedMotion } from '../../layout/scroll.js'
import { useWidth } from './hooks.js'

// 어반엣지역 노선도. 황리단선(H)이 왼쪽에서 들어와 어반엣지역(H01)에서 승강장 4개 노선으로 갈라진다(옥틸리니어: 수평과 45도).
// 승강장 배지를 누르면 열차가 그 승강장으로 이동한다. 키보드로도 고를 수 있다.
const COLOR_VAR = { yellow: '--ue-line-yellow', red: '--ue-line-red', blue: '--ue-line-blue', green: '--ue-line-green', white: '--ue-white' }
const STROKE = { yellow: 'stroke-line-yellow', red: 'stroke-line-red', blue: 'stroke-line-blue', green: 'stroke-line-green', white: 'stroke-white' }
const FILL = { yellow: 'fill-line-yellow', red: 'fill-line-red', blue: 'fill-line-blue', green: 'fill-line-green', white: 'fill-white' }

function branchPath(hub, end, run) {
  const dy = end.y - hub.y
  const dir = Math.sign(dy)
  const ady = Math.abs(dy)
  const x1 = hub.x + run
  if (!ady) return `M${hub.x} ${hub.y} H${end.x}`
  const r = 14
  return `M${hub.x} ${hub.y} H${x1 - r * 0.2} Q${x1} ${hub.y} ${x1 + r * 0.7} ${hub.y + dir * r * 0.7} L${x1 + ady - r * 0.7} ${end.y - dir * r * 0.7} Q${x1 + ady} ${end.y} ${x1 + ady + r * 0.2} ${end.y} H${end.x}`
}

export default function StationMap({ activeId, onSelect, className }) {
  const pick = usePick()
  const [ref, w] = useWidth()
  const train = useRef(null)
  const paths = useRef({})
  const small = w < 520
  const rowH = small ? 38 : 60
  const padY = small ? 34 : 64
  const H = rowH * (ROOMS.length - 1) + padY * 2
  const hub = { x: small ? 92 : Math.max(150, w * 0.2), y: padY + (rowH * (ROOMS.length - 1)) / 2 }
  const termX = w - (small ? 124 : 230)
  const run = small ? 16 : 40
  const geo = useMemo(
    () =>
      ROOMS.map((r, i) => {
        const end = { x: termX, y: padY + rowH * i }
        return { r, end, d: branchPath(hub, end, run) }
      }),
    [hub.x, hub.y, termX, rowH, padY, run], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // 열차: 활성 승강장 선을 따라 허브에서 끝 정거장까지 달린다.
  useEffect(() => {
    const p = paths.current[activeId]
    const t = train.current
    if (!p || !t) return undefined
    const len = p.getTotalLength()
    const place = (k) => {
      const a = p.getPointAtLength(len * k)
      const b = p.getPointAtLength(Math.min(len, len * k + 1))
      const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
      t.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`)
    }
    if (prefersReducedMotion()) {
      place(1)
      return undefined
    }
    const t0 = performance.now()
    let raf = 0
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / 780)
      place(1 - (1 - k) ** 3)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [activeId, geo])

  return (
    <div ref={ref} className={cx('w-full', className)}>
      {w > 0 && (
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="group" aria-label={pick({ en: 'UrbanEdge Station map: four platforms', ko: '어반엣지역 노선도: 승강장 4개' })} className="block overflow-visible">
          {/* 황리단선: 왼쪽에서 들어와 어반엣지역에서 끝난다 */}
          <path d={`M0 ${hub.y} H${hub.x}`} fill="none" strokeWidth="14" strokeLinecap="round" className="stroke-line-yellow" />
          <text x="0" y={hub.y - 24} fontSize="12" fontWeight="700" letterSpacing="1.5" className="fill-text-sec font-label">
            {pick(LINE.name).toUpperCase()}
          </text>
          {[...geo].sort((a, b) => (a.r.id === activeId) - (b.r.id === activeId)).map(({ r, d }) => (
            <path
              key={r.id}
              ref={(el) => {
                paths.current[r.id] = el
              }}
              d={d}
              fill="none"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={r.id === activeId ? 1 : 0.5}
              className={cx(STROKE[r.color], 'transition-opacity duration-base ease-out')}
            />
          ))}
          {/* 허브: 어반엣지역 */}
          <circle cx={hub.x} cy={hub.y} r="19" strokeWidth="5" className="fill-white stroke-bg-base" />
          <text x={hub.x} y={hub.y} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="800" className="fill-bg-base font-label">
            {STATION.code}
          </text>
          <text x={hub.x} y={hub.y + 40} textAnchor="middle" fontSize="14" fontWeight="800" className="fill-text-pri">
            {pick(STATION.name)}
          </text>
          {/* 승강장 끝 정거장 */}
          {geo.map(({ r, end }) => {
            const on = r.id === activeId
            return (
              <g
                key={r.id}
                role="button"
                tabIndex={0}
                aria-label={`${pick({ en: 'Platform', ko: '승강장' })} ${r.platform} ${pick(r.title)}`}
                aria-pressed={on}
                onClick={() => onSelect?.(r.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect?.(r.id)
                  }
                }}
                className="group cursor-pointer outline-none"
              >
                <rect x={end.x - 24} y={end.y - 24} width={w - end.x + 20} height="48" rx="24" fill="transparent" strokeWidth="3" className="stroke-transparent group-focus-visible:stroke-focus" />
                <circle cx={end.x} cy={end.y} r={on ? 17 : 14} strokeWidth="4" className={cx(FILL[r.color], 'stroke-bg-base transition-[r] duration-base ease-out')} />
                <text x={end.x} y={end.y} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="800" className={cx('font-label', r.color === 'red' || r.color === 'blue' ? 'fill-text-pri' : 'fill-text-onYellow')}>
                  {r.platform}
                </text>
                <text x={end.x + 28} y={end.y} dominantBaseline="central" fontSize={small ? 13 : 15} fontWeight={on ? 800 : 600} className={on ? 'fill-text-pri' : 'fill-text-sec'}>
                  {pick(r.title)}
                </text>
              </g>
            )
          })}
          {/* 열차 */}
          <g ref={train} pointerEvents="none">
            <g transform="translate(-20 -9)">
              <rect width="40" height="18" rx="8" className="fill-white stroke-bg-base" strokeWidth="2" />
              <rect y="9" width="40" height="4" className="fill-line-yellow" />
              <rect x="6" y="3" width="7" height="4" rx="1.5" className="fill-bg-base" />
              <rect x="17" y="3" width="7" height="4" rx="1.5" className="fill-bg-base" />
              <rect x="28" y="3" width="7" height="4" rx="1.5" className="fill-bg-base" />
            </g>
          </g>
        </svg>
      )}
    </div>
  )
}
