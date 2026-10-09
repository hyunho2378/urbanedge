import HowItWorks from '../components/home/HowItWorks.jsx'
import Hero from '../components/home/Hero.jsx'
import Location from '../components/home/Location.jsx'
import Platforms from '../components/home/Platforms.jsx'
import Prints from '../components/home/Prints.jsx'
import TimeStrip from '../components/home/TimeStrip.jsx'
import { ZebraBar } from '../layout/ZebraBar.jsx'

// 홈: 히어로(슬로건), 시간의 승강장 띠, 방 세 곳, 방문 순서, 인화물, 오시는 길. 밝은 구간과 어두운 구간을 번갈아 두고 횡단보도 띠로 나눈다.
// 쿠폰은 홈 구간이 아니라 모든 페이지에 뜨는 플로팅 버튼과 모달이다(layout/CouponFab).
export default function Home() {
  return (
    <>
      <Hero />
      <ZebraBar thickness="12px" />
      <TimeStrip />
      <Platforms />
      <HowItWorks />
      <ZebraBar thickness="12px" />
      <Prints />
      <ZebraBar thickness="12px" />
      <Location />
    </>
  )
}
