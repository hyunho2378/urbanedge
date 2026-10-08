import { lazy, useState } from 'react'
import { SceneHost } from './lib/SceneHost.jsx'
import { ROOM_STATIONS } from './lib/palette.js'

const PlatformCanvas = lazy(() => import('./platform/PlatformCanvas.jsx'))

const sr = { position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }

/**
 * PlatformDiorama: GY-01 UrbanEdge 승강장. 열차가 들어와 멈추고 문이 열리면 승강장 4곳(Platform 1 ~ 4)의 문이 방 색으로 빛난다.
 * @param {object} props
 * @param {string} [props.className] 컨테이너 클래스. 부모가 높이 또는 aspect-ratio를 정한다.
 * @param {boolean} [props.interactive=true] 포인터, 기기 기울기 시차와 문 클릭
 * @param {string|null} [props.activeRoom] 'subway'|'karaoke'|'phone'|'retro'. 강조하고 전광판에 승차 역으로 표시
 * @param {(id: string) => void} [props.onSelectRoom] 문을 누르면 방 id로 호출
 * @param {'auto'|'low'|'medium'|'high'} [props.quality='auto'] 해상도 배율 상한. auto는 모바일 1.5, 데스크톱 2
 * @param {number} [props.progress=1] 0에서 1. 0.04~0.6 열차 입장과 제동, 0.66~0.8 문 열림, 0.76~1 승강장 문 점등
 * @param {string} [props.poster] WebGL 실패와 로딩 중에 보이는 이미지
 * @param {string} [props.label] 접근성 설명
 */
export function PlatformDiorama({ className, interactive = true, activeRoom = null, onSelectRoom, quality = 'auto', progress = 1, poster = '/img/illus/platform-poster.jpg', label = 'Illustration of UrbanEdge Station (GY-01) on Gyeongju Metro. A train arrives and its doors open onto four photo platforms.' }) {
  const [focusRoom, setFocusRoom] = useState(null)
  return (
    <SceneHost className={className} Scene={PlatformCanvas} sceneProps={{ interactive, activeRoom, focusRoom, onSelectRoom, quality, progress }} poster={poster} label={label}>
      {interactive && onSelectRoom && (
        <ul style={{ ...sr, listStyle: 'none' }}>
          {ROOM_STATIONS.map((s) => (
            <li key={s.id}>
              <button type="button" style={sr} onClick={() => onSelectRoom(s.id)} onFocus={() => setFocusRoom(s.id)} onBlur={() => setFocusRoom(null)}>
                {`Platform ${s.no}: ${s.name}`}
              </button>
            </li>
          ))}
        </ul>
      )}
    </SceneHost>
  )
}
