import { Suspense, useEffect, useState } from 'react'
import { ArrowUpRight, Clock, MapPin } from 'lucide-react'
import { Button, cx } from '@urbanedge/ds'
import { SITE } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import { InstagramGlyph, NaverGlyph } from '../../layout/SocialLinks.jsx'
import { GoogleEmbedFallback } from './fallbacks.jsx'
import { isStub, lazyReal } from './kit.jsx'
import { useNearViewport } from './hooks.js'
import { Head, Section } from './parts.jsx'

const COPY = {
  label: { en: 'Exit 1', ko: '1번 출구' },
  title: { en: 'Follow Exit 1 to Poseok-ro 1079beon-gil.', ko: '1번 출구는 포석로1079번길이다' },
  desc: {
    en: 'UrbanEdge Station sits in the middle of Hwangridan-gil. Walk in from the street door and keep going: the platforms are further inside.',
    ko: '어반엣지역은 황리단길 한가운데에 있다. 길가 문으로 들어와 안쪽으로 계속 걸어가면 승강장이 나온다.',
  },
  map3d: { en: '3D map', ko: '3D 지도' },
  google: { en: 'Google Maps', ko: '구글 지도' },
  gmaps: { en: 'Directions in Google Maps', ko: '구글 지도 길 찾기' },
  naver: { en: 'Naver Map', ko: '네이버 지도' },
  kakao: { en: 'Kakao Map', ko: '카카오맵' },
  place: { en: 'Naver Place', ko: '네이버 플레이스' },
  loading: { en: 'Loading the map', ko: '지도를 불러오는 중' },
}
const MapLazy = lazyReal(() => import('@urbanedge/map'), 'HwangnidanMap', null)

const linkCls = 'inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow'

// 1번 출구 구간: 지도는 하나씩 보여 준다(3D는 준비된 경우에만 탭이 생긴다). 주 버튼은 하나, 나머지는 텍스트 링크다.
export default function Location() {
  const pick = usePick()
  const [ref, near] = useNearViewport('500px')
  const [shop, setShop] = useState({ lat: 35.8346, lng: 129.2108 })
  const [real3d, setReal3d] = useState(false)
  const [tab, setTab] = useState('google')

  useEffect(() => {
    if (!near) return
    import('@urbanedge/map')
      .then((m) => {
        if (m.SHOP?.lat) setShop({ lat: m.SHOP.lat, lng: m.SHOP.lng })
        const ok = !isStub(m.HwangnidanMap)
        setReal3d(ok)
        if (ok) setTab('3d')
      })
      .catch(() => {})
  }, [near])

  const { lat, lng } = shop
  const links = {
    google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
    kakao: `https://map.kakao.com/link/to/UrbanEdge,${lat},${lng}`,
    naver: SITE.maps.naver,
  }
  const ext = (href, label, icon) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>
      {icon}
      <B v={label} inline />
      <span className="sr-only">{pick({ en: '(opens in a new tab)', ko: '(새 탭에서 열림)' })}</span>
    </a>
  )

  return (
    <Section id="location" labelledBy="location-title">
      <Head label={COPY.label} title={COPY.title} titleId="location-title" desc={COPY.desc} lean />
      <address className="t-body mt-16 flex flex-wrap items-center gap-x-24 gap-y-8 not-italic text-text-pri">
        <span className="inline-flex items-center gap-8"><MapPin size={18} aria-hidden="true" className="text-yellow" /><B v={SITE.address} inline /></span>
        <span className="inline-flex items-center gap-8"><Clock size={18} aria-hidden="true" className="text-yellow" />{SITE.hours.open} ~ {SITE.hours.close}</span>
      </address>

      <div ref={ref} className="relative mt-16 overflow-hidden rounded-xl bg-bg-panel md:mt-32" style={{ height: 'clamp(200px, 28dvh, 560px)' }}>
        {real3d && (
          <div role="group" aria-label={pick({ en: 'Map type', ko: '지도 종류' })} className="absolute left-12 top-12 z-10 flex rounded-pill bg-black p-4">
            {[{ id: '3d', label: COPY.map3d }, { id: 'google', label: COPY.google }].map((t) => (
              <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)} className={cx('min-h-40 rounded-pill px-16 font-ui text-body-sm font-semibold transition-colors duration-fast ease-out', tab === t.id ? 'bg-yellow text-text-onYellow' : 'text-text-sec hover:text-text-pri')}>
                <B v={t.label} inline />
              </button>
            ))}
          </div>
        )}
        {near &&
          (tab === '3d' && real3d ? (
            <Suspense fallback={<p className="t-label grid size-full place-items-center text-text-meta"><B v={COPY.loading} /></p>}>
              <MapLazy className="size-full" mode="3d" theme="dark" showRoute />
            </Suspense>
          ) : (
            <GoogleEmbedFallback lat={lat} lng={lng} title={pick({ en: 'UrbanEdge on Google Maps', ko: '구글 지도의 어반엣지' })} />
          ))}
      </div>

      <div className="mt-16 flex flex-wrap items-center gap-x-24 gap-y-0 md:mt-24 md:gap-y-8">
        <Button as="a" href={links.google} target="_blank" rel="noopener noreferrer" size="lg" className="mb-8 w-full text-body md:mb-0 md:w-auto">
          <B v={COPY.gmaps} inline />
          <ArrowUpRight size={18} aria-hidden="true" />
        </Button>
        {ext(links.naver, COPY.naver, null)}
        {ext(links.kakao, COPY.kakao, null)}
        {ext(SITE.naverPlace, COPY.place, <NaverGlyph size={16} />)}
        {ext(SITE.instagram.url, { en: 'Instagram', ko: '인스타그램' }, <InstagramGlyph size={16} />)}
      </div>
    </Section>
  )
}
