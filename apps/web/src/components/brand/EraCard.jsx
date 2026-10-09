import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, cx } from '@urbanedge/ds'
import { LINE_BG, LINE_TEXT } from '../../data/site.js'
import { ERA } from '../../data/story.js'
import { usePick } from '../../i18n/index.jsx'
import { B } from '../../layout/B.jsx'
import { Photo } from '../home/parts.jsx'

// 시간의 승강장 타임라인 한 칸. 모바일은 왼쪽 세로 레일, 넓은 화면은 위쪽 가로 레일에 방 색 점을 찍는다.
export default function EraCard({ room }) {
  const pick = usePick()
  const e = ERA[room.id]
  if (!e) return null
  return (
    <li className="relative border-l-4 border-white/25 pb-40 pl-24 last:pb-0 md:border-l-0 md:pb-0 md:pl-0 md:pr-24 md:last:pr-0">
      <span aria-hidden="true" className={cx('absolute -left-[14px] top-0 size-24 rounded-pill ring-4 ring-bg-base md:hidden', LINE_BG[room.color])} />
      <div aria-hidden="true" className="relative mb-24 hidden h-24 md:block">
        <span className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 bg-white/25" />
        <span className={cx('absolute left-0 top-0 size-24 rounded-pill ring-4 ring-bg-base', LINE_BG[room.color])} />
      </div>
      <p className="t-label text-text-meta"><B v={e.line} inline /></p>
      <p className={cx('t-title mt-8', LINE_TEXT[room.color])}><B v={e.year} inline /></p>
      <h3 className="t-subhead mt-4 text-text-pri"><B v={room.title} inline /></h3>
      <Photo src={room.photo.src} alt={pick(room.photo.alt)} ratio="4 / 3" className="mt-16 rounded-lg" sizes="(min-width: 768px) 33vw, 100vw" />
      <p className="t-strong mt-16 text-text-pri"><B v={e.concept} /></p>
      <p className="t-body mt-8 text-text-sec"><B v={e.experience} /></p>
      <Button as={Link} to={`/rooms/${room.id}`} variant="dark" size="md" className="mt-16">
        {pick({ en: 'View room', ko: '방 보기' })}
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </li>
  )
}
