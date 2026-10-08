import { Link } from 'react-router-dom'
import { Button } from '@urbanedge/ds'
import { ROOMS } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { Wrap } from '../../layout/Wrap.jsx'

const COPY = {
  title: { en: 'UrbanEdge', ko: '어반엣지' },
  sub: { en: 'Self photo studio, Hwangridan-gil', ko: '황리단길 셀프 사진관' },
  hours: { en: 'Open 10:00 to 24:00', ko: '매일 10:00 ~ 24:00' },
  go: { en: 'Directions', ko: '오시는 길' },
}

// 홈 히어로: 배경 사진 위에 이름, 한 줄 소개, 방 세 곳 전환 카드 하나.
export default function Hero() {
  const pick = usePick()
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden" style={{ minHeight: 'min(64dvh, 520px)' }}>
      <img src={ROOMS[0].photo.src} alt="" aria-hidden="true" loading="eager" decoding="async" draggable="false" className="absolute inset-0 -z-10 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-base via-transparent to-bg-base/60" />
      <Wrap className="relative flex flex-col items-center gap-24 pb-48 pt-96 text-center md:pt-128">
        <div>
          <h1 id="hero-title" className="t-title text-text-pri">{pick(COPY.title)}</h1>
          <p className="t-lead mt-8 text-yellow">{pick(COPY.sub)}</p>
          <p className="t-body mt-4 text-text-sec">{pick(COPY.hours)}</p>
        </div>
        <Button as={Link} to="/visit" size="lg">{pick(COPY.go)}</Button>
      </Wrap>
    </section>
  )
}
