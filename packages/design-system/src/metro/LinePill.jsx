import { cx } from '../components/cx.js'
import { INK, lineRgb, tok } from './colors.js'

const U = { sm: 0.8, md: 1, lg: 1.4 }

// 서울 지하철 장난감 열차 포장 상자의 노선명 알약. 노선 색 알약 안에 노선 문자와 이름, 옆으로 점선과 정거장.
// stations: [{ id, label }] 선택, current: 인덱스. 점선은 둥근 점 패턴이며 마지막 정거장은 큰 고리다.
export function LinePill({ code = 'H', name = 'Hwangnidan Line', nameKo = '황리단선', color = 'yellow', stations = [], current = -1, size = 'md', className }) {
  const u = U[size] || 1
  const n = stations.length
  return (
    <div className={cx('flex w-full items-center', className)} style={{ gap: 14 * u }} role="group" aria-label={`${name}, ${n} stations`}>
      <span className="inline-flex shrink-0 items-center" style={{ gap: 10 * u, padding: `${6 * u}px ${18 * u}px ${6 * u}px ${6 * u}px`, borderRadius: 999, background: lineRgb(color), color: INK }}>
        <span className="grid place-items-center rounded-pill font-label font-extrabold" style={{ width: 34 * u, height: 34 * u, fontSize: 22 * u, background: INK, color: lineRgb(color), lineHeight: 1 }}>{code}</span>
        <span className="block" style={{ lineHeight: 1.05 }}>
          <span className="block" style={{ fontSize: 17 * u, fontWeight: 800, letterSpacing: '-0.02em' }}>{name}</span>
          <span className="block" style={{ fontSize: 11.5 * u, fontWeight: 650, opacity: 0.75 }}>{nameKo}</span>
        </span>
      </span>
      {n > 0 && (
        <svg className="min-w-0 flex-1" height={28 * u} width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
          <line x1="0" x2="100%" y1={14 * u} y2={14 * u} stroke={tok('text-pri', 0.4)} strokeWidth={3.2 * u} strokeLinecap="round" strokeDasharray={`0.1 ${9 * u}`} />
          {stations.map((s, i) => {
            const pct = n > 1 ? 6 + (i / (n - 1)) * 88 : 50
            const here = i === current
            return (
              <g key={s.id}>
                <circle cx={`${pct}%`} cy={14 * u} r={(here ? 8.5 : 6.5) * u} fill={tok('bg-base')} />
                <circle cx={`${pct}%`} cy={14 * u} r={(here ? 6 : 4.4) * u} fill={here ? tok('white') : lineRgb(color)} stroke={lineRgb(color)} strokeWidth={here ? 3 * u : 0} />
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
