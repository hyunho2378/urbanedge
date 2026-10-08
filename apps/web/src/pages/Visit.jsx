import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, Copy, ExternalLink, LocateFixed } from 'lucide-react'
import { Button, ExitSign, Container, TransitMap, cx, useLangValue } from '@urbanedge/ds'
import { GoogleMapEmbed, HwangnidanMap, directionsLinks } from '@urbanedge/map'
import { SITE } from '../data/site.js'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { FindUsPoster } from '../components/pages/FindUsPoster.jsx'
import { OpenNow } from '../components/pages/OpenNow.jsx'
import { PageTop } from '../components/pages/PageTop.jsx'
import { Tape } from '../components/pages/Tape.jsx'
import { useNearView } from '../components/pages/hooks.js'
import { INSTAGRAM, NAVER_PLACE, PLACE_STRIP, ROUTE_STOPS, STATION } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const T = {
  title: { en: 'Visit', ko: '오시는 길' },
  h1: { en: 'Find Exit 1.', ko: '1번 출구 찾기' },
  lead: {
    en: 'GY-01 UrbanEdge sits at 6, Poseok-ro 1079beon-gil, a lane in the Hwangridan-gil area of Gyeongju. Look for the black front with a checkerboard step. It is the only station of a metro that exists nowhere else, and it is open 10:00 to 24:00.',
    ko: 'GY-01 어반엣지역은 경주 황리단길 부근 포석로1079번길 6의 골목에 있으며, 검은 외관과 체커보드 문턱이 보이면 1번 출구에 도착한 것이다. 다른 곳에는 없는 지하철의 하나뿐인 역이고, 영업 시간은 10:00부터 24:00까지다.',
  },
  naverPlace: { en: 'Open Naver Place', ko: '네이버 플레이스 열기' },
  instagram: { en: 'Instagram @__urbanedge', ko: '인스타그램 @__urbanedge' },
  dirTitle: { en: 'Walk there', ko: '걸어서 가기' },
  mapTitle: { en: 'The last stretch, on a map.', ko: '골목 앞까지 지도로 보기' },
  mapSub: { en: 'Drag to look around, or switch to Google Maps for street names in your own app.', ko: '끌어서 주변을 둘러보거나, 구글 지도로 바꿔 익숙한 앱의 길 이름으로 확인할 수 있다.' },
  tab3d: { en: '3D map', ko: '3D 지도' },
  tab2d: { en: '2D map', ko: '2D 지도' },
  tabG: { en: 'Google Maps', ko: '구글 지도' },
  mapTabs: { en: 'Map type', ko: '지도 종류' },
  locate: { en: 'Draw my route here', ko: '내 위치에서 경로 그리기' },
  locateNote: { en: 'Your location stays in the browser. Nothing is sent or saved.', ko: '위치 정보는 브라우저 안에서만 쓰이며 전송하거나 저장하지 않는다.' },
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
  routeTitle: { en: 'From Exit 1 to your print.', ko: '1번 출구에서 인화물까지' },
  routeSub: { en: 'Tap a stop. This is the order you will walk it, drawn as a metro line.', ko: '정거장을 누르면 사진과 설명이 열린다. 걷게 될 순서를 노선도로 그렸다.' },
  routeAria: { en: 'Route from Exit 1 to the print slot', ko: '1번 출구에서 인화 출구까지의 노선' },
  stop: { en: 'Stop', ko: '정거장' },
  nextStop: { en: 'Next stop', ko: '다음 정거장' },
  accTitle: { en: 'Before you come', ko: '방문 전에 알아 둘 점' },
  accBody: {
    en: 'We have not confirmed the entrance step, the door width or wheelchair access yet, so please message @__urbanedge on Instagram before you come. The kiosk and this website work in English and Korean, and there is no staff on site.',
    ko: '입구 단차와 문 폭, 휠체어 이용 여부는 아직 확인하지 못했으므로 방문 전에 인스타그램 @__urbanedge로 메시지를 보내 주세요. 키오스크와 이 웹사이트는 영어와 한국어를 지원하고, 현장에 직원은 없다.',
  },
  posterTitle: { en: 'Take it with you.', ko: '출력해서 들고 가기' },
  posterSub: {
    en: 'A poster for the fridge, the hotel desk or a friend, with a QR code to this site.',
    ko: '냉장고나 숙소 데스크, 친구에게 건넬 수 있는 포스터이며 이 사이트로 연결되는 QR 코드가 들어 있다.',
  },
  stripTitle: { en: 'Photos from Naver Place', ko: '네이버 플레이스의 사진' },
  gallery: { en: 'See the full gallery', ko: '갤러리 전체 보기' },
  tape: [
    { en: 'Attention please: you have reached Exit 1', ko: '안내 말씀드립니다. 1번 출구에 도착했습니다' },
    { en: 'Doors open on the checkerboard side', ko: '내리실 문은 체커보드 쪽입니다' },
    { en: 'Please take all your belongings', ko: '두고 내리는 물건이 없도록 확인해 주세요' },
  ],
  pause: { en: 'Pause announcements', ko: '안내 문구 멈추기' },
  play: { en: 'Resume announcements', ko: '안내 문구 다시 흐르기' },
}

