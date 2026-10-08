import { Globe } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from './lang.jsx'
import { COPY } from '../flow/copy.js'
import { PLATFORM_BG, roomById } from '../flow/rooms.js'

// TopRail: 화면 위 길찾기 구조. 지하철 역명판처럼 왼쪽에 승강장 번호 배지와 지금 정거장, 오른쪽에 다음 정거장과 언어 버튼,
// 아래에 노선 한 줄(정거장 점과 진행)이 있다. 장식이 아니라 "지금 어디이고 다음은 무엇인지"를 알리는 표지다.
// 언어 버튼은 반대 언어 이름을 같은 칸에 겹쳐 그려 한영을 바꿔도 폭이 변하지 않는다.
export function TopRail({ ctrl, showLang = true }) {
  const t = useT()
  const { step, steps } = ctrl
  const room = roomById(ctrl.room)
  const stops = steps.slice(1)
  const i = Math.max(0, stops.findIndex((s) => s.id === step))
  const cur = stops[i]
  const nxt = stops[i + 1]
  const span = 1680
  const gap = span / (stops.length - 1)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-header" style={{ height: 176 }}>
      <div className="absolute flex items-center gap-24" style={{ left: 120, top: 36 }}>
        <span className={cx('grid shrink-0 place-items-center rounded-pill font-label', PLATFORM_BG[room.color])} style={{ width: 88, height: 88, fontSize: 48, fontWeight: 600 }} aria-hidden="true">
          {room.n}
        </span>
        <span className="block">
          <T n={COPY.rail.where} v={{ n: room.n, platform: room.title }} as="span" className="kt-caption block text-text-meta" />
          <T n={cur.label} as="span" className="kt-strong block" />
        </span>
      </div>

      <div className="absolute flex items-center gap-40" style={{ right: 120, top: 24, height: 120 }}>
        <span className="block text-right">
          <T n={COPY.rail.next} as="span" className="kt-caption block text-text-meta" />
          <T n={nxt ? nxt.label : COPY.rail.last} as="span" className="kt-strong block" />
        </span>
        {showLang ? (
          <button
            type="button"
            onClick={() => ctrl.setLang(ctrl.lang === 'ko' ? 'en' : 'ko')}
            aria-label={t(COPY.rail.langLabel)}
            className="ue-press pointer-events-auto flex items-center gap-16 rounded-pill bg-bg-panel px-32 text-text-pri transition-[transform,background-color] duration-fast ease-out"
            style={{ height: 120 }}
          >
            <Globe size={36} strokeWidth={2} aria-hidden="true" />
            <T n={COPY.rail.lang} as="span" className="kt-strong" />
          </button>
        ) : null}
      </div>

      {/* 노선 한 줄: 지나온 구간은 노랑, 남은 구간은 옅은 선. 정거장 점은 단계 수만큼 있다. */}
      <div className="absolute" style={{ left: 120, top: 166, width: span, height: 4 }} aria-hidden="true">
        <div className="k-line absolute inset-0 rounded-pill" />
        <div className="absolute inset-y-0 left-0 origin-left rounded-pill bg-yellow transition-transform duration-slow ease-out" style={{ width: span, transform: `scaleX(${i / (stops.length - 1)})` }} />
        {stops.map((s, k) => {
          const on = k === i
          const d = on ? 24 : 12
          return <span key={s.id} className={cx('absolute rounded-pill', k <= i ? 'bg-yellow' : 'bg-bg-raised', on && 'ring-8 ring-bg-base')} style={{ left: k * gap - d / 2, top: 2 - d / 2, width: d, height: d }} />
        })}
      </div>
      <p className="sr-only" role="status">
        {t(COPY.rail.status, { n: i + 1, total: stops.length, name: cur.label })}
      </p>
    </div>
  )
}
