import HowItWorks from '../components/home/HowItWorks.jsx'
import Hero from '../components/home/Hero.jsx'
import Location from '../components/home/Location.jsx'
import Platforms from '../components/home/Platforms.jsx'
import Prints from '../components/home/Prints.jsx'
import { Section } from '../components/home/parts.jsx'
import { usePick } from '../i18n/index.jsx'

// 홈: 히어로, 방 세 곳, 이용 방법, 쿠폰, 인화물, 오시는 길.
export default function Home() {
  const pick = usePick()
  return (
    <>
      <Hero />
      <Platforms />
      <HowItWorks />
      <Prints />
      <Location />
    </>
  )
}