const STOP_COPY = {
  alley: {
    en: 'Turn into the lane off Poseok-ro. The shop is the black one with the checkerboard step, and passers-by tend to slow down here.',
    ko: '포석로에서 골목으로 접어들면 체커보드 문턱이 있는 검은 건물이 이 가게다.',
  },
  door: {
    en: 'Step up onto the black and white squares. This is the gate: the sign over your head says UrbanEdge.',
    ko: '흑백 체커보드 문턱에 올라서면 머리 위 간판에 UrbanEdge라고 쓰여 있고, 이곳이 개찰구 역할을 한다.',
  },
  mirrors: {
    en: 'Through the glass you can see a wall packed with round red mirrors. Keep walking in.',
    ko: '유리 너머로 둥근 빨간 거울이 벽을 가득 채운 모습이 보이며, 계속 안쪽으로 걸어 들어간다.',
  },
  hall: {
    en: 'Further in, yellow seats sit in front of blue and white tile. The platforms follow as you keep going.',
    ko: '더 들어가면 파란 타일과 하얀 타일 앞에 노란 의자가 놓여 있고, 계속 걸으면 승강장이 이어진다.',
  },
  room: {
    en: 'Pick a platform. Each room has its own kiosk, so walk up to the machine and tap the screen.',
    ko: '승강장을 고른 뒤 방마다 따로 있는 키오스크로 다가가 화면을 누르면 된다.',
  },
  slot: {
    en: 'After the last shot, your print slides onto the white tray near the bottom of the machine.',
    ko: '마지막 컷이 끝나면 인화물이 기기 하단의 흰색 트레이로 나온다.',
  },
}

const MapPane = ({ mode, lang, onReady }) =>
  mode === 'google' ? <GoogleMapEmbed className="size-full" lang={lang} zoom={17} /> : <HwangnidanMap mode={mode} showRoute lang={lang} className="size-full" onReady={onReady} />

