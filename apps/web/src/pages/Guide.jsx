import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUp, Camera, DoorOpen, Eye, Footprints, LayoutGrid, Printer, Sparkles } from 'lucide-react'
import { Button, CautionTape, Container, Reveal, cx } from '@urbanedge/ds'
import { usePick } from '../i18n/index.jsx'
import { SITE } from '../data/site.js'
import { PageHero } from '../components/pages/PageHero.jsx'
import { Section } from '../components/pages/Section.jsx'
import { StepCard } from '../components/pages/StepCard.jsx'
import { CameraDiagram, CAMERA_PARTS } from '../components/pages/CameraDiagram.jsx'
import { CutSchematic } from '../components/pages/CutSchematic.jsx'
import { Faq } from '../components/pages/Faq.jsx'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const price = SITE.price.base.toLocaleString('en-US')

const T = {
  title: { ko: '이용 안내', en: 'How to use' },
  label: { ko: '이용 안내 / HOW TO', en: 'HOW TO USE' },
  h1: { ko: '처음이어도 4단계', en: 'Four steps, even for a first visit' },
  desc: {
    ko: '방 고르기부터 인화까지 4단계로 이어지고, 이 기기의 카메라는 화면 아래에 있다.',
    en: 'From picking a room to collecting prints takes four steps, and the camera on this machine sits below the screen.',
  },
  priceLabel: { ko: '기본 요금', en: 'Base price' },
  priceValue: { ko: `${price}원`, en: `${price} KRW` },
  priceNote: { ko: `인화 ${SITE.price.prints}장 포함`, en: `${SITE.price.prints} prints included` },

  stepsLabel: { ko: '이용 순서', en: 'STEPS' },
  stepsTitle: { ko: '방 찾기에서 인화까지', en: 'From finding a room to your prints' },
  stepsAria: { ko: '이용 4단계', en: 'Four steps' },

  camLabel: { ko: '카메라 위치', en: 'CAMERA POSITION' },
  camTitle: { ko: '카메라는 화면 아래에 있다', en: 'The camera is below the screen' },
  camIntro: {
    ko: '일반 포토부스는 카메라가 화면 위에 있는 경우가 많으므로, 이 기기에서는 촬영 전에 렌즈 위치를 먼저 확인하는 편이 좋다.',
    en: 'Many photo booths put the camera above the screen, so find the lens first on this machine before you start shooting.',
  },
  camAria: {
    ko: '기기 정면 도식. 모니터 아래 가운데에 렌즈, 렌즈 아래 오른쪽에 카드 단말기, 하단에 인화 출구가 있다.',
    en: 'Front view of the machine. The lens is centered below the monitor, the card terminal is to its lower right, and the print slot is at the bottom.',
  },
  camCaption: { ko: '기기 정면 도식. 번호를 누르면 해당 부품이 강조된다.', en: 'Front view of the machine. Select a number to highlight that part.' },
  camList: { ko: '기기 부품 설명', en: 'Machine parts' },
  camNotice: {
    ko: '기기 상단에는 기기 이동 금지와 CCTV 녹화 중 안내문 두 장이 붙어 있으며, 기기는 제자리에서 이용한다.',
    en: 'Two notices sit at the top of the machine, one saying do not move the device and one saying CCTV is recording, so use it where it stands.',
  },

  cutLabel: { ko: '4컷과 8컷', en: '4 CUTS OR 8 CUTS' },
  cutTitle: { ko: '촬영 장수와 고르는 방식의 차이', en: 'How the two options differ' },
  cutIntro: {
    ko: '4컷은 찍은 사진이 그대로 프레임에 들어가고, 8컷은 더 많이 찍은 뒤 마음에 드는 컷을 고른다.',
    en: 'With 4 cuts every shot goes straight into the frame. With 8 cuts you shoot more and pick your favorites.',
  },
  cutCaption: { ko: '4컷과 8컷 비교표', en: 'Comparison of 4 cuts and 8 cuts' },
  cutCol: { ko: '항목', en: 'Item' },
  cutNote: {
    ko: `기본 요금은 ${price}원이며 인화 ${SITE.price.prints}장이 포함된다. 프레임별 금액은 프레임 선택 화면에서 확인한다.`,
    en: `The base price is ${price} KRW with ${SITE.price.prints} prints included. Frame prices are shown on the frame selection screen.`,
  },

  tipLabel: { ko: '포즈 팁', en: 'POSE TIPS' },
  tipTitle: { ko: '렌즈 위치를 알면 사진이 달라진다', en: 'Knowing the lens changes the photo' },
  tipRooms: { ko: '방별 포즈 제안 보기', en: 'See pose ideas by room' },

  faqLabel: { ko: '자주 묻는 질문', en: 'FAQ' },
  faqTitle: { ko: '방문 전에 가장 많이 궁금한 것', en: 'Questions people ask before visiting' },

  ctaTitle: { ko: '직접 눌러 보고 가기', en: 'Try it before you go' },
  ctaBody: { ko: '키오스크 체험에서 화면 흐름을 미리 눌러 볼 수 있다.', en: 'Click through the screen flow in the kiosk demo ahead of your visit.' },
  ctaKiosk: { ko: '키오스크 체험하기', en: 'Try the kiosk' },
  ctaVisit: { ko: '오시는 길 보기', en: 'Get directions' },
}

