import { Link } from 'react-router-dom'
import { UrbanEdgeWordmark } from '@urbanedge/brand'
import { SITE, FOOT_LINKS } from '../data/site.js'
import { usePick } from '../i18n/index.jsx'
import LogoMark from './LogoMark.jsx'
import { ExtLink } from './ExtLink.jsx'
import { InstagramGlyph, NaverGlyph } from './SocialLinks.jsx'
import { Wrap } from './Wrap.jsx'
import { B } from './B.jsx'

// 푸터: 작게. 로고, 링크 한 줄, 주소와 영업시간 한 줄, 저작권.
export default function Footer() {
  const pick = usePick()
  const link = 'inline-flex min-h-40 items-center gap-8 text-body-sm text-text-sec transition-colors duration-fast ease-out hover:text-text-pri hover:underline'

  return (
    <footer className="ue-light relative">
      <Wrap className="py-24 md:py-32">
        <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between">
          <Link to="/" aria-label={pick({ en: 'UrbanEdge, home', ko: '어반엣지 홈' })} className="flex items-center gap-10">
            <LogoMark className="size-32" />
            <UrbanEdgeWordmark className="h-14 w-auto text-text-pri" aria-hidden="true" role="presentation" />
          </Link>
          <div className="flex flex-wrap gap-x-20">
            {FOOT_LINKS.map((n) => <Link key={n.to} to={n.to} className={link}><B v={n.label} inline /></Link>)}
            <ExtLink href={SITE.instagram.url} className={link} icon={false}><InstagramGlyph size={16} />Instagram</ExtLink>
            <ExtLink href={SITE.naverPlace} className={link} icon={false}><NaverGlyph size={16} /><B v={{ en: 'Naver', ko: '네이버' }} inline /></ExtLink>
            <ExtLink href={SITE.maps.google} className={link} icon={false}>Google Maps</ExtLink>
          </div>
        </div>
        <p className="t-caption mt-16 text-text-meta">
          <B v={SITE.address} inline /> · {SITE.hours.open} ~ {SITE.hours.close} · &copy; 2026 UrbanEdge
        </p>
      </Wrap>
    </footer>
  )
}