export default function Visit() {
  const v = useV()
  const lang = useLangValue()
  usePageTitle(T.title)
  const [mode, setMode] = useState('3d')
  const [mapRef, mapSeen] = useNearView('240px 0px')
  const [stop, setStop] = useState('alley')
  const [copy, setCopy] = useState('idle')
  const ctrl = useRef(null)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const links = directionsLinks({ lang: 'en' }).items.filter((i) => i.kind === 'directions')
  const at = Math.max(0, ROUTE_STOPS.findIndex((s) => s.id === stop))
  const cur = ROUTE_STOPS[at]
  const nextStop = ROUTE_STOPS[(at + 1) % ROUTE_STOPS.length]
  const network = {
    id: 'exit1-route',
    title: v(T.routeAria),
    lines: [
      {
        id: 'route',
        color: 'yellow',
        code: 'GY',
        name: 'Exit 1 to print',
        stations: ROUTE_STOPS.map((s, i) => ({
          id: s.id,
          kind: 'station',
          label: s.label.en,
          labelKo: s.label.ko,
          x: i * 2,
          y: i < 3 ? 0 : 1.6,
          vx: i < 3 ? 0 : 1.6,
          vy: i * 2,
          labelDir: i % 2 ? 's' : 'n',
          vLabelDir: 'e',
        })),
      },
    ],
  }

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

  const tab = (id, label) => (
    <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)} className={cx('ue-press rounded-pill px-16 py-8 font-ui text-bodySm font-semibold transition-colors duration-fast ease-out', mode === id ? 'bg-yellow text-text-onYellow' : 'text-text-pri hover:text-yellow')}>
      <Tx inline {...label} />
    </button>
  )

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
            <Tx inline {...T.naverPlace} />
            <ExternalLink size={18} aria-hidden="true" />
          </Button>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
            <Tx inline {...T.instagram} />
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </PageTop>

      <Tape items={T.tape} pause={T.pause} play={T.play} />

      <section aria-labelledby="visit-map" className="section-y">
        <Container className="4xl:max-w-screen-4xl">
          <div className="flex flex-col justify-between gap-16 md:flex-row md:items-end">
            <div>
              <Tx {...T.mapTitle} as="h2" role="headline" className="text-text-pri" id="visit-map" />
              <Tx {...T.mapSub} as="p" role="body" className="mt-12 max-w-read text-text-sec" />
            </div>
            <div role="group" aria-label={v(T.mapTabs)} className="flex w-fit gap-4 rounded-pill bg-bg-panel p-4">
              {tab('3d', T.tab3d)}
              {tab('2d', T.tab2d)}
              {tab('google', T.tabG)}
            </div>
          </div>

          <div ref={mapRef} className="relative mt-24 w-full overflow-hidden rounded-lg bg-bg-panel" style={{ height: 'clamp(380px, 64dvh, 640px)' }}>
            {mapSeen && <MapPane key={mode === 'google' ? 'g' : 'm'} mode={mode} lang={lang} onReady={(c) => (ctrl.current = c)} />}
          </div>
          {mode !== 'google' && (
            <div className="mt-16">
              <button type="button" onClick={() => ctrl.current?.showRouteFromMe?.()} className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
                <LocateFixed size={18} aria-hidden="true" />
                <Tx inline {...T.locate} />
              </button>
              <Tx {...T.locateNote} as="p" role="caption" className="max-w-read text-text-meta" />
            </div>
          )}

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

      <section aria-labelledby="visit-route" className="overflow-hidden bg-bg-elev py-64 md:py-96">
        <Container className="4xl:max-w-screen-4xl">
          <Tx {...T.routeTitle} as="h2" role="headline" className="text-text-pri" id="visit-route" />
          <Tx {...T.routeSub} as="p" role="body" className="mt-12 max-w-read text-text-sec" />
          <div className="mx-auto mt-32 w-full max-w-wide md:mt-48">
            <TransitMap network={network} orientation="auto" activeId={stop} onSelect={(id) => setStop(id)} animateTrain aria-label={v(T.routeAria)} />
          </div>
          <div key={cur.id} className="mt-40 grid animate-fade-in items-center gap-x-48 gap-y-24 lg:grid-cols-12">
            <figure className="overflow-hidden rounded-lg bg-bg-panel lg:col-span-6">
              <img src={cur.photo.thumb} srcSet={`${cur.photo.thumb} ${cur.photo.w}w, ${cur.photo.full} 1350w`} sizes="(min-width: 1024px) 46vw, 92vw" alt={v(cur.photo.alt)} width={cur.photo.w} height={cur.photo.h} loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
            </figure>
            <div className="lg:col-span-6">
              <p className="text-text-meta">
                <Tx inline {...T.stop} role="label" /> <span className="t-label tabular-nums">{at + 1} / {ROUTE_STOPS.length}</span>
              </p>
              <Tx {...cur.label} as="h3" role="headline" className="mt-8 text-text-pri" />
              <Tx {...STOP_COPY[cur.id]} as="p" role="body" className="mt-16 max-w-read text-text-sec" />
              <button type="button" onClick={() => setStop(nextStop.id)} className="t-strong mt-24 inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
                <Tx inline {...T.nextStop} />
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="visit-poster" className="section-y">
        <Container className="grid items-center gap-x-64 gap-y-40 lg:grid-cols-12 4xl:max-w-screen-4xl">
          <div className="lg:col-span-5">
            <Tx {...T.posterTitle} as="h2" role="headline" className="text-text-pri" id="visit-poster" />
            <Tx {...T.posterSub} as="p" role="body" className="mt-12 max-w-read text-text-sec" />
            <Tx {...T.accTitle} as="h3" role="subhead" className="mt-40 text-text-pri" />
            <Tx {...T.accBody} as="p" role="body" className="mt-12 max-w-read text-text-sec" />
          </div>
          <div className="lg:col-span-7">
            <FindUsPoster />
          </div>
        </Container>
      </section>

      <section aria-labelledby="visit-strip" className="pb-64 md:pb-96">
        <Container className="4xl:max-w-screen-4xl">
          <div className="flex flex-wrap items-end justify-between gap-16">
            <Tx {...T.stripTitle} as="h2" role="subhead" className="text-text-pri" id="visit-strip" />
            <a href={NAVER_PLACE} target="_blank" rel="noopener noreferrer" className="t-strong inline-flex min-h-48 items-center gap-8 text-yellow hover:text-yellow-hover">
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
