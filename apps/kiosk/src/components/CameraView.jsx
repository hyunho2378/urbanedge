import { useEffect, useRef } from 'react'
import { cx } from '@urbanedge/ds'
import { T, useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 카메라 미리보기: 웹캠 또는 샘플(팀 인화 사진)을 세로 3:4 canvas에 그리고 보정을 실시간으로 적용한다(약 30fps).
// 인화 칸과 같은 비율이라 보이는 대로 인화된다. 영상은 이 canvas 밖으로 나가지 않는다.
export function CameraView({ camera, retouch, className, badge = true, children, style }) {
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

  const label = t(camera.isLive ? COPY.common.cameraLive : COPY.common.cameraSample)
  return (
    <div className={cx('relative overflow-hidden rounded-xl bg-bg-elev', className)} style={style}>
      <canvas ref={ref} width={540} height={720} className="k-canvas h-full w-full" role="img" aria-label={label} />
      {badge && (
        <span className="kt-caption absolute left-20 top-20 rounded-pill bg-scrim px-20 py-6 text-text-pri">
          <T n={camera.isLive ? COPY.common.cameraLive : COPY.common.cameraSample} inline />
        </span>
      )}
      {children}
    </div>
  )
}
