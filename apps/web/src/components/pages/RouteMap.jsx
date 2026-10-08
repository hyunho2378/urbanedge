import { Link } from 'react-router-dom'
import { LineBadge, Reveal, cx } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'
import { LINE_BG, LINE_BORDER } from './content.js'

// 노선도형 인덱스. 5개 방을 노선 색 선과 정거장 점으로 잇는다.
// 모바일은 세로, lg 이상은 가로로 이어지며 정거장이 곧 방 상세 링크다.
export function RouteMap({ rooms, activeId, label, compact = false, tail }) {
  const pick = usePick()
  const last = rooms.length - 1
  return (
    <nav aria-label={label}>
      <ol className={cx('grid gap-y-0', tail ? 'lg:grid-cols-6' : 'lg:grid-cols-5')}>
        {rooms.map((r, i) => {
          const active = r.id === activeId
          return (
            <Reveal as="li" key={r.id} delay={i * 70} className="relative">
              <Link
                to={`/rooms/${r.id}`}
                aria-current={active ? 'page' : undefined}
                className="group relative block rounded-md pb-32 pl-64 pt-8 lg:pb-0 lg:pl-0 lg:pr-16 lg:pt-72"
              >
                {/* 선과 정거장 점: 장식이므로 읽는 도구에서는 숨긴다. 선은 다음 정거장 점의 중심까지 이어진다. */}
                {(i < last || tail) && (
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute -bottom-24 left-12 top-24 w-8 lg:bottom-auto lg:left-16  lg:top-12 lg:h-8 lg:w-full',
                      LINE_BG[r.color],
                    )}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cx(
                    'absolute left-0 top-8 grid size-32 place-items-center rounded-pill border-4 transition-colors duration-base ease-out lg:top-0',
                    LINE_BORDER[r.color],
                    active ? 'bg-yellow' : 'bg-bg-base group-hover:bg-bg-raised',
                  )}
                />
                <span className="flex items-center gap-12">
                  <LineBadge code={r.code} color={r.color} />
                  <span className={cx('ue-label text-h4 4xl:text-h3', active ? 'text-yellow' : 'text-text-pri group-hover:text-yellow')}>{r.name}</span>
                </span>
                <span className="mt-8 block text-body 4xl:text-lead font-semibold text-text-pri">{pick(r.title)}</span>
                {!compact && <span className="mt-4 block max-w-read text-bodySm 4xl:text-body text-text-sec">{pick(r.tagline)}</span>}
              </Link>
            </Reveal>
          )
        })}
        {tail && (
          <li className="relative">
            <div className="relative block pb-0 pl-64 pt-8 lg:pl-0 lg:pr-16 lg:pt-72">
              <span aria-hidden="true" className="absolute left-0 top-8 size-32 rounded-pill border-4 border-dashed border-text-meta bg-bg-base lg:top-0" />
              <span className="flex items-center gap-12">
                <span className="inline-grid size-32 shrink-0 place-items-center rounded-pill border border-dashed border-text-meta font-label text-bodySm 4xl:text-body font-bold text-text-meta">?</span>
                <span className="ue-label text-h4 4xl:text-h3 text-text-pri">{tail.name}</span>
              </span>
              <span className="mt-8 block text-body 4xl:text-lead font-semibold text-text-pri">{tail.title}</span>
              {tail.body && <span className="mt-4 block max-w-read text-bodySm 4xl:text-body text-text-sec">{tail.body}</span>}
            </div>
          </li>
        )}
      </ol>
    </nav>
  )
}
