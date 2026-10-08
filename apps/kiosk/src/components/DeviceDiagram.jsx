import { cx } from '@urbanedge/ds'

// 기기 정면 도식(안내용 단순화). 흰색 본체, 모니터, 양옆 조명바, 모니터 아래 렌즈, 카드 단말기, 하단 캐비닛, 출구 슬롯과 흰색 트레이.
// highlight: 'camera' | 'slot' | null. callouts는 오른쪽에 선과 라벨로 붙는다.
const POS = { monitor: 27.6, lens: 52.4, card: 64, slot: 95 }
const PULSE = { transformBox: 'fill-box', transformOrigin: 'center' }

export function DeviceDiagram({ highlight, callouts = [], className }) {
  return (
    <div className={cx('relative', className)}>
      <svg viewBox="0 0 520 760" className="block h-full w-full" aria-hidden="true">
        <rect x="20" y="20" width="480" height="720" rx="28" className="fill-text-pri" />
        <rect x="38" y="96" width="22" height="236" rx="6" className="fill-white stroke-bg-raised" strokeWidth="2" />
        <rect x="460" y="96" width="22" height="236" rx="6" className="fill-white stroke-bg-raised" strokeWidth="2" />
        <rect x="84" y="88" width="352" height="244" rx="10" className="fill-bg-base" />
        <rect x="92" y="96" width="336" height="28" rx="4" className="fill-yellow" />
        <rect x="124" y="176" width="272" height="16" rx="8" className="fill-bg-raised" />
        <rect x="168" y="210" width="184" height="16" rx="8" className="fill-bg-raised" />
        <rect x="150" y="262" width="96" height="40" rx="8" className="fill-yellow" opacity="0.9" />
        <rect x="274" y="262" width="96" height="40" rx="8" className="fill-bg-raised" />
        <circle cx="260" cy="398" r="36" className="fill-bg-base" />
        <circle cx="260" cy="398" r="23" className="fill-bg-panel" />
        <circle cx="260" cy="398" r="8" className="fill-bg-raised" />
        <rect x="352" y="468" width="112" height="46" rx="10" className="fill-bg-base" />
        <rect x="374" y="486" width="68" height="7" rx="3.5" className="fill-state-success" />
        <rect x="44" y="548" width="432" height="132" rx="12" className="fill-none stroke-text-meta" strokeWidth="3" />
        <rect x="150" y="698" width="220" height="14" rx="7" className="fill-bg-base" />
        <rect x="126" y="712" width="268" height="28" rx="6" className="fill-text-sec stroke-bg-raised" strokeWidth="2" />
        {highlight === 'camera' && (
          <g>
            <circle cx="260" cy="398" r="52" className="fill-none stroke-yellow" strokeWidth="5" />
            <circle cx="260" cy="398" r="52" className="animate-ring-out fill-none stroke-yellow" strokeWidth="4" style={PULSE} />
          </g>
        )}
        {highlight === 'slot' && (
          <g>
            <rect x="110" y="686" width="300" height="62" rx="14" className="fill-none stroke-yellow" strokeWidth="5" />
            <rect x="110" y="686" width="300" height="62" rx="14" className="animate-ring-out fill-none stroke-yellow" strokeWidth="4" style={PULSE} />
          </g>
        )}
      </svg>
      {callouts.map((c) => (
        <div key={c.at} className="absolute left-full flex -translate-y-1/2 items-center" style={{ top: `${POS[c.at]}%` }}>
          <span className={cx('block h-4 w-48', c.tone === 'quiet' ? 'bg-hairlineStrong' : 'bg-yellow')} />
          <span
            className={cx(
              'whitespace-nowrap rounded-md border px-20 py-12 font-ui text-k-label font-bold',
              c.tone === 'quiet' ? 'border-hairlineStrong text-text-sec' : 'border-yellow bg-tint text-yellow',
            )}
          >
            {c.text}
          </span>
        </div>
      ))}
    </div>
  )
}
