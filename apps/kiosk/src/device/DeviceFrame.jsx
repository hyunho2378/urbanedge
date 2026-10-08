// DeviceFrame.jsx v2: 어반엣지 포토부스 기기의 외형을 CSS와 inline SVG로 그린다(카메라가 모니터 아래인 기기).
// 비율은 geometry.js의 실측값이며, 문 아래는 모니터 중심의 상반신 구도로 줄이고 바탕색으로 흐린다.
// 본체는 aspect-ratio 박스이며 transform scale을 쓰지 않는다.
// props
//   hint          'camera' | 'card' | 'slot' | 'screen' | null  해당 부품에 노랑 링 펄스와 라벨(card는 단말기가 불을 켜고 카드가 들어가는 동작)
//   flashing      true면 LED 조명바가 밝아진다
//   printUrl      있으면 출구 슬롯에서 인화물이 transform으로 밀려 나온다
//   cameraActive  true면 렌즈 표시등이 켜진다
//   annotate      true면 부품 번호 마커를 얹는다(범례는 시뮬레이터 패널)
//   (언어는 DS LangContext에서 읽는다. 라벨은 Bi로 그려 한영 전환에도 크기가 변하지 않는다)
//   bg            'elev' | 'base' 아래쪽 흐림이 섞이는 바탕색
//   children      모니터 안에 들어가는 내용(보통 1920x1080 Stage)
// 코치마크 Tour는 data-tour="screen|camera|card|slot" 표식으로 부품 위치를 찾는다.
import { useEffect, useState } from 'react'
import { Bi, cx, pickLang, useLangValue } from '@urbanedge/ds'
import './device.css'
import {
  DOOR,
  HANDLE,
  LEDS,
  LENS,
  MONITOR,
  NOTICE_L,
  NOTICE_R,
  PARTS,
  RATIO,
  READER,
  SLOT_PLATE,
  STICKER,
  TRAY,
  ZONES,
  place,
} from './geometry.js'
import {
  CardReaderPart,
  HandlePart,
  LensPart,
  NoticeCctvPart,
  NoticeMovePart,
  SlotPlatePart,
  StickerPart,
  TrayPart,
} from './parts.jsx'

const labelPos = {
  left: { right: '100%', top: '50%', transform: 'translate3d(0,-50%,0)', marginRight: '1.2cqw' },
  right: { left: '100%', top: '50%', transform: 'translate3d(0,-50%,0)', marginLeft: '1.2cqw' },
  below: { top: '100%', left: '50%', transform: 'translate3d(-50%,0,0)', marginTop: '1.2cqw' },
  above: { bottom: '100%', left: '50%', transform: 'translate3d(-50%,0,0)', marginBottom: '1.2cqw' },
}

function HintRing({ zone }) {
  const z = ZONES[zone]
  if (!z) return null
  return (
    <div className="dv-ring" data-round={z.round ? 'true' : 'false'} data-zone={zone} style={place(z.box)}>
      <div className="dv-ring-pulse" />
      <div className="dv-ring-line" />
      <span
        aria-hidden="true"
        className="dv-label absolute z-10 whitespace-nowrap rounded-md bg-yellow px-8 py-4 font-ui text-caption font-bold text-text-onYellow md:px-10 md:text-body-sm"
        style={labelPos[z.side]}
      >
        <Bi inline en={z.label.en} ko={z.label.ko} />
      </span>
    </div>
  )
}

// 인화물: 종이가 틈 아래로 밀려 나온다. 사라질 때는 잠깐 남겨 되돌아가는 전환을 보여 준다.
function PrintOut({ printUrl }) {
  const lang = useLangValue()
  const [shown, setShown] = useState(null)
  const [out, setOut] = useState(false)

  useEffect(() => {
    if (printUrl) {
      setShown(printUrl)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setOut(true)))
      return () => cancelAnimationFrame(id)
    }
    setOut(false)
    const t = setTimeout(() => setShown(null), 1600)
    return () => clearTimeout(t)
  }, [printUrl])

  if (!shown) return null
  return (
    <div className="dv-print-clip" style={{ left: '3%', top: '6.5%', width: '84%', height: '89%' }} data-print={out ? 'out' : 'in'}>
      <div className="absolute inset-x-0 flex justify-center" style={{ top: '1.5%', height: '97%' }}>
        <div className="dv-paper" data-out={out ? 'true' : 'false'} style={{ height: '100%', aspectRatio: '2 / 3' }}>
          <img src={shown} alt={pickLang(lang, 'Printed photo', '인화물')} draggable="false" />
        </div>
      </div>
    </div>
  )
}

