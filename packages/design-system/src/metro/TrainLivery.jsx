import { useId } from 'react'
import { cx } from '../components/cx.js'
import { useReducedMotion } from './hooks.js'
import { TrainCars, trainWidth, VB_TOP, VB_H } from './art/TrainSide.jsx'

// 한국 전동차 옆모습(art/TrainSide.jsx). 흰 스테인리스 차체, 노선색 띠, 검은 경사 앞유리, 고무 문틀, 좌석이 비치는 창,
// 지붕 냉방기와 팬터그래프, 대차와 바퀴, 차간 주름 통로, UE 심볼 래핑.
// cars: 1에서 4(최대 8). doorsOpen이면 문짝이 벽 속으로 들어가고 실내 조명이 따뜻해진다(감속 모션이면 즉시).
// headed: 'right' | 'left' 진행 방향. stripe가 있으면 띠 색만 바꾼다. destination은 측면 행선 표시기 문자.
export function TrainLivery({
  cars = 3,
  color = 'yellow',
  stripe,
  lineCode = 'H',
  lineName = 'Hwangnidan Line',
  headed = 'right',
  doorsOpen = false,
  destination = 'GY-01',
  number = 1101,
  supergraphic = false,
  rail = true,
  className,
  title,
}) {
  const uid = `tl${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const reduced = useReducedMotion()
  const n = Math.max(1, Math.min(8, cars))
  const W = trainWidth(n)
  const pad = 22
  return (
    <svg
      viewBox={`${-pad} ${VB_TOP} ${W + pad * 2} ${VB_H}`}
      className={cx('block h-auto w-full', className)}
      role="img"
      aria-label={title || `${lineName} train`}
      data-line={lineCode}
    >
      <TrainCars uid={uid} n={n} color={stripe || color} doorsOpen={doorsOpen} reduced={reduced} dest={destination} number={number} supergraphic={supergraphic} rail={rail} flip={headed === 'left'} />
    </svg>
  )
}
