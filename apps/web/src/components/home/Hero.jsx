import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, cx } from '@urbanedge/ds'
import { ROOMS as ROOMS_DATA } from '../../data/site.js'
import { byTimeOrder } from '../../data/story.js'
const ROOMS = byTimeOrder(ROOMS_DATA)
import { SLOGAN } from '../../data/story.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import { Wrap } from '../../layout/Wrap.jsx'
import { useReducedMotion } from '../pages/hooks.js'

const COPY = {
  title: { en: 'UrbanEdge', ko: '어반엣지' },
  sub: { en: 'Self photo studio, Hwangridan-gil', ko: '황리단길 셀프 사진관' },
  hours: { en: 'Open 10:00 to 24:00', ko: '매일 10:00 ~ 24:00' },
  go: { en: 'Directions', ko: '오시는 길' },
  story: { en: 'The story', ko: '어반엣지 이야기' },
  view: { en: 'View room', ko: '방 보기' },
  rooms: { en: 'Rooms', ko: '촬영 방' },
}
// 방 색은 리터럴 클래스로 둔다(Tailwind가 찾을 수 있게).
const DOT = { green: 'bg-line-green', red: 'bg-line-red', yellow: 'bg-yellow' }
const CYCLE_MS = 3600

// 홈 히어로: 횡단보도 포스터 위에 이름, 슬로건, 소개, 길 안내 버튼. 위쪽 가운데에 다이내믹 아일랜드 알약 하나가
// 방 세 곳(1 레트로 1968, 2 노래방 2008, 3 지하철 2000년대)을 시간 순서대로 돌아가며 보여 준다. 누르면 펼쳐져 사진과 '방 보기'가 나온다.
export default function Hero() {
  const pick = usePick()
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const room = ROOMS[i]

  useEffect(() => {
    if (open || reduced) return undefined
    const t = setInterval(() => setI((k) => (k + 1) % ROOMS.length), CYCLE_MS)
    return () => clearInterval(t)
  }, [open, reduced])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const dur = reduced ? '0ms' : '520ms'
  const ease = 'cubic-bezier(0.32, 1.2, 0.4, 1)'

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden" style={{ minHeight: 'min(78dvh, 620px)' }}>
      <picture>
        <source media="(max-width: 640px)" srcSet="/img/lg/hero-crosswalk-m.jpg" />
        <img src="/img/lg/hero-crosswalk.jpg" alt="" aria-hidden="true" loading="eager" decoding="async" draggable="false" className="absolute inset-0 -z-10 size-full object-cover" />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-base via-transparent to-black/50" />

      <Wrap className="relative flex flex-col items-center gap-24 pb-40 pt-96 text-center md:pt-128">
        <div className="flex w-full justify-center" style={{ height: open ? 216 : 48, transition: `height ${dur} ${ease}` }}>
          <div
            className="overflow-hidden bg-black text-left text-text-pri shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-white/15"
            style={{ width: open ? 'min(100%, 360px)' : 'min(100%, 300px)', borderRadius: open ? 28 : 24, transition: `width ${dur} ${ease}, border-radius ${dur} ${ease}` }}
          >
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={`${pick(COPY.rooms)}: ${pick(room.title)}`}
              className="flex h-48 w-full items-center gap-12 px-16 text-left"
            >
              <span aria-hidden="true" className={cx('size-12 shrink-0 rounded-pill', DOT[room.color])} />
              <span key={room.id} className="min-w-0 flex-1 truncate font-ui text-body-sm font-semibold" style={reduced ? undefined : { animation: 'ue-island-in 360ms ease-out' }}>
                {room.platform} {pick(room.title)}
              </span>
              <span className="shrink-0 font-label text-caption text-text-sec">{room.era ? pick(room.era).split(':')[0] : ''}</span>
            </button>
            <div className="px-16 pb-16" style={{ opacity: open ? 1 : 0, transition: reduced ? 'none' : `opacity 240ms ease-out ${open ? '160ms' : '0ms'}`, pointerEvents: open ? 'auto' : 'none' }} aria-hidden={!open}>
              <img src={room.photo.src} alt="" draggable="false" className="h-96 w-full rounded-lg object-cover" />
              <div className="mt-12 flex items-center justify-between gap-12">
                <div className="flex gap-8" role="group" aria-label={pick(COPY.rooms)}>
                  {ROOMS.map((r, k) => (
                    <button key={r.id} type="button" tabIndex={open ? 0 : -1} onClick={() => setI(k)} aria-label={pick(r.title)} aria-pressed={k === i} className="grid size-32 place-items-center">
                      <span className={cx('h-8 rounded-pill transition-all duration-base ease-out', k === i ? 'w-24 bg-yellow' : 'w-8 bg-text-meta')} />
                    </button>
                  ))}
                </div>
                <Link to={`/rooms/${room.id}`} tabIndex={open ? 0 : -1} className="inline-flex min-h-40 items-center gap-8 rounded-pill bg-yellow px-16 font-ui text-body-sm font-semibold text-text-onYellow">
                  {pick(COPY.view)}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <h1 id="hero-title" className="t-title text-text-pri">{pick(COPY.title)}</h1>
          <p className="t-lead mt-12 text-text-pri"><B v={SLOGAN} /></p>
          <p className="t-body mt-12 text-text-sec">{pick(COPY.sub)}</p>
          <p className="t-body text-text-sec">{pick(COPY.hours)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-24 gap-y-4">
          <Button as={Link} to="/visit" size="lg">{pick(COPY.go)}</Button>
          <Link to="/brand" className="inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow">
            {pick(COPY.story)}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Wrap>
    </section>
  )
}
