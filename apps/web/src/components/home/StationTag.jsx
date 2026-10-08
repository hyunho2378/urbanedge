import { cx } from '@urbanedge/ds'
import { LINE_BG, LINE_ON, STATION } from '../../data/site.js'
import { B } from '../../layout/B.jsx'

// 작은 역명 태그: 노란 코드 배지 + 역명. 모바일과 사진 위에 올리는 용도다(ds StationSign은 큰 표지판이다).
// room을 주면 오른쪽에 승강장 번호 배지를 붙인다.
export default function StationTag({ room, className }) {
  return (
    <span className={cx('inline-flex items-center gap-8 rounded-pill bg-white py-4 pl-4 pr-16 text-bg-base shadow-lift', className)}>
      <span className="grid h-32 shrink-0 place-items-center rounded-pill bg-yellow px-10 font-label text-body-sm font-bold text-text-onYellow">{STATION.code}</span>
      <span className="t-strong leading-tight"><B v={STATION.name} inline /></span>
      {room && (
        <span aria-hidden="true" className={cx('ml-4 grid size-32 shrink-0 place-items-center rounded-pill font-label text-body-sm font-bold', LINE_BG[room.color], LINE_ON[room.color])}>{room.platform}</span>
      )}
    </span>
  )
}