const STEPS = [
  {
    icon: DoorOpen,
    color: 'yellow',
    title: { ko: '방 찾기', en: 'Find a room' },
    body: {
      ko: '입구에서 안쪽으로 들어가면 방 5곳이 이어지며, 방마다 키오스크가 따로 있어 마음에 드는 방의 기기 앞에서 시작한다.',
      en: 'Walk in from the entrance and the five rooms follow one another. Each room has its own kiosk, so start at the one in the room you like.',
    },
    note: { ko: '방 분위기는 포토 룸 페이지에서 미리 볼 수 있다.', en: 'Preview every room on the Photo Rooms page.' },
  },
  {
    icon: LayoutGrid,
    color: 'red',
    title: { ko: '컷 수와 프레임 선택', en: 'Choose cuts and a frame' },
    body: {
      ko: '화면에서 4컷 또는 8컷을 고르고 Signature Cut과 Layer Cut 가운데 프레임을 정한 뒤 카드 단말기로 결제한다.',
      en: 'Pick 4 or 8 cuts on the screen, choose a Signature Cut or Layer Cut frame, then pay at the card terminal.',
    },
    note: { ko: '금액은 프레임 선택 화면에 표시된다.', en: 'Prices appear on the frame selection screen.' },
  },
  {
    icon: Camera,
    color: 'blue',
    title: { ko: '촬영', en: 'Shoot' },
    body: {
      ko: '카운트다운이 시작되면 모니터 아래 가운데 렌즈를 바라보고, 컷마다 포즈를 바꾼다.',
      en: 'When the countdown starts, look at the lens centered below the monitor and change your pose every cut.',
    },
    note: { ko: '컷 사이에는 자리를 옮겨도 된다.', en: 'You may move around between cuts.' },
  },
  {
    icon: Printer,
    color: 'green',
    title: { ko: '인화', en: 'Collect your prints' },
    body: {
      ko: `촬영이 끝나면 기기 아래쪽 인화 출구의 흰색 트레이로 사진이 나오며, 기본 ${price}원에 인화 ${SITE.price.prints}장이 포함된다.`,
      en: `When shooting ends, prints slide out onto the white tray at the slot near the bottom of the machine. The base price of ${price} KRW includes ${SITE.price.prints} prints.`,
    },
    note: { ko: '기기 위 벽에는 앞서 다녀간 손님의 인화지 콜라주가 붙는다.', en: 'Prints from earlier guests are collaged on the wall above the machine.' },
  },
]

