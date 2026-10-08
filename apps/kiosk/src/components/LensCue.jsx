import { ArrowDown } from 'lucide-react'
import { T } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// LensCue: 렌즈가 화면 바로 아래 가운데에 있다는 기능 신호. 카메라 확인과 촬영 단계에서만 화면 아래 가장자리 가운데에 작게 놓인다.
// 기기 실측(geometry.js)에서 렌즈 중심은 화면 가로의 약 50.5% 지점이다. 터치를 받지 않는다.
export function LensCue({ node = COPY.common.lensCue }) {
  return (
    <div className="pointer-events-none absolute z-header flex items-center gap-16 rounded-pill bg-yellow px-36 text-text-onYellow" style={{ left: 970, bottom: 40, height: 72, transform: 'translate3d(-50%, 0, 0)' }} aria-hidden="true">
      <T n={node} as="span" className="kt-strong whitespace-nowrap" />
      <ArrowDown size={40} strokeWidth={2.4} className="k-nudge" />
    </div>
  )
}
