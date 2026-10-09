import { Suspense, useEffect, useState } from 'react'
import { Clock, MapPin } from 'lucide-react'
import { Button } from '@urbanedge/ds'
import { SITE } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import { InstagramGlyph } from '../../layout/SocialLinks.jsx'
import { NaverMark } from '../pages/NaverMark.jsx'
import { GoogleEmbedFallback } from './fallbacks.jsx'
import { isStub, lazyReal } from './kit.jsx'
import { useNearViewport } from './hooks.js'
import { Section } from './parts.jsx'

const COPY = {
  title: { en: 'Location', ko: '위치' },
  gmaps: { en: 'Google Maps', ko: '구글 지도' },
  place: { en: 'Naver Place', ko: '네이버 플레이스' },
  loading: { en: 'Loading the map', ko: '지도를 불러오는 중' },
}
const MapLazy = lazyReal(() => import('@urbanedge/map'), 'HwangnidanMap', null)

const linkCls = 'inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow'

// 1번 출구 구간: 지도는 하나만 보여 준다(3D 엔진이 있으면 3D, 없으면 구글 지도). 주 버튼은 하나, 나머지는 텍스트 링크다.
export default function Location() {
  const pick = usePick()
  const [ref, near] = useNearViewport('500px')
  const [shop, setShop] = useState({ lat: 35.8346, lng: 129.2108 })
  const [real3d, setReal3d] = useState(false)

  useEffect(() => {
    if (!near) return
    import('@urbanedge/map')
      .then((m) => {
        if (m.SHOP?.lat) setShop({ lat: m.SHOP.lat, lng: m.SHOP.lng })
        setReal3d(!isStub(m.HwangnidanMap))
      })
      .catch(() => {})
  }, [near])

  const { lat, lng } = shop
  const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
  const ext = (href, label, icon) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>
      {icon}
      {pick(label)}
      <span className="sr-only">{pick({ en: '(opens in a new tab)', ko: '(새 탭에서 열림)' })}</span>
    </a>
  )

  return (
    <Section id="location" labelledBy="location-title" tone="light">
      <h2 id="location-title" className="t-headline text-text-pri">{pick(COPY.title)}</h2>
      <address className="t-body mt-12 flex flex-wrap items-center gap-x-24 gap-y-8 not-italic text-text-pri">
        <span className="inline-flex items-start gap-8"><MapPin size={18} aria-hidden="true" className="mt-4 shrink-0 text-yellow" /><B v={SITE.address} inline /></span>
        <span className="inline-flex items-center gap-8"><Clock size={18} aria-hidden="true" className="text-yellow" />{SITE.hours.open} ~ {SITE.hours.close}</span>
      </address>

      <div ref={ref} className="relative mt-16 overflow-hidden rounded-xl bg-bg-panel md:mt-32" style={{ height: 'clamp(320px, 48dvh, 520px)' }}>
        {near &&
          (real3d ? (
            <Suspense fallback={<p className="t-label grid size-full place-items-center text-text-meta">{pick(COPY.loading)}</p>}>
              <MapLazy className="size-full" mode="3d" theme="dark" showRoute lang={pick({ en: 'en', ko: 'ko' })} />
            </Suspense>
          ) : (
            <GoogleEmbedFallback lat={lat} lng={lng} title={pick({ en: 'UrbanEdge on Google Maps', ko: '구글 지도의 어반엣지' })} />
          ))}
      </div>

      <div className="mt-16 flex flex-wrap items-center gap-x-24 gap-y-8 md:mt-24">
        <Button as="a" href={gmaps} target="_blank" rel="noopener noreferrer" size="lg" className="w-full text-body md:w-auto">{pick(COPY.gmaps)}</Button>
        {ext(SITE.naverPlace, COPY.place, <NaverMark size={18} />)}
        {ext(SITE.instagram.url, { en: 'Instagram', ko: '인스타그램' }, <InstagramGlyph size={16} />)}
      </div>
    </Section>
  )
}
