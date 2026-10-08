// GoogleMapEmbed.jsx: 구글 지도 임베드. 환경변수 VITE_GOOGLE_MAPS_KEY가 있으면 Maps Embed API(place 모드), 없으면 키 없는 임베드.
// 구글 약관: iframe 내용을 가리거나 필터로 바꾸지 않는다(로고와 약관 링크가 그대로 보인다). 어두운 사이트에는 감싸는 틀만 맞춘다.
// 키는 코드에 넣지 않고 apps/web/.env.local의 VITE_GOOGLE_MAPS_KEY로만 읽는다(커밋 금지). 키는 구글 콘솔에서 HTTP 리퍼러 제한을 건다.
import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { SHOP } from './shop.js'
import { directionsLinks } from './links.js'
import { pickText } from './i18n.js'
import './map.css'

const cx = (...a) => a.filter(Boolean).join(' ')

export function embedSrc({ zoom = 17, lang = 'en' } = {}) {
  const key = import.meta.env?.VITE_GOOGLE_MAPS_KEY
  const q = `${SHOP.lat},${SHOP.lng}`
  const hl = lang === 'ko' ? 'ko' : 'en'
  if (key) {
    // Embed API place 모드의 q는 장소명, 주소, 플러스 코드를 받는다. 도로명 주소로 핀을 찍고 center로 확정 좌표에 맞춘다.
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(SHOP.address)}&center=${encodeURIComponent(q)}&zoom=${zoom}&language=${hl}&region=KR`
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&hl=${hl}&output=embed`
}

export function GoogleMapEmbed({ className = '', zoom = 17, lang = 'en', title }) {
  const t = pickText(lang)
  const [loaded, setLoaded] = useState(false)
  const links = directionsLinks({ lang })
  const label = title || t.google.frame
  return (
    <div className={cx('uemap-gembed', className)} data-loaded={loaded}>
      <div className="uemap-gembed__bar">
        <span className="uemap-gembed__title">{t.google.title}</span>
        <a className="uemap-gembed__open" href={links.google} target="_blank" rel="noopener noreferrer">
          <span>{t.google.open}</span>
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="uemap-gembed__frame">
        {!loaded && <p className="uemap-gembed__wait" aria-hidden="true">{t.loading}</p>}
        <iframe
          title={label}
          src={embedSrc({ zoom, lang })}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  )
}
