import { Bi } from '@urbanedge/ds'
import { UEMark } from '../logo/UEMark.jsx'
import { METRO_STOPS, STATIONS, SYSTEM, formatShotDate } from '../print/stations.js'

// MetroPassCard: 메트로 패스 시각 요소(검정 카드, 노랑 머리글, 정거장 노선, 승강장 스탬프). 스타일은 인라인과 --ue-* CSS 변수라 앱의 Tailwind 스캔 범위와 무관하다.
// props: visited(방문한 역 id 배열, 예 ['gy-01']), platforms(찍은 승강장 번호 배열), date, className, style
//  후보 역은 Concept stop으로만 흐리게 보이고 열렸다고 말하지 않는다. 방문 기록은 호출하는 쪽이 쿠키(ue_pass)로 관리한다.
const LABEL = '"Barlow Condensed", "Pretendard Variable", Pretendard, sans-serif'
const UI = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Helvetica Neue", Arial, sans-serif'
const v = (name, a) => (a == null ? `rgb(var(--ue-${name}))` : `rgb(var(--ue-${name}) / ${a})`)
const LINE_VAR = { yellow: 'line-yellow', red: 'line-red', blue: 'line-blue', green: 'line-green' }

function Dot({ done, size = 30 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        flex: `0 0 ${size}px`,
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: done ? v('yellow') : v('bg-base'),
        border: done ? 'none' : `3px dashed ${v('text-pri', 0.45)}`,
        color: v('text-on-yellow'),
        position: 'relative',
        zIndex: 1,
      }}
    >
      {done && (
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      )}
    </span>
  )
}

export function MetroPassCard({ visited = [], platforms = [], date, className, style }) {
  const when = date ? formatShotDate(date) : null
  return (
    <div
      className={className}
      style={{ width: '100%', maxWidth: 440, background: v('bg-base'), color: v('text-pri'), borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 64px rgb(var(--ue-black) / 0.55)', fontFamily: UI, ...style }}
    >
      <div style={{ background: v('yellow'), color: v('text-on-yellow'), display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
        <UEMark title="" aria-hidden="true" style={{ width: 52, height: 'auto', display: 'block' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 30, letterSpacing: '0.06em', lineHeight: 1 }}>
            <Bi en="METRO PASS" ko="메트로 패스" inline />
          </div>
          <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 13, letterSpacing: '0.2em', marginTop: 4 }}>
            <Bi en="GYEONGJU METRO" ko="경주 메트로" inline />
          </div>
        </div>
        <span aria-hidden="true" style={{ width: 42, height: 42, borderRadius: '50%', background: v('bg-base'), color: v('yellow'), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: LABEL, fontWeight: 700, fontSize: 22 }}>
          {SYSTEM.code}
        </span>
      </div>

      <ol style={{ listStyle: 'none', margin: 0, padding: '20px 20px 6px', position: 'relative' }}>
        {METRO_STOPS.map((st, i) => {
          const done = visited.includes(st.id)
          const concept = st.status === 'concept'
          return (
            <li key={st.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, paddingBottom: i === METRO_STOPS.length - 1 ? 0 : 22 }}>
              {i < METRO_STOPS.length - 1 && <span aria-hidden="true" style={{ position: 'absolute', left: 13, top: 22, bottom: -4, width: 4, background: done && visited.includes(METRO_STOPS[i + 1].id) ? v('yellow') : v('text-pri', 0.28) }} />}
              <Dot done={done} />
              <div style={{ flex: 1, minWidth: 0, opacity: done || !concept ? 1 : 0.55 }}>
                <div style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 14, letterSpacing: '0.16em', color: done ? v('yellow') : v('text-meta') }}>{st.code}</div>
                <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  <Bi en={st.name.en} ko={st.name.ko} inline />
                </div>
              </div>
              <span style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 12, letterSpacing: '0.18em', color: done ? v('yellow') : v('text-meta') }}>
                {done ? <Bi en="STAMPED" ko="방문 완료" inline /> : concept ? <Bi en="CONCEPT STOP" ko="후보 역" inline /> : <Bi en="OPEN" ko="운영 중" inline />}
              </span>
            </li>
          )
        })}
      </ol>

      <div style={{ padding: '16px 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: LABEL, fontWeight: 600, fontSize: 12, letterSpacing: '0.2em', color: v('text-meta'), marginRight: 4 }}>
          <Bi en="PLATFORMS" ko="승강장" inline />
        </span>
        {STATIONS.map((s) => {
          const got = platforms.includes(s.platform)
          return (
            <span
              key={s.id}
              aria-label={`${s.pCode} ${s.title.en}${got ? ' stamped' : ''}`}
              style={{ width: 38, height: 38, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: LABEL, fontWeight: 700, fontSize: 18, background: got ? v(LINE_VAR[s.color]) : 'transparent', color: got ? v('text-on-yellow') : v('text-meta'), border: got ? 'none' : `3px dashed ${v('text-pri', 0.4)}` }}
            >
              {s.pCode}
            </span>
          )
        })}
        {when && <span style={{ marginLeft: 'auto', fontFamily: LABEL, fontWeight: 600, fontSize: 14, letterSpacing: '0.12em', color: v('text-sec') }}>{when}</span>}
      </div>
      <div style={{ borderTop: `1px solid ${v('text-pri', 0.14)}`, padding: '10px 20px 14px', fontFamily: LABEL, fontWeight: 500, fontSize: 12, letterSpacing: '0.18em', color: v('text-meta') }}>
        <Bi en="IMAGINARY METRO · TRAVEL EXPERIENCE" ko="가상의 지하철 관광 경험" inline />
      </div>
    </div>
  )
}
