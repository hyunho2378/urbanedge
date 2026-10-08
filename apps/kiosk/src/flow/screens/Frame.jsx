import { useMemo } from 'react'
import { T, useT } from '../../components/lang.jsx'
import { FrameCarousel } from '../../components/FrameCarousel.jsx'
import { StripView, stripAspect } from '../../components/StripView.jsx'
import { COPY } from '../copy.js'
import { framesFor, frameById } from '../prints.js'

// 5. frame v3: 가운데 프레임 하나가 초점이다. 옆으로 밀면 가운데에 온 프레임이 선택되고, 이름과 장수가 오른쪽 위에 바뀌어 나온다.
const H = 430
export default function Frame({ ctrl }) {
  const t = useT()
  const items = useMemo(() => framesFor(ctrl.cuts || 4), [ctrl.cuts])
  const active = frameById(ctrl.frameId) || items[0]
  const itemW = Math.round(H * (2 / 3))
  return (
    <div className="absolute inset-0 bg-bg-base">
      <div className="absolute" style={{ left: 120, top: 236, width: 1000 }}>
        <T n={COPY.frame.title} as="h1" className="kt-title" />
        <T n={COPY.frame.sub} as="p" className="kt-body mt-16 text-text-sec" />
      </div>
      {active && (
        <div className="absolute text-right" style={{ right: 120, top: 250, width: 640 }} aria-live="polite">
          <T n={active.name} as="p" className="kt-subhead" />
          <T n={COPY.frame.slots} v={{ n: active.slots }} as="p" className="kt-body mt-8 text-text-sec" />
        </div>
      )}
      <div className="absolute" style={{ left: 0, top: 440 }}>
        <FrameCarousel
          items={items}
          activeId={ctrl.frameId}
          onActive={ctrl.setFrame}
          label={t(COPY.frame.label)}
          itemW={itemW + 80}
          gap={56}
          height={H + 20}
          className="items-center"
          renderItem={(f) => (
            <div className="flex justify-center">
              <StripView frame={f} date={ctrl.date} roomId={ctrl.room} height={Math.round(Math.min(H, (itemW + 80) / stripAspect(f)))} className="k-lift" label={t(f.name)} />
            </div>
          )}
        />
      </div>
    </div>
  )
}
