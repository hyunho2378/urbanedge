import { cx } from '../components/cx.js'
import { INK, lineRgb, tok } from './colors.js'
import { TrainIcon } from './TrainIcon.jsx'

const SIZES = {
  sm: { dot: 11, ring: 3, lw: 5, train: 28, font: 12, gap: 8 },
  md: { dot: 15, ring: 4, lw: 7, train: 36, font: 13, gap: 10 },
  lg: { dot: 22, ring: 5, lw: 9, train: 48, font: 16, gap: 12 },
  xl: { dot: 36, ring: 8, lw: 15, train: 84, font: 28, gap: 18 },
}

// 남은 정거장과 이동하는 열차. stops: [{ id, label, labelKo?, code? }], current: 0부터 시작하는 인덱스(소수 가능)
// 가로는 정거장 수만큼 같은 폭의 열에 이름이 놓이고, 세로는 정거장마다 step px 높이의 행이 된다.
// labels: 'all' | 'ends' | 'none'. onSelect(index, stop)이 있으면 정거장이 버튼이 된다.
export function TrainTrack({ stops = [], current = 0, color = 'yellow', orientation = 'horizontal', size = 'md', labels = 'all', step, onSelect, className, 'aria-label': ariaLabel }) {
  const n = stops.length
  const S = SIZES[size] || SIZES.md
  const cur = Math.max(0, Math.min(n - 1, current))
  const p = n > 1 ? cur / (n - 1) : 0
  const near = Math.round(cur)
  const col = lineRgb(color)
  const vertical = orientation === 'vertical'
  const rowH = Math.max(S.train * 0.62, S.dot + S.ring * 2)
  const stepPx = step || S.font * 4.2
  const f = (i) => (n > 1 ? i / (n - 1) : 0)

  const dot = (i) => {
    const reached = i <= cur + 0.001
    const isNear = i === near
    return (
      <span
        key={i}
        className="absolute rounded-pill"
        style={{
          [vertical ? 'top' : 'left']: `${f(i) * 100}%`,
          [vertical ? 'left' : 'top']: '50%',
          width: S.dot,
          height: S.dot,
          marginLeft: -S.dot / 2,
          marginTop: -S.dot / 2,
          background: reached ? tok('white') : tok('bg-base'),
          boxShadow: reached ? `0 0 0 ${S.ring}px ${col}${isNear ? `, 0 0 0 ${S.ring + 4}px ${lineRgb(color, 0.3)}` : ''}` : `0 0 0 ${Math.max(2, S.ring - 1)}px ${tok('text-pri', 0.28)}`,
          transition: 'background-color 320ms var(--ue-ease-out), box-shadow 320ms var(--ue-ease-out)',
        }}
      />
    )
  }

  const labelOf = (s, i) => {
    const isNear = i === near
    const reached = i <= cur + 0.001
    const show = labels === 'all' || (labels === 'ends' && (i === 0 || i === n - 1 || isNear))
    if (!show) return null
    return (
      <span className={cx('block min-w-0', vertical ? 'text-left' : 'text-center')} style={{ fontSize: S.font, lineHeight: 1.25, textWrap: 'balance' }}>
        <span className={cx('block', isNear ? 'text-text-pri' : reached ? 'text-text-sec' : 'text-text-meta')} style={{ fontWeight: isNear ? 750 : reached ? 600 : 500, letterSpacing: '-0.01em' }}>{s.label}</span>
        {s.labelKo && <span className="block text-text-meta" style={{ fontSize: S.font * 0.86, fontWeight: 450 }}>{s.labelKo}</span>}
      </span>
    )
  }

  const asItem = (s, i, inner) =>
    onSelect ? (
      <button type="button" key={s.id} onClick={() => onSelect(i, s)} className="ue-press block w-full cursor-pointer text-inherit" style={{ minHeight: 44 }} aria-current={i === near ? 'step' : undefined}>{inner}</button>
    ) : (
      <span key={s.id} className="block w-full" aria-current={i === near ? 'step' : undefined}>{inner}</span>
    )

  if (!vertical) {
    return (
      <div className={cx('relative w-full', className)} style={{ '--p': p }} role="list" aria-label={ariaLabel || 'Journey progress'}>
        <div className="relative" style={{ height: rowH, overflowX: 'clip' }}>
          <div className="absolute inset-y-0" style={{ left: `${50 / Math.max(1, n)}%`, right: `${50 / Math.max(1, n)}%` }}>
            <div className="absolute inset-x-0 rounded-pill" style={{ top: '50%', height: S.lw, marginTop: -S.lw / 2, background: tok('text-pri', 0.16) }} />
            <div className="absolute inset-x-0 rounded-pill" style={{ top: '50%', height: S.lw, marginTop: -S.lw / 2, background: col, transformOrigin: 'left center', transform: 'scaleX(var(--p))', transition: 'transform 720ms var(--ue-ease-out)' }} />
            {stops.map((_, i) => dot(i))}
            <div className="pointer-events-none absolute left-0 w-full" style={{ top: '50%', height: 0, transform: 'translate3d(calc(var(--p) * 100%), 0, 0)', transition: 'transform 720ms var(--ue-ease-out)' }}>
              <TrainIcon color={color} size={S.train} className="absolute" style={{ left: 0, top: 0, marginLeft: -S.train / 2, marginTop: -(S.train * 10) / 34 }} />
            </div>
          </div>
        </div>
        {labels !== 'none' && (
          <ol className="m-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, marginTop: S.gap * 0.6 }}>
            {stops.map((s, i) => <li key={s.id} className="px-1" role="listitem">{asItem(s, i, labelOf(s, i))}</li>)}
          </ol>
        )}
      </div>
    )
  }

  const colW = Math.max(S.train * 0.7, S.dot + S.ring * 2 + 6)
  return (
    <div className={cx('relative w-full', className)} style={{ '--p': p, height: n * stepPx, overflowY: 'clip' }} role="list" aria-label={ariaLabel || 'Journey progress'}>
      <div className="absolute" style={{ left: 0, width: colW, top: `${50 / Math.max(1, n)}%`, bottom: `${50 / Math.max(1, n)}%` }}>
        <div className="absolute inset-y-0 rounded-pill" style={{ left: '50%', width: S.lw, marginLeft: -S.lw / 2, background: tok('text-pri', 0.16) }} />
        <div className="absolute inset-y-0 rounded-pill" style={{ left: '50%', width: S.lw, marginLeft: -S.lw / 2, background: col, transformOrigin: 'center top', transform: 'scaleY(var(--p))', transition: 'transform 720ms var(--ue-ease-out)' }} />
        {stops.map((_, i) => dot(i))}
        <div className="pointer-events-none absolute top-0 h-full" style={{ left: '50%', width: 0, transform: 'translate3d(0, calc(var(--p) * 100%), 0)', transition: 'transform 720ms var(--ue-ease-out)' }}>
          <TrainIcon color={color} size={S.train} rotate={90} className="absolute" style={{ left: 0, top: 0, marginLeft: -S.train / 2, marginTop: -(S.train * 10) / 34 }} />
        </div>
      </div>
      {labels !== 'none' && (
        <ol className="absolute m-0 grid list-none p-0" style={{ left: colW + S.gap, right: 0, top: 0, bottom: 0, gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>
          {stops.map((s, i) => <li key={s.id} className="flex items-center" role="listitem">{asItem(s, i, labelOf(s, i))}</li>)}
        </ol>
      )}
    </div>
  )
}
