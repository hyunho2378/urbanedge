import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AtSign, Check, Clock, Copy, CreditCard, ExternalLink, Languages, MapPin, Hand, UserRound, Accessibility } from 'lucide-react'
import { Button, Reveal } from '@urbanedge/ds'
import { useLang, usePick } from '../i18n/index.jsx'
import { SITE } from '../data/site.js'
import { PageHero } from '../components/pages/PageHero.jsx'
import { Section } from '../components/pages/Section.jsx'
import { RouteSteps } from '../components/pages/RouteSteps.jsx'
import { photo } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const price = SITE.price.base.toLocaleString('en-US')

const T = {
  title: { ko: '오시는 길', en: 'Visit' },
  label: { ko: '오시는 길 / VISIT', en: 'VISIT' },
  h1: { ko: '입구에서 안쪽까지', en: 'From the street to the machine' },
  desc: {
    ko: '경주 황리단길의 포석로1079번길 6에 있으며, 입구에서 안쪽으로 들어가면 방 5곳이 이어지고 방마다 기기가 따로 있다.',
    en: 'Find us at 6, Poseok-ro 1079beon-gil in Gyeongju, near Hwangnidan-gil. Walk in from the entrance and the five rooms follow, each with its own machine.',
  },
  naver: { ko: '네이버 지도', en: 'Naver Map' },
  google: { ko: '구글 지도', en: 'Google Maps' },
  newTab: { ko: '새 탭에서 열림', en: 'opens in a new tab' },

  infoLabel: { ko: '기본 정보', en: 'INFORMATION' },
  infoTitle: { ko: '방문 전에 확인할 네 가지', en: 'Four things to check before you come' },
  addr: { ko: '주소', en: 'Address' },
  hours: { ko: '운영 시간', en: 'Hours' },
  hoursV: { ko: `${SITE.hours.open}에서 ${SITE.hours.close}까지`, en: `${SITE.hours.open} to ${SITE.hours.close}` },
  fee: { ko: '이용 요금', en: 'Price' },
  feeV: { ko: `기본 ${price}원, 인화 ${SITE.price.prints}장 포함`, en: `${price} KRW base, ${SITE.price.prints} prints included` },
  insta: { ko: '인스타그램', en: 'Instagram' },
  copy: { ko: '주소 복사', en: 'Copy address' },
  copied: { ko: '주소를 복사했다', en: 'Address copied' },
  copyFail: { ko: '복사하지 못했다. 주소를 직접 선택해 주세요', en: 'Copy failed. Please select the address manually' },

  routeLabel: { ko: '동선', en: 'WAYFINDING' },
  routeTitle: { ko: '입구에서 기기까지 다섯 걸음', en: 'Five steps from the entrance to the machine' },
  routeIntro: {
    ko: '안쪽 공간의 세부 배치는 현장에서 확인되는 만큼만 적었으며, 입구에서 안쪽으로 들어가면 방 5곳이 이어진다.',
    en: 'This route lists only what has been confirmed on site: walk in from the entrance and the five rooms follow one after another.',
  },
  routeAria: { ko: '입구에서 기기까지 단계', en: 'Steps from the entrance to the machine' },

  accLabel: { ko: '접근성 안내', en: 'ACCESSIBILITY' },
  accTitle: { ko: '이용 전에 알아 둘 점', en: 'Good to know before you use it' },
  accIntro: {
    ko: '확인된 내용만 적었고, 확인되지 않은 항목은 그대로 밝혀 두었다.',
    en: 'Only confirmed details are listed, and anything unconfirmed is marked as such.',
  },
  cta: { ko: '이용 방법 보기', en: 'Read the guide' },
}

