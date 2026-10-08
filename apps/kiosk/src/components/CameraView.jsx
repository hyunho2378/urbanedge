import { useEffect, useRef } from 'react'
import { cx } from '@urbanedge/ds'
import { useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 카메라 미리보기: 웹캠 또는 샘플 장면을 canvas에 그리고 보정을 실시간으로 적용한다(약 30fps).
// 영상은 이 canvas 밖으로 나가지 않는다.
export function CameraView({ camera, retouch, className, badge = true, children }) {
  const ref = useRef(null)
  const t = useT()
  const live = useRef({})
  live.current = { camera, retouch }

  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    let raf = 0
    let last = 0
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      const { camera: cam, retouch: r } = live.current
      cam.draw(ctx, c.width, c.height, now, r)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={cx('relative overflow-hidden rounded-lg bg-bg-elev', className)}>
      <canvas ref={ref} width={960} height={540} className="k-canvas h-full w-full" aria-label={t(camera.isLive ? COPY.common.live : COPY.common.sample)} role="img" />
      {badge && (
        <span className="ue-label absolute left-24 top-24 rounded-md bg-scrim px-16 py-8 text-k-label text-text-pri">
          {camera.isLive ? t(COPY.common.live) : t(COPY.common.sample)}
        </span>
      )}
      {children}
    </div>
  )
}
