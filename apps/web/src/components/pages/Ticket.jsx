import { cx } from '@urbanedge/ds'
import { PlatformBadge } from './PlatformBadge.jsx'
import { Tx } from './Bilingual.jsx'

// 승차권형 카드(Metro Ticket): 왼쪽 본권, 점선 절취선, 오른쪽 부권. 절취선 위아래의 반원 홈은 바탕색 원으로 만든다.
// 한 번의 촬영 여정을 뜻하는 장난스러운 설정이며 실제 교통수단에는 쓸 수 없다. 모든 문구는 { en, ko }다.
export function Ticket({ platform, line, station, fare, date, admit, wink, className, children }) {
  return (
    <div className={cx('relative flex overflow-hidden rounded-lg bg-white text-black', className)}>
      <div className="min-w-0 flex-1 p-20 md:p-32">
        <Tx {...line} role="label" className="text-bg-raised" />
        <div className="mt-16 flex items-center gap-16">
          <PlatformBadge no={platform.no} accent={platform.accent} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-ui text-h2 font-extrabold leading-none tracking-tight">{platform.name}</p>
            <Tx {...station} as="p" role="caption" className="mt-4 font-semibold text-bg-raised" />
          </div>
        </div>
        <Tx {...fare} as="p" role="caption" className="mt-16 text-bg-raised" />
        <Tx {...wink} as="p" role="caption" className="mt-4 text-bg-raised" />
        {children && <div className="mt-20">{children}</div>}
      </div>
      <div aria-hidden="true" className="relative w-0 border-l border-solid border-bg-raised">
        <span className="absolute -left-12 -top-12 size-24 rounded-pill bg-bg-base" />
        <span className="absolute -bottom-12 -left-12 size-24 rounded-pill bg-bg-base" />
      </div>
      <div className="flex w-96 shrink-0 flex-col items-center justify-between bg-yellow px-8 py-20 text-center text-text-onYellow md:w-120">
        <Tx {...admit} role="label" />
        <p className="font-label text-h2 font-bold leading-none tabular-nums">{date}</p>
        <p className="t-caption font-semibold">GY-01</p>
      </div>
    </div>
  )
}
