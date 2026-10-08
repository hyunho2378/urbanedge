import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { LineBadge } from '@urbanedge/ds'
import { ROOMS } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'

// 노선 마퀴: 방 이름이 지하철 노선 안내처럼 흐른다. 일시정지 버튼, hover 정지, 동작 줄이기 정지를 제공한다(WCAG 2.2.2).
// 같은 목록을 두 반쪽에 나눠 담고 -50%만큼 이동하므로 이음새가 보이지 않는다. 한 반쪽이 가장 넓은 화면보다 길도록 목록을 4번 반복한다.
function Half({ hidden }) {
  return (
    <div className="flex shrink-0" aria-hidden={hidden || undefined}>
      {[0, 1, 2, 3].map((k) => (
        <ul key={k} className="flex shrink-0 items-center gap-40 pr-40 3xl:gap-64 3xl:pr-64">
          {ROOMS.map((r) => (
            <li key={r.id} className="flex items-center gap-16 3xl:gap-24">
              <LineBadge code={r.code} color={r.color} size="md" />
              <span className="ue-label whitespace-nowrap text-h3 text-text-pri 3xl:text-h2">{r.name}</span>
              <span aria-hidden="true" className="ml-24 text-h3 text-yellow 3xl:ml-40">‡</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

export default function RouteMarquee() {
  const pick = usePick()
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const label = pick({ ko: '포토 룸 노선', en: 'Photo room lines' })

  return (
    <section aria-label={label} className="relative flex items-center border-y border-hairline bg-bg-base">
      <p className="sr-only">{ROOMS.map((r) => `${r.code} ${r.name}`).join(', ')}</p>
      <div
        className="min-w-0 flex-1 overflow-hidden py-24 3xl:py-32"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-hidden="true"
      >
        <div
          className="flex w-max animate-marquee will-change-transform motion-reduce:animate-none"
          style={{ animationPlayState: paused || hover ? 'paused' : 'running' }}
        >
          <Half />
          <Half hidden />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? pick({ ko: '노선 흐름 재생', en: 'Play route marquee' }) : pick({ ko: '노선 흐름 일시정지', en: 'Pause route marquee' })}
        className="ue-press mx-16 grid size-48 shrink-0 place-items-center rounded-pill border border-hairlineStrong text-text-pri transition-colors duration-fast ease-out hover:border-yellow hover:text-yellow lg:mx-24"
      >
        {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
      </button>
    </section>
  )
}
