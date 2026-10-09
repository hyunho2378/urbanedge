import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { LINE_BG, LINE_TEXT, ROOMS } from '../../data/site.js'
import { ERA, TIME_PLATFORM } from '../../data/story.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import { Section } from './parts.jsx'

// 시간의 승강장 띠: 1968, 2008, 2000년대 세 칸. 칸마다 방으로 가고, 아래 링크는 브랜드 이야기로 간다.
export default function TimeStrip() {
  const pick = usePick()
  return (
    <Section id="time" labelledBy="time-title" tone="light" className="!py-28 md:!py-56">
      <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-8">
        <div className="max-w-read">
          <h2 id="time-title" className="t-headline text-text-pri">{pick(TIME_PLATFORM.title)}</h2>
          <p className="t-body mt-8 text-text-sec"><B v={TIME_PLATFORM.short} /></p>
        </div>
        <Link to="/brand" className="inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-text-meta">
          {pick({ en: 'The story', ko: '어반엣지 이야기' })}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ol className="mt-16 grid gap-8 md:mt-24 md:grid-cols-3 md:gap-16">
        {ROOMS.map((r) => {
          const e = ERA[r.id]
          return (
            <li key={r.id}>
              <Link to={`/rooms/${r.id}`} className="group flex items-center gap-16 rounded-lg bg-bg-panel p-16 transition-colors duration-fast ease-out hover:bg-bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-bg-base md:flex-col md:items-start md:gap-8 md:p-24">
                <span aria-hidden="true" className={cx('size-16 shrink-0 rounded-pill', LINE_BG[r.color])} />
                <span className="min-w-0 flex-1">
                  <span className={cx('t-title block', r.color === 'yellow' ? 'text-text-pri' : LINE_TEXT[r.color])}>{pick(e.year)}</span>
                  <span className="t-strong mt-4 block text-text-pri">{pick(r.title)}</span>
                  <span className="t-caption mt-4 block text-text-meta">{pick(e.concept)}</span>
                </span>
                <ArrowRight size={18} aria-hidden="true" className="shrink-0 text-text-meta transition-transform duration-fast ease-out group-hover:translate-x-4 md:hidden" />
              </Link>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
