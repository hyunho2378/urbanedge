import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Expand } from 'lucide-react'
import { Reveal, Tag, cx } from '@urbanedge/ds'
import { usePick } from '../i18n/index.jsx'
import { SITE } from '../data/site.js'
import { PageHero } from '../components/pages/PageHero.jsx'
import { Section } from '../components/pages/Section.jsx'
import { PhotoTile } from '../components/pages/PhotoTile.jsx'
import { Lightbox } from '../components/pages/Lightbox.jsx'
import { RoomNav } from '../components/pages/RoomNav.jsx'
import { RouteMap } from '../components/pages/RouteMap.jsx'
import { ROOM_LIST, LINE_BG, findRoom } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'
import NotFound from './NotFound.jsx'

const BADGE_TEXT = { yellow: 'text-text-onYellow', red: 'text-text-pri', blue: 'text-text-pri', green: 'text-text-onYellow' }

const T = {
  rooms: { ko: '포토 룸', en: 'Photo Rooms' },
  aboutLabel: { ko: '방 소개', en: 'ABOUT THE ROOM' },
  aboutTitle: { ko: '이 방에서 찍는 장면', en: 'The scene you shoot here' },
  factLine: { ko: '노선', en: 'Line' },
  factKiosk: { ko: '키오스크', en: 'Kiosk' },
  factKioskV: { ko: '이 방에 따로 있음', en: 'One in this room' },
  factHours: { ko: '운영 시간', en: 'Hours' },
  factProps: { ko: '소품과 배경', en: 'Props and set' },
  hoursV: { ko: `${SITE.hours.open}에서 ${SITE.hours.close}까지`, en: `${SITE.hours.open} to ${SITE.hours.close}` },
  zoom: { ko: '크게 보기', en: 'View larger' },
  poseLabel: { ko: '포즈 제안', en: 'POSE IDEAS' },
  poseTitle: { ko: '이 방에서 해 볼 포즈 세 가지', en: 'Three poses to try in this room' },
  poseIntro: {
    ko: '방에 놓인 소품을 기준으로 정했으며, 컷마다 하나씩 바꿔 보면 서로 다른 사진이 나온다.',
    en: 'Each idea is built on the props in the room. Swap to a new one every cut for a varied strip.',
  },
  photoLabel: { ko: '방 사진', en: 'PHOTOS' },
  photoTitle: { ko: '다른 각도에서 본 방', en: 'The room from other angles' },
  navLabel: { ko: '다음 정거장', en: 'NEXT STOP' },
  navTitle: { ko: '다른 방도 둘러보기', en: 'Keep exploring the line' },
  navAria: { ko: '이전 방과 다음 방', en: 'Previous and next room' },
  prev: { ko: '이전 방', en: 'PREVIOUS' },
  next: { ko: '다음 방', en: 'NEXT' },
  mapAria: { ko: '포토 룸 노선도', en: 'Photo room route map' },
  lbDialog: { ko: '사진 확대 보기', en: 'Photo viewer' },
  lbClose: { ko: '닫기', en: 'Close' },
  lbPrev: { ko: '이전 사진', en: 'Previous photo' },
  lbNext: { ko: '다음 사진', en: 'Next photo' },
}

export default function RoomDetail() {
  const { id } = useParams()
  const room = findRoom(id)
  if (!room) return <NotFound />
  return <RoomView key={room.id} room={room} />
}

