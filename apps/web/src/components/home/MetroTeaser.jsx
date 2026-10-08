import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { MOTTO } from '../../data/site.js'
import { B } from '../../layout/B.jsx'
import MetroMap from '../metro-feature/MetroMap.jsx'
import { Head, Section } from './parts.jsx'

const COPY = {
  label: { en: 'Gyeongju Metro', ko: '경주 메트로' },
  title: { en: 'Line GY starts at UrbanEdge.', ko: 'GY선은 어반엣지에서 출발한다' },
  desc: {
    en: 'UrbanEdge is stop GY-01. Next on the map: Daereungwon, Cheomseongdae, and Donggung and Wolji.',
    ko: '어반엣지가 GY-01역이다. 다음 역은 대릉원, 첨성대, 동궁과 월지다.',
  },
  map: { en: 'Open the Metro map', ko: '메트로 노선도 열기' },
}
const link = 'inline-flex min-h-48 items-center gap-8 font-ui text-body font-semibold text-yellow underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow-hover'

// 홈의 메트로 소개: 노선도 위에서 역 이름을 읽고, 텍스트 링크 하나로 노선도 페이지로 보낸다.
export default function MetroTeaser() {
  return (
    <Section id="metro" labelledBy="metro-title">
      <Head label={COPY.label} title={COPY.title} titleId="metro-title" desc={COPY.desc} lean />
      <p className="t-label mt-12 hidden text-text-sec md:block"><B v={MOTTO} /></p>
      <MetroMap compact className="mt-24 md:mt-40" />
      <div className="mt-8 md:mt-24">
        <Link to="/metro" className={link}><B v={COPY.map} inline /><ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </Section>
  )
}
