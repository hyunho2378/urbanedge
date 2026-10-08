// DirectionsLinks.jsx: 길 찾기 링크 줄. Open in Naver Map, Open in Google Maps, Naver Place, Open in Kakao Map. 데이터는 directionsLinks()에서 온다.
import { ExternalLink } from 'lucide-react'
import { directionsLinks } from './links.js'
import './map.css'

const TONE = { naver: 'primary', google: 'primary', naverPlace: 'outline', kakao: 'ghost' }

export function DirectionsLinks({ lang = 'en', className = '', stack = false, kakao = true }) {
  const { items } = directionsLinks({ lang })
  return (
    <ul className={`uemap-links ${className}`.trim()} data-stack={stack ? 'true' : undefined}>
      {items.filter((i) => kakao || i.id !== 'kakao').map((i) => (
        <li key={i.id}>
          <a href={i.href} target="_blank" rel="noopener noreferrer" data-tone={TONE[i.id]}>
            <span>{lang === 'ko' ? i.labelKo : i.label}</span>
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  )
}
