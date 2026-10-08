import { Component, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { StationSign } from '@urbanedge/ds'
import { LINE, STATION, platformById } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import { Wrap } from '../../layout/Wrap.jsx'
import { prefersReducedMotion, scrollToId } from '../../layout/scroll.js'
import { lazyReal } from './kit.jsx'
import { useMedia, useNearViewport, useSectionProgress } from './hooks.js'
import StationTag from './StationTag.jsx'
import TrainSvg from './TrainSvg.jsx'

const COPY = {
  title: { en: 'Welcome to UrbanEdge Station.', ko: '어반엣지역에 오신 것을 환영합니다' },
  body: {
    en: 'Gyeongju has no subway, so this is the first and only stop on Gyeongju Metro. Cones, yellow tape and a checkerboard floor mark the way in. Four platforms follow, each with its own kiosk.',
    ko: '경주에는 지하철이 없어서 이곳이 경주 메트로의 처음이자 유일한 열린 역이다. 검은 고깔과 노란 테이프, 체커보드 바닥이 보이면 입구이고 안쪽으로 승강장 네 곳이 이어진다.',
  },
  a0: { en: 'Platform clear. Please stand behind the yellow line.', ko: '안전선 뒤로 한 걸음 물러서기' },
  a1: { en: 'A train is arriving at UrbanEdge.', ko: '열차 진입 중, 행선지는 어반엣지' },
  a2: { en: 'Doors open. Mind the gap between the train and your photo.', ko: '문 열림, 내리면 바로 포토 룸' },
  pick: { en: 'Pick a platform', ko: '승강장 고르기' },
  go: { en: 'Open', ko: '열기' },
}
const Diorama = lazyReal(() => import('@urbanedge/scenes'), 'PlatformDiorama', null)

// WebGL이 실패해도 앱과 콘솔이 깨지지 않게 막는다. 실패하면 포스터 이미지만 남는다.
class SceneGuard extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// 기기 성능 판단: 코어 4개 이상, 데이터 절약 모드 아님, 동작 줄이기 아님, WebGL 지원
const capable = () => {
  if (typeof navigator === 'undefined') return false
  const nav = navigator
  if (nav.connection?.saveData) return false
  if ((nav.hardwareConcurrency || 2) < 4) return false
  if (nav.deviceMemory && nav.deviceMemory < 4) return false
  if (prefersReducedMotion()) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

// 승강장 구간: 스크롤하면 열차가 도착한다. 성능이 되는 기기에서만 Three.js 장면(작업 T)을 화면에 가까워질 때 불러오고, 아니면 포스터와 SVG 열차를 쓴다.
export default function PlatformScene() {
  const pick = usePick()
  const wrap = useRef(null)
  const [nearRef, near] = useNearViewport('500px')
  const reduce = prefersReducedMotion()
  const mobile = useMedia('(max-width: 767px)')
  const raw = useSectionProgress(wrap, { sticky: !mobile })
  const p = reduce ? 1 : raw
  const [room, setRoom] = useState(null)
  const [can, setCan] = useState(false)
  const arrive = Math.min(1, p / 0.62)
  const doors = Math.min(1, Math.max(0, (p - 0.62) / 0.3))
  const say = p < 0.18 ? COPY.a0 : p < 0.62 ? COPY.a1 : COPY.a2
  const picked = room ? platformById(room) : null

  useEffect(() => {
    setCan(capable())
  }, [])

  return (
    <section id="platform" ref={wrap} aria-label={pick(COPY.title)} style={{ height: mobile ? '66dvh' : '170dvh', scrollMarginTop: 'var(--ue-header-h)' }} className="relative bg-bg-base">
      <div ref={nearRef} className="relative top-0 h-full overflow-hidden md:sticky md:h-dvh">
        <img src="/img/illus/platform-poster.jpg" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" className="absolute inset-0 size-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-black/45" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-bg-base/70" />

        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex justify-center pb-96 md:pb-96">
          <div className="w-full max-w-3xl px-16" style={{ transform: `translate3d(${(1 - arrive) * 110}vw,0,0)`, transition: reduce ? 'none' : 'transform 120ms linear' }}>
            <TrainSvg doors={doors} />
          </div>
        </div>

        {near && can && !mobile && (
          <SceneGuard>
            <Suspense fallback={null}>
              <Diorama className="absolute inset-0 size-full" interactive activeRoom={room} onSelectRoom={setRoom} quality={mobile ? 'low' : 'high'} progress={p} />
            </Suspense>
          </SceneGuard>
        )}

        <Wrap className="pointer-events-none relative z-10 flex h-full flex-col justify-between pb-16 pt-56 md:pb-24 md:pt-128">
          <div className="pointer-events-auto max-w-xl rounded-xl bg-black/55 p-16 md:p-20">
            <span className="hidden md:block"><StationSign station={{ code: STATION.code, name: STATION.name.en, nameKo: STATION.name.ko }} line={{ code: LINE.code, color: LINE.color }} size="md" /></span>
            <StationTag className="md:hidden" />
            <h2 className="t-headline mt-12 text-text-pri md:mt-20 3xl:text-h1"><B v={COPY.title} /></h2>
            <p className="t-body mt-8 text-text-sec md:mt-12"><B v={COPY.body} /></p>
          </div>
          <div className="pointer-events-auto flex flex-col items-start gap-12 md:flex-row md:items-end md:justify-between">
            <p className="t-label max-w-sm text-yellow" role="status" aria-live="off"><B v={say} /></p>
            {picked ? (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('ue:platform', { detail: picked.id }))
                  scrollToId('platforms')
                }}
                className="ue-press inline-flex min-h-48 items-center gap-8 rounded-pill bg-white px-20 font-ui text-body-sm font-semibold text-bg-base"
              >
                <B v={COPY.go} inline /> {pick(picked.title)}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" onClick={() => scrollToId('platforms')} className="inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-text-pri underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow">
                <B v={COPY.pick} inline />
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </Wrap>
      </div>
    </section>
  )
}
