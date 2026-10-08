import { useMemo } from 'react'
import { T, useT } from '../../components/lang.jsx'
import { FrameCarousel } from '../../components/FrameCarousel.jsx'
import { StripView } from '../../components/StripView.jsx'
import { COPY } from '../copy.js'
import { framesFor, frameById } from '../prints.js'

// 5. frame: 프레임을 옆으로 밀어 고른다. 가운데에 온 프레임이 선택되고 커지며, 이름과 설명이 위쪽에 바뀌어 나온다.
// 프레임은 실제 인화 합성기로 그린 미리보기라 인화물과 같다.
export default function Frame({ ctrl }) {
  const t = useT()
  const items = useMemo(() => framesFor(ctrl.cuts || 4), [ctrl.cuts])
  const active = frameById(ctrl.frameId) || items[0]
  return (
    <div className="k-tiles absolute inset-0">
      <div className="absolute" style={{ left: 64, top: 172, width: 800 }}>
        <T n={COPY.frame.title} as="h1" className="kt-title" />
        <T n={COPY.frame.sub} as="p" className="kt-body mt-12 text-text-sec" />
      </div>
      {active && (
        <div className="absolute" style={{ left: 1000, top: 184, width: 856 }} aria-live="polite">
          <T n={active.name} as="p" className="kt-subhead" />
          <T n={active.blurb} as="p" className="kt-body mt-8 text-text-sec" />
          <T n={COPY.frame.slots} v={{ n: active.slots }} as="p" className="kt-caption mt-8 text-yellow" />
        </div>
      )}
      <div className="absolute" style={{ left: 0, top: 380 }} data-coach="frame">
        <FrameCarousel
          items={items}
          activeId={ctrl.frameId}
          onActive={ctrl.setFrame}
          label={t(COPY.frame.label)}
          itemW={400}
          gap={64}
          height={620}
          className="items-center"
          renderItem={(f) => <StripView frame={f} date={ctrl.date} roomId={ctrl.room} width={400} className="k-lift" label={t(f.name)} />}
        />
      </div>
    </div>
  )
}
