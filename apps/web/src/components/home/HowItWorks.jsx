import { usePick } from '../../i18n/index.jsx'
import { Section } from './parts.jsx'

const STEPS = [
  { en: 'Pay', ko: '결제' },
  { en: 'Pick cuts and frame', ko: '컷과 프레임 선택' },
  { en: 'Shoot', ko: '촬영' },
  { en: 'Take your prints', ko: '인화물 받기' },
]

// 이용 순서 네 단계. 한 줄 목록이다.
export default function HowItWorks() {
  const pick = usePick()
  return (
    <Section id="how" labelledBy="how-title" tone="light" className="!py-24 md:!py-48">
      <h2 id="how-title" className="t-headline text-text-pri">{pick({ en: 'How it works', ko: '이용 방법' })}</h2>
      <ol className="mt-16 grid grid-cols-2 gap-12 md:grid-cols-4 md:gap-24">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-center gap-12 rounded-lg bg-bg-panel p-16">
            <span aria-hidden="true" className="grid size-32 shrink-0 place-items-center rounded-pill bg-yellow font-label text-body-sm font-bold text-bg-base">{i + 1}</span>
            <span className="t-strong text-body-sm text-text-pri md:text-body">{pick(s)}</span>
          </li>
        ))}
      </ol>
    </Section>
  )
}