const PARTS = {
  screen: {
    title: { ko: '모니터', en: 'Monitor' },
    body: { ko: '프레임과 컷 수를 고르고 촬영 안내를 읽는 터치 화면이며, 양옆에 세로 조명바가 있다.', en: 'The touch screen for choosing frames and cuts and reading prompts, with a vertical light bar on each side.' },
  },
  lens: {
    title: { ko: '렌즈', en: 'Lens' },
    body: { ko: '모니터 바로 아래 가운데에 있으며, 촬영하는 동안 시선을 여기에 둔다.', en: 'Centered right below the monitor. Keep your eyes here while shooting.' },
  },
  card: {
    title: { ko: '카드 단말기', en: 'Card terminal' },
    body: { ko: '렌즈 아래 오른쪽에 있으며 초록 불이 들어온 단말기에서 카드로 결제한다.', en: 'To the lower right of the lens, with a green light. Pay by card here.' },
  },
  slot: {
    title: { ko: '인화 출구', en: 'Print slot' },
    body: { ko: '하단 캐비닛 문에 있는 슬롯이며, 인화물이 아래의 흰색 트레이로 나온다.', en: 'A slot in the lower cabinet door. Prints come out onto the white tray below it.' },
  },
}

const CUT_ROWS = [
  { th: { ko: '촬영', en: 'Shots taken' }, a: { ko: '4장을 촬영', en: '4 shots' }, b: { ko: '8장을 촬영', en: '8 shots' } },
  {
    th: { ko: '고르기', en: 'Picking' },
    a: { ko: '찍은 4장이 그대로 프레임에 들어간다', en: 'All 4 shots go straight into the frame' },
    b: { ko: '8장 가운데 마음에 드는 4장을 골라 프레임에 넣는다', en: 'Choose your favorite 4 of the 8 for the frame' },
  },
  {
    th: { ko: '어울리는 경우', en: 'Good for' },
    a: { ko: '한 번에 빠르게 끝내고 싶을 때', en: 'Finishing quickly in one go' },
    b: { ko: '포즈를 여러 번 바꿔 보고 싶을 때', en: 'Trying several poses and keeping the best' },
  },
  {
    th: { ko: '프레임', en: 'Frames' },
    a: { ko: '컷 수에 맞는 Signature Cut과 Layer Cut', en: 'Signature Cut and Layer Cut for 4 cuts' },
    b: { ko: '컷 수에 맞는 Signature Cut과 Layer Cut', en: 'Signature Cut and Layer Cut for 8 cuts' },
  },
]

const TIPS = [
  { icon: Eye, title: { ko: '렌즈를 바라본다', en: 'Look at the lens' }, body: { ko: '시선을 모니터 아래 렌즈에 두면 사진 속 눈이 정면을 향한다.', en: 'Keep your eyes on the lens below the monitor so your gaze faces forward in the photo.' } },
  { icon: ArrowUp, title: { ko: '턱을 살짝 든다', en: 'Lift your chin slightly' }, body: { ko: '정면을 보는 높이에서 턱만 살짝 위로 들면 얼굴선이 또렷하게 나온다.', en: 'From a straight-ahead gaze, raise your chin a little for a cleaner jawline.' } },
  { icon: Footprints, title: { ko: '컷 사이에 움직인다', en: 'Move between cuts' }, body: { ko: '촬영 사이에는 자리를 옮기고 포즈를 바꿔도 되므로 컷마다 다른 장면을 만든다.', en: 'You may move and change pose between shots, so give every cut a different scene.' } },
  { icon: Sparkles, title: { ko: '방의 소품을 쓴다', en: 'Use the props' }, body: { ko: '마이크, 탬버린, 손잡이, 나무 의자처럼 방마다 다른 소품이 놓여 있다.', en: 'Each room has its own props such as a mic, tambourine, hand straps or wooden stools.' } },
]

