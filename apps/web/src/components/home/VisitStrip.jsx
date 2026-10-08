import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Clock, MapPin, Ticket } from 'lucide-react'
import { Button, Reveal } from '@urbanedge/ds'
import { SITE, formatPrice } from '../../data/site.js'
import { useLang, usePick } from '../../i18n/index.jsx'
import { ExtLink } from '../../layout/ExtLink.jsx'
import { T } from '../../layout/type.js'
import { Photo, Section, SectionHead } from './parts.jsx'

const COPY = {
  label: { ko: '방문 정보', en: 'Visit' },
  title: { ko: '입구에서 안쪽으로 들어간다', en: 'Head inside from the entrance' },
  desc: {
    ko: '촬영 기기는 안쪽에 있다. 입구에서 안쪽으로 들어가면 방 5곳이 이어진다.',
    en: 'The photo machines are further inside. Walk in from the entrance and the five rooms follow one after another.',
  },
  photoAlt: {
    ko: '어반엣지 메트로그래피 간판이 걸린 건물 모서리와 체커보드 바닥의 유리 입구',
    en: 'The corner of the building with the UrbanEdge Metrography sign and a glass entrance over a checkerboard floor',
  },
  caption: { ko: '이 간판과 체커보드 바닥이 보이면 도착한 곳이다.', en: 'Look for this sign and the checkerboard floor.' },
  address: { ko: '주소', en: 'Address' },
  hours: { ko: '영업시간', en: 'Hours' },
  price: { ko: '이용 요금', en: 'Price' },
  priceNote: { ko: '기본 요금, 인화 2장 포함', en: 'base price, 2 prints included' },
  naver: { ko: '네이버 지도', en: 'Naver Map' },
  google: { ko: '구글 지도', en: 'Google Maps' },
  insta: { ko: '인스타그램', en: 'Instagram' },
  more: { ko: '오시는 길 자세히 보기', en: 'Full directions' },
}

export default function VisitStrip() {
  const pick = usePick()
  const { lang } = useLang()
  const rows = [
    { k: 'address', Icon: MapPin, v: pick(SITE.address) },
    { k: 'hours', Icon: Clock, v: `${SITE.hours.open} ~ ${SITE.hours.close}` },
    { k: 'price', Icon: Ticket, v: formatPrice(lang), n: pick(COPY.priceNote) },
  ]
  return (
    <Section id="visit" labelledBy="visit-title" tone="elev">
      <SectionHead index={6} label={COPY.label} titleId="visit-title" title={COPY.title} desc={COPY.desc} />
      <div className="grid gap-48 lg:grid-cols-12 lg:gap-x-64">
        <Reveal className="lg:col-span-6">
          <figure>
            <Photo src="/img/lg/o_21.jpg" alt={pick(COPY.photoAlt)} ratio="4 / 3" />
            <figcaption className={`${T.small} mt-16 text-text-meta`}>{pick(COPY.caption)}</figcaption>
          </figure>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-6">
          <dl className="border-t border-hairline">
            {rows.map(({ k, Icon, v, n }) => (
              <div key={k} className="flex gap-20 border-b border-hairline py-24">
                <Icon size={22} aria-hidden="true" className="mt-4 shrink-0 text-yellow" />
                <div>
                  <dt className={`${T.label} text-text-meta`}>{pick(COPY[k])}</dt>
                  <dd className={`${T.h4} mt-8 text-text-pri`}>
                    {v}
                    {n && <span className={`${T.small} mt-4 block font-normal text-text-meta`}>{n}</span>}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-32 flex flex-col gap-12 md:flex-row md:flex-wrap">
            <Button as="a" href={SITE.maps.naver} target="_blank" rel="noopener noreferrer" variant="outline" size="lg" className="text-body">
              {pick(COPY.naver)}
              <ArrowUpRight size={18} aria-hidden="true" />
              <span className="sr-only">{pick({ ko: '(새 탭에서 열림)', en: '(opens in a new tab)' })}</span>
            </Button>
            <Button as="a" href={SITE.maps.google} target="_blank" rel="noopener noreferrer" variant="outline" size="lg" className="text-body">
              {pick(COPY.google)}
              <ArrowUpRight size={18} aria-hidden="true" />
              <span className="sr-only">{pick({ ko: '(새 탭에서 열림)', en: '(opens in a new tab)' })}</span>
            </Button>
            <Button as="a" href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" variant="ghost" size="lg" className="text-body">
              {SITE.instagram.handle}
              <span className="sr-only">{pick(COPY.insta)} {pick({ ko: '(새 탭에서 열림)', en: '(opens in a new tab)' })}</span>
            </Button>
          </div>

          <Link
            to="/visit"
            className={`${T.body} group mt-32 inline-flex min-h-48 items-center gap-12 font-ui font-semibold text-yellow underline-offset-8 hover:underline`}
          >
            {pick(COPY.more)}
            <ArrowRight size={20} aria-hidden="true" className="transition-transform duration-base ease-out group-hover:translate-x-4" />
          </Link>
        </Reveal>
      </div>
    </Section>
  )
}
