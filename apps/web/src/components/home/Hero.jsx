import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@urbanedge/ds'
import { ROOMS } from '../../data/site.js'
import { SLOGAN } from '../../data/story.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import { Wrap } from '../../layout/Wrap.jsx'

const COPY = {
  title: { en: 'UrbanEdge', ko: '어반엣지' },
  sub: { en: 'Self photo studio, Hwangridan-gil', ko: '황리단길 셀프 사진관' },
  hours: { en: 'Open 10:00 to 24:00', ko: '매일 10:00 ~ 24:00' },
  go: { en: 'Directions', ko: '오시는 길' },
  story: { en: 'The story', ko: '어반엣지 이야기' },
}

// 홈 히어로: 배경 사진 위에 이름, 슬로건, 한 줄 소개, 영업시간, 길 안내 버튼과 브랜드 이야기 링크.
export default function Hero() {
  const pick = usePick()
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden" style={{ minHeight: 'min(60dvh, 500px)' }}>
      <img src={ROOMS[0].photo.src} alt="" aria-hidden="true" loading="eager" decoding="async" draggable="false" className="absolute inset-0 -z-10 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/65" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-base via-transparent to-bg-base/60" />
      <Wrap className="relative flex flex-col items-center gap-24 pb-40 pt-96 text-center md:pt-128">
        <div className="max-w-3xl">
          <h1 id="hero-title" className="t-title text-text-pri">{pick(COPY.title)}</h1>
          <p className="t-lead mt-12 text-text-pri"><B v={SLOGAN} /></p>
          <p className="t-body mt-12 text-text-sec">{pick(COPY.sub)}</p>
          <p className="t-body text-text-sec">{pick(COPY.hours)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-24 gap-y-4">
          <Button as={Link} to="/visit" size="lg">{pick(COPY.go)}</Button>
          <Link to="/brand" className="inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow">
            {pick(COPY.story)}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Wrap>
    </section>
  )
}
