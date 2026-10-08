import { useState } from 'react'
import { FRAMES, StripPreview } from '@urbanedge/brand'
import { Bi } from '@urbanedge/ds'
import { Tx } from './Bilingual.jsx'

// 프레임 모음. 작업 B가 만든 실물 목업(/img/frames/<id>.jpg)을 보여 주고, 파일이 없으면 같은 프레임을 canvas로 합성해 대신 보여 준다.
function Card({ f }) {
  const [broken, setBroken] = useState(false)
  return (
    <li className="w-3/5 shrink-0 snap-start md:w-1/4 xl:w-1/5">
      <div className="overflow-hidden rounded-lg bg-bg-panel">
        {broken ? (
          <StripPreview frameId={f.id} mode="sheet" scale={0.3} alt={f.name.en} />
        ) : (
          <img src={f.mockup} alt={f.name.en} loading="lazy" decoding="async" className="block h-auto w-full" onError={() => setBroken(true)} />
        )}
      </div>
      <Tx {...f.name} as="p" role="subhead" className="mt-12 text-text-pri" />
      <p className="t-caption mt-4 text-text-meta">
        <Bi inline en={`${f.cuts} cuts`} ko={`${f.cuts}컷`} />
      </p>
    </li>
  )
}

export function FrameCarousel({ label }) {
  return (
    <ul tabIndex={0} aria-label={label} className="flex snap-x gap-12 overflow-x-auto pb-16 md:gap-24" style={{ scrollbarWidth: 'none' }}>
      {FRAMES.map((f) => (
        <Card key={f.id} f={f} />
      ))}
    </ul>
  )
}
