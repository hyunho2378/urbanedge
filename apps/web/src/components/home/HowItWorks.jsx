import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { JOURNEY } from '../../data/story.js'
import { usePick } from '../../i18n/index.jsx'
import { Section } from './parts.jsx'

// 방문 순서 다섯 단계. 기기 조작이 아니라 찾아오기부터 인화물 받기까지다. 자세한 안내는 이용 방법 페이지에 있다.
export default function HowItWorks() {
  const pick = usePick()
  return (
    <Section id="how" labelledBy="how-title" tone="light" className="!py-28 md:!py-56">
      <div className="flex flex-wrap items-end justify-between gap-x-24 gap-y-8">
        <h2 id="how-title" className="t-headline text-text-pri">{pick({ en: 'Your visit', ko: '방문 순서' })}</h2>
        <Link to="/guide" className="inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-text-meta">
          {pick({ en: 'Full guide', ko: '자세한 이용 방법' })}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ol className="mt-12 grid gap-8 md:mt-24 md:grid-cols-5 md:gap-16">
        {JOURNEY.map((s, i) => (
          <li key={s.id} className="flex items-center gap-12 rounded-lg bg-bg-panel p-12 md:flex-col md:items-start md:gap-16 md:p-20">
            <span aria-hidden="true" className="grid size-32 shrink-0 place-items-center rounded-pill bg-yellow font-label text-body-sm font-bold text-bg-base">{i + 1}</span>
            <span className="t-strong text-body-sm text-text-pri md:text-body">{pick(s.short)}</span>
          </li>
        ))}
      </ol>
    </Section>
  )
}
