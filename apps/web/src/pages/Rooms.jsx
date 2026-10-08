import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { LineBadge, Reveal } from '@urbanedge/ds'
import { usePick } from '../i18n/index.jsx'
import { PageHero } from '../components/pages/PageHero.jsx'
import { Section } from '../components/pages/Section.jsx'
import { RouteMap } from '../components/pages/RouteMap.jsx'
import { RoomCard } from '../components/pages/RoomCard.jsx'
import { ROOM_LIST } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const T = {
  title: { ko: '포토 룸', en: 'Photo Rooms' },
  label: { ko: '포토 룸 / PHOTO ROOMS', en: 'PHOTO ROOMS' },
  h1: { ko: '방마다 다른 노선', en: 'Five rooms, five lines' },
  desc: {
    ko: '어반엣지에는 지하철, 노래방, 공중전화, 레트로, 화장실 다섯 개의 포토 룸이 이어져 있으며, 방마다 키오스크가 따로 있어 마음에 드는 방 앞에서 바로 촬영할 수 있다.',
    en: 'UrbanEdge links five photo rooms: Subway, Karaoke, Public Phone, Retro and Toilet. Each room has its own kiosk, so you can shoot right where you like.',
  },
  mapLabel: { ko: '노선도', en: 'ROUTE MAP' },
  mapTitle: { ko: 'L1에서 L5까지 한 줄로 이어지는 방', en: 'L1 to L5 on a single line' },
  mapIntro: {
    ko: '정거장 하나가 방 하나이며, 이름을 누르면 방 상세 페이지로 이동한다.',
    en: 'Each station is one room. Select a name to open its detail page.',
  },
  mapNav: { ko: '포토 룸 노선도', en: 'Photo room route map' },
  cardsLabel: { ko: '방 카드', en: 'ROOM CARDS' },
  cardsTitle: { ko: '다섯 방을 사진으로 비교', en: 'Compare the five rooms by photo' },
  cardsIntro: {
    ko: '소품과 분위기가 방마다 달라서, 찍고 싶은 장면에 맞춰 방을 고르면 된다.',
    en: 'Props and mood change from room to room, so pick the room that fits the scene you want.',
  },
  cta: { ko: '방 보기', en: 'View room' },
  guideKicker: { ko: '처음 오셨나요', en: 'First time here' },
  guideTitle: { ko: '이용 안내 보기', en: 'Read the guide' },
  guideBody: { ko: '4단계 이용 방법과 카메라 위치를 먼저 확인할 수 있다.', en: 'See the four steps and where the camera is before you go in.' },
}

export default function Rooms() {
  const pick = usePick()
  usePageTitle(pick(T.title))
  return (
    <div className="break-keep break-words">
      <PageHero
        index="01"
        label={pick(T.label)}
        title={pick(T.h1)}
        desc={pick(T.desc)}
        crumbs={[{ label: pick(T.title) }]}
        aside={
          <ul className="flex flex-wrap gap-12" aria-label={pick(T.mapNav)}>
            {ROOM_LIST.map((r) => (
              <li key={r.id}>
                <Link to={`/rooms/${r.id}`} aria-label={`${r.code} ${r.name}`} className="ue-press block rounded-pill transition-opacity duration-fast ease-out hover:opacity-80">
                  <LineBadge code={r.code} color={r.color} size="lg" />
                </Link>
              </li>
            ))}
          </ul>
        }
      />

      <Section id="rooms-map" index={1} label={pick(T.mapLabel)} title={pick(T.mapTitle)} intro={pick(T.mapIntro)}>
        <RouteMap rooms={ROOM_LIST} label={pick(T.mapNav)} />
      </Section>

      <Section id="rooms-cards" index={2} label={pick(T.cardsLabel)} title={pick(T.cardsTitle)} intro={pick(T.cardsIntro)} tone="elev">
        <ul className="grid gap-16 md:grid-cols-2 md:gap-24 xl:grid-cols-3 4xl:grid-cols-6">
          {ROOM_LIST.map((r, i) => (
            <Reveal as="li" key={r.id} delay={(i % 3) * 80}>
              <RoomCard room={r} cta={pick(T.cta)} />
            </Reveal>
          ))}
          <Reveal as="li" delay={160}>
            <Link
              to="/guide"
              className="group ue-press flex h-full min-h-240 flex-col justify-between rounded-lg bg-yellow p-24 text-text-onYellow transition-colors duration-base ease-out hover:bg-yellow-hover lg:p-32"
            >
              <span className="ue-label text-label 4xl:text-bodySm">{pick(T.guideKicker)}</span>
              <span>
                <span className="block text-h2 font-black leading-tight tracking-tightest">{pick(T.guideTitle)}</span>
                <span className="mt-12 block text-bodySm 4xl:text-body">{pick(T.guideBody)}</span>
                <ArrowRight size={32} aria-hidden="true" className="mt-24 transition-transform duration-base ease-out group-hover:translate-x-8" />
              </span>
            </Link>
          </Reveal>
        </ul>
      </Section>
    </div>
  )
}
