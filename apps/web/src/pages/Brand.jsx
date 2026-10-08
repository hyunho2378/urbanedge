import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Share2 } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { UEMark, UrbanEdgeWordmark } from '@urbanedge/brand'
import { LINE, LINE_BG, LINE_ON, ROOMS, SITE, STATION } from '../data/site.js'
import { useShare } from '../components/home/kit.jsx'
import { Head, Photo, Section } from '../components/home/parts.jsx'
import TrainSvg from '../components/home/TrainSvg.jsx'
import { usePick } from '../i18n/index.jsx'
import { SocialButton } from '../layout/SocialLinks.jsx'
import { Wrap } from '../layout/Wrap.jsx'
import { B } from '../layout/B.jsx'

const COPY = {
  heroTitle: { en: 'Explore Gyeongju, one station at a time.', ko: '한 정거장씩 경주를 탐험한다' },
  heroBody: {
    en: 'Gyeongju has no subway, so UrbanEdge drew one: Gyeongju Metro. UrbanEdge Station is stop GY-01.',
    ko: '경주에는 지하철이 없어서 어반엣지가 경주 메트로를 그렸다. 어반엣지역이 GY-01역이다.',
  },
  storyLabel: { en: 'The story', ko: '이야기' },
  storyTitle: { en: 'No subway in Gyeongju. So we built one.', ko: '경주에는 지하철이 없어서 직접 만들었다' },
  story1: {
    en: 'Gyeongju has tombs, temples and one very good walking street, and not a single subway line. UrbanEdge borrowed the idea anyway. The shop is a station, the street door is Exit 1, and the photo rooms are platforms. Where a booth stands, a stop can follow: that is Gyeongju Metro, code GY.',
    ko: '경주에는 고분과 절, 걷기 좋은 황리단길이 있지만 지하철 노선은 하나도 없다. 어반엣지는 그 빈자리를 콘셉트로 가져와 매장을 역으로, 길가 문을 1번 출구로, 포토 룸을 승강장으로 만들었다. 부스가 있는 곳마다 역이 생긴다는 설정이 경주 메트로(GY)다.',
  },
  story2: {
    en: 'UrbanEdge is a self-service photo studio, open 10:00 to 24:00. Press start and look at the lens below the screen.',
    ko: '어반엣지는 10:00부터 24:00까지 운영하는 무인 셀프 사진관이다. 시작을 누르고 화면 아래 렌즈를 보면 된다.',
  },
  conceptLabel: { en: 'Concept', ko: '콘셉트' },
  conceptTitle: { en: 'Metrography: metro plus photography.', ko: '메트로그래피, 지하철과 사진의 만남' },
  conceptBody: {
    en: 'Every part of the studio borrows from a metro system. Rooms are platforms, shots are stops, a visit is a journey, and the print is your ticket. The signs, boards and announcements follow the same grammar.',
    ko: '사진관의 모든 요소가 지하철 체계를 빌려 온다. 방은 승강장, 촬영 컷은 정거장, 한 번의 이용은 여정, 인화물은 승차권이다. 표지판과 안내판, 안내 방송도 같은 문법을 따른다.',
  },
  logoLabel: { en: 'Logo', ko: '로고' },
  logoTitle: { en: 'A block mark and a wordmark.', ko: '블록 심볼과 워드마크' },
  logoBody: {
    en: 'The UE mark is built from rectangles only, so it prints crisply at any size, down to a favicon. Use it black on yellow or white, and yellow on black. The wordmark carries the full name.',
    ko: 'UE 심볼은 직사각형만으로 만들어서 파비콘 크기까지 또렷하게 인쇄된다. 노랑이나 흰색 바탕에는 검정, 검정 바탕에는 노랑으로 쓴다. 전체 이름은 워드마크가 맡는다.',
  },
  colorLabel: { en: 'Colors', ko: '색' },
  colorTitle: { en: 'Black, yellow, and three platform colors.', ko: '검정과 노랑, 승강장 세 가지 색' },
  colorBody: {
    en: 'Black and signal yellow carry the brand. Each platform adds one accent on its badge: yellow, red and green.',
    ko: '검정과 신호 노랑이 브랜드 색이다. 승강장 배지에는 노랑, 빨강, 초록을 하나씩 쓴다.',
  },
  trainLabel: { en: 'The train', ko: '열차' },
  trainTitle: { en: 'White body, yellow stripe, GY on the side.', ko: '흰 차체와 노란 띠, 옆면의 GY' },
  trainBody: {
    en: 'The livery is borrowed from the little toy trains of Seoul: a white body, one colored stripe and a line badge. Ours carries the UE mark and the GY code.',
    ko: '서울 지하철 장난감 열차처럼 흰 차체에 색 띠 하나와 노선 배지를 얹었다. 우리 열차에는 UE 심볼과 GY 코드가 붙는다.',
  },
  postersLabel: { en: 'Posters', ko: '포스터' },
  postersTitle: { en: 'Store posters', ko: '매장 포스터' },
  linksLabel: { en: 'Find us online', ko: '온라인에서 만나기' },
  linksTitle: { en: 'Photos, reviews, hours.', ko: '사진, 후기, 영업 정보' },
  share: { en: 'Share the line', ko: '노선 공유하기' },
  visit: { en: 'Show me the way', ko: '길 찾기' },
  station: { en: 'Station sign', ko: '역명판' },
  platform: { en: 'Platform', ko: '승강장' },
}