const ROUTE = [
  {
    title: { ko: '골목에서 매장 찾기', en: 'Spot the shop from the alley' },
    body: {
      ko: '검은 외관에 UrbanEdge Metrography 간판이 붙은 유리 매장이며, 입구 앞 바닥은 체커보드 무늬다.',
      en: 'A glass-fronted shop with a black facade and the UrbanEdge Metrography sign, with a checkerboard pattern on the floor at the entrance.',
    },
    photo: photo('o_21'),
  },
  {
    title: { ko: '입구로 들어가기', en: 'Step through the entrance' },
    body: {
      ko: '유리 너머로 둥근 빨간 거울이 줄지어 붙은 벽이 보이며, 이 벽과 체커보드 바닥이 입구 안쪽의 첫인상이다.',
      en: 'Through the glass you can see a wall of round red mirrors. That wall and the checkerboard floor are the first things inside.',
    },
    photo: photo('o_24'),
  },
  {
    title: { ko: '안쪽 공간으로 이동', en: 'Move into the inner space' },
    body: {
      ko: '입구에서 안쪽으로 들어가면 방 5곳이 이어지며, 파란 타일과 흰 타일 벽에 노란 대기 의자가 놓인 공간을 지나게 된다.',
      en: 'Walk in from the entrance and the five rooms follow, passing a space with blue and white tiled walls and yellow waiting seats.',
    },
    photo: photo('o_18'),
  },
  {
    title: { ko: '방 앞의 기기 찾기', en: 'Find the machine in your room' },
    body: {
      ko: '방마다 키오스크가 따로 있다. 흰색 본체 가운데에 가로형 모니터가 있고, 카메라는 모니터 아래에 있다.',
      en: 'Each room has its own kiosk. A white body holds a wide monitor in the middle, and the camera sits below it.',
    },
    link: { to: '/guide', label: { ko: '카메라 위치 자세히 보기', en: 'See where the camera is' } },
  },
  {
    title: { ko: '인화물 받기', en: 'Pick up your prints' },
    body: {
      ko: '촬영이 끝나면 기기 아래쪽 인화 출구의 흰색 트레이에서 사진을 가져간다. 기기 위 벽에는 앞서 다녀간 손님의 인화지 콜라주가 붙어 있다.',
      en: 'When shooting ends, take your prints from the white tray at the slot near the bottom of the machine. Prints from earlier guests are collaged on the wall above it.',
    },
  },
]

const ACCESS = [
  {
    icon: Languages,
    title: { ko: '언어', en: 'Language' },
    body: { ko: '기기 화면과 이 웹사이트는 한국어와 영어를 지원한다.', en: 'The kiosk screen and this website support Korean and English.' },
  },
  {
    icon: Hand,
    title: { ko: '조작 방식', en: 'Controls' },
    body: { ko: '기기는 터치 화면으로 조작하고, 결제는 렌즈 아래 오른쪽의 카드 단말기에서 한다.', en: 'The machine runs on a touch screen, and payment is at the card terminal to the lower right of the lens.' },
  },
  {
    icon: UserRound,
    title: { ko: '도움 요청', en: 'Getting help' },
    body: { ko: '무인 셀프 사진관이라 직원이 상주하지 않으며, 기기에 붙은 안내 스티커에 문의 연락처가 적혀 있다.', en: 'This is an unmanned self-service studio with no staff on site, and a sticker on the machine lists a contact for help.' },
  },
  {
    icon: Accessibility,
    title: { ko: '이동 편의', en: 'Step-free access' },
    body: {
      ko: `입구 단차와 문 폭, 휠체어와 유모차 이용 여부는 아직 확인된 정보가 없으며, 방문 전에 인스타그램 ${SITE.instagram.handle}로 문의하면 확인할 수 있다.`,
      en: `Entrance steps, door width and wheelchair or stroller access are not yet confirmed here. Message us on Instagram ${SITE.instagram.handle} before you visit.`,
    },
  },
]

function Info({ icon: Icon, label, children }) {
  return (
    <div className="border-b border-hairline py-24 lg:py-32">
      <dt className="ue-label flex items-center gap-12 text-label 4xl:text-bodySm text-text-meta">
        <Icon size={18} aria-hidden="true" className="text-yellow" />
        {label}
      </dt>
      <dd className="mt-12 text-h4 4xl:text-h3 font-bold text-text-pri text-pretty">{children}</dd>
    </div>
  )
}

