// DeviceLab.jsx: 경로 `/device`. 기기 외형만 단독으로 확인하는 개발용 페이지.
// 화면 흐름(KioskScreen)에 의존하지 않는다. 쿼리로 부품 상태를 지정한다.
//   ?hint=camera|card|slot|screen  ?flash=1  ?camera=1  ?print=1  ?annotate=1  ?lang=ko
import { LangContext } from '@urbanedge/ds'
import DeviceFrame from '../device/DeviceFrame.jsx'
import Stage from '../device/Stage.jsx'
import { RATIO } from '../device/geometry.js'

export default function DeviceLab() {
  const q = new URLSearchParams(window.location.search)
  const hint = ['camera', 'card', 'slot', 'screen'].includes(q.get('hint')) ? q.get('hint') : null
  const lang = q.get('lang') === 'ko' ? 'ko' : 'en'
  return (
    <LangContext.Provider value={lang}>
      <main className="grid min-h-dvh place-items-center bg-bg-elev p-16">
        <div style={{ width: `min(100%, calc((100dvh - 2rem) / ${RATIO}))` }}>
          <DeviceFrame
            hint={hint}
            flashing={q.get('flash') === '1'}
            cameraActive={q.get('camera') === '1'}
            printUrl={q.get('print') === '1' ? '/img/cr_pattern.jpg' : null}
            annotate={q.get('annotate') === '1'}
          >
            <Stage>
              <div className="grid h-full w-full place-items-center border-8 border-yellow bg-bg-base text-text-pri">
                <p className="font-display text-k-title font-bold">1920 x 1080</p>
              </div>
            </Stage>
          </DeviceFrame>
        </div>
      </main>
    </LangContext.Provider>
  )
}
