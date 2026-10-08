import { T, useLang } from '../../components/lang.jsx'
import { COPY } from '../copy.js'

// 3. intro v3: 온보딩 첫 순간. 노선도처럼 네 정거장(선택, 결제, 촬영, 인화)을 한 줄로 보여 주는 한 장이다.
const X0 = 240
const X1 = 1680
export default function Intro() {
  const lang = useLang()
  const stops = COPY.intro.stops
  const gap = (X1 - X0) / (stops.length - 1)
  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 240, width: 1300 }}>
        <T n={COPY.intro.title} as="h1" className="kt-title" />
        <T n={COPY.intro.body} as="p" className="kt-lead mt-24 text-text-sec" />
      </div>
      <ol className="absolute inset-x-0" style={{ top: 600, height: 280 }} aria-label={COPY.intro.title[lang]}>
        <span className="absolute rounded-pill bg-yellow" style={{ left: X0, width: X1 - X0, top: 34, height: 12 }} aria-hidden="true" />
        {stops.map((s, i) => (
          <li key={s.en} className="k-rise absolute flex flex-col items-center text-center" style={{ left: X0 + i * gap - 200, width: 400, top: 0, animationDelay: `${i * 90}ms` }}>
            <span className="kt-strong kt-num grid place-items-center rounded-pill bg-bg-base text-text-pri ring-8 ring-yellow" style={{ width: 80, height: 80 }} aria-hidden="true">
              {i + 1}
            </span>
            <T n={s} as="span" className="kt-subhead mt-32" />
            <T n={s.sub} as="span" className="kt-body mt-4 text-text-sec" />
          </li>
        ))}
      </ol>
    </div>
  )
}
