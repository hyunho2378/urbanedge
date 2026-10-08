import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { Bi, Button, CautionTape, Container, ExitSign, ShareButton, TrainTrack, cx, useLangValue } from '@urbanedge/ds'
import { SITE } from '../data/site.js'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { CameraDiagram, CAMERA_PARTS } from '../components/pages/CameraDiagram.jsx'
import { CutCompare } from '../components/pages/CutCompare.jsx'
import { Faq } from '../components/pages/Faq.jsx'
import { FrameCarousel } from '../components/pages/FrameCarousel.jsx'
import { KioskEmbed } from '../components/pages/KioskEmbed.jsx'
import { PageTop } from '../components/pages/PageTop.jsx'
import { Tape } from '../components/pages/Tape.jsx'
import { useMedia, useScrollStops } from '../components/pages/hooks.js'
import { STATION, photo } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const won = { en: SITE.price.base.toLocaleString('en-US'), ko: SITE.price.base.toLocaleString('ko-KR') }
const price = { en: `\u20a9${won.en}`, ko: `${won.ko}원` }

const T = {
  title: { en: 'How to', ko: '이용 안내' },
  h1: { en: 'Five stops from the street to your strip.', ko: '거리에서 인화물까지 다섯 정거장' },
  lead: {
    en: 'Enter at Exit 1, ride five stops and step off with a printed strip. Nobody works the floor and the camera sits below the screen, so here is everything in the order it happens.',
    ko: '1번 출구로 들어와 다섯 정거장을 지나면 인화물이 손에 남는다. 현장에 직원이 없고 카메라가 화면 아래에 있으므로, 일어나는 순서대로 모두 적어 두었다.',
  },
  start: { en: 'Start the journey', ko: '여정 시작' },
  try: { en: 'Try the kiosk now', ko: '키오스크 바로 체험' },
  tape: [
    { en: 'Next stop: Choose cuts', ko: '다음 정거장은 컷 선택입니다' },
    { en: 'Mind the lens, it sits below the screen', ko: '렌즈는 화면 아래에 있으니 주의하세요' },
    { en: 'Please do not move the machine', ko: '기기는 옮기지 마세요' },
    { en: 'Exit 1 is also the entrance', ko: '1번 출구는 입구이기도 합니다' },
  ],
  pause: { en: 'Pause announcements', ko: '안내 문구 멈추기' },
  play: { en: 'Resume announcements', ko: '안내 문구 다시 흐르기' },
  trackLabel: { en: 'Journey progress', ko: '여정 진행' },

  cut: {
    group: { en: 'Number of cuts', ko: '컷 수' },
    four: { en: '4 cuts', ko: '4컷' },
    eight: { en: '8 cuts', ko: '8컷' },
    fourText: { en: 'Four shots, and all four go on the print.', ko: '네 장을 찍으면 네 장이 모두 인화된다.' },
    eightText: {
      en: 'Eight shots, then you choose which ones go on the print. How many fit depends on the frame.',
      ko: '여덟 장을 찍은 뒤 인화할 컷을 직접 고르며, 몇 장이 들어가는지는 프레임에 따라 다르다.',
    },
    shots: { en: 'Your shots', ko: '찍은 컷' },
    shot: { en: 'Shot', ko: '컷' },
    all: { en: 'All four shots are on the print.', ko: '네 컷이 모두 인화물에 올라간다.' },
    picked: { en: 'Picked', ko: '고른 컷' },
    full: { en: 'The frame is full. Tap a picked shot to swap it.', ko: '프레임이 가득 찼다. 고른 컷을 누르면 빠지고 다른 컷으로 바꿀 수 있다.' },
    frames: { en: 'Frames for this choice', ko: '이 컷 수의 프레임' },
    printNote: {
      en: 'A live preview with the team photos. Your own strip prints the shot date in small type.',
      ko: '팀 사진으로 만든 실시간 미리보기이며, 실제 인화물에는 촬영 날짜가 작게 찍힌다.',
    },
  },
  framesLabel: { en: 'All frames', ko: '전체 프레임' },

  camAria: {
    en: 'Front view of the machine. The lens is centred below the monitor, the card terminal sits to its lower right and the print slot is at the bottom.',
    ko: '기기 정면 도식. 모니터 아래 가운데에 렌즈가 있고, 렌즈 오른쪽 아래에 카드 단말기, 하단에 인화 출구가 있다.',
  },
  camCaption: { en: 'Tap a number to find the part.', ko: '번호를 누르면 부품이 강조된다.' },
  camList: { en: 'Machine parts', ko: '기기 부품' },
  camNotice: {
    en: 'Two notices sit on top of the machine: do not move it, and CCTV is recording.',
    ko: '기기 상단에는 기기 이동 금지와 CCTV 녹화 중이라는 안내문 두 장이 붙어 있다.',
  },

  simTitle: { en: 'Try the real screen.', ko: '실제 화면 체험' },
  simSub: { en: 'This is the kiosk screen running in your browser. Payment is left out of the demo.', ko: '브라우저에서 돌아가는 키오스크 화면이며, 결제는 체험에서 제외했다.' },
  sim: {
    title: { en: 'UrbanEdge kiosk simulator', ko: '어반엣지 키오스크 시뮬레이터' },
    loading: { en: 'Loading the kiosk', ko: '키오스크 불러오는 중' },
    full: { en: 'Open full screen in a new window', ko: '새 창에서 전체 화면으로 열기' },
    restart: { en: 'Restart', ko: '처음부터' },
  },
  faqTitle: { en: 'Questions people ask at Exit 1.', ko: '1번 출구에서 자주 나오는 질문' },
  endTitle: { en: 'Ready to board?', ko: '탑승 준비가 되었다면' },
  endBody: { en: 'Pick the platform you like, or get directions to Exit 1.', ko: '마음에 드는 승강장을 고르거나 1번 출구까지 가는 길을 확인해 보자.' },
  endRooms: { en: 'Browse the platforms', ko: '승강장 둘러보기' },
  endVisit: { en: 'Get to Exit 1', ko: '1번 출구 찾아가기' },
  shareStrip: { en: 'Share your strip', ko: '내 인화물 공유' },
  stopOf: { en: 'Stop', ko: '정거장' },
}

