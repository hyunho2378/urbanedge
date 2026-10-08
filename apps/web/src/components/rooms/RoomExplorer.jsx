import { Component, Suspense, lazy, useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { hasWebGL } from '@urbanedge/scenes'
import { useV } from '../pages/Bilingual.jsx'
import { ZONES } from './zones.js'
import './room-explorer.css'

const Model = lazy(() => import('./RoomModelCanvas.jsx'))
const COPY = {
  title: { ko: '매장 안', en: 'Inside the shop' },
  intro: { ko: '영역을 누르면 위치가 노랗게 표시된다.', en: 'Tap an area to light it up on the model.' },
}
class ModelBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

export function RoomExplorer() {
  const v = useV()
  const [active, setActive] = useState('subway')
  const [supported, setSupported] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [view, setView] = useState('photo')
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
          <h2 id="room-explorer-title" className="t-headline">{v(COPY.title)}</h2>
          <p className="t-body">{v(COPY.intro)}</p>
        </header>
        <div className="room-explorer__layout">
          <div className="room-explorer__viewport">
            <div className="room-explorer__views" role="group" aria-label={v({ ko: '보기 방식', en: 'View' })}>
              {[['photo', { ko: '투시도', en: 'Render' }], ['model', { ko: '3D', en: '3D' }]].map(([id, label]) => <button key={id} type="button" aria-pressed={view === id} className={`room-explorer__view ${view === id ? 'room-explorer__view--active' : ''}`} onClick={() => setView(id)}>{v(label)}</button>)}
            </div>
            <div className="room-explorer__stage" role="group" aria-label={v({ ko: '매장 모형', en: 'Shop model' })}>
              {view === 'photo' ? <img src="/img/space/urbanedge-space.jpg" className="room-explorer__render" alt={v({ ko: '레트로, 노래방, 지하철 방과 대기 의자, 전신거울, 셔터 포토존, 유리 입구가 보이는 매장 투시도', en: 'Cutaway of the shop: Retro, Karaoke and Subway rooms, waiting seats, full-length mirror, shutter photo spot and glass entrance' })} /> : <>
              <img src="/models/urbanedge-shell-fallback.png" className={`room-explorer__poster ${loaded && !failed ? 'room-explorer__poster--hidden' : ''}`} alt="" />
              {supported && !failed && <ModelBoundary onFailure={() => setFailed(true)}><Suspense fallback={null}><Model active={active} onSelect={setActive} reduced={reduced} onReady={() => setLoaded(true)} onFailure={() => setFailed(true)} /></Suspense></ModelBoundary>}
              </>}
            </div>
          </div>
          <div className="room-explorer__panel">
            <div className="room-explorer__choices" role="group" aria-label={v({ ko: '영역 선택', en: 'Choose an area' })}>
              {ZONES.map((item, index) => <button key={item.id} type="button" className={`room-explorer__choice ${active === item.id ? 'room-explorer__choice--active' : ''}`} aria-pressed={active === item.id} onClick={() => { setActive(item.id); setView('model') }} onKeyDown={(e) => keyboard(e, index)}><span className="room-explorer__choice-no">{item.no}</span><span>{v(item.title)}</span></button>)}
            </div>
            <div className="room-explorer__detail" role="status" aria-live="polite">
              <h3>{v(zone.title)}</h3>
              <p>{v(zone.desc)}</p>
              {zone.platform && <Link to={`/rooms/${zone.platform}`} className="room-explorer__platform-link"><span>{v({ ko: '이 방 보기', en: 'See this room' })}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
