import { useState } from 'react'
import { Container, cx } from '@urbanedge/ds'
import { PageShell, Tx, useV } from '../components/pages/Bilingual.jsx'
import { CameraDiagram, CAMERA_PARTS } from '../components/pages/CameraDiagram.jsx'
import { PageTop } from '../components/pages/PageTop.jsx'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const T = {
  title: { en: 'How to', ko: '이용 방법' },
  camAria: {
    en: 'Front of the machine: lens below the screen, card reader to its lower right, print slot at the bottom.',
    ko: '기기 정면: 화면 아래 렌즈, 오른쪽 아래 카드 단말기, 하단 인화 출구.',
  },
  camList: { en: 'Machine parts', ko: '기기 부품' },
}

const STEPS = [
  { t: { en: 'Pay', ko: '결제' }, d: { en: 'Pay by card at the terminal.', ko: '카드 단말기에서 결제한다.' } },
  { t: { en: 'Choose cuts', ko: '컷 선택' }, d: { en: '4 or 8 shots.', ko: '4컷 또는 8컷.' } },
  { t: { en: 'Choose a frame', ko: '프레임 선택' }, d: { en: 'The date is printed on every frame.', ko: '모든 프레임에 날짜가 인쇄된다.' } },
  { t: { en: 'Shoot', ko: '촬영' }, d: { en: 'Look at the lens below the screen.', ko: '화면 아래 렌즈를 본다.' } },
  { t: { en: 'Take your print', ko: '인화물 받기' }, d: { en: 'It comes out of the slot at the bottom.', ko: '하단 슬롯으로 나온다.' } },
]

const PARTS = {
  screen: { title: { en: 'Screen', ko: '화면' }, body: { en: 'Touch to choose.', ko: '터치로 선택한다.' } },
  lens: { title: { en: 'Lens', ko: '렌즈' }, body: { en: 'Look here while shooting.', ko: '촬영할 때 여기를 본다.' } },
  card: { title: { en: 'Card terminal', ko: '카드 단말기' }, body: { en: 'Pay here.', ko: '여기서 결제한다.' } },
  slot: { title: { en: 'Print slot', ko: '인화 출구' }, body: { en: 'Prints come out here.', ko: '인화물이 나온다.' } },
}

export default function Guide() {
  const v = useV()
  usePageTitle(T.title)
  const [part, setPart] = useState('lens')
  return (
    <PageShell>
      <PageTop title={T.title} />
      <section className="ue-light py-40 md:py-64">
        <Container className="grid gap-x-64 gap-y-40 lg:grid-cols-2 4xl:max-w-screen-4xl">
          <ol className="divide-y divide-hairline border-y border-hairline">
            {STEPS.map((s, i) => (
              <li key={i} className="flex items-baseline gap-16 py-16">
                <span className="w-24 shrink-0 font-label tabular-nums text-yellow">{i + 1}</span>
                <div>
                  <Tx {...s.t} as="p" role="subhead" className="text-text-pri" />
                  <Tx {...s.d} as="p" role="body" className="mt-4 text-text-sec" />
                </div>
              </li>
            ))}
          </ol>
          <div>
            <div className="mx-auto max-w-xs rounded-lg bg-bg-panel p-16">
              <CameraDiagram active={part} onSelect={setPart} ariaLabel={v(T.camAria)} />
            </div>
            <ul aria-label={v(T.camList)} className="mt-16 grid grid-cols-2 gap-8">
              {CAMERA_PARTS.map((k) => (
                <li key={k}>
                  <button type="button" aria-pressed={part === k} onClick={() => setPart(k)} className={cx('w-full rounded-md px-16 py-12 text-left transition-colors duration-base ease-out', part === k ? 'bg-yellow text-text-onYellow' : 'bg-bg-panel text-text-pri hover:text-yellow')}>
                    <Tx {...PARTS[k].title} as="span" role="subhead" className="block" />
                    <Tx {...PARTS[k].body} as="span" role="caption" className="block opacity-80" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </PageShell>
  )
}
