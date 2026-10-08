import Hero from '../components/home/Hero.jsx'
import Location from '../components/home/Location.jsx'
import PlatformScene from '../components/home/PlatformScene.jsx'
import Platforms from '../components/home/Platforms.jsx'
import Prints from '../components/home/Prints.jsx'
import ScratchCoupon from '../components/home/ScratchCoupon.jsx'
import TapeBand from '../components/home/TapeBand.jsx'
import { Head, Section } from '../components/home/parts.jsx'

const TAPE_A = [
  { en: 'Mind the lens', ko: '렌즈 주의' },
  { en: 'The camera sits below the screen', ko: '카메라는 화면 아래' },
  { en: 'Now boarding: Karaoke Shot', ko: '탑승 중 노래방 샷' },
  { en: 'Destination: UrbanEdge', ko: '행선지 어반엣지' },
]

const COUPON = {
  label: { en: 'Coupon', ko: '쿠폰' },
  title: { en: 'Share UrbanEdge, get a scratch card.', ko: '공유하고 스크래치 카드 받기' },
}

// 홈: 히어로, 공유 쿠폰, 승강장 고르기, 승강장 장면, 인화물, 오시는 길.
// 공유 쿠폰은 첫 몇 번의 스크롤 안에 닿도록 히어로 바로 아래에 둔다.
export default function Home() {
  return (
    <>
      <Hero />
      <Section id="coupon" labelledBy="coupon-title" tone="elev">
        <Head label={COUPON.label} title={COUPON.title} titleId="coupon-title" lean />
        <div className="mt-24 max-w-3xl md:mt-40">
          <ScratchCoupon />
        </div>
      </Section>
      <Platforms />
      <TapeBand items={TAPE_A} tone="yellow" dir={-1} tilt={-1.4} />
      <PlatformScene />
      <Prints />
      <Location />
    </>
  )
}
