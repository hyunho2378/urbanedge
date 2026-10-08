import { CautionTape, cx } from '@urbanedge/ds'
import { StationBadge } from '../../components/StationBadge.jsx'
import { Camera, Footprints, Monitor } from 'lucide-react'
import { DeviceDiagram } from '../../components/DeviceDiagram.jsx'
import { ScreenLabel } from '../../components/ScreenHead.jsx'
import { useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'
import { LINE_BG } from '../rooms.js'

// 3. intro: 온보딩 3장 카드가 가로로 넘어간다(자동 진행 없음, 하단 다음 버튼으로 넘긴다).
//   A 이용 순서 4단계  B 카메라 위치(hintZone camera)  C 서는 곳과 인화물이 나오는 곳(hintZone slot)
const STATION_COLORS = ['yellow', 'red', 'blue', 'green']

function CardA() {
  const t = useT()
  const steps = t(COPY.intro.a.steps)
  return (
    <section className="flex h-full w-full shrink-0 flex-col gap-24 px-64 pb-16 pt-16" aria-label={t(COPY.intro.pageLabel)[0]}>
      <ScreenLabel n={1}>{t(COPY.intro.pageLabel)[0].slice(3)}</ScreenLabel>
      <h1 className="font-display text-k-title font-black leading-tight tracking-tightest">{t(COPY.intro.a.title)}</h1>
      <div className="flex flex-1 items-center">
        <div className="relative w-full">
          <div className="absolute flex" style={{ top: 42, left: '12.5%', right: '12.5%' }} aria-hidden="true">
            {STATION_COLORS.slice(0, 3).map((c) => (
              <span key={c} className={cx('h-12 flex-1', LINE_BG[c])} />
            ))}
          </div>
          <ol className="relative flex">
            {steps.map((s, i) => (
              <li key={s.t} className="flex w-1/4 flex-col items-center px-16 text-center">
                <span className="rounded-pill border-8 border-bg-base">
                  <StationBadge code={String(i + 1)} color={STATION_COLORS[i]} size="lg" />
                </span>
                <p className="mt-20 font-display text-k-h3 font-black leading-tight tracking-tightest">{s.t}</p>
                <p className="mt-12 text-k-body leading-snug text-text-sec">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-yellow">
        <div className="w-24 shrink-0">
          <CautionTape size={14} />
        </div>
        <p className="flex items-center px-32 py-20 font-ui text-k-body font-bold">{t(COPY.intro.a.note)}</p>
      </div>
    </section>
  )
}

function CardB() {
  const t = useT()
  const tiles = t(COPY.intro.b.tiles)
  const icons = [Monitor, Camera]
  return (
    <section className="flex h-full w-full shrink-0 gap-48 overflow-hidden px-64 pb-16 pt-16" aria-label={t(COPY.intro.pageLabel)[1]}>
      <div className="flex w-3/5 flex-col gap-24">
        <ScreenLabel n={2}>{t(COPY.intro.pageLabel)[1].slice(3)}</ScreenLabel>
        <h1 className="font-display text-k-title font-black leading-tight tracking-tightest">{t(COPY.intro.b.title)}</h1>
        <p className="text-k-lead font-semibold leading-snug">{t(COPY.intro.b.body)}</p>
        <ul className="mt-auto grid grid-cols-2 gap-16">
          {tiles.map((x, i) => {
            const Icon = icons[i]
            return (
              <li key={x.t} className={cx('flex items-start gap-16 rounded-xl border px-24 py-20', i === 1 ? 'border-yellow bg-tint' : 'border-hairlineStrong bg-bg-panel')}>
                <Icon size={48} className={cx('mt-4 shrink-0', i === 1 ? 'text-yellow' : 'text-text-sec')} aria-hidden="true" />
                <span>
                  <span className="block font-display text-k-h3 font-black leading-tight tracking-tightest">{x.t}</span>
                  <span className="mt-4 block text-k-body leading-snug text-text-sec">{x.d}</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="flex w-2/5 items-start pt-8">
        <DeviceDiagram
          highlight="camera"
          className="h-full"
          callouts={[
            { at: 'lens', text: t(COPY.intro.b.lensLabel) },
            { at: 'monitor', text: t(COPY.intro.b.screenLabel), tone: 'quiet' },
          ]}
        />
      </div>
    </section>
  )
}

// 위에서 내려다본 서는 위치 도식
function StandDiagram() {
  const t = useT()
  return (
    <div className="relative w-full">
      <svg viewBox="0 0 480 300" className="block w-full" role="img" aria-label={t(COPY.intro.c.stand)}>
        <rect x="40" y="8" width="400" height="36" rx="8" className="fill-text-pri" />
        <circle cx="240" cy="62" r="12" className="fill-bg-base stroke-yellow" strokeWidth="4" />
        <polygon points="240,66 60,290 420,290" className="fill-yellow stroke-yellow" fillOpacity="0.16" strokeWidth="3" strokeDasharray="10 8" />
        <circle cx="200" cy="214" r="26" className="fill-text-pri" />
        <circle cx="280" cy="214" r="26" className="fill-text-pri" />
        <text x="200" y="222" textAnchor="middle" className="fill-bg-base" fontSize="22" fontWeight="800">{t(COPY.intro.c.you)}</text>
        <text x="60" y="34" className="fill-bg-base" fontSize="22" fontWeight="800">{t(COPY.intro.c.wall)}</text>
      </svg>
    </div>
  )
}

function CardC() {
  const t = useT()
  return (
    <section className="flex h-full w-full shrink-0 gap-48 overflow-hidden px-64 pb-16 pt-16" aria-label={t(COPY.intro.pageLabel)[2]}>
      <div className="flex w-3/5 flex-col gap-20">
        <ScreenLabel n={3}>{t(COPY.intro.pageLabel)[2].slice(3)}</ScreenLabel>
        <h1 className="font-display text-k-title font-black leading-tight tracking-tightest">{t(COPY.intro.c.title)}</h1>
        <div className="flex items-center gap-32">
          <div className="w-2/5 shrink-0">
            <StandDiagram />
          </div>
          <div className="flex flex-col gap-8">
            <p className="flex items-center gap-12 font-ui text-k-label font-bold text-yellow">
              <Footprints size={32} aria-hidden="true" />
              {t(COPY.intro.c.stand)}
            </p>
            <p className="text-k-body font-semibold leading-snug">{t(COPY.intro.c.standBody)}</p>
            <p className="text-k-body leading-snug text-text-sec">{t(COPY.intro.c.move)}</p>
          </div>
        </div>
        <div className="flex flex-col gap-8 border-t border-hairlineStrong pt-20">
          <p className="font-ui text-k-label font-bold text-yellow">{t(COPY.intro.c.slot)}</p>
          <p className="text-k-body font-semibold leading-snug">{t(COPY.intro.c.slotBody)}</p>
        </div>
      </div>
      <div className="flex w-2/5 items-start pt-8">
        <DeviceDiagram highlight="slot" className="h-full" callouts={[{ at: 'slot', text: t(COPY.intro.c.slotLabel) }]} />
      </div>
    </section>
  )
}

export default function Intro({ ctrl }) {
  const t = useT()
  const page = ctrl.introPage
  return (
    <div className="relative h-full overflow-hidden">
      <div className="flex h-full pb-48 transition-transform duration-slow ease-out" style={{ transform: `translate3d(${-page * 100}%, 0, 0)` }}>
        <CardA />
        <CardB />
        <CardC />
      </div>
      <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-16" role="status" aria-label={t(COPY.intro.dots, { n: page + 1, total: 3 })}>
        {[0, 1, 2].map((i) => (
          <span key={i} aria-hidden="true" className={cx('block rounded-pill transition-transform duration-base ease-out', i === page ? 'size-20 bg-yellow' : 'size-12 bg-hairlineStrong')} />
        ))}
      </div>
    </div>
  )
}
