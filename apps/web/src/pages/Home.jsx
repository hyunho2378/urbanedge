import { Suspense } from 'react'
import Hero from '../components/home/Hero.jsx'
import Journey from '../components/home/Journey.jsx'
import JourneyIsland from '../components/home/JourneyIsland.jsx'
import KioskModal from '../components/home/KioskModal.jsx'
import Location from '../components/home/Location.jsx'
import MetroTeaser from '../components/home/MetroTeaser.jsx'
import PlatformScene from '../components/home/PlatformScene.jsx'
import Platforms from '../components/home/Platforms.jsx'
import Prints from '../components/home/Prints.jsx'
import TapeBand from '../components/home/TapeBand.jsx'

const TAPE_A = [
  { en: 'Mind the lens', ko: '렌즈 주의' },
  { en: 'The camera sits below the screen', ko: '카메라는 화면 아래' },
  { en: 'Next stop: Pose', ko: '다음 정거장 포즈' },
  { en: 'Now boarding: Karaoke Shot', ko: '탑승 중 노래방 샷' },
]
const TAPE_B = [
  { en: 'Do not skip the camera', ko: '카메라를 건너뛰지 마세요' },
  { en: 'Doors open at the back', ko: '문은 뒤쪽으로 열림' },
  { en: 'Your print departs from the tray', ko: '인화물은 하단 슬롯에서 출발' },
  { en: 'Destination: UrbanEdge', ko: '행선지 어반엣지' },
]

// 홈: 히어로, 경고 테이프, 승강장 장면, 이용 여정, 승강장 고르기, 인화물과 쿠폰, 1번 출구(지도), 하단 행동 바.
export default function Home() {
  return (
    <>
      <Hero />
      <TapeBand items={TAPE_A} tone="yellow" dir={-1} tilt={-1.4} />
      <PlatformScene />
      <Journey />
      <Platforms />
      <MetroTeaser />
      <TapeBand items={TAPE_B} tone="black" dir={1} tilt={1.2} />
      <Prints />
      <Location />
      <JourneyIsland />
      <Suspense fallback={null}>
        <KioskModal />
      </Suspense>
    </>
  )
}