const STOPS = [
  { id: 'enter', label: 'Enter', labelKo: '입장' },
  { id: 'cuts', label: 'Choose cuts', labelKo: '컷 선택' },
  { id: 'frame', label: 'Frame', labelKo: '프레임' },
  { id: 'pose', label: 'Pose', labelKo: '포즈' },
  { id: 'print', label: 'Print', labelKo: '인화' },
]

const COPY = [
  {
    announce: { en: 'Attention please: Exit 1 is the entrance.', ko: '안내 말씀드립니다. 1번 출구는 입구입니다.' },
    title: { en: 'Find Exit 1, then walk straight in.', ko: '1번 출구를 찾아 곧장 들어가기' },
    body: {
      en: 'Look for the black front with the UrbanEdge sign and a checkerboard step. Through the glass you can see a wall of round red mirrors. The platforms are further back, and each one has its own kiosk, so there is no queue to join.',
      ko: '검은 외관에 UrbanEdge 간판이 붙고 체커보드 문턱이 있는 곳이 1번 출구다. 유리 너머로 둥근 빨간 거울이 벽을 채우고 있으며, 안쪽으로 들어가면 승강장이 이어지고 승강장마다 키오스크가 따로 있어 줄을 설 일이 없다.',
    },
  },
  {
    announce: { en: 'Next stop: Choose cuts.', ko: '이번 정거장은 컷 선택입니다.' },
    title: { en: 'Tap the screen, pick 4 cuts or 8.', ko: '화면을 누르고 4컷이나 8컷 고르기' },
    body: {
      en: 'The kiosk wakes on a touch and asks for a language, English or Korean. Then it asks how many shots you want. Try the choice below with real team photos.',
      ko: '키오스크는 화면을 터치하면 깨어나 한국어와 영어 가운데 언어를 묻고, 이어서 촬영할 컷 수를 묻는다. 아래에서 실제 팀 사진으로 직접 골라 볼 수 있다.',
    },
  },
  {
    announce: { en: 'Next stop: Frame.', ko: '이번 정거장은 프레임입니다.' },
    title: { en: 'Pick a frame, then pay at the terminal.', ko: '프레임을 고르고 카드 단말기에서 결제하기' },
    body: {
      en: 'Frames run from clean white to black and yellow, with ticket and train designs, and each one prints the date in small type. Prices show on the frame screen. After you choose, pay by card on the terminal to the lower right of the lens.',
      ko: '프레임은 깔끔한 흰색부터 검정과 노랑, 승차권과 열차 디자인까지 다양하고 촬영 날짜가 작게 인쇄된다. 금액은 프레임 화면에 표시되며, 프레임을 고른 뒤 렌즈 오른쪽 아래의 카드 단말기에서 카드로 결제한다.',
    },
  },
  {
    announce: { en: 'Mind the lens. It sits below the screen.', ko: '렌즈를 주의하세요. 화면 아래에 있습니다.' },
    title: { en: 'Look at the round lens, and ignore your reflection.', ko: '화면 아래 동그란 렌즈를 바라보기' },
    body: {
      en: 'Most photo booths hide the camera above the screen, so first shots stare at the wrong spot. Here it is the dark circle in the middle, right under the screen. A countdown runs before every shot, and you may move between shots.',
      ko: '카메라는 화면 아래 가운데에 있는 동그란 렌즈다. 일반 포토부스는 화면 위에 카메라를 두는 경우가 많아 첫 컷에서 엉뚱한 곳을 보기 쉽다. 컷마다 카운트다운이 돌고, 컷 사이에는 자리를 옮겨도 된다.',
    },
  },
  {
    announce: { en: 'This is the last stop. Please take your strip with you.', ko: '종착역입니다. 인화물을 두고 내리지 마세요.' },
    title: { en: 'Wait for the slot, then take the tray.', ko: '하단 슬롯에서 나온 인화물 가져가기' },
    body: {
      en: `Prints slide out of the slot near the bottom of the machine onto a small white tray. The base price is ${price.en} and includes 2 prints. Post yours and tag @__urbanedge.`,
      ko: `인화물은 기기 하단의 슬롯에서 작은 흰색 트레이로 나온다. 기본 요금은 ${price.ko}이며 인화 2장이 포함되고, 사진을 올릴 때 @__urbanedge를 태그할 수 있다.`,
    },
  },
]

