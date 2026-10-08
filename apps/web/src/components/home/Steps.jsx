import { Link } from 'react-router-dom'
import { ArrowRight, Camera, DoorOpen, Monitor, Printer } from 'lucide-react'
import { Reveal, cx } from '@urbanedge/ds'
import { LINE_BG } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { T } from '../../layout/type.js'
import { Section, SectionHead } from './parts.jsx'

const COPY = {
  label: { ko: '이용 방법', en: 'How it works' },
  title: { ko: '찾고 고르고 찍고 받는 4단계', en: 'Find, choose, shoot, collect in four steps' },
  step: { ko: '단계', en: 'Step' },
  more: { ko: '이용 안내 자세히 보기', en: 'Read the full guide' },
}

const STEPS = [
  {
    color: 'yellow',
    Icon: DoorOpen,
    title: { ko: '방 찾기', en: 'Find your room' },
    desc: {
      ko: '입구에서 안쪽으로 들어가면 방 5곳이 이어진다. 마음에 드는 방의 키오스크 앞에 선다.',
      en: 'Walk in from the entrance and the five rooms follow one after another. Stand at the kiosk of the room you like.',
    },
  },
  {
    color: 'red',
    Icon: Monitor,
    title: { ko: '컷 수와 프레임 선택', en: 'Choose cuts and frame' },
    desc: {
      ko: '키오스크 화면에서 4컷 또는 8컷과 프레임을 고른다.',
      en: 'On the kiosk screen, pick 4 cuts or 8 cuts and a frame.',
    },
  },
  {
    color: 'blue',
    Icon: Camera,
    title: { ko: '촬영', en: 'Shoot' },
    desc: {
      ko: '렌즈는 모니터 아래에 있으므로 화면 아래 렌즈를 바라보고 카운트다운에 맞춰 포즈를 잡는다.',
      en: 'The lens sits below the monitor, so look at the lens under the screen and strike your pose with the countdown.',
    },
  },
  {
    color: 'green',
    Icon: Printer,
    title: { ko: '인화', en: 'Collect your print' },
    desc: {
      ko: '촬영한 사진을 확인하면 하단 인화 출구에서 인화물이 나온다.',
      en: 'After you review your shots, the print comes out of the slot at the bottom of the machine.',
    },
  },
]

export default function Steps() {
  const pick = usePick()
  return (
    <Section id="how" labelledBy="how-title">
      <SectionHead index={3} label={COPY.label} titleId="how-title" title={COPY.title} />
      <ol className="grid gap-x-24 gap-y-48 md:grid-cols-2 xl:grid-cols-4 xl:gap-x-32">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={i} delay={i * 80} className="relative border-t border-hairline pt-32">
            <span aria-hidden="true" className={cx('absolute -top-px left-0 h-4 w-full', LINE_BG[s.color])} />
            <div className="flex items-start justify-between gap-16">
              <p className="font-label text-display-m font-bold leading-none text-yellow">
                <span className="sr-only">{pick(COPY.step)} </span>
                {String(i + 1).padStart(2, '0')}
              </p>
              <s.Icon size={32} aria-hidden="true" className="mt-8 shrink-0 text-text-sec" />
            </div>
            <h3 className={`${T.h4} mt-24 text-text-pri`}>{pick(s.title)}</h3>
            <p className={`${T.body} mt-12 text-text-sec`}>{pick(s.desc)}</p>
          </Reveal>
        ))}
      </ol>
      <Reveal className="mt-48 lg:mt-72">
        <Link
          to="/guide"
          className={`${T.body} group inline-flex min-h-48 items-center gap-12 font-ui font-semibold text-yellow underline-offset-8 hover:underline`}
        >
          {pick(COPY.more)}
          <ArrowRight size={20} aria-hidden="true" className="transition-transform duration-base ease-out group-hover:translate-x-4" />
        </Link>
      </Reveal>
    </Section>
  )
}
