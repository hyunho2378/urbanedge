import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, cx } from '@urbanedge/ds'
import { LINE_BG, LINE_ON, ROOMS } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import StationMap from './StationMap.jsx'
import StationTag from './StationTag.jsx'
import { useMedia } from './hooks.js'
import { Head, Photo, Section } from './parts.jsx'

const COPY = {
  label: { en: 'UrbanEdge Station', ko: '어반엣지역' },
  title: { en: 'Pick your platform.', ko: '승강장 고르기' },
  pose: { en: 'Pose idea', ko: '포즈 제안' },
  why: { en: 'Why it photographs well', ko: '사진이 잘 나오는 이유' },
  board: { en: 'Departures', ko: '출발 안내' },
  boarding: { en: 'Now boarding', ko: '탑승 중' },
  dest: { en: 'Destination: UrbanEdge', ko: '행선지: 어반엣지' },
  see: { en: 'See the room', ko: '방 자세히 보기' },
}
const VIBE = {
  subway: { en: 'Commute', ko: '출퇴근' },
  karaoke: { en: 'Duet', ko: '듀엣' },
  retro: { en: 'Booth', ko: '부스' },
}

export function PlatformBadge({ room, size = 32, className }) {
  return (
    <span aria-hidden="true" style={{ width: size, height: size }} className={cx('inline-grid shrink-0 place-items-center rounded-pill font-label font-bold leading-none', LINE_BG[room.color], LINE_ON[room.color], className)}>
      <span style={{ fontSize: size * 0.5 }}>{room.platform}</span>
    </span>
  )
}

export default function Platforms() {
  const pick = usePick()
  const narrow = useMedia('(max-width: 767px)')
  const [id, setId] = useState('subway')
  const r = ROOMS.find((x) => x.id === id) || ROOMS[0]

  useEffect(() => {
    const on = (e) => ROOMS.some((x) => x.id === e.detail) && setId(e.detail)
    window.addEventListener('ue:platform', on)
    return () => window.removeEventListener('ue:platform', on)
  }, [])

  return (
    <Section id="platforms" labelledBy="platforms-title" className="overflow-hidden">
      <Head label={COPY.label} title={COPY.title} titleId="platforms-title" lean />

      <div className="mt-16 md:mt-40">
        <StationMap activeId={id} onSelect={setId} />
      </div>

      <div className="mt-16 grid gap-16 md:mt-40 md:gap-24 lg:grid-cols-12 lg:gap-x-48">
        <div className="relative lg:col-span-7">
          <div key={r.id} className="animate-pop-in">
            <Photo src={r.photo.src} alt={pick(r.photo.alt)} ratio={narrow ? '21 / 9' : '16 / 9'} className="rounded-lg" sizes="(min-width: 1024px) 60vw, 92vw" />
          </div>
          <div className="absolute -bottom-16 left-12 md:left-24">
            <StationTag room={r} />
          </div>
        </div>

        <div className="pt-16 lg:col-span-5 lg:pt-0">
          <div key={r.id} className="animate-fade-up">
            <p className="t-body line-clamp-4 text-text-pri md:line-clamp-none"><B v={r.concept} /></p>
            <div className="mt-12 md:mt-20">
              <p className="t-label text-yellow"><B v={COPY.pose} /></p>
              <p className="t-strong mt-4 text-text-pri"><B v={r.pose} /></p>
            </div>
            <div className="mt-16 hidden md:block">
              <p className="t-label text-yellow"><B v={COPY.why} /></p>
              <p className="t-body mt-4 text-text-sec"><B v={r.why} /></p>
            </div>
          </div>
          <div className="mt-16 md:mt-24">
            <Button as={Link} to={`/rooms/${r.id}`} size="lg" className="text-body">
              <B v={COPY.see} inline />
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-32 hidden rounded-lg bg-black p-20 md:block" role="group" aria-label={pick(COPY.board)}>
            <p className="t-label flex items-center justify-between text-text-meta">
              <B v={COPY.board} inline />
              <B v={COPY.dest} inline />
            </p>
            <ul className="mt-8">
              {ROOMS.map((x) => (
                <li key={x.id}>
                  <button type="button" onClick={() => setId(x.id)} aria-pressed={x.id === id} className={cx('flex min-h-48 w-full items-center gap-16 text-left font-label text-h4 font-bold uppercase tracking-wide transition-colors duration-fast ease-out', x.id === id ? 'text-yellow' : 'text-text-sec hover:text-text-pri')}>
                    <PlatformBadge room={x} size={28} />
                    <span className="min-w-0 flex-1 truncate"><B v={x.title} inline /></span>
                    <span className={cx('shrink-0 text-body-sm', x.id === id ? 'animate-pulse-soft' : 'text-text-meta')}><B v={x.id === id ? COPY.boarding : VIBE[x.id]} inline /></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}
