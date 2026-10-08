import { Link } from 'react-router-dom'
import { Clock, MapPin, Ticket } from 'lucide-react'
import { CautionTape } from '@urbanedge/ds'
import { UEMark, UrbanEdgeWordmark } from '@urbanedge/brand'
import { LINE, NAV, SITE, formatPrice } from '../data/site.js'
import { useLang, usePick } from '../i18n/index.jsx'
import { ExtLink } from './ExtLink.jsx'
import { InstagramGlyph, NaverGlyph } from './SocialLinks.jsx'
import { Wrap } from './Wrap.jsx'
import { B } from './B.jsx'

// 푸터: 종착역 안내판. 큰 워드마크, 방문 정보, 실제 링크 버튼, 아래에 경고 테이프 띠.
export default function Footer() {
  const pick = usePick()
  const { lang } = useLang()
  const link = 'inline-flex min-h-48 items-center text-text-sec transition-colors duration-fast ease-out hover:text-yellow'

  return (
    <footer className="relative bg-bg-elev">
      <Wrap className="pb-24 pt-40 md:pb-32 md:pt-56 lg:pt-96">
        <Link to="/" aria-label={pick({ en: 'UrbanEdge Metrography, home', ko: '어반엣지 메트로그래피 홈' })} className="mt-16 block">
          <UrbanEdgeWordmark className="h-auto w-3/4 text-text-pri md:w-full md:max-w-3xl" aria-hidden="true" role="presentation" />
        </Link>

        <div className="mt-24 flex flex-wrap gap-x-24 md:mt-40">
          <ExtLink href={SITE.instagram.url} className={link} icon={false}><InstagramGlyph size={16} />Instagram</ExtLink>
          <ExtLink href={SITE.naverPlace} className={link} icon={false}><NaverGlyph size={16} /><B v={{ en: 'Naver Place', ko: '네이버 플레이스' }} inline /></ExtLink>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-x-24 gap-y-40 md:mt-56 lg:grid-cols-12">
          <address className="col-span-2 text-body-sm not-italic leading-relaxed text-text-pri lg:col-span-6">
            <p className="flex gap-12">
              <MapPin size={18} aria-hidden="true" className="mt-4 shrink-0 text-yellow" />
              <span><B v={SITE.address} inline /></span>
            </p>
            <p className="mt-8 flex gap-12 md:mt-12">
              <Clock size={18} aria-hidden="true" className="mt-4 shrink-0 text-yellow" />
              <span>{SITE.hours.open} ~ {SITE.hours.close}</span>
            </p>
            <p className="mt-8 hidden gap-12 md:mt-12 md:flex">
              <Ticket size={18} aria-hidden="true" className="mt-4 shrink-0 text-yellow" />
              <span>
                {formatPrice(lang)}
                <span className="block text-text-meta"><B v={{ en: 'base price, 2 prints included', ko: '기본 요금, 인화 2장 포함' }} inline /></span>
              </span>
            </p>
          </address>

          <nav aria-label={pick({ en: 'Footer', ko: '푸터' })} className="hidden md:block lg:col-span-3">
            <p className="t-label mb-8 text-text-meta"><B v={{ en: 'Pages', ko: '페이지' }} inline /></p>
            <ul className="text-body-sm">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={link}><B v={n.label} inline /></Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block lg:col-span-3">
            <p className="t-label mb-8 text-text-meta"><B v={{ en: 'Find us', ko: '찾아오기' }} inline /></p>
            <ul className="text-body-sm">
              <li><ExtLink href={SITE.naverPlace} className={link}><B v={{ en: 'Naver Place', ko: '네이버 플레이스' }} inline /></ExtLink></li>
              <li><ExtLink href={SITE.maps.naver} className={link}><B v={{ en: 'Naver Map', ko: '네이버 지도' }} inline /></ExtLink></li>
              <li><ExtLink href={SITE.maps.google} className={link}>Google Maps</ExtLink></li>
            </ul>
          </div>
        </div>

        <p className="t-caption mt-24 flex md:mt-56 items-start gap-10 text-text-meta">
          <UEMark className="mt-2 w-20 shrink-0 text-text-meta" title="" aria-hidden="true" role="presentation" />
          <span>&copy; 2026 UrbanEdge</span>
        </p>
      </Wrap>
      <div className="h-16 w-full lg:h-24" aria-hidden="true">
        <CautionTape size={16} />
      </div>
    </footer>
  )
}