function RoomView({ room }) {
  const pick = usePick()
  const [lb, setLb] = useState(null)
  usePageTitle(`${room.name} ${pick(room.title)}`)

  const at = ROOM_LIST.findIndex((r) => r.id === room.id)
  const prev = ROOM_LIST[(at - 1 + ROOM_LIST.length) % ROOM_LIST.length]
  const next = ROOM_LIST[(at + 1) % ROOM_LIST.length]
  const [main, ...others] = room.photoList

  return (
    <div className="break-keep break-words">
      <PageHero
        index={room.code}
        label={`${pick(room.title)} / ${room.name}`}
        title={room.name}
        desc={pick(room.lead)}
        crumbs={[{ to: '/rooms', label: pick(T.rooms) }, { label: room.name }]}
        aside={
          <div className="flex items-center gap-20" aria-hidden="true">
            <span className={cx('grid size-96 place-items-center rounded-pill font-label text-display-m font-bold tracking-tight lg:size-120', LINE_BG[room.color], BADGE_TEXT[room.color])}>
              {room.code}
            </span>
          </div>
        }
      />

      <Section id="room-about" index={1} label={pick(T.aboutLabel)} title={pick(T.aboutTitle)}>
        <div className="grid gap-x-64 gap-y-40 lg:grid-cols-12">
          <Reveal className="lg:col-span-5 4xl:col-span-4">
            <button
              type="button"
              onClick={() => setLb(0)}
              aria-label={`${pick(T.zoom)}: ${pick(main.alt)}`}
              className="group ue-press relative block w-full overflow-hidden rounded-lg border border-hairline bg-bg-panel"
              style={{ aspectRatio: '3 / 4' }}
            >
              <img src={main.full} alt="" width={main.w} height={main.h} className="size-full object-cover" decoding="async" />
              <span aria-hidden="true" className="absolute bottom-16 right-16 inline-flex items-center gap-8 rounded-pill bg-scrim px-14 py-8 text-caption 4xl:text-bodySm text-text-pri">
                <Expand size={16} />
                {pick(T.zoom)}
              </span>
            </button>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-7 4xl:col-span-8">
            <p className="max-w-read text-lead text-text-pri text-pretty 4xl:text-h3">{pick(room.body)}</p>
            <dl className="mt-40 grid border-t border-hairlineStrong md:grid-cols-2">
              <div className="border-b border-hairline py-20 md:pr-24">
                <dt className="ue-label text-label 4xl:text-bodySm text-text-meta">{pick(T.factLine)}</dt>
                <dd className="mt-8 flex items-center gap-12 text-body 4xl:text-lead font-semibold text-text-pri">
                  <span className={cx('inline-grid size-32 place-items-center rounded-pill font-label text-bodySm 4xl:text-body font-bold', LINE_BG[room.color], BADGE_TEXT[room.color])}>{room.code}</span>
                  {room.name}
                </dd>
              </div>
              <div className="border-b border-hairline py-20">
                <dt className="ue-label text-label 4xl:text-bodySm text-text-meta">{pick(T.factKiosk)}</dt>
                <dd className="mt-8 text-body 4xl:text-lead font-semibold text-text-pri">{pick(T.factKioskV)}</dd>
              </div>
              <div className="border-b border-hairline py-20 md:pr-24">
                <dt className="ue-label text-label 4xl:text-bodySm text-text-meta">{pick(T.factHours)}</dt>
                <dd className="mt-8 text-body 4xl:text-lead font-semibold text-text-pri">{pick(T.hoursV)}</dd>
              </div>
              <div className="border-b border-hairline py-20 md:col-span-2">
                <dt className="ue-label text-label 4xl:text-bodySm text-text-meta">{pick(T.factProps)}</dt>
                <dd className="mt-12 flex flex-wrap gap-8">
                  {room.props.map((p, i) => (
                    <Tag key={i}>{pick(p)}</Tag>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Section>

      <Section id="room-poses" index={2} label={pick(T.poseLabel)} title={pick(T.poseTitle)} intro={pick(T.poseIntro)} tone="elev">
        <ol className="grid gap-16 md:grid-cols-3 lg:gap-24">
          {room.poses.map((p, i) => (
            <Reveal as="li" key={i} delay={i * 80} className="relative overflow-hidden rounded-lg border border-hairline bg-bg-panel p-24 lg:p-32">
              <span aria-hidden="true" className={cx('absolute inset-x-0 top-0 h-4', LINE_BG[room.color])} />
              <p className="ue-label text-display-m font-bold leading-none text-yellow">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-24 text-h3 4xl:text-h2 font-black tracking-tightest text-text-pri">{pick(p.title)}</h3>
              <p className="mt-12 text-body 4xl:text-lead text-text-sec text-pretty">{pick(p.desc)}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      {others.length > 0 && (
        <Section id="room-photos" index={3} label={pick(T.photoLabel)} title={pick(T.photoTitle)}>
          <ul className="columns-2 gap-12 md:columns-3 lg:gap-16 xl:columns-4">
            {others.map((ph, i) => (
              <li key={ph.id} className="mb-12 break-inside-avoid lg:mb-16">
                <PhotoTile photo={ph} label={pick(T.zoom)} onOpen={() => setLb(i + 1)} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="room-next" index={others.length > 0 ? 4 : 3} label={pick(T.navLabel)} title={pick(T.navTitle)} tone="elev">
        <RoomNav prev={prev} next={next} labels={{ nav: pick(T.navAria), prev: pick(T.prev), next: pick(T.next) }} />
        <div className="mt-56 lg:mt-80">
          <RouteMap rooms={ROOM_LIST} activeId={room.id} label={pick(T.mapAria)} compact />
        </div>
      </Section>

      {lb != null && (
        <Lightbox
          items={room.photoList}
          index={lb}
          onIndex={setLb}
          onClose={() => setLb(null)}
          label={{ dialog: pick(T.lbDialog), close: pick(T.lbClose), prev: pick(T.lbPrev), next: pick(T.lbNext) }}
        />
      )}
    </div>
  )
}
