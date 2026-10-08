import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, cx } from '@urbanedge/ds'
import { ROOMS, STATION } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { Wrap } from '../../layout/Wrap.jsx'

const COPY = {
  title: { en: 'UrbanEdge', ko: '어반엣지' },
  sub: { en: 'Self photo studio, Hwangridan-gil', ko: '황리단길 셀프 사진관' },
  hours: { en: 'Open 10:00 to 24:00', ko: '매일 10:00 ~ 24:00' },
  go: { en: 'See this room', ko: '이 방 보기' },
}

// 홈 히어로: 배경 사진 위에 이름, 한 줄 소개, 방 세 곳 전환 카드 하나.
export default function Hero() {
  const pick = usePick()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const room = ROOMS[i]

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setI((k) => (k + 1) % ROOMS.length), 6500)
    return () => clearInterval(t)
  }, [paused])

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden" style={{ minHeight: 'min(70dvh, 560px)' }}>
      {ROOMS.map((r, k) => (
        <img key={r.id} src={r.photo.src} alt="" aria-hidden="true" loading={k === 0 ? 'eager' : 'lazy'} decoding="async" draggable="false" className={cx('absolute inset-0 -z-10 size-full object-cover transition-opacity duration-slow ease-out', k === i ? 'opacity-100' : 'opacity-0')} />
      ))}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-base via-transparent to-bg-base/60" />

      <Wrap className="relative flex flex-col items-center gap-24 pb-48 pt-72 text-center md:pt-96">
        <div>
          <h1 id="hero-title" className="t-title text-text-pri">{pick(COPY.title)}</h1>
          <p className="t-lead mt-8 text-yellow">{pick(COPY.sub)}</p>
          <p className="t-body mt-4 text-text-sec">{pick(COPY.hours)}</p>
        </div>

        <div className="w-full max-w-md overflow-hidden rounded-xl border border-text-pri/15 bg-bg-base/90 text-left" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
          <div className="flex items-center gap-12 px-20 py-12">
            <span aria-hidden="true" className="grid size-32 shrink-0 place-items-center rounded-pill bg-yellow font-label text-body-sm font-bold text-bg-base">GY</span>
            <span className="t-label text-text-sec">{STATION.code} UrbanEdge</span>
          </div>
          <div className="flex items-center justify-between gap-16 bg-black px-20 py-20">
            <div className="min-w-0">
              <p key={room.id} className="animate-fade-up font-label text-h2 font-bold leading-tight text-yellow">{pick(room.title)}</p>
            </div>
            <span aria-hidden="true" className={cx('grid size-56 shrink-0 place-items-center rounded-pill bg-yellow font-label text-h3 font-bold text-bg-base')}>{room.platform}</span>
          </div>
          <div className="flex items-center justify-between gap-12 px-20 py-12" role="group" aria-label={pick({ en: 'Rooms', ko: '방' })}>
            <div className="flex gap-8">
              {ROOMS.map((r, k) => (
                <button key={r.id} type="button" onClick={() => setI(k)} aria-label={pick(r.title)} aria-pressed={k === i} className="grid size-48 place-items-center">
                  <span className={cx('h-8 rounded-pill transition-all duration-base ease-out', k === i ? 'w-32 bg-yellow' : 'w-8 bg-text-meta')} />
                </button>
              ))}
            </div>
            <Button as={Link} to={`/rooms/${room.id}`} size="md">{pick(COPY.go)}</Button>
          </div>
        </div>
      </Wrap>
    </section>
  )
}
