// Simulator.jsx v3: 경로 `/`. 기기와 그 안의 화면만 보여 준다. 설정 패널, 새 창 열기, 투어는 없다.
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { pickLang, useLangValue } from '@urbanedge/ds'
import DeviceFrame from '../device/DeviceFrame.jsx'
import Stage from '../device/Stage.jsx'
import KioskScreen from '../flow/KioskScreen.jsx'
import './simulator.css'

export default function Simulator({ ctrl }) {
  const { hintZone, flashing, printUrl, cameraActive, lang, cameraMode, room } = ctrl
  const [params] = useSearchParams()
  const embed = params.get('embed') === '1'
  const L = useLangValue()
  const q = new URLSearchParams({ lang, camera: cameraMode })
  if (room) q.set('room', room)
  return (
    <div className="sim-embed grid min-h-dvh place-items-center bg-bg-base text-text-pri">
      <div className="sim-device" data-embed={embed ? 'true' : 'false'}>
        <DeviceFrame hint={null} flashing={flashing} printUrl={printUrl} cameraActive={cameraActive} annotate={false} bg={embed ? 'base' : 'elev'}>
          <Stage label={pickLang(L, 'Kiosk screen', '키오스크 화면')}>
            <KioskScreen ctrl={ctrl} />
          </Stage>
        </DeviceFrame>
      </div>
      {embed ? null : (
        <Link to={`/screen?${q.toString()}`} className="ue-press absolute bottom-16 right-16 min-h-48 px-12 font-ui text-body-sm font-semibold text-text-sec hover:text-text-pri">
          {pickLang(L, 'Full screen', '전체 화면')}
        </Link>
      )}
    </div>
  )
}
