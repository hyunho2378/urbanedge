import HowItWorks from '../components/home/HowItWorks.jsx'
import Hero from '../components/home/Hero.jsx'
import Location from '../components/home/Location.jsx'
import Platforms from '../components/home/Platforms.jsx'
import Prints from '../components/home/Prints.jsx'
import ScratchCoupon from '../components/home/ScratchCoupon.jsx'
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
      <Section id="coupon" labelledBy="coupon-title" className="!py-24 md:!py-48">
        <h2 id="coupon-title" className="t-headline text-text-pri">{pick({ en: 'Share, then scratch', ko: '공유하고 긁기' })}</h2>
        <div className="mt-16 max-w-3xl"><ScratchCoupon /></div>
      </Section>
      <Prints />
      <Location />
    </>
  )
}
