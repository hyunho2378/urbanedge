import { cx } from '@urbanedge/ds'

// 기기 정면 도식: 모니터 아래에 렌즈가 있고 그 아래 오른쪽에 카드 단말기, 하단에 인화 출구가 있다.
// 비율은 docs/reference/device 의 사진(IMG_1638, IMG_1651)에서 읽은 배치를 따른다.
// 색은 전부 토큰 클래스이고, 크기는 viewBox 단위라 화면 너비에 맞춰 함께 줄어든다.
const PARTS = ['screen', 'lens', 'card', 'slot']
const pulse = { transformBox: 'fill-box', transformOrigin: 'center' }

function Marker({ n, x, y, on }) {
  return (
    <g aria-hidden="true" className={cx('transition-opacity duration-base ease-out', on ? 'opacity-100' : 'opacity-70')}>
      <circle cx={x} cy={y} r="15" className={on ? 'fill-yellow' : 'fill-bg-raised stroke-text-meta'} strokeWidth="1.5" />
      <text x={x} y={y + 5.5} textAnchor="middle" fontSize="16" fontWeight="700" className={cx('font-label', on ? 'fill-text-onYellow' : 'fill-text-pri')}>
        {n}
      </text>
    </g>
  )
}

export function CameraDiagram({ active, onSelect, ariaLabel, className }) {
  const on = (k) => active === k
  const hot = (k) => ({ onClick: () => onSelect?.(k), className: 'cursor-pointer' })
  const ring = (k) => cx('fill-none stroke-yellow transition-opacity duration-base ease-out', on(k) ? 'opacity-100' : 'opacity-0')
  return (
    <svg viewBox="0 0 440 570" role="img" aria-label={ariaLabel} className={cx('block h-auto w-full', className)}>
      {/* 본체 */}
      <rect x="60" y="16" width="320" height="538" rx="26" className="fill-text-pri" />
      {/* 상단 안내문 두 장: 기기 이동 금지, CCTV 녹화 중 */}
      <rect x="78" y="30" width="72" height="26" rx="3" className="fill-none stroke-text-meta" strokeWidth="1.5" />
      <rect x="290" y="30" width="72" height="26" rx="3" className="fill-none stroke-text-meta" strokeWidth="1.5" />
      <line x1="86" y1="40" x2="142" y2="40" className="stroke-text-meta" strokeWidth="1.5" />
      <line x1="86" y1="47" x2="128" y2="47" className="stroke-text-meta" strokeWidth="1.5" />
      <circle cx="304" cy="43" r="7" className="fill-none stroke-line-red" strokeWidth="2" />
      <line x1="318" y1="40" x2="352" y2="40" className="stroke-text-meta" strokeWidth="1.5" />
      <line x1="318" y1="47" x2="342" y2="47" className="stroke-text-meta" strokeWidth="1.5" />

      {/* 1 모니터와 양옆 조명바 */}
      <g {...hot('screen')}>
        <rect x="84" y="86" width="14" height="52" rx="4" className="fill-white stroke-text-meta" strokeWidth="1.5" />
        <rect x="84" y="148" width="14" height="52" rx="4" className="fill-white stroke-text-meta" strokeWidth="1.5" />
        <rect x="342" y="86" width="14" height="52" rx="4" className="fill-white stroke-text-meta" strokeWidth="1.5" />
        <rect x="342" y="148" width="14" height="52" rx="4" className="fill-white stroke-text-meta" strokeWidth="1.5" />
        <rect x="108" y="76" width="224" height="134" rx="6" className="fill-bg-base" />
        <rect x="116" y="84" width="208" height="118" rx="3" className="fill-bg-panel" />
        <text x="220" y="136" textAnchor="middle" fontSize="26" fontWeight="700" className="fill-text-pri font-brand">
          UrbanEdge
        </text>
        <text x="220" y="156" textAnchor="middle" fontSize="11" letterSpacing="3" className="fill-text-sec font-label">
          METROGRAPHY
        </text>
        <rect x="100" y="70" width="240" height="146" rx="8" className={ring('screen')} strokeWidth="3" />
      </g>

      {/* 2 렌즈: 모니터 아래 가운데 */}
      <g {...hot('lens')}>
        <circle cx="220" cy="278" r="27" className="fill-bg-base" />
        <circle cx="220" cy="278" r="27" className="fill-none stroke-text-meta" strokeWidth="2" />
        <circle cx="220" cy="278" r="18" className="fill-bg-raised" />
        <circle cx="220" cy="278" r="8" className="fill-bg-panel" />
        <circle cx="213" cy="271" r="3" className="fill-text-meta" />
        <circle cx="220" cy="278" r="40" className={ring('lens')} strokeWidth="3" />
        {on('lens') && (
          <circle cx="220" cy="278" r="30" style={pulse} className="animate-ring-out fill-none stroke-yellow motion-reduce:animate-none" strokeWidth="3" />
        )}
      </g>
      {/* 시선: 모니터 중앙에서 렌즈로 내려오는 화살표 */}
      <g aria-hidden="true" className={cx('transition-opacity duration-base ease-out', on('lens') ? 'opacity-100' : 'opacity-0')}>
        <path d="M220 222 V 236" className="fill-none stroke-yellow" strokeWidth="3" strokeDasharray="4 5" strokeLinecap="round" />
        <path d="M212 232 L220 242 L228 232" className="fill-none stroke-yellow" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 3 카드 단말기: 렌즈 아래 오른쪽, 초록 LED */}
      <g {...hot('card')}>
        <rect x="286" y="318" width="86" height="38" rx="7" className="fill-bg-base" />
        <rect x="302" y="334" width="40" height="5" rx="2.5" className="fill-state-success" />
        <rect x="294" y="326" width="70" height="3" rx="1.5" className="fill-bg-raised" />
        <rect x="280" y="312" width="98" height="50" rx="10" className={ring('card')} strokeWidth="3" />
      </g>

      {/* 하단 캐비닛 문 */}
      <rect x="84" y="384" width="272" height="150" rx="12" className="fill-none stroke-text-meta" strokeWidth="2" />
      <rect x="96" y="424" width="9" height="40" rx="4.5" className="fill-text-meta" />
      <rect x="102" y="396" width="42" height="18" rx="2" className="fill-none stroke-text-meta" strokeWidth="1.5" />
      <rect x="298" y="396" width="42" height="12" rx="2" className="fill-bg-base" />

      {/* 4 인화 출구와 흰색 트레이: 문 가운데에서 살짝 오른쪽 */}
      <g {...hot('slot')}>
        <path d="M168 466 H 276 L 288 514 H 156 Z" className="fill-white stroke-text-meta" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="164" y="454" width="116" height="12" rx="6" className="fill-bg-base" />
        <rect x="148" y="444" width="144" height="80" rx="12" className={ring('slot')} strokeWidth="3" />
      </g>

      <Marker n="1" x={98} y={74} on={on('screen')} />
      <Marker n="2" x={180} y={250} on={on('lens')} />
      <Marker n="3" x={378} y={316} on={on('card')} />
      <Marker n="4" x={140} y={450} on={on('slot')} />
    </svg>
  )
}

export const CAMERA_PARTS = PARTS
