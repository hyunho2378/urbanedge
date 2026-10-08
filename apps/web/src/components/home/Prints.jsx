import { cx } from '@urbanedge/ds'
import { IG_PHOTOS, platformById } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import ScratchCoupon from './ScratchCoupon.jsx'
import TiltStrip from './TiltStrip.jsx'
import { Head, Section } from './parts.jsx'

const COPY = {
  label: { en: 'Prints', ko: '인화물' },
  title: { en: 'Real prints, straight from the tray.', ko: '출구 슬롯에서 갓 나온 인화물' },
  desc: {
    en: 'Tilt the strip and swipe the rail. Then share Gyeongju Metro and a scratch card opens.',
    ko: '스트립을 기울이고 레일을 밀어 본 뒤 경주 메트로를 공유하면 스크래치 카드가 열린다.',
  },
  strip: { en: 'Karaoke Shot, a team test run. Drag to tilt.', ko: '노래방 샷, 팀 시험 촬영. 끌면 기울어진다.' },
  source: { en: 'From the shop Instagram', ko: '매장 인스타그램 게시물' },
  couponTitle: { en: 'Share the line. Scratch the card.', ko: '노선을 공유하고 카드를 긁는다' },
  couponBody: {
    en: 'Send UrbanEdge to a friend, and a scratch card unlocks right here with a code for the kiosk.',
    ko: '친구에게 어반엣지를 보내면 이 자리에서 키오스크용 코드가 담긴 스크래치 카드가 열린다.',
  },
}

export default function Prints() {
  const pick = usePick()
  return (
    <Section id="prints" labelledBy="prints-title" tone="elev" className="overflow-hidden">
      <Head label={COPY.label} title={COPY.title} titleId="prints-title" desc={COPY.desc} lean />

      <div className="mt-16 grid items-end gap-12 md:mt-40 md:gap-24 lg:grid-cols-12 lg:gap-x-48">
        <div className="grid grid-cols-5 items-center gap-16 lg:col-span-4 lg:grid-cols-1">
          <div className="col-span-2 mx-auto w-2/3 lg:col-span-1 lg:w-full">
            <TiltStrip className="w-full" />
          </div>
          <p className="t-caption col-span-3 text-text-meta lg:col-span-1 lg:mt-16"><B v={COPY.strip} /></p>
        </div>

        <div className="min-w-0 lg:col-span-8">
          <div role="region" tabIndex={0} aria-label={pick({ en: 'Real prints from the booths. Scroll sideways.', ko: '실제 인화물. 옆으로 민다.' })} className="-mr-24 flex scroll-smooth snap-x snap-mandatory gap-16 overflow-x-auto pb-16 pr-24 pt-8 md:-mr-40 md:pr-40 lg:-mr-64 lg:gap-24 lg:pr-64" style={{ scrollbarWidth: 'none' }}>
            {IG_PHOTOS.map((g, i) => {
              const room = g.room ? platformById(g.room) : null
              return (
                <figure key={g.id} className={cx('w-1/3 shrink-0 snap-start md:w-2/5 xl:w-1/3', i % 2 ? 'translate-y-8 rotate-1' : '-rotate-1')}>
                  <div className="overflow-hidden rounded-md bg-bg-panel" style={{ aspectRatio: g.ratio }}>
                    <img src={g.src} alt={pick(g.alt)} loading="lazy" decoding="async" draggable="false" className="size-full object-cover" />
                  </div>
                  <figcaption className="t-caption mt-8 text-text-meta"><B v={room ? room.title : COPY.source} /></figcaption>
                </figure>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-16 grid items-center gap-16 rounded-xl bg-bg-panel p-12 md:mt-48 md:gap-24 md:p-40 lg:grid-cols-12 lg:gap-x-48">
        <div className="hidden md:block lg:col-span-5">
          <h3 className="t-subhead hidden text-text-pri md:block"><B v={COPY.couponTitle} /></h3>
          <p className="t-body mt-8 hidden text-text-sec md:block"><B v={COPY.couponBody} /></p>
        </div>
        <div className="lg:col-span-7">
          <ScratchCoupon />
        </div>
      </div>
    </Section>
  )
}