const FAQ = [
  {
    q: { ko: '카메라는 어디에 있나요?', en: 'Where is the camera?' },
    a: {
      ko: '모니터 바로 아래 가운데에 있다. 일반 포토부스처럼 화면 위를 보면 렌즈를 놓치기 쉬우므로, 촬영 중에는 화면 아래 렌즈를 바라본다.',
      en: 'It sits centered right below the monitor. Looking above the screen as in other booths misses the lens, so look at the lens under the screen while shooting.',
    },
  },
  {
    q: { ko: '4컷과 8컷은 무엇이 다른가요?', en: 'What is the difference between 4 and 8 cuts?' },
    a: {
      ko: '4컷은 4장을 찍어 그대로 프레임에 담고, 8컷은 8장을 찍은 뒤 마음에 드는 4장을 골라 담는다.',
      en: 'With 4 cuts you shoot 4 photos and all of them go into the frame. With 8 cuts you shoot 8 and choose your favorite 4.',
    },
  },
  {
    q: { ko: '이용 요금은 얼마인가요?', en: 'How much does it cost?' },
    a: {
      ko: `기본 요금은 ${price}원이며 인화 ${SITE.price.prints}장이 포함된다. 프레임별 금액은 프레임 선택 화면에서 확인한 뒤 카드 단말기로 결제한다.`,
      en: `The base price is ${price} KRW and includes ${SITE.price.prints} prints. Check each frame price on the frame selection screen, then pay at the card terminal.`,
    },
  },
  {
    q: { ko: '방은 어떻게 고르나요?', en: 'How do I choose a room?' },
    a: {
      ko: '방마다 키오스크가 따로 있어, 입구에서 안쪽으로 들어가 마음에 드는 방의 기기 앞에서 시작하면 된다. 방별 분위기는 포토 룸 페이지에서 미리 볼 수 있다.',
      en: 'Every room has its own kiosk, so walk in and start at the machine in the room you like. The Photo Rooms page previews each room.',
    },
  },
  {
    q: { ko: '인화물은 어디로 나오나요?', en: 'Where do the prints come out?' },
    a: {
      ko: '기기 하단 캐비닛의 인화 출구에서 흰색 트레이로 나온다. 촬영이 끝나면 화면 안내에 따라 트레이를 확인한다.',
      en: 'They come out of the slot in the lower cabinet onto a white tray. When shooting ends, follow the on-screen prompt and check the tray.',
    },
  },
  {
    q: { ko: '영어로도 이용할 수 있나요?', en: 'Can I use it in English?' },
    a: {
      ko: '기기 화면은 한국어와 영어를 지원하며, 이 웹사이트도 같은 두 언어로 제공한다.',
      en: 'The kiosk screen supports Korean and English, and this website offers the same two languages.',
    },
  },
  {
    q: { ko: '기기를 옮기거나 만져도 되나요?', en: 'May I move the machine?' },
    a: {
      ko: `기기 상단에 기기 이동 금지와 CCTV 녹화 중 안내문이 붙어 있어, 기기는 제자리에서 이용한다. 그 밖의 문의는 인스타그램 ${SITE.instagram.handle}로 남길 수 있다.`,
      en: `Notices on top of the machine say not to move it and that CCTV is recording, so use it where it stands. For anything else, message us on Instagram ${SITE.instagram.handle}.`,
    },
  },
  {
    q: { ko: '운영 시간은 언제인가요?', en: 'What are the opening hours?' },
    a: {
      ko: `${SITE.hours.open}에서 ${SITE.hours.close}까지 운영한다. 변동 사항은 인스타그램 ${SITE.instagram.handle}에서 확인할 수 있다.`,
      en: `We are open from ${SITE.hours.open} to ${SITE.hours.close}. Any changes are posted on Instagram ${SITE.instagram.handle}.`,
    },
  },
]

