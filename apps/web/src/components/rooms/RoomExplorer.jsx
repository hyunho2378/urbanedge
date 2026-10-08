import { Component, Suspense, lazy, useEffect, useState } from 'react'
import { Rotate3D, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PLATFORMS } from '../pages/content.js'
import { hasWebGL } from '@urbanedge/scenes'
import { useV } from '../pages/Bilingual.jsx'
import { ZONES } from './zones.js'
import './room-explorer.css'

const Model = lazy(() => import('./RoomModelCanvas.jsx'))
const COPY = {
  title: { ko: '공간을 직접 둘러보세요.', en: 'Walk through the space.' },
  intro: { ko: '실제 Rhino 모델에서 영역을 누르세요. 드래그로 회전하고 두 손가락 또는 스크롤로 확대할 수 있습니다.', en: 'Tap an area on the actual Rhino model. Drag to rotate; pinch or scroll to zoom.' },
  unavailable: { ko: '모형 이미지에서 공간을 살펴보고 아래에서 영역을 선택하세요.', en: 'Explore the model image, then select an area below.' },
  caption: { ko: '제공된 OBJ의 실제 벽 구조를 보여줍니다. 선택한 바닥 영역은 노란색으로 표시됩니다.', en: 'The supplied OBJ supplies the actual walls. Yellow marks the selected floor area.' },
}
class ModelBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

export function RoomExplorer() {
  const v = useV()
  const [active, setActive] = useState('center')
  const [supported, setSupported] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reduced, setReduced] = useState(false)
  const zone = ZONES.find((item) => item.id === active) || ZONES[0]
  useEffect(() => {
    setSupported(hasWebGL())
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])
  const keyboard = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const dir = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1
    const next = (index + dir + ZONES.length) % ZONES.length
    setActive(ZONES[next].id)
    event.currentTarget.parentElement.children[next]?.focus()
  }
  return (
    <section className="room-explorer section-y" aria-labelledby="room-explorer-title">
      <div className="room-explorer__wrap">
        <header className="room-explorer__heading">
          <span className="room-explorer__eyebrow">URBANEDGE / THE SPACE</span>
          <h2 id="room-explorer-title" className="t-headline">{v(COPY.title)}</h2>
          <p className="t-body">{v(COPY.intro)}</p>
        </header>
        <div className="room-explorer__layout">
          <div className="room-explorer__viewport">
            <div className="room-explorer__stage" role="group" aria-label={v({ ko: '공간 모형 뷰어', en: 'Architectural model viewer' })}>
              <img src="/models/urbanedge-shell-fallback.png" className={`room-explorer__poster ${loaded && !failed ? 'room-explorer__poster--hidden' : ''}`} alt={v({ ko: '외벽과 칸막이가 보이는 제공된 건축 모형', en: 'The supplied architectural model with outer walls and partitions' })} />
              {supported && !failed && <ModelBoundary onFailure={() => setFailed(true)}><Suspense fallback={null}><Model active={active} onSelect={setActive} reduced={reduced} onReady={() => setLoaded(true)} onFailure={() => setFailed(true)} /></Suspense></ModelBoundary>}
              <div className="room-explorer__stage-label" aria-hidden="true"><Rotate3D size={16} /> 3D / OBJ</div>
            </div>
            <p className="room-explorer__caption">{v(!supported || failed ? COPY.unavailable : COPY.caption)}</p>
          </div>
          <div className="room-explorer__panel">
            <span className="room-explorer__eyebrow">01 — 05 / FLOOR ZONES</span>
            <h3 className="t-subhead">{v({ ko: '영역별로 보기', en: 'Explore by area' })}</h3>
            <div className="room-explorer__choices" role="group" aria-label={v({ ko: '영역 선택', en: 'Choose an area' })}>
              {ZONES.map((item, index) => <button key={item.id} type="button" className={`room-explorer__choice ${active === item.id ? 'room-explorer__choice--active' : ''}`} aria-pressed={active === item.id} onClick={() => setActive(item.id)} onKeyDown={(e) => keyboard(e, index)}><span className="room-explorer__choice-no">{item.no}</span><span>{v(item.title)}</span><ArrowUpRight size={16} aria-hidden="true" /></button>)}
            </div>
            <div className="room-explorer__detail" role="status" aria-live="polite">
              <span className="room-explorer__eyebrow">{zone.no} / ARCHITECTURE</span>
              <h4>{v(zone.title)}</h4>
              <p>{v(zone.desc)}</p>
            </div>
            <nav className="room-explorer__platforms" aria-label={v({ ko: '포토 승강장 네 곳', en: 'Four photo platforms' })}>
              <span className="room-explorer__eyebrow">PHOTO PLATFORMS</span>
              <div>{PLATFORMS.map((platform) => <Link key={platform.id} to={`/rooms/${platform.id}`} className="room-explorer__platform-link"><span>{String(platform.no).padStart(2, '0')} / {v(platform.title)}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div>
            </nav>
          </div>
        </div>
      </div>
    </section>
  )
}
