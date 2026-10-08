import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useV } from '../pages/Bilingual.jsx'
import { ZONES } from './zones.js'
import './room-explorer.css'

const W = 1412
const H = 1114

export function RoomExplorer() {
  const v = useV()
  const [active, setActive] = useState('subway')
  const zone = ZONES.find((z) => z.id === active) || ZONES[0]
  const onKey = (e, i) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const d = ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1
    const n = (i + d + ZONES.length) % ZONES.length
    setActive(ZONES[n].id)
    e.currentTarget.parentElement.children[n]?.focus()
  }
  return (
    <section className="room-explorer" aria-label={v({ ko: '매장 안', en: 'Inside the shop' })}>
      <div className="room-explorer__wrap room-explorer__layout">
        <div className="room-explorer__stage">
          <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={v({ ko: '매장 투시도', en: 'Shop cutaway' })}>
            <defs>
              <mask id="rx-cut">
                <rect width={W} height={H} fill="#fff" />
                <polygon points={zone.poly} fill="#000" />
              </mask>
            </defs>
            <image href="/img/space/urbanedge-space.jpg" width={W} height={H} />
            <rect width={W} height={H} fill="#0b0b0b" opacity=".62" mask="url(#rx-cut)" className="room-explorer__dim" />
            <polygon points={zone.poly} fill="none" stroke="#f5c518" strokeWidth="4" strokeLinejoin="round" pointerEvents="none" />
            {ZONES.map((z) => (
              <polygon key={z.id} points={z.poly} fill="transparent" onClick={() => setActive(z.id)} style={{ cursor: 'pointer' }}>
                <title>{v(z.title)}</title>
              </polygon>
            ))}
          </svg>
        </div>
        <div className="room-explorer__panel">
          <div className="room-explorer__choices" role="group" aria-label={v({ ko: '영역', en: 'Areas' })}>
            {ZONES.map((z, i) => (
              <button key={z.id} type="button" aria-pressed={active === z.id} className={`room-explorer__choice ${active === z.id ? 'room-explorer__choice--active' : ''}`} onClick={() => setActive(z.id)} onKeyDown={(e) => onKey(e, i)}>
                <span>{v(z.title)}</span>
              </button>
            ))}
          </div>
          <div className="room-explorer__detail" role="status" aria-live="polite">
            <h3>{v(zone.title)}</h3>
            <p>{v(zone.desc)}</p>
            {zone.platform && (
              <Link to={`/rooms/${zone.platform}`} className="room-explorer__platform-link">
                <span>{v({ ko: '방 보기', en: 'View room' })}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