const PARTS = {
  screen: {
    title: { en: 'Screen', ko: '모니터' },
    body: { en: 'The touch screen for language, cuts and frame, with a light bar on each side.', ko: '언어와 컷 수, 프레임을 고르는 터치 화면이며 양옆에 세로 조명바가 있다.' },
  },
  lens: {
    title: { en: 'Lens', ko: '렌즈' },
    body: { en: 'The camera. Centred right below the screen. Look here while you shoot.', ko: '화면 바로 아래 가운데의 카메라이며, 촬영하는 동안 시선을 여기에 둔다.' },
  },
  card: {
    title: { en: 'Card terminal', ko: '카드 단말기' },
    body: { en: 'Lower right of the lens, with a green light. Pay by card here.', ko: '렌즈 오른쪽 아래에 초록 불이 들어온 단말기이며, 카드로 결제한다.' },
  },
  slot: {
    title: { en: 'Print slot', ko: '인화 출구' },
    body: { en: 'A slot in the lower cabinet. Prints land on the white tray below it.', ko: '하단 캐비닛의 슬롯이며, 인화물이 아래의 흰색 트레이로 나온다.' },
  },
}

const FAQ = [
  {
    q: { en: 'Where is the camera?', ko: '카메라는 어디에 있나요?' },
    a: {
      en: 'Right below the screen, in the middle. Most booths hide it above the screen, so everybody stares at the wrong spot on the first shot. Look at the round lens and you are looking at the camera.',
      ko: '화면 바로 아래 가운데에 있다. 일반 포토부스는 화면 위에 카메라를 두는 경우가 많아 첫 컷에서 엉뚱한 곳을 보기 쉬우므로, 동그란 렌즈를 바라보면 카메라를 보는 것이다.',
    },
  },
  {
    q: { en: 'What is the difference between 4 cuts and 8 cuts?', ko: '4컷과 8컷은 무엇이 다른가요?' },
    a: {
      en: 'Four cuts are four shots, and all four go on the print. Eight cuts are eight shots, and you choose which ones make it. How many fit depends on the frame.',
      ko: '4컷은 네 장을 찍어 모두 인화하고, 8컷은 여덟 장을 찍은 뒤 인화할 컷을 직접 고른다. 몇 장이 들어가는지는 프레임에 따라 다르다.',
    },
  },
  {
    q: { en: 'How much is it?', ko: '이용 요금은 얼마인가요?' },
    a: {
      en: `The base price is ${price.en} and includes 2 prints. Each frame shows its own price on the frame screen, then you pay by card on the terminal under the lens.`,
      ko: `기본 요금은 ${price.ko}이며 인화 2장이 포함된다. 프레임별 금액은 프레임 화면에서 확인한 뒤 렌즈 아래 카드 단말기로 결제한다.`,
    },
  },
  {
    q: { en: 'Which platform should I pick?', ko: '어느 승강장을 고르면 좋나요?' },
    a: {
      en: 'Pick the mood: steel doors and straps on Platform 1, a sing-along on Platform 2, a ringing phone on Platform 3, a quiet portrait on Platform 4. Every platform has its own kiosk, so you can walk to the next one and shoot again.',
      ko: '원하는 분위기에 맞추면 된다. 1번 승강장은 스테인리스 문과 손잡이, 2번은 노래방, 3번은 울리는 공중전화, 4번은 조용한 인물 사진에 어울린다. 승강장마다 키오스크가 따로 있어 옆 승강장으로 걸어가 다시 찍을 수 있다.',
    },
  },
  {
    q: { en: 'Can I use it in English?', ko: '영어로도 이용할 수 있나요?' },
    a: {
      en: 'Yes. The kiosk starts with a language screen, English or Korean, and this website has both languages too.',
      ko: '그렇다. 키오스크는 한국어와 영어를 고르는 화면으로 시작하고, 이 웹사이트도 두 언어를 모두 제공한다.',
    },
  },
  {
    q: { en: 'Where do the prints come out?', ko: '인화물은 어디로 나오나요?' },
    a: {
      en: 'At the slot near the bottom of the machine, onto a small white tray. Check the tray when the screen says your print is ready.',
      ko: '기기 하단의 슬롯에서 작은 흰색 트레이로 나온다. 화면에 인화가 끝났다는 안내가 뜨면 트레이를 확인한다.',
    },
  },
  {
    q: { en: 'Is anyone there to help?', ko: '도와주는 직원이 있나요?' },
    a: {
      en: 'No, it is an unmanned studio. If something goes wrong, message @__urbanedge on Instagram.',
      ko: '무인 스튜디오라 직원이 없다. 문제가 생기면 인스타그램 @__urbanedge로 메시지를 보내 주세요.',
    },
  },
  {
    q: { en: 'Can I move the machine?', ko: '기기를 옮겨도 되나요?' },
    a: {
      en: 'Please do not. A notice on top says not to move it, and another says CCTV is recording.',
      ko: '옮기지 않는다. 기기 상단에 이동 금지 안내문이 붙어 있고 CCTV 녹화 중이라는 안내문도 함께 붙어 있다.',
    },
  },
  {
    q: { en: 'When is it open?', ko: '운영 시간은 언제인가요?' },
    a: {
      en: `From ${SITE.hours.open} to ${SITE.hours.close}. Any change is posted on Instagram @__urbanedge.`,
      ko: `${SITE.hours.open}부터 ${SITE.hours.close}까지 운영하며, 변동 사항은 인스타그램 @__urbanedge에 올라온다.`,
    },
  },
]

