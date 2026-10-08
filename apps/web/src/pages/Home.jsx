import About from '../components/home/About.jsx'
import FirstTime from '../components/home/FirstTime.jsx'
import GalleryStrip from '../components/home/GalleryStrip.jsx'
import Hero from '../components/home/Hero.jsx'
import KioskCta from '../components/home/KioskCta.jsx'
import RoomsIndex from '../components/home/RoomsIndex.jsx'
import RouteMarquee from '../components/home/RouteMarquee.jsx'
import SectionRail from '../components/home/SectionRail.jsx'
import Steps from '../components/home/Steps.jsx'
import VisitStrip from '../components/home/VisitStrip.jsx'

// 홈: 히어로, 노선 마퀴, 01 소개, 02 포토 룸, 03 이용 방법, 04 처음 오는 분께, 05 갤러리, 06 방문 정보, 키오스크 체험.
export default function Home() {
  return (
    <>
      <Hero />
      <RouteMarquee />
      <About />
      <RoomsIndex />
      <Steps />
      <FirstTime />
      <GalleryStrip />
      <VisitStrip />
      <KioskCta />
      <SectionRail />
    </>
  )
}