const POSTERS = [
  '/img/place/poster-01.jpg', '/img/biz_02.jpg', '/img/place/poster-02.jpg', '/img/biz_04.jpg', '/img/place/poster-03.jpg', '/img/biz_07.jpg',
  '/img/place/poster-04.jpg', '/img/biz_08.jpg', '/img/biz_05.jpg', '/img/biz_09.jpg',
]

const COLORS = [
  { id: 'black', cls: 'bg-bg-base', on: 'text-text-pri', name: { en: 'Platform black', ko: '승강장 검정' }, rgb: '10 10 10' },
  { id: 'yellow', cls: 'bg-yellow', on: 'text-text-onYellow', name: { en: 'Signal yellow', ko: '신호 노랑' }, rgb: '245 197 24' },
  { id: 'white', cls: 'bg-white', on: 'text-text-onYellow', name: { en: 'Tile white', ko: '타일 흰색' }, rgb: '255 255 255' },
  { id: 'red', cls: 'bg-line-red', on: 'text-text-pri', name: { en: 'Platform 2 red', ko: '2번 승강장 빨강' }, rgb: '231 65 53' },
  { id: 'green', cls: 'bg-line-green', on: 'text-text-onYellow', name: { en: 'Platform 3 green', ko: '3번 승강장 초록' }, rgb: '63 166 107' },
]

