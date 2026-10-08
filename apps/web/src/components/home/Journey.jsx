import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MonitorPlay } from 'lucide-react'
import { TrainTrack, cx } from '@urbanedge/ds'
import { formatPrice } from '../../data/site.js'
import { useLang, usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import DeviceDiagram from './DeviceDiagram.jsx'
import StationTag from './StationTag.jsx'
import { useMedia } from './hooks.js'
import { Head, Photo, Section } from './parts.jsx'

const COPY = {
  label: { en: 'How it works', ko: '이용 방법' },
  title: { en: 'Four stops from door to print.', ko: '입구에서 인화까지 네 정거장' },
  desc: { en: 'Swipe the track. You do not need Korean to use the kiosk: it speaks English too.', ko: '트랙을 밀어 단계를 넘겨 본다. 키오스크는 영어도 지원한다.' },
  try: { en: 'Try the kiosk right here', ko: '여기서 키오스크 체험' },
  four: { en: '4 cuts', ko: '4컷' },
  eight: { en: '8 cuts', ko: '8컷' },
  fourCaption: { en: 'Four shots, four slots. Every shot makes the print.', ko: '네 장을 찍어 네 칸에 모두 담는다.' },
  eightCaption: { en: 'Eight shots, then you keep your best four.', ko: '여덟 장을 찍고 가장 마음에 드는 네 장만 고른다.' },
}
const STEPS = [
  {
    id: 'board', label: { en: 'Board', ko: '탑승' },
    title: { en: 'Walk in and find your platform.', ko: '입구에서 안쪽으로 걸어 들어간다' },
    body: {
      en: 'The street door opens onto four platforms in a row, one photo room each. Pick the one that matches the shot you want, then stand at its kiosk.',
      ko: '길가 문을 열면 승강장 네 곳이 일렬로 이어지고 승강장마다 포토 룸이 하나씩 있다. 찍고 싶은 장면에 맞는 곳을 골라 그 방의 키오스크 앞에 선다.',
    },
  },
  {
    id: 'choose', label: { en: 'Choose', ko: '선택' },
    title: { en: 'Pick 4 cuts or 8 cuts.', ko: '4컷과 8컷 중에서 고른다' },
    body: {
      en: 'Tap a frame on the kiosk screen. Four cuts keeps every shot. Eight cuts takes eight and lets you keep the best four.',
      ko: '키오스크 화면에서 프레임을 누른다. 4컷은 찍은 사진을 전부 쓰고, 8컷은 여덟 장을 찍은 뒤 네 장만 남긴다.',
    },
  },
  {
    id: 'pose', label: { en: 'Pose', ko: '촬영' },
    title: { en: 'Mind the lens. It sits below the screen.', ko: '렌즈는 화면 아래에 있다' },
    body: {
      en: 'Look at the small lens under the monitor, not at your own reflection on the screen. Follow the countdown, and feel free to move between shots.',
      ko: '카메라는 모니터 아래의 작은 렌즈이므로 시선을 그 렌즈에 둔다. 카운트다운에 맞춰 찍고 컷 사이에는 자리를 옮겨도 된다.',
    },
  },
  {
    id: 'print', label: { en: 'Print', ko: '인화' },
    title: { en: 'Collect your ticket.', ko: '인화물을 받는다' },
    body: {
      en: 'Your strip slides out of the slot at the bottom of the machine. The base price is {price} and includes two prints.',
      ko: '촬영한 사진을 확인하면 기계 하단의 출구 슬롯에서 인화물이 나온다. 기본 요금 {price}에 인화 2장이 포함된다.',
    },
  },
]

function CutsPicker() {
  const pick = usePick()
  const [cuts, setCuts] = useState(4)
  const four = cuts === 4
  const img = 'h-4/5 shrink-0 rounded-md object-cover shadow-lift transition-transform duration-slow ease-out'
  return (
    <div className="flex size-full flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center px-16 pt-12">
        <img src="/img/ig/ig-07.jpg" alt={pick({ en: 'An eight-cut print in a blue frame', ko: '파란 프레임의 8컷 인화물' })} loading="lazy" draggable="false" className={cx(img, 'aspect-square', four ? '-rotate-6 translate-y-4 opacity-60' : 'z-10 rotate-2 translate-x-8')} />
        <img src="/img/ig/ig-04.jpg" alt={pick({ en: 'A four-cut subway print', ko: '지하철 방의 4컷 인화물' })} loading="lazy" draggable="false" className={cx(img, 'aspect-square -ml-24', four ? 'z-10 rotate-3 -translate-x-8' : 'rotate-6 translate-y-4 opacity-60')} />
      </div>
      <div className="shrink-0 px-16 pb-12 pt-8">
        <div role="group" aria-label={pick({ en: 'Choose a frame size', ko: '프레임 컷 수 선택' })} className="mx-auto flex w-fit rounded-pill bg-black p-4">
          {[4, 8].map((n) => (
            <button key={n} type="button" aria-pressed={cuts === n} onClick={() => setCuts(n)} className={cx('min-h-48 rounded-pill px-20 font-ui text-body-sm font-semibold transition-colors duration-fast ease-out', cuts === n ? 'bg-yellow text-text-onYellow' : 'text-text-sec hover:text-text-pri')}>
              <B v={n === 4 ? COPY.four : COPY.eight} inline />
            </button>
          ))}
        </div>
        <p className="t-caption sr-only text-center text-text-sec md:not-sr-only md:mt-8" aria-live="polite">
          <B v={four ? COPY.fourCaption : COPY.eightCaption} />
        </p>
      </div>
    </div>
  )
}

function Visual({ id }) {
  const pick = usePick()
  if (id === 'board')
    return (
      <>
        <Photo src="/img/place/naver-14.jpg" alt={pick({ en: 'Black cones, yellow tape and a checkerboard floor at the entrance', ko: '검은 고깔과 노란 테이프, 체커보드 바닥이 놓인 입구' })} ratio="4 / 3" className="size-full" imgClassName="object-center" />
        <div className="absolute left-12 top-12">
          <StationTag />
        </div>
      </>
    )
  if (id === 'choose') return <CutsPicker />
  if (id === 'pose') return <div className="grid size-full place-items-center p-20"><DeviceDiagram className="h-full w-auto" /></div>
  return <Photo src="/img/place/naver-20.jpg" alt={pick({ en: 'Hands holding two freshly printed photo strips', ko: '방금 인화한 포토 스트립 두 장을 든 손' })} ratio="4 / 3" className="size-full" />
}

export default function Journey() {
  const narrow = useMedia('(max-width: 767px)')
  const pick = usePick()
  const { lang } = useLang()
  const scroller = useRef(null)
  const [cur, setCur] = useState(0)

  useEffect(() => {
    const el = scroller.current
    if (!el) return undefined
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const a = el.children[0]
        const b = el.children[1]
        if (!a || !b) return
        const step = b.offsetLeft - a.offsetLeft
        const max = el.scrollWidth - el.clientWidth
        setCur(Math.min(STEPS.length - 1, Math.max(0, max > 0 && el.scrollLeft >= max - 2 ? STEPS.length - 1 : el.scrollLeft / step)))
      })
    }
    on()
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  const go = (i) => {
    const el = scroller.current
    if (!el) return
    const t = el.children[Math.max(0, Math.min(STEPS.length - 1, i))]
    el.scrollTo({ left: t.offsetLeft - el.children[0].offsetLeft, behavior: 'smooth' })
  }
  const stops = STEPS.map((s) => ({ id: s.id, label: s.label.en, labelKo: s.label.ko }))
  const price = formatPrice(lang)

  return (
    <Section id="journey" labelledBy="journey-title" tone="elev" className="overflow-hidden" wrapClass="relative">
      <div className="flex flex-col gap-16 md:flex-row md:items-end md:justify-between">
        <Head label={COPY.label} title={COPY.title} titleId="journey-title" desc={COPY.desc} lean />
        <div className="hidden gap-8 md:flex">
          {[-1, 1].map((d) => (
            <button key={d} type="button" onClick={() => go(Math.round(cur) + d)} aria-label={pick(d < 0 ? { en: 'Previous stop', ko: '이전 단계' } : { en: 'Next stop', ko: '다음 단계' })} className="ue-press grid size-48 place-items-center rounded-pill bg-bg-raised text-text-pri transition-colors duration-fast ease-out hover:bg-yellow hover:text-text-onYellow">
              {d < 0 ? <ChevronLeft size={22} aria-hidden="true" /> : <ChevronRight size={22} aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-16 md:mt-40">
        <TrainTrack stops={stops} current={cur} color="green" orientation="horizontal" onSelect={go} aria-label={pick({ en: 'Four steps: Board, Choose, Pose, Print', ko: '네 단계: 탑승, 선택, 촬영, 인화' })} />
      </div>

      <div ref={scroller} role="region" tabIndex={0} aria-label={pick({ en: 'How it works. Scroll sideways to see all four stops.', ko: '이용 방법. 옆으로 밀어 네 단계를 본다.' })} className="-mx-24 mt-16 flex scroll-smooth snap-x snap-mandatory gap-16 overflow-x-auto px-24 pb-8 md:-mx-40 md:gap-24 md:px-40 md:pb-24 lg:-mx-64 lg:px-64" style={{ scrollPaddingInline: 'var(--ue-page-px)', scrollbarWidth: 'none' }}>
        {STEPS.map((s) => (
          <article key={s.id} className="w-5/6 shrink-0 snap-start md:w-2/5 lg:w-1/3 xl:w-1/4">
            <div className="relative overflow-hidden rounded-lg bg-bg-panel" style={{ aspectRatio: narrow ? '8 / 5' : '4 / 3' }}>
              <Visual id={s.id} />
            </div>
            <h3 className="t-subhead mt-12 text-text-pri"><B v={s.title} /></h3>
            <p className="t-body mt-8 text-text-sec"><B v={{ en: s.body.en.replace('{price}', price), ko: s.body.ko.replace('{price}', price) }} /></p>
          </article>
        ))}
      </div>

      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('ue:kiosk'))} className="mt-8 inline-flex min-h-48 items-center gap-8 font-ui text-body font-semibold text-yellow underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow-hover">
        <MonitorPlay size={18} aria-hidden="true" />
        <B v={COPY.try} inline />
      </button>
    </Section>
  )
}
