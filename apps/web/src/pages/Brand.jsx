import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, cx } from '@urbanedge/ds'
import EraCard from '../components/brand/EraCard.jsx'
import TrainSvg from '../components/home/TrainSvg.jsx'
import { usePageTitle } from '../components/pages/usePageTitle.js'
import { ROOMS } from '../data/site.js'
import { BRAND_TITLE, IDENTITY, SLOGAN, TIME_PLATFORM } from '../data/story.js'
import { usePick } from '../i18n/index.jsx'
import { B } from '../layout/B.jsx'
import Wordmark from '../layout/Wordmark.jsx'
import { Wrap } from '../layout/Wrap.jsx'

const COPY = {
  assets: { en: 'Brand assets', ko: '브랜드 자산' },
  logo: { en: 'Wordmark', ko: '워드마크' },
  colors: { en: 'Colors', ko: '색' },
  pattern: { en: 'Crosswalk', ko: '횡단보도' },
  patternNote: { en: 'Black and white bars, like the main poster.', ko: '메인 포스터처럼 검정과 흰색 띠를 번갈아 쓴다.' },
  train: { en: 'Train', ko: '열차' },
  posters: { en: 'Posters', ko: '포스터' },
  rooms: { en: 'See the rooms', ko: '촬영 방 보기' },
  go: { en: 'Directions', ko: '오시는 길' },
}

const POSTERS = [
  '/img/place/poster-01.jpg', '/img/biz_02.jpg', '/img/place/poster-02.jpg', '/img/biz_04.jpg', '/img/place/poster-03.jpg', '/img/biz_07.jpg',
  '/img/place/poster-04.jpg', '/img/biz_08.jpg', '/img/biz_05.jpg', '/img/biz_09.jpg',
]

const COLORS = [
  { id: 'black', cls: 'bg-[#0A0A0A]', on: 'text-white', name: { en: 'Black', ko: '검정' }, hex: '#0A0A0A' },
  { id: 'white', cls: 'bg-white', on: 'text-text-onYellow', name: { en: 'White', ko: '흰색' }, hex: '#FFFFFF' },
  { id: 'yellow', cls: 'bg-yellow', on: 'text-text-onYellow', name: { en: 'Yellow', ko: '노랑' }, hex: '#F5C518' },
  { id: 'red', cls: 'bg-line-red', on: 'text-text-pri', name: { en: 'Red', ko: '빨강' }, hex: '#E74135' },
  { id: 'green', cls: 'bg-line-green', on: 'text-text-onYellow', name: { en: 'Green', ko: '초록' }, hex: '#3FA66B' },
]

const h2 = 't-headline text-text-pri'