export default function Visit() {
  const pick = usePick()
  const { lang } = useLang()
  const [copy, setCopy] = useState('idle')
  const timer = useRef(0)
  usePageTitle(pick(T.title))
  useEffect(() => () => clearTimeout(timer.current), [])

  const onCopy = async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(SITE.address[lang] ?? SITE.address.ko)
      setCopy('done')
    } catch {
      setCopy('fail')
    }
    timer.current = setTimeout(() => setCopy('idle'), 2400)
  }

  const mapBtn = (href, label, primary) => (
    <Button as="a" href={href} target="_blank" rel="noopener noreferrer" variant={primary ? 'primary' : 'outline'} size="lg">
      {label}
      <ExternalLink size={18} aria-hidden="true" />
      <span className="sr-only">({pick(T.newTab)})</span>
    </Button>
  )

  return (
    <div className="break-keep break-words">
      <PageHero
        index="03"
        label={pick(T.label)}
        title={pick(T.h1)}
        desc={pick(T.desc)}
        crumbs={[{ label: pick(T.title) }]}
      >
        <div className="mt-40 flex flex-wrap gap-16">
          {lang === 'ko' ? mapBtn(SITE.maps.naver, pick(T.naver), true) : mapBtn(SITE.maps.google, pick(T.google), true)}
          {lang === 'ko' ? mapBtn(SITE.maps.google, pick(T.google), false) : mapBtn(SITE.maps.naver, pick(T.naver), false)}
        </div>
      </PageHero>

      <Section id="visit-info" index={1} label={pick(T.infoLabel)} title={pick(T.infoTitle)}>
        <dl className="grid border-t border-hairlineStrong md:grid-cols-2 md:gap-x-64">
          <Info icon={MapPin} label={pick(T.addr)}>
            <span className="block">{pick(SITE.address)}</span>
            <span className="mt-16 flex flex-wrap items-center gap-12">
              <button
                type="button"
                onClick={onCopy}
                className="ue-press inline-flex min-h-48 items-center gap-8 rounded-md border border-hairlineStrong px-16 text-bodySm 4xl:text-body font-semibold text-text-pri transition-colors duration-fast ease-out hover:border-yellow hover:text-yellow"
              >
                {copy === 'done' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                {pick(T.copy)}
              </button>
              <span role="status" aria-live="polite" className="text-bodySm 4xl:text-body font-normal text-text-sec">
                {copy === 'done' && pick(T.copied)}
                {copy === 'fail' && pick(T.copyFail)}
              </span>
            </span>
          </Info>
          <Info icon={Clock} label={pick(T.hours)}>
            {pick(T.hoursV)}
          </Info>
          <Info icon={CreditCard} label={pick(T.fee)}>
            {pick(T.feeV)}
          </Info>
          <Info icon={AtSign} label={pick(T.insta)}>
            <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-48 items-center gap-8 rounded-sm text-yellow hover:text-yellow-hover">
              {SITE.instagram.handle}
              <ExternalLink size={16} aria-hidden="true" />
              <span className="sr-only">({pick(T.newTab)})</span>
            </a>
          </Info>
        </dl>
      </Section>

      <Section id="visit-route" index={2} label={pick(T.routeLabel)} title={pick(T.routeTitle)} intro={pick(T.routeIntro)} tone="elev">
        <RouteSteps steps={ROUTE} label={pick(T.routeAria)} />
      </Section>

      <Section id="visit-access" index={3} label={pick(T.accLabel)} title={pick(T.accTitle)} intro={pick(T.accIntro)}>
        <ul className="grid gap-16 md:grid-cols-2 lg:gap-24 xl:grid-cols-4">
          {ACCESS.map((a, i) => (
            <Reveal as="li" key={i} delay={i * 70} className="rounded-lg border border-hairline bg-bg-panel p-24 lg:p-32">
              <span className="grid size-48 place-items-center rounded-md border border-hairlineStrong text-yellow">
                <a.icon size={24} aria-hidden="true" />
              </span>
              <h3 className="mt-24 text-h3 4xl:text-h2 font-black tracking-tightest text-text-pri">{pick(a.title)}</h3>
              <p className="mt-12 text-body 4xl:text-lead text-text-sec text-pretty">{pick(a.body)}</p>
            </Reveal>
          ))}
        </ul>
        <div className="mt-40">
          <Button as={Link} to="/guide" variant="outline">
            {pick(T.cta)}
          </Button>
        </div>
      </Section>
    </div>
  )
}
