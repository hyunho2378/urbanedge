// ScreenOnly.jsx v2: 경로 `/screen`. 프로그램 화면만 1920x1080 비율로 창을 꽉 채워(레터박스) 보여 준다.
// 코치마크 투어는 ?tour=1일 때만 열린다, 우클릭과 텍스트 선택과 드래그를 막는다.
// ?embed=1이면 웹 iframe용으로 건너뛰기 링크와 긴 투어를 빼고 짧은 안내만 보인다.
import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LogOut, RotateCw } from 'lucide-react'
import { Bi, pickLang, useLangValue } from '@urbanedge/ds'
import Stage from '../device/Stage.jsx'
import Tour from '../device/Tour.jsx'
import { TOUR_STEPS } from '../device/tourCopy.js'
import { useTour } from '../device/useTour.js'
import { useMedia } from '../device/useMedia.js'
import KioskScreen from '../flow/KioskScreen.jsx'
import './simulator.css'

export default function ScreenOnly({ ctrl }) {
  const [params] = useSearchParams()
  const embed = params.get('embed') === '1'
  // 운영 데모의 '전체 화면'으로 들어왔을 때만 나가기를 보인다(매장의 실제 키오스크에는 손님용 나가기가 없다).
  const fromSim = params.get('from') === 'sim' && !embed
  const navigate = useNavigate()
  useEffect(() => {
    if (!fromSim) return undefined
    const k = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName)) return
      if (e.key === 'Escape' || e.key === 'f' || e.key === 'F' || e.key === 'ㄹ') {
        e.preventDefault()
        navigate('/')
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [fromSim, navigate])
  const lang = useLangValue()
  const ctx = embed ? 'embed' : 'screen'
  // v3: 투어는 자동으로 열지 않는다(?tour=1로만 연다). 화면 안 온보딩은 결제와 첫 촬영 전 팁 두 번과 탑승 안내 한 장이다.
  const tour = useTour({ total: TOUR_STEPS[ctx].length, autoOpen: false })
  const portrait = useMedia('(orientation: portrait) and (max-width: 700px)')

  return (
    <div
      className="fixed inset-0 grid select-none place-items-center overflow-hidden bg-black"
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {embed ? null : (
        <Link
          to="/"
          className="sr-only focus:not-sr-only focus:absolute focus:left-16 focus:top-16 focus:z-toast focus:rounded-md focus:bg-yellow focus:px-16 focus:py-12 focus:font-ui focus:text-body focus:font-bold focus:text-text-onYellow"
        >
          <Bi inline en="Back to the simulator" ko="시뮬레이터로 돌아가기" />
        </Link>
      )}
      {fromSim ? (
        <Link
          to="/"
          aria-label="전체화면 끝내기 (F 또는 Esc)"
          className="screen-exit"
        >
          <LogOut size={18} aria-hidden="true" />
          전체화면 끝내기
        </Link>
      ) : null}
      <div className="screen-only-box" data-tour="screen">
        <Stage label={pickLang(lang, 'Kiosk screen', '키오스크 화면')}>
          <KioskScreen ctrl={ctrl} />
        </Stage>
      </div>
      {portrait && !embed ? (
        <p className="t-caption absolute inset-x-16 bottom-24 flex items-center justify-center gap-8 text-center text-text-sec" role="note">
          <RotateCw size={16} aria-hidden="true" className="shrink-0" />
          <Bi en="Rotate your phone to fill the screen" ko="휴대폰을 가로로 돌리면 화면이 더 크게 보입니다" />
        </p>
      ) : null}
      <Tour open={tour.open} ctx={ctx} index={tour.index} onIndex={tour.go} onClose={tour.close} />
    </div>
  )
}
