import { ArrowDown } from 'lucide-react'
import { T } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 출구 표지: 지하철 출구 안내판처럼 검정 판에 노란 번호 칸과 EXIT 글자, 아래를 가리키는 화살표. 인화물이 나오는 슬롯(1번 출구) 쪽을 가리킨다.
// 노랑 바탕 위에서 쓰도록 판 전체가 검정이다.
export function ExitSign({ className }) {
  return (
    <div className={`inline-flex items-stretch gap-12 rounded-xl bg-bg-base p-12 text-text-pri ${className || ''}`}>
      <span className="grid place-items-center rounded-lg bg-yellow px-32 font-label text-text-onYellow" style={{ fontSize: 72, fontWeight: 800, lineHeight: 1 }}>
        1
      </span>
      <span className="px-20 py-8">
        <T n={COPY.finish.exit} as="span" className="kt-headline" />
        <T n={COPY.finish.exitSub} as="span" className="kt-caption text-text-sec" />
      </span>
      <span className="k-nudge grid place-items-center rounded-lg bg-yellow px-28 text-text-onYellow">
        <ArrowDown size={56} strokeWidth={3.4} aria-hidden="true" />
      </span>
    </div>
  )
}
