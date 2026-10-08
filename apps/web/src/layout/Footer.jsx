import { Link } from 'react-router-dom'
import { Clock, MapPin, Ticket } from 'lucide-react'
import { LineBadge, RouteRibbon, Wordmark } from '@urbanedge/ds'
import { NAV, ROOMS, SITE, formatPrice } from '../data/site.js'
import { useLang, usePick } from '../i18n/index.jsx'
import { ExtLink } from './ExtLink.jsx'
import { Wrap } from './Wrap.jsx'
import { T } from './type.js'

const COPY = {
  visit: { ko: '방문 정보', en: 'Visit' },
  explore: { ko: '둘러보기', en: 'Explore' },
  follow: { ko: '찾기와 소식', en: 'Find us' },
  hours: { ko: '영업시간', en: 'Hours' },
  price: { ko: '이용 요금', en: 'Price' },
  priceNote: { ko: '기본, 인화 2장 포함', en: 'base, 2 prints included' },
  naver: { ko: '네이버 지도', en: 'Naver Map' },
  google: { ko: '구글 지도', en: 'Google Maps' },
  rights: { ko: '어반엣지 메트로그래피', en: 'UrbanEdge Metrography' },
}

function InstagramGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Footer() {
  const pick = usePick()
  const { lang } = useLang()
  const link = 'inline-flex min-h-40 items-center text-text-sec transition-colors duration-fast ease-out hover:text-yellow'

  return (
    <footer className="relative bg-bg-base">
      <RouteRibbon className="h-8" />
      <Wrap className="py-64 lg:py-96">
        <div className="grid gap-56 lg:grid-cols-12 lg:gap-x-40">
          <div className="lg:col-span-5">
            <Link to="/" className="ue-press inline-block rounded-sm" aria-label={pick({ ko: '어반엣지 메트로그래피 홈', en: 'UrbanEdge Metrography home' })}>
              <Wordmark className="origin-left scale-125" />
            </Link>
            <p className="mt-32 max-w-read font-display text-h2 font-black leading-tight tracking-tightest text-text-pri text-balance 3xl:text-h1">
              {SITE.taglineEn}
            </p>
            <p className={`${T.small} mt-12 text-text-sec`}>{pick(SITE.tagline)}</p>
            <ul className="mt-32 flex items-center gap-8" aria-label={pick({ ko: '포토 룸 노선 코드', en: 'Photo room line codes' })}>
              {ROOMS.map((r) => (
                <li key={r.id}>
                  <Link to={`/rooms/${r.id}`} aria-label={`${r.code} ${r.name}`} className="ue-press block rounded-pill">
                    <LineBadge code={r.code} color={r.color} />
                  </Link>
                </li>
              ))}
            </ul>
            <p className={`${T.label} mt-24 text-yellow`}>{SITE.slogan}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-24 gap-y-40 lg:col-span-7 lg:grid-cols-3 lg:gap-x-32">
            <div className="col-span-2 lg:col-span-1">
              <h2 className={`${T.label} mb-16 text-text-meta`}>{pick(COPY.visit)}</h2>
              <address className={`${T.small} not-italic leading-relaxed text-text-pri`}>
                <p className="flex gap-12">
                  <MapPin size={18} aria-hidden="true" className="mt-4 shrink-0 text-yellow" />
                  <span>{pick(SITE.address)}</span>
                </p>
                <p className="mt-12 flex gap-12">
                  <Clock size={18} aria-hidden="true" className="mt-4 shrink-0 text-yellow" />
                  <span>
                    <span className="sr-only">{pick(COPY.hours)} </span>
                    {SITE.hours.open} ~ {SITE.hours.close}
                  </span>
                </p>
                <p className="mt-12 flex gap-12">
                  <Ticket size={18} aria-hidden="true" className="mt-4 shrink-0 text-yellow" />
                  <span>
                    <span className="sr-only">{pick(COPY.price)} </span>
                    {formatPrice(lang)}
                    <span className="block text-text-meta">{pick(COPY.priceNote)}</span>
                  </span>
                </p>
              </address>
            </div>

            <nav aria-label={pick(COPY.explore)}>
              <h2 className={`${T.label} mb-16 text-text-meta`}>{pick(COPY.explore)}</h2>
              <ul className={T.small}>
                {NAV.map((n) => (
                  <li key={n.to}>
                    <Link to={n.to} className={link}>
                      {pick(n.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className={`${T.label} mb-16 text-text-meta`}>{pick(COPY.follow)}</h2>
              <ul className={T.small}>
                <li>
                  <ExtLink href={SITE.instagram.url} className={link} icon={false}>
                    <InstagramGlyph />
                    {SITE.instagram.handle}
                  </ExtLink>
                </li>
                <li>
                  <ExtLink href={SITE.maps.naver} className={link}>
                    {pick(COPY.naver)}
                  </ExtLink>
                </li>
                <li>
                  <ExtLink href={SITE.maps.google} className={link}>
                    {pick(COPY.google)}
                  </ExtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-64 flex flex-col gap-12 border-t border-hairline pt-24 md:flex-row md:items-center md:justify-between lg:mt-96">
          <p className={`${T.small} text-text-meta`}>
            <span aria-hidden="true" className="mr-12 text-yellow">‡</span>
            &copy; 2026 {pick(COPY.rights)}
          </p>
          <p className={`${T.label} text-text-meta`}>{SITE.slogan}</p>
        </div>
      </Wrap>
    </footer>
  )
}