// 어반엣지 브랜드 페이지: 슬로건, 정체성 두 가지, 시간의 승강장 타임라인, 브랜드 자산(워드마크, 색, 횡단보도, 열차, 포스터).
export default function Brand() {
  const pick = usePick()
  usePageTitle(BRAND_TITLE)
  const [broken, setBroken] = useState({})
  const posterList = POSTERS.filter((p) => !broken[p])

  return (
    <>
      <section aria-labelledby="brand-title" className="relative bg-bg-base">
        <Wrap className="pb-48 pt-40 md:pb-96 md:pt-64 lg:pt-96">
          <h1 id="brand-title" className="t-label text-yellow"><B v={BRAND_TITLE} inline /></h1>
          <p className="t-title mt-16 max-w-5xl text-text-pri md:text-display-m"><B v={SLOGAN} /></p>
        </Wrap>
      </section>

      <section aria-labelledby="brand-identity" className="ue-light py-40 md:py-80">
        <Wrap>
          <h2 id="brand-identity" className="sr-only">{pick({ en: 'Identity', ko: '정체성' })}</h2>
          <ul className="grid gap-16 md:grid-cols-2 md:gap-24">
            {IDENTITY.map((it) => (
              <li key={it.id} className="rounded-xl bg-bg-panel p-24 md:p-40">
                <h3 className="t-subhead text-text-pri"><B v={it.title} inline /></h3>
                <p className="t-body mt-12 text-text-sec"><B v={it.body} /></p>
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      <section aria-labelledby="brand-time" className="bg-bg-base py-40 md:py-80">
        <Wrap>
          <h2 id="brand-time" className={h2}><B v={TIME_PLATFORM.title} inline /></h2>
          <p className="t-lead mt-12 max-w-read text-text-sec"><B v={TIME_PLATFORM.lead} /></p>
          <ol className="mt-32 md:mt-48 md:grid md:grid-cols-3">
            {ROOMS.map((r) => (
              <EraCard key={r.id} room={r} />
            ))}
          </ol>
        </Wrap>
      </section>


      <section aria-labelledby="brand-assets" className="ue-light py-40 md:py-80">
        <Wrap>
          <h2 id="brand-assets" className={h2}><B v={COPY.assets} inline /></h2>

          <h3 className="t-subhead mt-32 text-text-pri"><B v={COPY.logo} inline /></h3>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <div className="grid place-items-center rounded-xl bg-[#0A0A0A] px-24 py-40 text-white"><Wordmark className="h-auto w-full max-w-xs" /></div>
            <div className="grid place-items-center rounded-xl bg-white px-24 py-40 text-[#0A0A0A] ring-1 ring-black/15"><Wordmark className="h-auto w-full max-w-xs" /></div>
            <div className="grid place-items-center rounded-xl bg-yellow px-24 py-40 text-[#0A0A0A]"><Wordmark className="h-auto w-full max-w-xs" /></div>
          </div>

          <h3 className="t-subhead mt-40 text-text-pri"><B v={COPY.colors} inline /></h3>
          <ul className="mt-16 grid grid-cols-2 gap-12 md:grid-cols-5">
            {COLORS.map((c) => (
              <li key={c.id} className={cx('flex min-h-112 flex-col justify-end rounded-lg p-16 md:min-h-160', c.cls, c.on, c.id === 'white' && 'ring-1 ring-black/15')}>
                <span className="text-body font-semibold"><B v={c.name} inline /></span>
                <span className="text-body-sm tabular-nums opacity-80">{c.hex}</span>
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      <section aria-labelledby="brand-train" className="bg-bg-base py-40 md:py-80">
        <Wrap>
          <h2 id="brand-train" className={h2}><B v={COPY.train} inline /></h2>
          <div className="mt-24 rounded-xl bg-bg-panel p-16 md:p-40">
            <TrainSvg className="mx-auto max-w-4xl" doors={0.6} title={pick({ en: 'UrbanEdge train', ko: '어반엣지 열차' })} />
          </div>
        </Wrap>
      </section>

      <section aria-labelledby="brand-posters" className="ue-light py-40 md:py-80">
        <Wrap>
          <h2 id="brand-posters" className={h2}><B v={COPY.posters} inline /></h2>
          <ul className="mt-24 columns-2 gap-12 md:columns-4 md:gap-16">
            {posterList.map((src) => (
              <li key={src} className="mb-12 break-inside-avoid md:mb-16">
                <a href={src} target="_blank" rel="noopener noreferrer" className="ue-press block overflow-hidden rounded-md bg-bg-panel">
                  <img src={src} alt={pick({ en: 'UrbanEdge poster', ko: '어반엣지 포스터' })} loading="lazy" decoding="async" draggable="false" onError={() => setBroken((b) => ({ ...b, [src]: true }))} className="block h-auto w-full" />
                </a>
              </li>
            ))}
          </ul>
        </Wrap>
      </section>


      <section aria-label={pick({ en: 'Next', ko: '다음' })} className="bg-bg-base py-40 md:py-64">
        <Wrap className="flex flex-wrap items-center gap-x-24 gap-y-12">
          <Button as={Link} to="/rooms" size="lg" className="w-full md:w-auto">{pick(COPY.rooms)}</Button>
          <Link to="/visit" className="inline-flex min-h-48 items-center font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow">{pick(COPY.go)}</Link>
        </Wrap>
      </section>
    </>
  )
}
