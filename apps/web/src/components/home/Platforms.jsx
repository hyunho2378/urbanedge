import { Link } from 'react-router-dom'
import { ERA } from '../../data/story.js'
import { ROOMS } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { Photo, Section } from './parts.jsx'

// 방 세 곳: 사진, 호선과 연도, 이름. 카드 전체가 링크다. 순서는 시간 순서(1 Retro, 2 Karaoke, 3 Subway)다.
export default function Platforms() {
  const pick = usePick()
  return (
    <Section id="platforms" labelledBy="platforms-title" className="!py-28 md:!py-56">
      <h2 id="platforms-title" className="t-headline text-text-pri">{pick({ en: 'Rooms', ko: '촬영 방' })}</h2>
      <ul className="mt-16 grid grid-cols-3 gap-12 [--room-ratio:0.75] md:gap-24 md:[--room-ratio:1.5]">
        {ROOMS.map((r) => (
          <li key={r.id}>
            <Link to={`/rooms/${r.id}`} className="group block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow">
              <Photo src={r.photo.src} alt="" ratio="var(--room-ratio)" className="rounded-lg transition-transform duration-base ease-out group-hover:scale-[1.02]" sizes="33vw" />
              <p className="t-label mt-8 text-text-meta">{pick(ERA[r.id].line)}</p>
              <p className="t-strong mt-4 text-body-sm text-text-pri md:text-body">{pick(r.title)}</p>
              <p className="t-caption mt-4 text-text-meta">{pick(ERA[r.id].year)}</p>
              <p className="t-caption mt-4 hidden text-text-sec md:block">{pick(r.summary)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
