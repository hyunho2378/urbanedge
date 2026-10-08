import { useId } from 'react'
import { UE_MARK_PATH } from '@urbanedge/brand'
import { cx } from '@urbanedge/ds'

// Gyeongju Metro 열차. 서울 지하철 장난감 열차를 참고한 흰색 차체, 노란 띠, 둥근 앞머리, 문 두 짝.
// doors 0..1: 문이 열리는 정도(transform으로 밀린다). 색은 토큰 클래스만 쓴다.
export default function TrainSvg({ className, doors = 0, title = 'Gyeongju Metro train' }) {
  const id = useId()
  return (
    <svg viewBox="0 0 720 180" role="img" aria-labelledby={`${id}-t`} className={cx('block h-auto w-full', className)}>
      <title id={`${id}-t`}>{title}</title>
      <rect x="6" y="14" width="708" height="122" rx="30" className="fill-white" />
      <rect x="6" y="78" width="708" height="22" className="fill-yellow" />
      <rect x="6" y="22" width="708" height="6" className="fill-bg-raised" opacity="0.18" />
      {[56, 190, 324, 458].map((x) => (
        <rect key={x} x={x} y="38" width="92" height="34" rx="8" className="fill-bg-base" />
      ))}
      {/* 문 두 짝 */}
      {[262, 396].map((x, i) => (
        <g key={x}>
          <rect x={x - 6} y="30" width="92" height="98" rx="4" className="fill-bg-raised" opacity="0.22" />
          <g style={{ transform: `translateX(${(i ? 1 : -1) * doors * 20}px)`, transition: 'transform 600ms var(--ue-ease-out)' }}>
            <rect x={x} y="34" width="38" height="90" rx="3" className="fill-white" />
            <rect x={x + 42} y="34" width="38" height="90" rx="3" className="fill-white" />
            <rect x={x + 6} y="44" width="26" height="30" rx="4" className="fill-bg-base" />
            <rect x={x + 48} y="44" width="26" height="30" rx="4" className="fill-bg-base" />
          </g>
        </g>
      ))}
      <rect x="650" y="36" width="52" height="40" rx="12" className="fill-bg-base" />
      <circle cx="28" cy="60" r="9" className="fill-yellow" />
      {/* 노선 배지와 UE 심볼 */}
      <circle cx="118" cy="110" r="14" className="fill-yellow" />
      <text x="118" y="111" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="800" className="fill-bg-base font-label">GY</text>
      <path d={UE_MARK_PATH} transform="translate(140 99) scale(0.082)" fillRule="evenodd" className="fill-bg-base" />
      <rect x="40" y="136" width="640" height="14" rx="4" className="fill-bg-raised" />
      {[110, 220, 500, 610].map((x) => (
        <circle key={x} cx={x} cy="154" r="12" className="fill-bg-raised" />
      ))}
    </svg>
  )
}
