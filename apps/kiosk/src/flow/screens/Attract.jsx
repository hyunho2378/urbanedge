import { Hand } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { T, useT } from '../../components/lang.jsx'
import { StripView } from '../../components/StripView.jsx'
import { COPY } from '../copy.js'
import { PLATFORM_BG, roomById } from '../rooms.js'
import { frameById } from '../prints.js'

// 1. attract v3: 초점은 실제 인화물 한 장. 왼쪽에 역명판(승강장 배지), 환영 문구 한 줄, 시작 알약. 화면 어디를 눌러도 시작한다.
// 움직이는 띠와 흐르는 사진 열은 없다. 아주 작은 Imaginary Metro 고지만 왼쪽 아래에 둔다.
export default function Attract({ ctrl }) {
  const t = useT()
  const room = roomById(ctrl.room)
  const frame = frameById('signature') || frameById('classic-white')
  return (
    <div className="absolute inset-0 bg-bg-base">
      <button type="button" onClick={ctrl.next} className="absolute inset-0 z-10 h-full w-full cursor-pointer" aria-label={`${t(COPY.attract.touch)}. ${t(COPY.attract.title)}`} />

      <div className="absolute flex flex-col justify-center" style={{ left: 120, top: 0, bottom: 0, width: 900 }}>
        <div className="flex items-center gap-24">
          <span className={cx('grid shrink-0 place-items-center rounded-pill font-label', PLATFORM_BG[room.color])} style={{ width: 96, height: 96, fontSize: 52, fontWeight: 600 }} aria-hidden="true">
            {room.n}
          </span>
          <span className="block">
            <T n={COPY.common.platformN} v={{ n: room.n }} as="span" className="kt-strong block" />
          </span>
          <T n={room.title} as="span" className="kt-strong text-text-sec" />
        </div>
        <T n={COPY.attract.title} as="h1" className="kt-title mt-56" />
        <T n={COPY.attract.sub} as="p" className="kt-lead mt-32 text-text-sec" />
        <div className="mt-64 inline-flex items-center gap-16 self-start rounded-pill bg-yellow px-56 text-text-onYellow" style={{ height: 120 }}>
          <Hand size={44} strokeWidth={2.2} aria-hidden="true" />
          <T n={COPY.attract.touch} as="span" className="kt-btn" />
        </div>
      </div>

      {frame ? (
        <div className="absolute" style={{ right: 140, top: 90, transform: 'rotate(3deg)' }} aria-hidden="true">
          <StripView frame={frame} date={ctrl.date} roomId={ctrl.room} height={900} scale={0.75} className="k-lift" />
        </div>
      ) : null}

      <div className="absolute" style={{ left: 120, bottom: 56 }}>
      </div>
    </div>
  )
}
