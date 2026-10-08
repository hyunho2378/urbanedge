import { useId } from 'react'
import { usePick } from '../../i18n/index.jsx'

// 기기 도식(현장 사진 기준): 흰색 본체, 상단 안내문, 가운데 가로형 모니터와 양옆 LED 바,
// 모니터 아래 렌즈, 렌즈 아래 오른쪽 카드 단말기(초록 LED), 하단 캐비닛 문, 인화 출구 슬롯과 트레이.
// 색은 전부 토큰 클래스이고 비율은 도식용이다.
const COPY = {
  title: { ko: '어반엣지 기기 도식', en: 'UrbanEdge machine diagram' },
  desc: {
    ko: '흰색 기기 가운데에 가로형 모니터가 있고 모니터 아래에 렌즈, 렌즈 아래 오른쪽에 카드 단말기, 맨 아래에 인화 출구가 있다.',
    en: 'A white machine with a landscape monitor in the middle, the lens below the monitor, a card terminal below the lens on the right, and the print slot at the bottom.',
  },
  start: { ko: 'TOUCH TO START', en: 'TOUCH TO START' },
}

function Marker({ x, y, n }) {
  return (
    <g>
      <circle cx={x} cy={y} r="13" className="fill-yellow stroke-bg-base" strokeWidth="2" />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" className="fill-text-onYellow font-label">
        {n}
      </text>
    </g>
  )
}

export default function DeviceDiagram({ className }) {
  const pick = usePick()
  const id = useId()
  return (
    <svg viewBox="0 0 400 610" role="img" aria-labelledby={`${id}-t ${id}-d`} className={className}>
      <title id={`${id}-t`}>{pick(COPY.title)}</title>
      <desc id={`${id}-d`}>{pick(COPY.desc)}</desc>

      {/* 본체 */}
      <rect x="50" y="8" width="300" height="594" rx="22" className="fill-white" />
      {/* 상단 안내문 두 장 */}
      <rect x="82" y="26" width="56" height="38" rx="3" className="fill-bg-raised" />
      <rect x="262" y="26" width="56" height="38" rx="3" className="fill-bg-raised" />
      {/* 모니터와 LED 바 */}
      <rect x="62" y="88" width="9" height="150" rx="4" className="fill-text-meta" />
      <rect x="329" y="88" width="9" height="150" rx="4" className="fill-text-meta" />
      <rect x="80" y="82" width="240" height="162" rx="8" className="fill-bg-base" />
      <rect x="88" y="90" width="224" height="146" rx="4" className="fill-bg-panel" />
      <text x="200" y="163" textAnchor="middle" dominantBaseline="central" fontSize="17" letterSpacing="3" className="fill-yellow font-label" fontWeight="600">
        {pick(COPY.start)}
      </text>
      {/* 렌즈(모니터 아래): 강조 링과 퍼지는 링 */}
      <circle
        cx="200" cy="270" r="14" fill="none" strokeWidth="3"
        className="animate-ring-out stroke-yellow"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
      <circle cx="200" cy="270" r="21" fill="none" strokeWidth="3" className="stroke-yellow" />
      <circle cx="200" cy="270" r="11" className="fill-bg-base" />
      <circle cx="200" cy="270" r="4" className="fill-line-blue" />
      {/* 카드 단말기(렌즈 아래 오른쪽, 초록 LED) */}
      <rect x="236" y="302" width="66" height="50" rx="6" className="fill-bg-panel" />
      <rect x="244" y="312" width="38" height="14" rx="2" className="fill-bg-base" />
      <circle cx="292" cy="312" r="3.5" className="fill-state-success" />
      {/* 하단 캐비닛 문과 안내 스티커 */}
      <rect x="80" y="372" width="240" height="150" rx="6" fill="none" strokeWidth="2" className="stroke-text-meta" />
      <rect x="98" y="390" width="72" height="44" rx="3" className="fill-yellow" />
      <rect x="298" y="432" width="7" height="34" rx="3" className="fill-text-meta" />
      {/* 인화 출구 슬롯과 흰색 트레이 */}
      <rect x="138" y="540" width="124" height="9" rx="4" className="fill-bg-base" />
      <path d="M128 552 H272 L282 590 H118 Z" className="fill-white stroke-text-meta" strokeWidth="2" strokeLinejoin="round" />

      {/* 번호 표시: 오른쪽 목록과 대응 */}
      <line x1="163" y1="270" x2="179" y2="270" strokeWidth="2" className="stroke-bg-base" />
      <Marker x="148" y="270" n="1" />
      <line x1="218" y1="327" x2="236" y2="327" strokeWidth="2" className="stroke-bg-base" />
      <Marker x="204" y="327" n="2" />
      <line x1="120" y1="544" x2="138" y2="544" strokeWidth="2" className="stroke-bg-base" />
      <Marker x="106" y="544" n="3" />
    </svg>
  )
}
