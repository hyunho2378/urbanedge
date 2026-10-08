import { ChevronsDown } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 승강장 가장자리: 화면 맨 아래의 노란 점자 블록 띠와, 아래를 가리키는 표지판. 카메라는 화면 바로 아래에 있다.
// 표지판 끝이 화면 아래 가장자리를 향해 계속 흔들리고, 가운데 렌즈 모양에서 물결이 퍼진다.
// tone: yellow(검정 바탕 위) 또는 ink(노랑 바탕 위)
export function PlatformEdge({ strong = false, tone = 'yellow', coachId }) {
  const ink = tone === 'ink'
  const ring = ink ? 'border-yellow' : 'border-bg-base'
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-header" aria-hidden="true">
      <div className="k-tactile absolute inset-x-0 bottom-0" style={{ height: 40 }} />
      <div className="k-nudge absolute bottom-0 left-1/2" style={{ width: 560, marginLeft: -280 }} data-coach={coachId}>
        <div className={cx('relative text-center', ink ? 'bg-bg-base text-text-pri' : 'bg-yellow text-text-onYellow')} style={{ height: 214, clipPath: 'polygon(0 0, 100% 0, 100% 66%, 50% 100%, 0 66%)' }}>
          <T n={COPY.common.lensCue} as="p" className="kt-strong pt-24" />
          <T n={COPY.common.lensCueSub} as="p" className="kt-caption" />
          <span className="absolute left-1/2 grid place-items-center" style={{ bottom: 18, width: 64, height: 64, marginLeft: -32 }}>
            <span className={cx('k-ripple absolute inset-0 rounded-pill border-4', ring)} />
            <span className={cx('k-ripple k-ripple-2 absolute inset-0 rounded-pill border-4', ring)} />
            <span className={cx('relative grid size-56 place-items-center rounded-pill', ink ? 'bg-yellow' : 'bg-bg-base')}>
              <span className={cx('size-28 rounded-pill', ink ? 'bg-bg-base' : 'bg-bg-raised')} />
              <span className="absolute size-12 rounded-pill bg-yellow-hover" style={{ top: 14, left: 14 }} />
            </span>
          </span>
        </div>
      </div>
      {strong && <ChevronsDown size={72} strokeWidth={3} className="k-chevron absolute left-1/2 text-yellow" style={{ bottom: 220, marginLeft: -36 }} />}
    </div>
  )
}
