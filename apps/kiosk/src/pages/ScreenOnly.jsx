// ScreenOnly.jsx: 경로 `/screen`. 기기 화면만 전체 화면으로 보여 준다. 우클릭, 텍스트 선택, 드래그를 막는다.
import { Link } from 'react-router-dom'
import Stage from '../device/Stage.jsx'
import KioskScreen from '../flow/KioskScreen.jsx'
import './simulator.css'

export default function ScreenOnly({ ctrl }) {
  const ko = ctrl.lang !== 'en'
  return (
    <div
      className="fixed inset-0 grid select-none place-items-center overflow-hidden bg-black"
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Link
        to="/"
        className="sr-only focus:not-sr-only focus:absolute focus:left-16 focus:top-16 focus:z-toast focus:rounded-md focus:bg-yellow focus:px-16 focus:py-12 focus:font-ui focus:text-body focus:font-bold focus:text-text-onYellow"
      >
        {ko ? '시뮬레이터로 돌아가기' : 'Back to the simulator'}
      </Link>
      <div className="screen-only-box">
        <Stage label={ko ? '키오스크 화면' : 'Kiosk screen'}>
          <KioskScreen ctrl={ctrl} />
        </Stage>
      </div>
    </div>
  )
}
