import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, DepartureBoard, PLATFORMS, cx } from '@urbanedge/ds'
import { LINE, ROOMS, STATION } from '../../data/site.js'
import { useMedia } from './hooks.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import { Wrap } from '../../layout/Wrap.jsx'
import './board-fix.css'
import { scrollToId } from '../../layout/scroll.js'

const COPY = {
  line1: { en: 'UrbanEdge', ko: '어반엣지' },
  line2: { en: 'Photo studio in Hwangridan-gil', ko: '황리단길 셀프 사진관' },
  lead: {
    en: 'Three rooms: Subway, Karaoke and Retro. Open 10:00 to 24:00.',
    ko: '지하철, 노래방, 레트로 방이 있다. 10:00부터 24:00까지 운영한다.',
  },
  board: { en: 'Board this platform', ko: '이 승강장 탑승' },
  way: { en: 'Show me the way', ko: '길 찾기' },
}
const GLOW = { yellow: '--ue-line-yellow', red: '--ue-line-red', blue: '--ue-line-blue', green: '--ue-line-green' }
const BOARD_STATION = { code: STATION.code, name: STATION.name.en, nameKo: STATION.name.ko }
// 좁은 화면에서는 역 코드를 빼서 역명이 잘리지 않게 한다(GY 배지가 노선을 알려 준다).
const BOARD_STATION_NARROW = { code: '', name: STATION.name.en, nameKo: STATION.name.ko }
const BOARD_LINE = { code: LINE.code, color: LINE.color, name: LINE.name.en, nameKo: LINE.name.ko }

// 홈 히어로: 출발 안내판이 주인공이다. 화살표, 스와이프, 키보드, 자동 넘김(일시정지)으로 승강장을 넘기고 배경 사진이 따라 바뀐다.
export default function Hero() {
  const pick = usePick()
  const nav = useNavigate()
  const [i, setI] = useState(0)
  const [warm, setWarm] = useState(false)
  const tall = useMedia('(min-width: 1024px) and (min-height: 1000px)')
  const tiny = useMedia('(max-width: 359px)')
  const narrow = useMedia('(max-width: 479px)')
  const room = ROOMS[i]
  const sec = useRef(null)

  // 첫 사진만 먼저 불러오고 나머지 승강장 사진은 첫 화면이 그려진 뒤에 불러온다(모바일 부담을 줄인다).
  useEffect(() => {
    const t = window.requestIdleCallback ? window.requestIdleCallback(() => setWarm(true), { timeout: 1500 }) : setTimeout(() => setWarm(true), 800)
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(t) : clearTimeout(t))
  }, [])

  const glow = `radial-gradient(120% 70% at 50% 100%, rgb(var(${GLOW[room.color] || GLOW.yellow}) / 0.34), transparent 70%)`

  return (
    <section ref={sec} aria-labelledby="hero-title" className="relative isolate flex flex-col justify-center overflow-hidden" style={{ minHeight: '100dvh' }}>
      {ROOMS.map((r, k) => (
        <img
          key={r.id}
          src={r.photo.src}
          alt=""
          aria-hidden="true"
          loading={k === 0 ? 'eager' : 'lazy'}
          fetchPriority={k === 0 ? 'high' : 'low'}
          decoding="async"
          draggable="false"
          className={cx('absolute inset-0 -z-10 size-full object-cover transition-[opacity,transform] duration-slow ease-out', k === i ? 'scale-100 opacity-100' : 'scale-105 opacity-0', k > 0 && !warm && 'hidden')}
        />
      ))}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-base via-transparent to-bg-base/70" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 transition-opacity duration-slow ease-out" style={{ backgroundImage: glow }} />

      <Wrap className="relative flex flex-col items-center pb-32 pt-96 text-center md:pb-48">
        <h1 id="hero-title" className="t-title max-w-3xl text-text-pri 3xl:max-w-none 3xl:text-display-m">
          <span className="block animate-fade-up" style={{ animationDelay: '80ms' }}><B v={COPY.line1} /></span>
          <span className="block animate-fade-up text-yellow" style={{ animationDelay: '190ms' }}><B v={COPY.line2} /></span>
        </h1>
        <p className="t-lead mt-12 max-w-xl animate-fade-up text-text-sec" style={{ animationDelay: '300ms' }}>
          <B v={COPY.lead} />
        </p>

        <div className="ue-hero-board mt-24 w-full animate-fade-up md:mt-32" style={{ animationDelay: '420ms' }}>
          <DepartureBoard
            size={tall ? 'lg' : tiny ? 'sm' : 'md'}
            platforms={PLATFORMS}
            platformIndex={i}
            onChange={(k) => setI(k)}
            onBoard={(p) => nav(`/rooms/${p.id}`)}
            autoAdvance={6500}
            station={narrow ? BOARD_STATION_NARROW : BOARD_STATION}
            line={BOARD_LINE}
          />
        </div>

        <div className="mt-16 flex w-full max-w-xl flex-col items-center gap-8">
          <Button as={Link} to={`/rooms/${room.id}`} size="lg" className="w-full text-body md:w-auto md:px-56">
            <B v={COPY.board} inline />
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
          <button type="button" onClick={() => scrollToId('location')} className="inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-sec underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow">
            <B v={COPY.way} inline />
          </button>
        </div>
      </Wrap>
      <span className="sr-only">{pick({ en: 'Now boarding', ko: '탑승 중' })}: {pick(room.title)}</span>
    </section>
  )
}
