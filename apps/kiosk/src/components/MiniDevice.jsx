import { cx } from '@urbanedge/ds'
import { LEDS, LENS, MONITOR, READER, TRAY } from '../device/geometry.js'

// MiniDevice: 온보딩 팁 안에 들어가는 기기 정면 축소도. 비율은 device/geometry.js의 실측값을 그대로 쓴다(본체 폭 100, 문 위 트레이까지).
// focus가 가리키는 부품(camera 렌즈, card 단말기)만 노랑으로 칠하고 링을 두른다.
const H = 116
export function MiniDevice({ focus, className, width = 240 }) {
  const lens = focus === 'camera'
  const card = focus === 'card'
  return (
    <svg viewBox={`0 0 100 ${H}`} width={width} height={(width * H) / 100} className={cx('block', className)} aria-hidden="true">
      <rect x="0" y="0" width="100" height={H} rx="4" className="fill-text-pri" />
      {LEDS.map((l) => (
        <rect key={l.id} x={l.x} y={l.y} width={l.w} height={l.h} rx="1" className="fill-white" />
      ))}
      <rect x={MONITOR.x} y={MONITOR.y} width={MONITOR.w} height={MONITOR.h} rx="1.2" className="fill-bg-base" />
      <rect x={MONITOR.x + 3} y={MONITOR.y + 3} width={MONITOR.w * 0.42} height="3.2" rx="1" className="fill-bg-raised" />
      <circle cx={LENS.cx} cy={LENS.cy} r={LENS.d / 2} className={lens ? 'fill-yellow' : 'fill-bg-base'} />
      <circle cx={LENS.cx} cy={LENS.cy} r={LENS.d / 5} className={lens ? 'fill-bg-base' : 'fill-bg-raised'} />
      <rect x={READER.x} y={READER.y} width={READER.w} height={READER.h} rx="1.2" className={card ? 'fill-yellow' : 'fill-bg-base'} />
      <rect x={READER.x + 3} y={READER.y + 3} width={READER.w - 6} height="2" rx="1" className={card ? 'fill-bg-base' : 'fill-bg-raised'} />
      <rect x="4.1" y="86" width="91.8" height={H - 86} className="fill-text-sec" />
      <rect x={TRAY.x} y={TRAY.y} width={TRAY.w} height={H - TRAY.y} className="fill-white" />
      {lens ? <circle cx={LENS.cx} cy={LENS.cy} r={LENS.d / 2 + 3.2} className="k-pulse fill-none stroke-yellow" strokeWidth="1.6" /> : null}
      {card ? <rect x={READER.x - 2.4} y={READER.y - 2.4} width={READER.w + 4.8} height={READER.h + 4.8} rx="2.4" className="k-pulse fill-none stroke-yellow" strokeWidth="1.6" /> : null}
    </svg>
  )
}
