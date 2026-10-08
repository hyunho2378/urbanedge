import { Reveal } from '@urbanedge/ds'
import { ROOMS, SITE, formatPrice } from '../../data/site.js'
import { useLang, usePick } from '../../i18n/index.jsx'
import { T } from '../../layout/type.js'
import { Photo, Section, SectionHead } from './parts.jsx'

const COPY = {
  label: { ko: '소개', en: 'About' },
  title: {
    ko: '방 5곳을 지나며 찍는 무인 셀프 사진관',
    en: 'A self-service photo studio with five rooms to walk through',
  },
  p1: {
    ko: '어반엣지 메트로그래피는 경북 경주시 황리단길에 있다. 방마다 키오스크가 따로 있어서 마음에 드는 방에 들어가 촬영부터 인화까지 직접 마친다.',
    en: 'UrbanEdge Metrography is in Hwangridan-gil, Gyeongju. Every room has its own kiosk, so you step into the room you like and handle everything from shooting to printing yourself.',
  },
  p2: {
    ko: '방 이름에는 지하철 노선처럼 L1부터 L5까지 코드가 붙고 노선 색으로 구분된다.',
    en: 'Each room carries a subway-style code from L1 to L5 and its own line color.',
  },
  photoAlt: {
    ko: '검은 고깔과 노란 경고 테이프, 체커보드 바닥이 놓인 어반엣지 입구 안쪽',
    en: 'Inside the UrbanEdge entrance, with black cones, yellow caution tape and a checkerboard floor',
  },
  address: { ko: '주소', en: 'Address' },
  hours: { ko: '영업시간', en: 'Hours' },
  price: { ko: '이용 요금', en: 'Price' },
  rooms: { ko: '포토 룸', en: 'Photo rooms' },
  area: { ko: '황리단길', en: 'Hwangridan-gil' },
  priceNote: { ko: '기본 요금, 인화 2장 포함', en: 'Base price, 2 prints included' },
  roomsValue: { ko: `${ROOMS.length}곳`, en: `${ROOMS.length} rooms` },
  roomsNote: {
    ko: `${ROOMS[0].code}부터 ${ROOMS[ROOMS.length - 1].code}까지`,
    en: `${ROOMS[0].code} to ${ROOMS[ROOMS.length - 1].code}`,
  },
}

export default function About() {
  const pick = usePick()
  const { lang } = useLang()
  const facts = [
    { k: 'address', v: pick(SITE.address), n: pick(COPY.area), long: true },
    { k: 'hours', v: `${SITE.hours.open} ~ ${SITE.hours.close}`, n: null },
    { k: 'price', v: formatPrice(lang), n: pick(COPY.priceNote) },
    { k: 'rooms', v: pick(COPY.roomsValue), n: pick(COPY.roomsNote) },
  ]

  return (
    <Section id="about" labelledBy="about-title">
      <SectionHead index={1} label={COPY.label} titleId="about-title" title={COPY.title} />
      <div className="grid gap-48 lg:grid-cols-12 lg:gap-x-64">
        <div className="lg:col-span-7">
          <Reveal>
            <p className={`${T.lead} max-w-read text-text-pri`}>{pick(COPY.p1)}</p>
            <p className={`${T.body} mt-24 max-w-read text-text-sec`}>{pick(COPY.p2)}</p>
          </Reveal>
          <Reveal as="dl" delay={80} className="mt-48 grid border-l border-t border-hairline md:grid-cols-2 lg:mt-64">
            {facts.map((f) => (
              <div key={f.k} className="border-b border-r border-hairline p-24 lg:p-32">
                <dt className={`${T.label} text-text-meta`}>{pick(COPY[f.k])}</dt>
                <dd className="mt-16">
                  <span className={f.long ? `${T.h4} block text-text-pri` : `${T.h3} block text-text-pri`}>{f.v}</span>
                  {f.n && <span className={`${T.small} mt-8 block text-text-meta`}>{f.n}</span>}
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal delay={120} className="md:max-w-lg lg:col-span-5 lg:max-w-none">
          <Photo src="/img/lg/o_20.jpg" alt={pick(COPY.photoAlt)} ratio="4 / 5" />
        </Reveal>
      </div>

    </Section>
  )
}
