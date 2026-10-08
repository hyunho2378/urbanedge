import { Link } from 'react-router-dom'
import { Bi, cx } from '@urbanedge/ds'
import { METRO_STOPS } from '../../data/site.js'

// Gyeongju Metro 노선도. 실제 지하철 노선도처럼 실선 하나에 역 원을 꿰고, 지금 역(GY-01)만 노란 면으로 채운다.
// 모바일은 세로, 태블릿 이상은 가로로 배치한다. 역 전체가 링크라서 누르면 역 상세로 간다.
export default function MetroMap({ compact = false, className }) {
  const n = METRO_STOPS.length
  return (
    <ol className={cx('relative flex flex-col md:flex-row', className)}>
      {METRO_STOPS.map((s, i) => {
        const first = i === 0
        const last = i === n - 1
        const here = s.real
        const Tag = s.real ? Link : 'div'
        const tagProps = s.real ? { to: '/station/' + s.id } : {}
        return (
          <li key={s.id} className="relative min-w-0 md:flex-1">
            {/* 노선: 세로(모바일)는 원 가운데를 지나는 막대, 가로(데스크톱)는 원 가운데를 지나는 막대 */}
            <span aria-hidden="true" className={cx('absolute bg-yellow md:hidden', first ? 'top-24' : 'top-0', last ? 'bottom-1/2' : 'bottom-0')} style={{ left: 19, width: 6 }} />
            <span aria-hidden="true" className={cx('absolute hidden bg-yellow md:block', first ? 'md:left-20' : 'md:left-0', last ? 'md:right-auto md:w-20' : 'md:right-0')} style={{ top: 17, height: 6 }} />
            <Tag {...tagProps} className={cx('group relative grid grid-cols-[44px_minmax(0,1fr)] items-start gap-x-16 pb-24 md:grid-cols-1 md:gap-y-16 md:pb-0 md:pr-16', compact && 'pb-16')}>
              <span
                aria-hidden="true"
                className={cx(
                  'relative z-10 grid size-40 place-items-center justify-self-center rounded-pill border-4 border-yellow font-label text-body-sm font-bold transition-transform duration-base ease-out group-hover:scale-105 md:justify-self-start',
                  here ? 'bg-yellow text-text-onYellow' : 'bg-bg-base text-yellow',
                )}
              >
                {s.code.slice(-2)}
              </span>
              <span className="min-w-0 pt-4 md:pt-0">
                <span className={cx('t-label block', here ? 'text-yellow' : 'text-text-sec')}>{s.code}</span>
                <span className="t-strong mt-4 block break-words text-text-pri">
                  <Bi en={s.name.en} ko={s.name.ko} />
                </span>
                {!compact && s.real && (
                  <span className="t-caption mt-4 block max-w-xs text-text-sec">
                    <Bi en={s.summary.en} ko={s.summary.ko} />
                  </span>
                )}
              </span>
            </Tag>
          </li>
        )
      })}
    </ol>
  )
}