export default function Brand() {
  const pick = usePick()
  const share = useShare({ title: `${SITE.name}`, text: pick(COPY.heroTitle) })
  const [broken, setBroken] = useState({})
  const posterList = POSTERS.filter((p) => !broken[p])

  // 이 페이지에 들어오면 맨 위에서 시작한다(ScrollToTop이 처리). 포스터가 없으면 건너뛴다.
  const sec = useRef(null)
  useEffect(() => {
    sec.current = null
  }, [])

  return (
    <>
      <section className="relative isolate overflow-hidden pb-48 pt-48 md:pb-80 md:pt-96">
        <img src="/img/place/naver-15.jpg" alt="" aria-hidden="true" decoding="async" draggable="false" className="absolute inset-0 -z-10 size-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/65" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-base via-transparent to-bg-base/60" />
        <Wrap>
          <p className="t-label text-yellow"><B v={LINE.name} inline /></p>
          <h1 className="t-display mt-12 max-w-4xl text-text-pri 3xl:text-display-xl"><B v={COPY.heroTitle} inline /></h1>
          <p className="t-lead mt-20 max-w-read text-text-sec"><B v={COPY.heroBody} inline /></p>
          <div className="mt-32 flex flex-col items-start gap-12 md:flex-row md:flex-wrap md:items-center md:gap-x-32">
            <SocialButton kind="naver" tone="solid" className="min-h-56 w-full md:w-auto" />
            <SocialButton kind="instagram" tone="link" />
            <button type="button" onClick={share.open} className="ue-press inline-flex min-h-48 items-center gap-8 font-ui text-body font-semibold text-yellow underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow-hover">
              <Share2 size={18} aria-hidden="true" />
              <B v={COPY.share} inline />
            </button>
          </div>
        </Wrap>
      </section>

      <Section id="story" labelledBy="story-title" tone="elev">
        <div className="grid gap-32 lg:grid-cols-12 lg:gap-x-64">
          <div className="lg:col-span-6">
            <Head label={COPY.storyLabel} title={COPY.storyTitle} titleId="story-title" />
            <p className="t-lead mt-24 max-w-read text-text-pri"><B v={COPY.story1} inline /></p>
            <p className="t-body mt-16 max-w-read text-text-sec"><B v={COPY.story2} inline /></p>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-xl bg-black p-24 md:p-32">
              <p className="t-label text-text-meta"><B v={COPY.station} inline /></p>
              <div className="mt-16 flex items-center gap-16">
                <span aria-hidden="true" className="grid size-56 shrink-0 place-items-center rounded-pill bg-yellow font-label text-h2 font-bold text-text-onYellow">{LINE.code}</span>
                <div>
                  <p className="font-label text-h2 font-bold uppercase tracking-wide text-text-pri">{STATION.code} <B v={STATION.name} inline /></p>
                  <p className="t-caption text-text-sec">{STATION.nameKo}</p>
                </div>
              </div>
              <ul className="mt-24 grid gap-x-16 gap-y-12 md:grid-cols-2">
                {ROOMS.map((r) => (
                  <li key={r.id} className="flex items-center gap-10">
                    <span aria-hidden="true" className={cx('grid size-32 shrink-0 place-items-center rounded-pill font-label text-body-sm font-bold', LINE_BG[r.color], LINE_ON[r.color])}>{r.platform}</span>
                    <span className="t-strong min-w-0"><B v={r.title} inline /></span>
                  </li>
                ))}
              </ul>
              <p className="t-caption mt-24 text-text-meta"><B v={{ en: 'Destination: UrbanEdge. Now boarding: any platform.', ko: '행선지: 어반엣지. 탑승 중: 모든 승강장.' }} inline /></p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="concept" labelledBy="concept-title">
        <Head label={COPY.conceptLabel} title={COPY.conceptTitle} titleId="concept-title" desc={COPY.conceptBody} />
        <div className="mt-32 grid gap-16 md:grid-cols-4">
          {[
            { a: { en: 'Room', ko: '방' }, b: { en: 'Platform', ko: '승강장' }, src: '/img/place/naver-21.jpg' },
            { a: { en: 'Shot', ko: '촬영 컷' }, b: { en: 'Stop', ko: '정거장' }, src: '/img/place/naver-06.jpg' },
            { a: { en: 'Visit', ko: '이용' }, b: { en: 'Journey', ko: '여정' }, src: '/img/place/naver-28.jpg' },
            { a: { en: 'Print', ko: '인화물' }, b: { en: 'Ticket', ko: '승차권' }, src: '/img/place/naver-20.jpg' },
          ].map((x, i) => (
            <figure key={i} className={cx('relative overflow-hidden rounded-lg', i % 2 ? 'md:translate-y-24' : '')}>
              <Photo src={x.src} alt="" ratio="4 / 5" className="rounded-lg" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-16 pt-48">
                <span className="t-caption text-text-sec"><B v={x.a} inline /></span>
                <span className="t-subhead block text-text-pri"><B v={x.b} inline /></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="logo" labelledBy="logo-title" tone="elev">
        <Head label={COPY.logoLabel} title={COPY.logoTitle} titleId="logo-title" desc={COPY.logoBody} />
        <div className="mt-32 grid gap-12 md:grid-cols-3">
          <div className="grid place-items-center rounded-xl bg-yellow py-56 text-text-onYellow">
            <UEMark className="w-2/5 max-w-40" title="UE mark" />
          </div>
          <div className="grid place-items-center rounded-xl bg-black py-56 text-yellow">
            <UEMark className="w-2/5 max-w-40" title="UE mark" />
          </div>
          <div className="grid place-items-center rounded-xl bg-white py-56 text-bg-base">
            <UEMark className="w-2/5 max-w-40" title="UE mark" />
          </div>
          <div className="grid place-items-center rounded-xl bg-bg-panel px-32 py-48 md:col-span-3">
            <UrbanEdgeWordmark className="w-full max-w-2xl text-text-pri" title="UrbanEdge Metrography" />
          </div>
        </div>
      </Section>

      <Section id="colors" labelledBy="colors-title">
        <Head label={COPY.colorLabel} title={COPY.colorTitle} titleId="colors-title" desc={COPY.colorBody} />
        <ul className="mt-32 grid grid-cols-2 gap-12 md:grid-cols-3">
          {COLORS.map((c, i) => (
            <li key={c.id} className={cx('flex flex-col justify-end rounded-lg p-16', c.cls, c.on, i === 0 ? 'ring-1 ring-hairlineStrong' : '', i < 2 ? 'min-h-160 md:min-h-192' : 'min-h-112 md:min-h-160')}>
              <span className="t-strong"><B v={c.name} inline /></span>
              <span className="t-caption opacity-80">RGB {c.rgb}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="train" labelledBy="train-title" tone="elev">
        <Head label={COPY.trainLabel} title={COPY.trainTitle} titleId="train-title" desc={COPY.trainBody} />
        <div className="mt-40 rounded-xl bg-bg-panel p-16 md:p-48">
          <TrainSvg className="mx-auto max-w-4xl" doors={0.6} title={pick({ en: 'The Gyeongju Metro train in white and yellow with the UE mark', ko: 'UE 심볼이 붙은 흰색과 노란색 황리단선 열차' })} />
        </div>
      </Section>

      <Section id="posters" labelledBy="posters-title">
        <Head label={COPY.postersLabel} title={COPY.postersTitle} titleId="posters-title" />
        <ul className="mt-32 columns-2 gap-12 md:columns-4 md:gap-16">
          {posterList.map((src) => (
            <li key={src} className="mb-12 break-inside-avoid md:mb-16">
              <a href={src} target="_blank" rel="noopener noreferrer" className="ue-press block overflow-hidden rounded-md bg-bg-panel">
                <img src={src} alt={pick({ en: 'An UrbanEdge Metrography poster', ko: '어반엣지 메트로그래피 포스터' })} loading="lazy" decoding="async" draggable="false" onError={() => setBroken((b) => ({ ...b, [src]: true }))} className="block h-auto w-full" />
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="links" labelledBy="links-title" tone="elev">
        <Head label={COPY.linksLabel} title={COPY.linksTitle} titleId="links-title" />
        <div className="mt-32 flex flex-col items-start gap-12 md:flex-row md:flex-wrap md:items-center md:gap-x-32">
          <SocialButton kind="naver" tone="solid" className="min-h-56 w-full md:w-auto" />
          <SocialButton kind="instagram" tone="link" />
          <Link to="/visit" className="inline-flex min-h-48 items-center gap-8 font-ui text-body font-semibold text-yellow underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow-hover">
            <B v={COPY.visit} inline />
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </Section>
      {share.sheet}
    </>
  )
}
