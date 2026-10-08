import { cx } from '@urbanedge/ds'
import { IG_PHOTOS } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import TiltStrip from './TiltStrip.jsx'
import { Section } from './parts.jsx'

// 인화물: 캐러셀 하나. 첫 칸이 노래방 틸트 스트립이고 뒤로 매장 인스타그램 사진이 이어진다.
export default function Prints() {
  const pick = usePick()
  return (
    <Section id="prints" labelledBy="prints-title" tone="elev" className="overflow-hidden !py-24 md:!py-48">
      <h2 id="prints-title" className="t-headline text-text-pri">{pick({ en: 'Prints', ko: '인화물' })}</h2>
      <div role="region" tabIndex={0} aria-label={pick({ en: 'Prints', ko: '인화물' })} className="-mr-24 mt-16 flex snap-x snap-mandatory items-center gap-16 overflow-x-auto pb-8 pr-24 md:-mr-40 md:pr-40" style={{ scrollbarWidth: 'none' }}>
        <div className="w-[104px] shrink-0 snap-start md:w-[150px]"><TiltStrip className="w-full" /></div>
        {IG_PHOTOS.map((g, i) => (
          <figure key={g.id} className={cx('w-[150px] shrink-0 snap-start md:w-[220px]')}>
            <div className="overflow-hidden rounded-md bg-bg-panel" style={{ aspectRatio: g.ratio }}>
              <img src={g.src} alt={pick(g.alt)} loading="lazy" decoding="async" draggable="false" className="size-full object-cover" />
            </div>
          </figure>
        ))}
      </div>
    </Section>
  )
}
