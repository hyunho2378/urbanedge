// SceneHost.jsx: 모든 WebGL 장면을 감싸는 래퍼.
// 화면 근처에 오면 그때 청크를 불러오고(lazy), 화면 밖이면 렌더를 멈추고, 동작 줄이기에서는 정지 프레임,
// WebGL이 없거나 실패하면 포스터 이미지로 대체한다. 부모가 크기(높이 또는 aspect-ratio)를 정한다.
import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { hasWebGL, useInView, usePageVisible, usePrefersReducedMotion } from './env.js'

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { this.props.onError?.(err) }
  render() { return this.state.failed ? null : this.props.children }
}

export function SceneHost({ className, style, Scene, sceneProps, poster, posterAlt = '', label, children, fit = 'cover', position = 'center' }) {
  const ref = useRef(null)
  const { near, visible } = useInView(ref)
  const pageVisible = usePageVisible()
  const reduced = usePrefersReducedMotion()
  const [supported, setSupported] = useState(true)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [lost, setLost] = useState(false)

  useEffect(() => { setSupported(hasWebGL()) }, [])
  const onReady = useCallback(() => setReady(true), [])
  const onError = useCallback(() => setFailed(true), [])
  const onLost = useCallback(() => setLost(true), [])
  const onRestored = useCallback(() => setLost(false), [])

  const useGL = supported && !failed
  const active = visible && pageVisible && !reduced
  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', touchAction: 'pan-y', ...style }}
      role="img"
      aria-label={label}
    >
      {poster && (
        <img
          src={poster}
          alt={posterAlt}
          decoding="async"
          draggable={false}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: position, opacity: useGL && ready && !lost ? 0 : 1, transition: 'opacity 480ms cubic-bezier(.16, 1, .3, 1)', pointerEvents: 'none' }}
        />
      )}
      {useGL && near && (
        <Boundary onError={onError}>
          <Suspense fallback={null}>
            <Scene {...sceneProps} active={active && !lost} still={reduced} onReady={onReady} onError={onError} onLost={onLost} onRestored={onRestored} />
          </Suspense>
        </Boundary>
      )}
      {children}
    </div>
  )
}