export default function Guide() {
  const v = useV()
  const lang = useLangValue()
  usePageTitle(T.title)
  const wide = useMedia('(min-width: 1024px)')
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)]
  const cur = useScrollStops(refs)
  const [part, setPart] = useState('lens')
  const origin = typeof window !== 'undefined' ? window.location.href : ''
  const ph1 = photo('o_21')
  const ph5 = photo('o_52')

  const head = (i) => (
    <>
      <p className="text-text-meta">
        <Tx inline {...T.stopOf} role="label" /> <span className="t-label tabular-nums">{i + 1} / 5</span>
      </p>
      <Tx {...COPY[i].announce} as="p" role="caption" className="mt-8 text-yellow" />
      <Tx {...COPY[i].title} as="h3" role="headline" className="mt-16 max-w-read text-text-pri" />
      <Tx {...COPY[i].body} as="p" role="body" className="mt-16 max-w-read text-text-sec" />
    </>
  )
  const figure = (ph) => (
    <figure className="overflow-hidden rounded-lg bg-bg-panel">
      <img src={ph.full} srcSet={`${ph.thumb} ${ph.w}w, ${ph.full} 1350w`} sizes="(min-width: 1024px) 40vw, 92vw" alt={v(ph.alt)} width={ph.w} height={ph.h} loading="lazy" decoding="async" className="block h-auto w-full" />
    </figure>
  )

  return (
    <PageShell>
      <PageTop
        title={T.h1}
        lead={T.lead}
        aside={
          <div className="hidden lg:block">
            <ExitSign number={1} label={STATION.name} labelKo={STATION.nameKo} size="lg" />
          </div>
        }
      >
        <div className="mt-32 flex flex-wrap items-center gap-x-24 gap-y-12">
          <Button as="a" href="#journey" size="lg">
            <Tx inline {...T.start} />
            <ArrowDown size={20} aria-hidden="true" />
          </Button>
          <a href="#try" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
            <Tx inline {...T.try} />
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </PageTop>

      <Tape items={T.tape} pause={T.pause} play={T.play} />

      <section id="journey" aria-label={v(T.trackLabel)} className="relative scroll-mt-64">
        {/* 모바일: 위에 붙는 가로 열차 표시. 데스크톱: 왼쪽에 붙는 세로 열차 표시. */}
        {!wide && (
          <div className="sticky z-sticky bg-bg-base/90 px-page py-8 backdrop-blur" style={{ top: 'var(--ue-header-h)' }}>
            <TrainTrack stops={STOPS} current={cur} color="yellow" orientation="horizontal" aria-label={v(T.trackLabel)} />
          </div>
        )}
        <Container className="grid gap-x-48 lg:grid-cols-12 4xl:max-w-screen-4xl">
          {wide && (
            <aside className="lg:col-span-2">
              <div className="sticky" style={{ top: 'calc(var(--ue-header-h) + 32px)' }}>
                <TrainTrack stops={STOPS} current={cur} color="yellow" orientation="vertical" aria-label={v(T.trackLabel)} />
              </div>
            </aside>
          )}
          <div className="lg:col-span-10">
            <article ref={refs[0]} id="stop-enter" className="grid items-center gap-x-48 gap-y-24 py-48 md:py-72 lg:grid-cols-2 lg:py-96">
              <div>{head(0)}</div>
              {figure(ph1)}
            </article>

            <article ref={refs[1]} id="stop-cuts" className="py-48 md:py-72 lg:py-96">
              <div className="mb-32">{head(1)}</div>
              <CutCompare copy={T.cut} />
            </article>

            <article ref={refs[2]} id="stop-frame" className="py-48 md:py-72 lg:py-96">
              <div className="mb-32">{head(2)}</div>
              <FrameCarousel label={v(T.framesLabel)} />
            </article>

            <article ref={refs[3]} id="stop-pose" className="grid items-start gap-x-48 gap-y-32 py-48 md:py-72 lg:grid-cols-2 lg:py-96">
              <div>
                {head(3)}
                <ul aria-label={v(T.camList)} className="mt-32 divide-y divide-hairline border-y border-hairline">
                  {CAMERA_PARTS.map((k, i) => {
                    const on = part === k
                    return (
                      <li key={k}>
                        <button type="button" aria-pressed={on} onClick={() => setPart(k)} className="group flex w-full items-start gap-16 py-16 text-left">
                          <span className={cx('grid size-40 shrink-0 place-items-center rounded-pill font-label text-body font-bold transition-colors duration-base ease-out', on ? 'bg-yellow text-text-onYellow' : 'bg-bg-panel text-text-pri group-hover:text-yellow')}>{i + 1}</span>
                          <span className="min-w-0 flex-1">
                            <Tx {...PARTS[k].title} as="span" role="subhead" className={cx('block transition-colors duration-base ease-out', on ? 'text-yellow' : 'text-text-pri group-hover:text-yellow')} />
                            <Tx {...PARTS[k].body} as="span" role="body" className="mt-4 block text-text-sec" />
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <figure className="overflow-hidden rounded-lg bg-bg-panel">
                <div className="h-12" aria-hidden="true">
                  <CautionTape size={12} />
                </div>
                <div className="mx-auto max-w-read p-24 lg:p-32">
                  <CameraDiagram active={part} onSelect={setPart} ariaLabel={v(T.camAria)} />
                </div>
                <figcaption className="px-24 pb-16 text-text-meta">
                  <Tx inline {...T.camCaption} role="caption" /> <Tx inline {...T.camNotice} role="caption" />
                </figcaption>
              </figure>
            </article>

            <article ref={refs[4]} id="stop-print" className="grid items-center gap-x-48 gap-y-24 py-48 md:py-72 lg:grid-cols-2 lg:py-96">
              <div>
                {head(4)}
                <div className="mt-24">
                  <ShareButton url={origin} title={SITE.name} text={v(COPY[4].announce)} variant="ghost" lang={lang}>
                    <Tx inline {...T.shareStrip} />
                  </ShareButton>
                </div>
              </div>
              {figure(ph5)}
            </article>
          </div>
        </Container>
      </section>

      <section id="try" aria-labelledby="try-title" className="scroll-mt-64 bg-bg-elev py-64 md:py-96">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.simTitle} as="h2" role="headline" className="text-text-pri" id="try-title" />
          <Tx {...T.simSub} as="p" role="body" className="mt-12 max-w-read text-text-sec" />
          <div className="mt-32 max-w-wide">
            <KioskEmbed copy={T.sim} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="faq-title" className="section-y">
        <Container className="grid gap-x-64 gap-y-32 lg:grid-cols-12 4xl:max-w-screen-4xl">
          <Tx {...T.faqTitle} as="h2" role="headline" className="text-text-pri lg:col-span-4" id="faq-title" />
          <div className="lg:col-span-8">
            <Faq items={FAQ} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="end-title" className="bg-yellow py-64 text-text-onYellow md:py-96">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.endTitle} as="h2" role="headline" id="end-title" className="max-w-read" />
          <Tx {...T.endBody} as="p" role="body" className="mt-12 max-w-read" />
          <div className="mt-32 flex flex-wrap items-center gap-x-24 gap-y-12">
            <Button as={Link} to="/rooms" variant="dark" size="lg">
              <Tx inline {...T.endRooms} />
              <ArrowRight size={20} aria-hidden="true" />
            </Button>
            <Link to="/visit" className="t-strong inline-flex min-h-48 items-center gap-8 underline underline-offset-4">
              <Tx inline {...T.endVisit} />
            </Link>
          </div>
        </Container>
      </section>
    </PageShell>
  )
}
