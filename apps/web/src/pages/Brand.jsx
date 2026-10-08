import { useState } from 'react'
import { cx } from '@urbanedge/ds'
import { UEMark, UrbanEdgeWordmark } from '@urbanedge/brand'
import TrainSvg from '../components/home/TrainSvg.jsx'
import { usePick } from '../i18n/index.jsx'
import { Wrap } from '../layout/Wrap.jsx'
import { B } from '../layout/B.jsx'

const COPY = {
  title: { en: 'Brand', ko: '브랜드' },
  logo: { en: 'Logo', ko: '로고' },
  colors: { en: 'Colors', ko: '색' },
  train: { en: 'Train', ko: '열차' },
  posters: { en: 'Posters', ko: '포스터' },
}

const POSTERS = [
  '/img/place/poster-01.jpg', '/img/biz_02.jpg', '/img/place/poster-02.jpg', '/img/biz_04.jpg', '/img/place/poster-03.jpg', '/img/biz_07.jpg',
  '/img/place/poster-04.jpg', '/img/biz_08.jpg', '/img/biz_05.jpg', '/img/biz_09.jpg',
]

const COLORS = [
  { id: 'black', cls: 'bg-bg-base', on: 'text-text-pri', name: { en: 'Black', ko: '검정' }, hex: '#0A0A0A' },
  { id: 'yellow', cls: 'bg-yellow', on: 'text-text-onYellow', name: { en: 'Yellow', ko: '노랑' }, hex: '#F5C518' },
  { id: 'white', cls: 'bg-white', on: 'text-text-onYellow', name: { en: 'White', ko: '흰색' }, hex: '#FFFFFF' },
  { id: 'red', cls: 'bg-line-red', on: 'text-text-pri', name: { en: 'Red', ko: '빨강' }, hex: '#E74135' },
  { id: 'green', cls: 'bg-line-green', on: 'text-text-onYellow', name: { en: 'Green', ko: '초록' }, hex: '#3FA66B' },
]

const h2 = 'text-h2 font-bold leading-tight text-text-pri'

export default function Brand() {
  const pick = usePick()
  const [broken, setBroken] = useState({})
  const posterList = POSTERS.filter((p) => !broken[p])

  return (
    <Wrap className="pb-64 pt-40 md:pb-96 md:pt-64 lg:pt-96">
      <h1 className="text-display-m font-bold leading-tight text-text-pri"><B v={COPY.title} inline /></h1>

      <section aria-labelledby="b-logo" className="mt-48 md:mt-64">
        <h2 id="b-logo" className={h2}><B v={COPY.logo} inline /></h2>
        <div className="mt-24 grid gap-12 md:grid-cols-3">
          <div className="grid place-items-center rounded-xl bg-yellow py-48 text-text-onYellow"><UEMark className="w-2/5 max-w-40" title="UE" /></div>
          <div className="grid place-items-center rounded-xl bg-black py-48 text-yellow"><UEMark className="w-2/5 max-w-40" title="UE" /></div>
          <div className="grid place-items-center rounded-xl bg-white py-48 text-bg-base"><UEMark className="w-2/5 max-w-40" title="UE" /></div>
          <div className="grid place-items-center rounded-xl bg-bg-panel px-32 py-40 md:col-span-3">
            <UrbanEdgeWordmark className="w-full max-w-xl text-text-pri" title="UrbanEdge Metrography" />
          </div>
        </div>
      </section>

      <section aria-labelledby="b-colors" className="mt-48 md:mt-64">
        <h2 id="b-colors" className={h2}><B v={COPY.colors} inline /></h2>
        <ul className="mt-24 grid grid-cols-2 gap-12 md:grid-cols-5">
          {COLORS.map((c) => (
            <li key={c.id} className={cx('flex min-h-112 flex-col justify-end rounded-lg p-16 md:min-h-160', c.cls, c.on, c.id === 'black' && 'ring-1 ring-hairlineStrong')}>
              <span className="text-body font-semibold"><B v={c.name} inline /></span>
              <span className="text-body-sm tabular-nums opacity-80">{c.hex}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="b-train" className="mt-48 md:mt-64">
        <h2 id="b-train" className={h2}><B v={COPY.train} inline /></h2>
        <div className="mt-24 rounded-xl bg-bg-panel p-16 md:p-40">
          <TrainSvg className="mx-auto max-w-4xl" doors={0.6} title={pick({ en: 'UrbanEdge train', ko: '어반엣지 열차' })} />
        </div>
      </section>

      <section aria-labelledby="b-posters" className="mt-48 md:mt-64">
        <h2 id="b-posters" className={h2}><B v={COPY.posters} inline /></h2>
        <ul className="mt-24 columns-2 gap-12 md:columns-4 md:gap-16">
          {posterList.map((src) => (
            <li key={src} className="mb-12 break-inside-avoid md:mb-16">
              <a href={src} target="_blank" rel="noopener noreferrer" className="ue-press block overflow-hidden rounded-md bg-bg-panel">
                <img src={src} alt={pick({ en: 'UrbanEdge poster', ko: '어반엣지 포스터' })} loading="lazy" decoding="async" draggable="false" onError={() => setBroken((b) => ({ ...b, [src]: true }))} className="block h-auto w-full" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Wrap>
  )
}
