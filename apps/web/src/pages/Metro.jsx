import { MOTTO } from '../data/site.js'
import { B } from '../layout/B.jsx'
import MetroMap from '../components/metro-feature/MetroMap.jsx'
import { Head, Section } from '../components/home/parts.jsx'

const COPY = {
  label: { en: 'Metro map', ko: '노선도' },
  title: { en: 'Gyeongju Metro, line GY.', ko: '경주 메트로 GY선' },
  desc: {
    en: 'Gyeongju has no subway, so UrbanEdge drew one. The line starts at GY-01 UrbanEdge in Hwangridan-gil and runs on to the sights you will visit next.',
    ko: '경주에는 지하철이 없어서 어반엣지가 노선도를 그렸다. 노선은 황리단길의 GY-01 어반엣지에서 출발해 다음에 들를 관광지로 이어진다.',
  },
}

export default function Metro() {
  return (
    <Section id="map" labelledBy="metro-title">
      <Head label={COPY.label} title={COPY.title} titleId="metro-title" desc={COPY.desc} />
      <p className="t-label mt-16 text-text-sec"><B v={MOTTO} /></p>
      <MetroMap className="mt-32 md:mt-48" />
    </Section>
  )
}
