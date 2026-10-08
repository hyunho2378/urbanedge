import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, CautionTape, Reveal } from '@urbanedge/ds'
import { kioskHref } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { Wrap } from '../../layout/Wrap.jsx'
import { T } from '../../layout/type.js'

const COPY = {
  label: { ko: '키오스크 체험', en: 'Kiosk preview' },
  title: { ko: '기기를 먼저 눌러 본다', en: 'Try the kiosk before you go' },
  desc: {
    ko: '방문 전에 웹에서 키오스크 화면 흐름을 따라가 본다. 한국어와 영어를 지원한다.',
    en: 'Walk through the kiosk screens on the web before your visit. Korean and English are both supported.',
  },
  cta: { ko: '키오스크 체험하기', en: 'Open the kiosk preview' },
  guide: { ko: '이용 안내 보기', en: 'Read the guide' },
  newTab: { ko: '(새 탭에서 열림)', en: '(opens in a new tab)' },
  touch: { ko: '화면을 터치해 주세요', en: 'Touch the screen to begin' },
  mock: { ko: '키오스크 시작 화면 예시', en: 'Example of the kiosk start screen' },
}

// 마지막 호출 구간: 노란 면 위에 어두운 키오스크 화면과 경고 테이프.
export default function KioskCta() {
  const pick = usePick()
  return (
    <section
      id="kiosk"
      aria-labelledby="kiosk-title"
      style={{ scrollMarginTop: 'var(--ue-header-h)' }}
      className="relative overflow-hidden bg-yellow text-text-onYellow"
    >
      <div className="h-16 w-full lg:h-24">
        <CautionTape size={20} />
      </div>
      <Wrap className="section-y grid items-center gap-48 lg:grid-cols-12 lg:gap-x-64">
        <Reveal className="lg:col-span-6">
          <p className={`${T.label} flex items-baseline gap-16`}>
            <span>07</span>
            <span>{pick(COPY.label)}</span>
          </p>
          <div className="mt-16 h-px w-full bg-text-onYellow/40" />
          <h2 id="kiosk-title" className={`${T.h2} mt-40 text-balance lg:mt-56`}>
            {pick(COPY.title)}
          </h2>
          <p className={`${T.lead} mt-24 max-w-read`}>{pick(COPY.desc)}</p>
          <div className="mt-40 flex flex-col gap-12 md:flex-row md:flex-wrap md:items-center">
            <Button as="a" href={kioskHref()} target="_blank" rel="noopener noreferrer" variant="dark" size="lg" className="text-body">
              {pick(COPY.cta)}
              <ArrowRight size={18} aria-hidden="true" />
              <span className="sr-only">{pick(COPY.newTab)}</span>
            </Button>
            <Link
              to="/guide"
              className={`${T.body} inline-flex min-h-48 items-center px-8 font-ui font-semibold underline underline-offset-8`}
            >
              {pick(COPY.guide)}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-6">
          <div role="img" aria-label={pick(COPY.mock)} className="rounded-device border border-text-onYellow/20 bg-white p-16 lg:p-24">
            <div className="relative flex items-stretch gap-12 lg:gap-16">
              <span aria-hidden="true" className="w-8 shrink-0 rounded-pill bg-text-meta" />
              <div
                className="relative grid min-w-0 flex-1 place-items-center rounded-lg bg-bg-base px-24 py-32 text-center text-text-pri"
                style={{ aspectRatio: '16 / 9' }}
              >
                <div>
                  <p className="ue-label animate-pulse-soft text-h3 text-yellow lg:text-h2">TOUCH TO START</p>
                  <p className={`${T.h4} mt-12`}>{pick(COPY.touch)}</p>
                </div>
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-4 bg-yellow" />
              </div>
              <span aria-hidden="true" className="w-8 shrink-0 rounded-pill bg-text-meta" />
            </div>
            <div aria-hidden="true" className="mx-auto mt-16 size-20 rounded-pill bg-bg-base ring-4 ring-bg-raised" />
          </div>
        </Reveal>
      </Wrap>
    </section>
  )
}
