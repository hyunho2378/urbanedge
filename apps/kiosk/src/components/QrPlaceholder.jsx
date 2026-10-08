import { useMemo } from 'react'

// QR 모양 자리표시: 실제 QR 생성 라이브러리를 쓰지 않는다. 세 모서리 파인더와 고정 시드 모듈로 QR처럼 보이게 그린다.
// 스캔되지 않는다. 화면 문구로 자리표시임을 밝힌다.
const N = 25

function makeModules(seed) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  const inFinder = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8)
  const out = []
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rnd() > 0.52) out.push([x, y])
  return out
}

function Finder({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="7" height="7" className="fill-bg-base" />
      <rect x={x + 1} y={y + 1} width="5" height="5" className="fill-white" />
      <rect x={x + 2} y={y + 2} width="3" height="3" className="fill-bg-base" />
    </g>
  )
}

export function QrPlaceholder({ seed = '@__urbanedge', label, className }) {
  const mods = useMemo(() => makeModules(seed), [seed])
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} role="img" aria-label={label} className={className} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={N + 4} height={N + 4} className="fill-white" />
      {mods.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" className="fill-bg-base" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={N - 7} y={0} />
      <Finder x={0} y={N - 7} />
    </svg>
  )
}
