import { Link } from 'react-router-dom'
import { ROOMS } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { Photo, Section } from './parts.jsx'

export function PlatformBadge({ room, size = 32, className }) {
  return <span aria-hidden="true" style={{ width: size, height: size, fontSize: size * 0.5 }} className={`inline-grid shrink-0 place-items-center rounded-pill bg-yellow font-label font-bold leading-none text-bg-base ${className || ''}`}>{room.platform}</span>
}

// 방 세 곳: 사진과 이름만. 카드 전체가 링크다.
export default function Platforms() {
  const pick = usePick()
  return (
    <Section id="platforms" labelledBy="platforms-title" className="!py-24 md:!py-48">
      <h2 id="platforms-title" className="sr-only">{pick({ en: 'Rooms', ko: '방' })}</h2>
      <ul className="grid grid-cols-3 gap-12 md:gap-24">
        {ROOMS.map((r) => (
          <li key={r.id}>
            <Link to={`/rooms/${r.id}`} className="group block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow">
              <Photo src={r.photo.src} alt="" ratio="3 / 4" className="rounded-lg transition-transform duration-base ease-out group-hover:scale-[1.02]" sizes="33vw" />
              <p className="t-strong mt-8 text-text-pri">{pick(r.title)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
