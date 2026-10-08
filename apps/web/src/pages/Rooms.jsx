import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, StationSign, platformById } from '@urbanedge/ds'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { PLATFORMS, STATION } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'
import { RoomExplorer } from '../components/rooms/RoomExplorer.jsx'
import { ZONES } from '../components/rooms/zones.js'

const T = {
  title: { en: 'Platforms', ko: '승강장' },
  h1: { en: 'Inside the shop', ko: '매장 안' },
  open: { en: 'Open room', ko: '방 보기' },
}

export default function Rooms() {
  const v = useV()
  usePageTitle(T.title)
  const [active, setActive] = useState('subway')
  const at = Math.max(0, PLATFORMS.findIndex((s) => s.id === active))
  const st = PLATFORMS[at]
  const prev = PLATFORMS[(at - 1 + PLATFORMS.length) % PLATFORMS.length]
  const next = PLATFORMS[(at + 1) % PLATFORMS.length]
  const photo = st.photoList[1] || st.photoList[0]
  const facts = ZONES.find((z) => z.id === st.id)
  const nm = (p) => ({ name: v(p.title) })

  return (
    <PageShell>
      <header className="pt-16 md:pt-24">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.h1} as="h1" role="headline" className="text-text-pri" />
        </Container>
      </header>
      <RoomExplorer />

      <section aria-label={v(T.title)} className="pb-64 md:pb-96">
        <Container className="4xl:max-w-screen-4xl">
          <div role="tablist" aria-label={v(T.title)} className="flex flex-wrap gap-8">
            {PLATFORMS.map((p) => (
              <button key={p.id} type="button" role="tab" aria-selected={p.id === active} onClick={() => setActive(p.id)} className={`min-h-40 rounded-pill border px-16 text-body-sm font-medium transition-colors ${p.id === active ? 'border-yellow bg-yellow text-text-on-yellow' : 'border-text-pri/25 text-text-sec hover:border-yellow'}`}>
                {p.no} · {v(p.title)}
              </button>
            ))}
          </div>
          <div key={st.id} className="island-swap mt-24 grid gap-x-48 gap-y-24 lg:grid-cols-12">
            <Link to={`/rooms/${st.id}`} aria-label={`${v(T.open)}: ${v(st.title)}`} className="relative block overflow-hidden rounded-lg bg-bg-panel lg:col-span-5" style={{ aspectRatio: '4 / 5' }}>
              <img src={photo.thumb} srcSet={`${photo.thumb} ${photo.w}w, ${photo.full} 1350w`} sizes="(min-width: 1024px) 40vw, 92vw" alt={v(photo.alt)} width={photo.w} height={photo.h} loading="lazy" decoding="async" className="size-full object-cover" />
            </Link>
            <div className="lg:col-span-7 lg:pt-16">
              <StationSign station={{ code: STATION.code, name: v({ en: STATION.name, ko: STATION.nameKo }) }} platform={platformById(st.id)} line={{ code: 'GY', color: 'yellow' }} prev={nm(prev)} next={nm(next)} size="md" />
              {facts && <p className="mt-24 max-w-read text-text-sec">{v(facts.desc)}</p>}
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  )
}
