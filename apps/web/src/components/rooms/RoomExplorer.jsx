import { useMemo, useRef, useEffect, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react'
import { Link } from 'react-router-dom'
import { platformById } from '@urbanedge/ds'
import { useV } from '../pages/Bilingual.jsx'
import { STATION } from '../pages/content.js'
import { ZONES } from './zones.js'
import './room-explorer.css'

const W = 1412
const H = 1114

const centroid = (poly) => {
  const pts = poly.split(' ').map((p) => p.split(',').map(Number))
  return { x: pts.reduce((a, p) => a + p[0], 0) / pts.length, y: pts.reduce((a, p) => a + p[1], 0) / pts.length }
}

const T = {
  area: { ko: '매장 안', en: 'Inside the shop' },
  plan: { ko: '매장 투시도', en: 'Shop cutaway' },
  areas: { ko: '영역', en: 'Areas' },
  view: { ko: '방 보기', en: 'View room' },
  hint: { ko: '투시도에서 방을 눌러 보세요', en: 'Tap a room on the plan' },
  prev: { ko: '이전 방', en: 'Previous room' },
  next: { ko: '다음 방', en: 'Next room' },
  platform: { ko: '번 승강장', en: 'Platform' },
}

export function RoomExplorer() {
  const v = useV()
  const [active, setActive] = useState('entrance')
  const [hover, setHover] = useState(null)
  const choicesRef = useRef(null)
  const zone = ZONES.find((z) => z.id === active) || ZONES[0]
  const rooms = useMemo(() => ZONES.filter((z) => z.platform), [])
  const at = rooms.findIndex((z) => z.id === active)
  const step = (d) => setActive(rooms[(at + d + rooms.length) % rooms.length].id)
  const pf = zone.platform ? platformById(zone.platform) : null
  const spots = useMemo(() => ZONES.map((z) => ({ ...z, c: centroid(z.poly) })), [])
  const tip = spots.find((z) => z.id === hover && !z.platform)

  useEffect(() => {
    const el = choicesRef.current?.querySelector('[aria-pressed="true"]')
    if (el && choicesRef.current.scrollWidth > choicesRef.current.clientWidth) {
      const box = choicesRef.current
      box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' })
    }
  }, [active])

  const onKey = (e, i) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const d = ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1
    const n = (i + d + ZONES.length) % ZONES.length
    setActive(ZONES[n].id)
    e.currentTarget.parentElement.children[n]?.focus()
  }
  const mouse = (id) => (e) => { if (e.pointerType === 'mouse') setHover(id) }

  return (
    <section className="rx" aria-label={v(T.area)}>
      <div className="rx__stage">
        <div className="rx__plan">
          <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={v(T.plan)}>
            <defs>
              <mask id="rx-cut">
                <rect width={W} height={H} fill="#fff" />
                <polygon points={zone.poly} fill="#000" />
              </mask>
            </defs>
            <image href="/img/space/urbanedge-space.jpg" width={W} height={H} />
            <rect width={W} height={H} fill="#0b0b0b" opacity=".62" mask="url(#rx-cut)" className="rx__dim" />
            {rooms.filter((z) => z.id !== active).map((z) => (
              <polygon key={`p-${z.id}`} points={z.poly} className="rx__pulse" pointerEvents="none" />
            ))}
            <polygon points={zone.poly} className="rx__outline" pointerEvents="none" />
            {ZONES.map((z) => (
              <polygon key={z.id} points={z.poly} className="rx__hit" data-hover={hover === z.id && active !== z.id ? 'true' : undefined} onClick={() => setActive(z.id)} onPointerEnter={mouse(z.id)} onPointerLeave={() => setHover(null)}>
                <title>{v(z.title)}</title>
              </polygon>
            ))}
          </svg>
          {spots.filter((z) => z.platform && z.id !== active).map((z) => (
            <button key={z.id} type="button" tabIndex={-1} aria-hidden="true" className="rx__pin" style={{ left: `${(z.c.x / W) * 100}%`, top: `${(z.c.y / H) * 100}%` }} onClick={() => setActive(z.id)}>
              <span className="rx__pin-dot" />
              <span className="rx__pin-label">{v(z.title)}</span>
            </button>
          ))}
          {tip && <span className="rx__tip" style={{ left: `${(tip.c.x / W) * 100}%`, top: `${(tip.c.y / H) * 100}%` }}>{v(tip.title)}</span>}
        </div>
      </div>

      <div className="rx__side">
        <div ref={choicesRef} className="rx__choices" role="group" aria-label={v(T.areas)}>
          {ZONES.map((z, i) => (
            <button key={z.id} type="button" aria-pressed={active === z.id} className="rx__choice" onClick={() => setActive(z.id)} onKeyDown={(e) => onKey(e, i)}>
              {v(z.title)}
            </button>
          ))}
        </div>

        <div className="rx__info" role="status" aria-live="polite">
          <div key={zone.id} className="rx__swap">
            {pf ? (
              <div className="rx__nav">
                <button type="button" className="rx__arrow" aria-label={`${v(T.prev)}: ${v(rooms[(at - 1 + rooms.length) % rooms.length].title)}`} onClick={() => step(-1)}>
                  <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <div className="rx__sign">
                  <span className="rx__sign-bar" aria-hidden="true" />
                  <span className="rx__sign-pill">
                    <span className="rx__sign-code">{STATION.code}</span>
                    <span className="rx__sign-name">{v({ en: STATION.name, ko: STATION.nameKo })}</span>
                  </span>
                  <span className="rx__sign-room">
                    <span className="rx__sign-no">{pf.number}</span>
                    {v(zone.title)}
                  </span>
                </div>
                <button type="button" className="rx__arrow" aria-label={`${v(T.next)}: ${v(rooms[(at + 1) % rooms.length].title)}`} onClick={() => step(1)}>
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <h3 className="rx__title">{v(zone.title)}</h3>
            )}
            <p className="rx__desc">{v(zone.desc)}</p>
            {zone.platform ? (
              <Link to={`/rooms/${zone.platform}`} className="rx__go">
                {v(T.view)}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <p className="rx__hint"><MousePointerClick size={16} aria-hidden="true" />{v(T.hint)}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
