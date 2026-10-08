import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, StationSign } from '@urbanedge/ds'
import { DISCLAIMER, LINE, ROOMS, SITE, STATION, stopById } from '../data/site.js'
import { B } from '../layout/B.jsx'
import { Photo, Section } from '../components/home/parts.jsx'
import { usePick } from '../i18n/index.jsx'
import NotFoundStation from './NotFound.jsx'

const COPY = {
  open: { en: 'Open station', ko: '운영 중인 역' },
  platforms: { en: 'Four platforms inside', ko: '역 안의 승강장 네 곳' },
  visit: { en: 'Plan your visit', ko: '방문 안내' },
  back: { en: 'Back to the Metro map', ko: '노선도로 돌아가기' },
  hours: { en: 'Hours', ko: '영업시간' },
}
const link = 'inline-flex min-h-48 items-center gap-8 font-ui text-body font-semibold text-yellow underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow-hover'

export default function Station() {
  const { id } = useParams()
  const pick = usePick()
  const s = stopById(id)
  if (!s || !s.real) return <NotFoundStation />

  return (
    <Section id="station" labelledBy="station-title">
      <p className="t-label text-yellow">
        {s.code} <B v={COPY.open} inline />
      </p>
      <div className="mt-16 grid gap-32 lg:grid-cols-12 lg:gap-x-64">
        <div className="lg:col-span-6">
          <h1 id="station-title" className="t-display text-text-pri"><B v={s.name} /></h1>
          <p className="t-lead mt-16 max-w-read text-text-sec"><B v={s.summary} /></p>
          <>
              <div className="mt-24">
                <StationSign station={{ code: STATION.code, name: STATION.name.en, nameKo: STATION.name.ko }} line={{ code: LINE.code, color: LINE.color }} />
              </div>
              <p className="t-body mt-24 text-text-pri"><B v={SITE.address} /></p>
              <p className="t-body text-text-sec"><B v={{ en: `Hours: ${SITE.hours.open} ~ ${SITE.hours.close}`, ko: `영업시간: ${SITE.hours.open} ~ ${SITE.hours.close}` }} inline /></p>
              <div className="mt-24 flex flex-col items-start gap-8">
                <Button as={Link} to="/visit" size="lg" className="text-body"><B v={COPY.visit} inline /><ArrowRight size={18} aria-hidden="true" /></Button>
              </div>
          </>
          <p className="mt-32"><Link to="/metro" className={link}><B v={COPY.back} inline /></Link></p>
          <p className="t-caption mt-24 text-text-meta" lang="en"><B v={DISCLAIMER} /></p>
        </div>

        <div className="lg:col-span-6">
          <>
              <Photo src={s.photo.src} alt={pick(s.photo.alt)} ratio="4 / 3" className="rounded-xl" priority />
              <h2 className="t-label mt-32 text-text-meta"><B v={COPY.platforms} /></h2>
              <ul className="mt-12 grid grid-cols-2 gap-12">
                {ROOMS.map((r) => (
                  <li key={r.id}>
                    <Link to={`/rooms/${r.id}`} className="group block">
                      <Photo src={r.photo.src} alt={pick(r.photo.alt)} ratio="4 / 5" className="rounded-lg transition-transform duration-base ease-out group-hover:-translate-y-4" />
                      <span className="t-strong mt-8 block text-text-pri"><span className="text-text-meta">{r.platform}</span> <B v={r.title} inline /></span>
                    </Link>
                  </li>
                ))}
              </ul>
          </>
        </div>
      </div>
    </Section>
  )
}
