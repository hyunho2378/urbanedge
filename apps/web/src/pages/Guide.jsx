import { Link } from 'react-router-dom'
import { Bus, Clock, ExternalLink, MapPin } from 'lucide-react'
import { Container, cx } from '@urbanedge/ds'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { NaverMark } from '../components/pages/NaverMark.jsx'
import { PageTop } from '../components/pages/PageTop.jsx'
import { usePageTitle } from '../components/pages/usePageTitle.js'
import { SITE } from '../data/site.js'
import { JOURNEY } from '../data/story.js'

const T = {
  title: { en: 'How to', ko: '이용 방법' },
  lead: { en: 'From the street to your prints, in five steps.', ko: '골목에서 인화물까지, 다섯 단계로 정리했다.' },
  glance: { en: 'At a glance', ko: '한눈에 보기' },
  hours: { en: 'Hours', ko: '영업시간' },
  address: { en: 'Address', ko: '주소' },
  bus: { en: 'Bus stop', ko: '버스 정류장' },
  busBody: { en: 'Hwangridan-gil. The walking route on our map starts here.', ko: '황리단길. 지도의 도보 경로가 여기서 시작한다.' },
  route: { en: 'See the walking route', ko: '도보 경로 보기' },
  gmaps: { en: 'Google Maps', ko: '구글 지도' },
  place: { en: 'Naver Place', ko: '네이버 플레이스' },
  newTab: { en: '(opens in a new tab)', ko: '(새 탭에서 열림)' },
  rooms: { en: 'See the rooms', ko: '촬영 방 보기' },
}

const linkCls = 'inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-text-meta'

function Glance({ icon: Icon, label, children }) {
  return (
    <div className="rounded-lg bg-bg-panel p-16 md:p-24">
      <p className="t-label flex items-center gap-8 text-text-meta">
        <Icon size={16} aria-hidden="true" />
        <Tx {...label} inline />
      </p>
      <div className="t-body mt-8 text-text-pri">{children}</div>
    </div>
  )
}

// 이용 방법: 기기 조작이 아니라 찾아오는 길부터 인화물을 받는 순간까지의 방문 여정.
export default function Guide() {
  const v = useV()
  usePageTitle(T.title)
  return (
    <PageShell>
      <PageTop title={T.title} lead={T.lead} />

      <section aria-labelledby="guide-glance" className="ue-light py-32 md:py-64">
        <Container className="4xl:max-w-screen-4xl">
          <h2 id="guide-glance" className="sr-only">{v(T.glance)}</h2>
          <div className="grid gap-12 md:grid-cols-3 md:gap-16">
            <Glance icon={Clock} label={T.hours}>
              <span className="tabular-nums">{SITE.hours.open} ~ {SITE.hours.close}</span>
            </Glance>
            <Glance icon={MapPin} label={T.address}>
              <Tx {...SITE.address} as="span" inline />
            </Glance>
            <Glance icon={Bus} label={T.bus}>
              <Tx {...T.busBody} as="span" />
            </Glance>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-24 gap-y-4 md:mt-16">
            <a href={SITE.maps.google} target="_blank" rel="noopener noreferrer" className={linkCls}>
              <ExternalLink size={16} aria-hidden="true" />
              <Tx {...T.gmaps} inline />
              <span className="sr-only">{v(T.newTab)}</span>
            </a>
            <a href={SITE.naverPlace} target="_blank" rel="noopener noreferrer" className={linkCls}>
              <NaverMark size={18} />
              <Tx {...T.place} inline />
              <span className="sr-only">{v(T.newTab)}</span>
            </a>
            <Link to="/visit" className={linkCls}>
              <Tx {...T.route} inline />
            </Link>
          </div>
        </Container>
      </section>


      <section aria-labelledby="guide-steps" className="bg-bg-base py-40 md:py-80">
        <Container className="4xl:max-w-screen-4xl">
          <h2 id="guide-steps" className="sr-only">{v(T.title)}</h2>
          <ol className="grid gap-40 md:gap-64">
            {JOURNEY.map((s, i) => (
              <li key={s.id} className="grid items-center gap-16 md:grid-cols-12 md:gap-48">
                <div className={cx('overflow-hidden rounded-xl bg-bg-panel md:col-span-6', i % 2 === 1 && 'md:order-2')}>
                  <img
                    src={s.photo.src}
                    alt={v(s.photo.alt)}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable="false"
                    className="block w-full object-cover"
                    style={{ aspectRatio: '4 / 3' }}
                  />
                </div>
                <div className="md:col-span-6">
                  <span aria-hidden="true" className="grid size-40 place-items-center rounded-pill bg-yellow font-label text-body font-bold text-text-onYellow">{i + 1}</span>
                  <Tx {...s.title} as="h3" role="headline" className="mt-16 text-text-pri" />
                  <Tx {...s.body} as="p" role="lead" className="mt-8 max-w-read text-text-sec" />
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-48 md:mt-64">
            <Link to="/rooms" className="ue-press inline-flex min-h-56 items-center justify-center rounded-md bg-yellow px-32 font-ui text-body font-semibold text-text-onYellow hover:bg-yellow-hover">
              <Tx {...T.rooms} inline />
            </Link>
          </div>
        </Container>
      </section>
    </PageShell>
  )
}