export default function Guide() {
  const pick = usePick()
  const [active, setActive] = useState('lens')
  usePageTitle(pick(T.title))

  return (
    <div className="break-keep break-words">
      <PageHero
        index="02"
        label={pick(T.label)}
        title={pick(T.h1)}
        desc={pick(T.desc)}
        crumbs={[{ label: pick(T.title) }]}
        aside={
          <div className="w-full rounded-lg lg:min-w-240 border border-hairlineStrong bg-bg-panel p-24 lg:p-28">
            <p className="ue-label text-label 4xl:text-bodySm text-text-meta">{pick(T.priceLabel)}</p>
            <p className="mt-8 font-display text-display-m font-black leading-tight tracking-tightest text-yellow">{pick(T.priceValue)}</p>
            <p className="mt-4 text-bodySm 4xl:text-body text-text-sec">{pick(T.priceNote)}</p>
          </div>
        }
      />

      <Section id="guide-steps" index={1} label={pick(T.stepsLabel)} title={pick(T.stepsTitle)}>
        <ol aria-label={pick(T.stepsAria)} className="grid gap-y-0 md:grid-cols-4 md:gap-x-0">
          {STEPS.map((s, i) => (
            <StepCard
              key={i}
              n={i + 1}
              color={s.color}
              icon={s.icon}
              title={pick(s.title)}
              body={pick(s.body)}
              note={pick(s.note)}
              last={i === STEPS.length - 1}
              delay={i * 80}
            />
          ))}
        </ol>
      </Section>

      <Section id="guide-camera" index={2} label={pick(T.camLabel)} title={pick(T.camTitle)} intro={pick(T.camIntro)} tone="elev">
        <div className="grid items-start gap-x-64 gap-y-40 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <figure className="overflow-hidden rounded-lg border border-hairlineStrong bg-bg-panel">
              <div className="h-12" aria-hidden="true">
                <CautionTape size={12} />
              </div>
              <div className="mx-auto max-w-read p-24 lg:p-32">
                <CameraDiagram active={active} onSelect={setActive} ariaLabel={pick(T.camAria)} />
              </div>
              <figcaption className="border-t border-hairline px-24 py-16 text-caption 4xl:text-bodySm text-text-meta">{pick(T.camCaption)}</figcaption>
            </figure>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-7">
            <ul aria-label={pick(T.camList)} className="border-t border-hairlineStrong">
              {CAMERA_PARTS.map((k, i) => {
                const on = active === k
                return (
                  <li key={k} className="border-b border-hairline">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActive(k)}
                      className="group flex w-full items-start gap-20 py-20 text-left lg:gap-28 lg:py-28"
                    >
                      <span
                        className={cx(
                          'grid size-40 shrink-0 place-items-center rounded-pill font-label text-body 4xl:text-lead font-bold transition-colors duration-base ease-out',
                          on ? 'bg-yellow text-text-onYellow' : 'border border-hairlineStrong text-text-pri group-hover:border-yellow',
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cx('block text-h4 4xl:text-h3 font-bold transition-colors duration-base ease-out', on ? 'text-yellow' : 'text-text-pri group-hover:text-yellow')}>
                          {pick(PARTS[k].title)}
                        </span>
                        <span className="mt-8 block max-w-read text-body 4xl:text-lead text-text-sec text-pretty">{pick(PARTS[k].body)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="mt-32 flex overflow-hidden rounded-md border border-hairlineStrong bg-bg-base">
              <div className="relative w-12 shrink-0 self-stretch" aria-hidden="true">
                <div className="absolute inset-0">
                  <CautionTape size={10} />
                </div>
              </div>
              <p className="p-16 text-bodySm 4xl:text-body text-text-sec lg:p-20">{pick(T.camNotice)}</p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section id="guide-cuts" index={3} label={pick(T.cutLabel)} title={pick(T.cutTitle)} intro={pick(T.cutIntro)}>
        <Reveal>
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">{pick(T.cutCaption)}</caption>
            <colgroup>
              <col className="w-1/5 md:w-1/6" />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr className="align-bottom">
                <th scope="col" className="ue-label border-b border-hairlineStrong pb-16 pr-8 text-label 4xl:text-bodySm font-medium text-text-meta">
                  {pick(T.cutCol)}
                </th>
                {[4, 8].map((n) => (
                  <th key={n} scope="col" className="border-b border-hairlineStrong px-8 pb-16 align-bottom md:px-24">
                    <span className="block max-w-240">
                      <CutSchematic cuts={n} ariaLabel={pick(n === 4 ? { ko: '4컷 도식: 4장을 찍어 프레임에 넣는다', en: '4 cut diagram: 4 shots go into the frame' } : { ko: '8컷 도식: 8장 중 4장을 골라 프레임에 넣는다', en: '8 cut diagram: choose 4 of 8 shots for the frame' })} />
                    </span>
                    <span className="mt-12 block font-display text-h2 font-black tracking-tightest text-yellow">
                      {n}
                      {pick({ ko: '컷', en: ' cuts' })}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CUT_ROWS.map((r, i) => (
                <tr key={i} className="align-top">
                  <th scope="row" className="border-b border-hairline py-20 pr-8 text-bodySm 4xl:text-body font-semibold text-text-meta lg:py-24">
                    {pick(r.th)}
                  </th>
                  <td className="border-b border-hairline px-8 py-20 text-body 4xl:text-lead text-text-pri text-pretty md:px-24 lg:py-24">{pick(r.a)}</td>
                  <td className="border-b border-hairline px-8 py-20 text-body 4xl:text-lead text-text-pri text-pretty md:px-24 lg:py-24">{pick(r.b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-24 max-w-read text-bodySm 4xl:text-body text-text-meta">{pick(T.cutNote)}</p>
        </Reveal>
      </Section>

      <Section id="guide-tips" index={4} label={pick(T.tipLabel)} title={pick(T.tipTitle)} tone="elev">
        <ul className="grid gap-16 md:grid-cols-2 lg:gap-24 xl:grid-cols-4">
          {TIPS.map((t, i) => (
            <Reveal as="li" key={i} delay={i * 70} className="rounded-lg border border-hairline bg-bg-panel p-24 lg:p-32">
              <span className="grid size-48 place-items-center rounded-md bg-yellow text-text-onYellow">
                <t.icon size={24} aria-hidden="true" />
              </span>
              <h3 className="mt-24 text-h3 4xl:text-h2 font-black tracking-tightest text-text-pri">{pick(t.title)}</h3>
              <p className="mt-12 text-body 4xl:text-lead text-text-sec text-pretty">{pick(t.body)}</p>
            </Reveal>
          ))}
        </ul>
        <div className="mt-40">
          <Button as={Link} to="/rooms" variant="outline">
            {pick(T.tipRooms)}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </Section>

      <Section id="guide-faq" index={5} label={pick(T.faqLabel)} title={pick(T.faqTitle)}>
        <Faq items={FAQ} />
      </Section>

      <section aria-labelledby="guide-cta" className="border-t border-hairline bg-bg-elev section-y">
        <Container className="flex flex-col items-start justify-between gap-32 lg:flex-row lg:items-end 4xl:max-w-screen-4xl">
          <div>
            <h2 id="guide-cta" className="font-display text-h1 font-black leading-tight tracking-tightest text-text-pri text-balance 4xl:text-display-m">
              {pick(T.ctaTitle)}
            </h2>
            <p className="mt-16 max-w-read text-lead text-text-sec">{pick(T.ctaBody)}</p>
          </div>
          <div className="flex flex-wrap gap-16">
            <Button as="a" href={SITE.kioskUrl} size="lg">
              {pick(T.ctaKiosk)}
              <ArrowRight size={20} aria-hidden="true" />
            </Button>
            <Button as={Link} to="/visit" variant="outline" size="lg">
              {pick(T.ctaVisit)}
            </Button>
          </div>
        </Container>
      </section>
    </div>
  )
}
