import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, Copy, ExternalLink } from 'lucide-react'
import { Button, ExitSign, Container, cx, useLangValue } from '@urbanedge/ds'
import { HwangnidanMap, directionsLinks } from '@urbanedge/map'
import { SITE } from '../data/site.js'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { FindUsPoster } from '../components/pages/FindUsPoster.jsx'
import { OpenNow } from '../components/pages/OpenNow.jsx'
import { PageTop } from '../components/pages/PageTop.jsx'
import { NaverMark } from '../components/pages/NaverMark.jsx'
import { useNearView } from '../components/pages/hooks.js'
import { INSTAGRAM, NAVER_PLACE, PLACE_STRIP, STATION } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const T = {
  title: { en: 'Visit', ko: '오시는 길' },
  h1: { en: 'Find Exit 1.', ko: '1번 출구 찾기' },
  lead: {
    en: '6, Poseok-ro 1079beon-gil, Gyeongju, near Hwangridan-gil. A black front with a checkerboard step. Open daily 10:00 to 24:00.',
    ko: '경주 황리단길 근처 포석로1079번길 6. 검은 외관에 체커보드 문턱이 있는 건물이다. 매일 10:00부터 24:00까지 연다.',
  },
  naverPlace: { en: 'Naver Place', ko: '네이버 플레이스' },
  instagram: { en: 'Instagram @__urbanedge', ko: '인스타그램 @__urbanedge' },
  dirTitle: { en: 'Directions', ko: '길찾기' },
  mapTitle: { en: 'Map', ko: '지도' },
  mapSub: { en: 'Tap My location to draw the walking route from where you are.', ko: '내 위치를 누르면 지금 있는 곳에서 걸어오는 길이 그려진다.' },
  addr: { en: 'Address', ko: '주소' },
  copy: { en: 'Copy address', ko: '주소 복사' },
  copied: { en: 'Address copied', ko: '주소를 복사했다' },
  copyFail: { en: 'Could not copy. Select the address by hand.', ko: '복사하지 못했다. 주소를 직접 선택해 주세요.' },
  hours: {
    openNow: { en: 'Open now', ko: '지금 영업 중' },
    closedNow: { en: 'Closed now', ko: '지금은 영업 종료' },
    until: { en: 'until', ko: '마감' },
    opensAt: { en: 'opens at', ko: '오픈' },
    localTime: { en: 'Time in Gyeongju', ko: '경주 현재 시각' },
  },
  posterTitle: { en: 'Save to your phone', ko: '휴대폰에 저장' },
  stripTitle: { en: 'Inside the shop', ko: '매장 사진' },
  gallery: { en: 'See the full gallery', ko: '갤러리 전체 보기' },
}

export default function Visit() {
  const v = useV()
  const lang = useLangValue()
  usePageTitle(T.title)
  const [mapRef, mapSeen] = useNearView('240px 0px')
  const [copy, setCopy] = useState('idle')
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const links = directionsLinks({ lang: 'en' }).items.filter((i) => i.kind === 'directions')
  const onCopy = async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(SITE.address[lang] ?? SITE.address.ko)
      setCopy('done')
    } catch {
      setCopy('fail')
    }
    timer.current = setTimeout(() => setCopy('idle'), 2400)
  }

  return (
    <PageShell>
      <PageTop
        title={T.h1}
        lead={T.lead}
        aside={
          <div className="hidden lg:block">
            <ExitSign number={1} label={STATION.name} labelKo={STATION.nameKo} size="lg" />
          </div>
        }
      >
        <div className="mt-32 flex flex-wrap items-center gap-x-24 gap-y-12">
          <Button as="a" href={NAVER_PLACE} target="_blank" rel="noopener noreferrer" size="lg">
            <NaverMark size={20} />
            <Tx inline {...T.naverPlace} />
            <ExternalLink size={18} aria-hidden="true" />
          </Button>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
            <Tx inline {...T.instagram} />
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </PageTop>

      <section aria-labelledby="visit-map" className="section-y">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.mapTitle} as="h2" role="headline" className="text-text-pri" id="visit-map" />
          <Tx {...T.mapSub} as="p" role="body" className="mt-12 max-w-read text-text-sec" />
          <div ref={mapRef} className="relative mt-24 w-full overflow-hidden rounded-lg bg-bg-panel" style={{ height: 'clamp(380px, 64dvh, 640px)' }}>
            {mapSeen && <HwangnidanMap mode="3d" showRoute lang={lang} className="size-full" />}
          </div>

          <div className="mt-32 grid gap-x-64 gap-y-32 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Tx {...T.dirTitle} as="p" role="label" className="text-text-meta" />
              <ul className="mt-12 flex flex-wrap gap-x-24 gap-y-4">
                {links.map((k) => (
                  <li key={k.id}>
                    <a href={k.href} target="_blank" rel="noopener noreferrer" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
                      <Tx inline en={k.label} ko={k.labelKo} />
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
              <Tx {...T.addr} as="p" role="label" className="mt-32 text-text-meta" />
              <Tx {...SITE.address} as="p" role="subhead" className="mt-8 text-text-pri" />
              <div className="mt-8 flex flex-wrap items-center gap-12">
                <button type="button" onClick={onCopy} className="t-strong inline-flex min-h-48 items-center gap-8 text-text-sec hover:text-yellow">
                  {copy === 'done' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                  <Tx inline {...T.copy} />
                </button>
                <span role="status" aria-live="polite">
                  {copy === 'done' && <Tx inline {...T.copied} role="caption" className="text-text-sec" />}
                  {copy === 'fail' && <Tx inline {...T.copyFail} role="caption" className="text-text-sec" />}
                </span>
              </div>
            </div>
            <div className="lg:col-span-6">
              <OpenNow copy={T.hours} />
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="visit-poster" className="pb-64 md:pb-96">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.posterTitle} as="h2" role="headline" className="text-text-pri" id="visit-poster" />
          <FindUsPoster className="mt-24" />
        </Container>
      </section>

      <section aria-labelledby="visit-strip" className="pb-64 md:pb-96">
        <Container className="4xl:max-w-screen-4xl">
          <div className="flex flex-wrap items-end justify-between gap-16">
            <Tx {...T.stripTitle} as="h2" role="subhead" className="text-text-pri" id="visit-strip" />
            <a href={NAVER_PLACE} target="_blank" rel="noopener noreferrer" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
              <NaverMark size={18} />
              <Tx inline {...T.naverPlace} />
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <ul className="mt-24 grid grid-cols-12 gap-8 md:gap-24">
            {PLACE_STRIP.map((ph, i) => (
              <li key={ph.id} className={cx(['col-span-7', 'col-span-5', 'col-span-12 md:col-span-5'][i], i === 1 && 'mt-24 md:mt-48')}>
                <img src={ph.thumb} alt={v(ph.alt)} width={ph.w} height={ph.h} loading="lazy" decoding="async" className="w-full rounded-lg object-cover" style={{ aspectRatio: i === 1 ? '3 / 4' : i === 0 ? '4 / 3' : '16 / 9' }} />
              </li>
            ))}
          </ul>
          <Link to="/gallery" className="t-strong mt-32 inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
            <Tx inline {...T.gallery} />
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </Container>
      </section>
    </PageShell>
  )
}