export default function DeviceFrame({
  hint = null,
  flashing = false,
  printUrl = null,
  cameraActive = false,
  annotate = false,
  bg = 'elev',
  className,
  children,
}) {
  const lang = useLangValue()
  return (
    <div
      className={cx('dv-root', className)}
      role="group"
      aria-label={pickLang(lang, 'UrbanEdge photo booth kiosk', '어반엣지 포토부스 키오스크 기기')}
      data-bg={bg}
      data-hint={hint ?? ''}
      data-flashing={flashing ? 'true' : 'false'}
      data-camera={cameraActive ? 'on' : 'off'}
      data-print={printUrl ? 'out' : 'none'}
    >
      <div className="dv-body" aria-hidden="true" />

      {/* CCTV 안내문 두 장 */}
      <div className="dv-part dv-drop" style={place(NOTICE_L)} aria-hidden="true">
        <NoticeMovePart />
      </div>
      <div className="dv-part dv-drop" style={place(NOTICE_R)} aria-hidden="true">
        <NoticeCctvPart />
      </div>

      {/* LED 조명바 */}
      {LEDS.map((l) => (
        <div key={l.id} aria-hidden="true">
          <div className="dv-part dv-led" style={place(l)} />
          <div className="dv-part dv-led-on" style={place(l)} data-on={flashing ? 'true' : 'false'} data-led={l.id} />
        </div>
      ))}

      {/* 모니터: 16:9 박스 안에 Stage가 들어간다 */}
      <div className="dv-part dv-monitor" style={place(MONITOR)} data-monitor="" data-tour="screen">
        {children}
        <div className="dv-glare" aria-hidden="true" />
      </div>

      {/* 렌즈 */}
      <div className="dv-part" style={place(LENS.box)} aria-hidden="true" data-lens={cameraActive ? 'on' : 'off'} data-tour="camera">
        <LensPart active={cameraActive} />
      </div>

      {/* 안내 스티커 */}
      <div className="dv-part" style={place(STICKER)} aria-hidden="true">
        <StickerPart />
      </div>

      {/* 하단 캐비닛 문과 그 위의 부품 */}
      <div className="dv-part dv-door" style={place(DOOR)} aria-hidden="true" />
      <div className="dv-part dv-drop" style={place(SLOT_PLATE)} aria-hidden="true" data-part="slot-plate">
        <SlotPlatePart />
      </div>
      <div className="dv-part dv-drop" style={place(HANDLE)} aria-hidden="true">
        <HandlePart />
      </div>
      <div className="dv-part" style={place(TRAY)} aria-hidden="true" data-tour="slot">
        <TrayPart />
        <PrintOut printUrl={printUrl} />
      </div>

      {/* 카드 단말기는 문 윗선에 얹히므로 문 뒤가 아니라 앞에 그린다 */}
      <div className="dv-part dv-drop" style={{ ...place(READER), zIndex: 2 }} aria-hidden="true" data-tour="card">
        <CardReaderPart hint={hint === 'card'} />
      </div>

      <div className="dv-fade" aria-hidden="true" />

      {hint ? <HintRing zone={hint} /> : null}
      {annotate
        ? PARTS.map((p, i) => (
            <span key={p.id} className="dv-marker" style={{ left: `${p.anchor.x}%`, top: `${p.anchor.y / RATIO}%` }} data-part={p.id}>
              {i + 1}
            </span>
          ))
        : null}
    </div>
  )
}
