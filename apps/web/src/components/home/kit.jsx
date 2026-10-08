import { lazy, useState } from 'react'
import * as DS from '@urbanedge/ds'
import { IslandFallback, ShareSheetFallback, StationSignFallback, TrainTrackFallback } from './fallbacks.jsx'
import { markShared } from './rewards.js'

// kit.jsx: 작업 M(지하철 키트), B(공유), T(장면), G(지도)의 컴포넌트를 계약 시그니처로 가져온다.
// 계약 스텁(`function X() { return null }`)이면 이 폴더의 대체 구현으로 자동 전환되고, 실제 구현이 들어오면 그대로 쓴다.
export const isStub = (C) => {
  if (!C) return true
  if (typeof C !== 'function') return false
  return /^function\s*[\w$]*\(\s*\)\s*\{\s*return\s+null;?\s*\}$/.test(String(C).trim())
}
const pickImpl = (real, fallback) => (isStub(real) ? fallback : real)

export const LiveIsland = pickImpl(DS.LiveIsland, IslandFallback)
export const TrainTrack = pickImpl(DS.TrainTrack, TrainTrackFallback)
export const StationSign = pickImpl(DS.StationSign, StationSignFallback)
export const ShareSheet = pickImpl(DS.ShareSheet, ShareSheetFallback)
export const USING = {
  liveIsland: !isStub(DS.LiveIsland),
  trainTrack: !isStub(DS.TrainTrack),
  stationSign: !isStub(DS.StationSign),
  share: !isStub(DS.ShareSheet),
}

// 무거운 패키지는 필요할 때만 불러온다. 스텁이면 fallback을 쓴다.
export const lazyReal = (loader, name, Fallback) =>
  lazy(async () => {
    try {
      const m = await loader()
      const C = m[name]
      return { default: isStub(C) ? Fallback : C }
    } catch {
      return { default: Fallback }
    }
  })

// 공유 행동: 우리 ShareSheet를 열고, 닫으면 공유한 것으로 본다(정직 시스템). 쿠폰 잠금 해제가 이 값을 쓴다.
export function useShare({ url, title, text, image } = {}) {
  const [open, setOpen] = useState(false)
  const sheet = (
    <ShareSheet
      open={open}
      onClose={() => {
        setOpen(false)
        markShared()
      }}
      url={url || (typeof window !== 'undefined' ? window.location.origin : '')}
      title={title}
      text={text}
      image={image}
    />
  )
  return { open: () => setOpen(true), sheet }
}
