import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Reveal, cx } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'
import { LINE_BG, LINE_BORDER } from './content.js'

// 입구에서 기기까지 세로 노선형 동선. 정거장 점과 선으로 순서를 잇고, 사진이 있으면 단계 아래에 놓는다.
const COLORS = ['yellow', 'red', 'blue', 'green', 'yellow']

export function RouteSteps({ steps, label }) {
  const pick = usePick()
  return (
    <ol aria-label={label}>
      {steps.map((s, i) => {
        const color = COLORS[i % COLORS.length]
        const last = i === steps.length - 1
        return (
          <Reveal as="li" key={i} className="relative pb-48 pl-64 last:pb-0 lg:pb-72 lg:pl-96">
            {!last && <span aria-hidden="true" className={cx('absolute -bottom-0 left-12 top-16 w-8 lg:left-20', LINE_BG[color])} />}
            <span
              aria-hidden="true"
              className={cx('absolute left-0 top-0 grid size-32 place-items-center rounded-pill border-4 bg-bg-base font-label text-caption 4xl:text-bodySm font-bold text-text-pri lg:left-8', LINE_BORDER[color])}
            />
            <div className="grid gap-x-64 gap-y-24 lg:grid-cols-2 lg:items-start">
              <div>
                <p className="ue-label text-label 4xl:text-bodySm text-yellow">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-8 text-h3 4xl:text-h2 font-black tracking-tightest text-text-pri">{pick(s.title)}</h3>
                <p className="mt-12 max-w-read text-body 4xl:text-lead text-text-sec text-pretty">{pick(s.body)}</p>
                {s.link && (
                  <Link to={s.link.to} className="mt-16 inline-flex min-h-48 items-center gap-8 rounded-sm text-bodySm 4xl:text-body font-semibold text-yellow hover:text-yellow-hover">
                    {pick(s.link.label)}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </div>
              {s.photo && (
                <figure className="overflow-hidden rounded-lg border border-hairline bg-bg-panel">
                  <img
                    src={s.photo.full}
                    alt={pick(s.photo.alt)}
                    width={s.photo.w}
                    height={s.photo.h}
                    loading="lazy"
                    decoding="async"
                    className="aspect-video w-full object-cover"
                  />
                  <figcaption className="border-t border-hairline px-16 py-12 text-caption 4xl:text-bodySm text-text-meta">{pick(s.photo.alt)}</figcaption>
                </figure>
              )}
            </div>
          </Reveal>
        )
      })}
    </ol>
  )
}
