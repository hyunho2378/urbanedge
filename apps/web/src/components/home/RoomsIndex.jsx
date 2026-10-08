import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button, LineBadge, Reveal, cx } from '@urbanedge/ds'
import { LINE_BG, LINE_TEXT, ROOMS } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { T } from '../../layout/type.js'
import { Photo, Section, SectionHead } from './parts.jsx'

const COPY = {
  label: { ko: '포토 룸 5곳', en: 'Five photo rooms' },
  title: { ko: 'L1부터 L5까지, 노선처럼 이어지는 방', en: 'Five rooms on one line, L1 to L5' },
  desc: {
    ko: '방마다 배경과 소품이 달라서 찍고 싶은 장면에 맞춰 고른다.',
    en: 'Each room has its own backdrop and props, so you can pick the one that fits the shot you want.',
  },
  view: { ko: '방 자세히 보기', en: 'View room' },
  all: { ko: '포토 룸 전체 보기', en: 'See all rooms' },
  list: { ko: '포토 룸 노선도', en: 'Photo room line map' },
}

// 노선도형 목록: 노선 색 선이 정거장(방)을 잇는다. 데스크톱은 목록 위에 올리거나 포커스하면 오른쪽 사진이 바뀌고,
// 모바일과 태블릿은 정거장마다 사진 카드가 붙는다.
export default function RoomsIndex() {
  const pick = usePick()
  const [active, setActive] = useState(0)
  const cur = ROOMS[active]

  return (
    <Section id="rooms" labelledBy="rooms-title" tone="elev">
      <SectionHead index={2} label={COPY.label} titleId="rooms-title" title={COPY.title} desc={COPY.desc} />

      <div className="grid gap-48 lg:grid-cols-12 lg:gap-x-64">
        <ol aria-label={pick(COPY.list)} className="lg:col-span-7">
          {ROOMS.map((r, i) => {
            const last = i === ROOMS.length - 1
            return (
              <Reveal as="li" key={r.id} delay={i * 60} className="relative">
                {!last && (
                  <span
                    aria-hidden="true"
                    className={cx('absolute bottom-0 left-28 top-56 w-8 -translate-x-1/2 rounded-pill', LINE_BG[r.color])}
                  />
                )}
                <Link
                  to={`/rooms/${r.id}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={cx('group flex gap-24 pb-40 lg:gap-32', last && 'pb-0')}
                >
                  <LineBadge code={r.code} color={r.color} size="lg" className="relative z-10 ring-8 ring-bg-elev" />
                  <span className="min-w-0 flex-1">
                    <span className={cx(T.label, 'block transition-colors duration-fast ease-out', active === i ? LINE_TEXT[r.color] : 'text-text-meta')}>
                      {r.name}
                    </span>
                    <span className="mt-4 flex items-center justify-between gap-16">
                      <span
                        className={cx(
                          T.h3,
                          'block transition-colors duration-fast ease-out',
                          active === i ? 'text-text-pri' : 'text-text-sec group-hover:text-text-pri',
                        )}
                      >
                        {pick(r.title)}
                      </span>
                      <ArrowRight
                        size={24}
                        aria-hidden="true"
                        className={cx(
                          'shrink-0 transition-transform duration-base ease-out group-hover:translate-x-8',
                          active === i ? 'text-yellow' : 'text-text-meta',
                        )}
                      />
                    </span>
                    <span className={`${T.body} mt-8 block max-w-read text-text-sec`}>{pick(r.summary)}</span>
                    <Photo
                      src={r.photo.src}
                      alt={pick(r.photo.alt)}
                      ratio="4 / 3"
                      className="mt-20 lg:hidden"
                    />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </ol>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky" style={{ top: 'calc(var(--ue-header-h) + 32px)' }}>
            <div className="relative overflow-hidden rounded-lg bg-bg-panel" style={{ aspectRatio: '4 / 5' }}>
              {ROOMS.map((r, i) => (
                <img
                  key={r.id}
                  src={r.photo.src}
                  alt={active === i ? pick(r.photo.alt) : ''}
                  aria-hidden={active === i ? undefined : true}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable="false"
                  className={cx(
                    'absolute inset-0 size-full object-cover transition-opacity duration-slow ease-out',
                    active === i ? 'opacity-100' : 'opacity-0',
                  )}
                />
              ))}
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-160 bg-gradient-to-t from-bg-base/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-16 p-24">
                <div className="flex items-center gap-16">
                  <LineBadge code={cur.code} color={cur.color} size="lg" />
                  <div>
                    <p className={`${T.label} text-text-pri`}>{cur.name}</p>
                    <p className={`${T.h4} text-text-pri`}>{pick(cur.title)}</p>
                  </div>
                </div>
              </div>
            </div>
            <Button as={Link} to={`/rooms/${cur.id}`} variant="outline" size="lg" className="mt-24 text-body">
              {pick(COPY.view)}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <Reveal className="mt-48 lg:mt-72">
        <Button as={Link} to="/rooms" size="lg" className="text-body">
          {pick(COPY.all)}
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </Reveal>
    </Section>
  )
}
