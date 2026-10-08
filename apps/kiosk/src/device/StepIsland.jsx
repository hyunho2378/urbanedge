// StepIsland.jsx: 현재 이용 단계를 보여 주는 다이내믹 아일랜드형 표시. 작업 M의 LiveIsland를 쓴다.
// 노선 배지는 승강장 번호와 승강장 강조색(없으면 GY 노랑), 접힌 줄은 다음 단계, 펼치면 현재 단계와 GY-01 UrbanEdge 역 안내와 진행선이 보인다.
// LiveIsland는 높이가 고정된 상자 위에 펼침을 겹쳐 그리므로 펼치거나 언어를 바꿔도 아래 기기가 밀리지 않는다.
import { LiveIsland, useLangValue } from '@urbanedge/ds'
import { STATION, SYSTEM, platformOf, platformTag } from './stations.js'

export default function StepIsland({ steps, step, room, className }) {
  const lang = useLangValue()
  const idx = Math.max(0, steps.findIndex((s) => s.id === step))
  const cur = steps[idx]
  const nxt = steps[idx + 1]
  const left = steps.length - 1 - idx
  const label = (s) => (s ? s.label[lang] ?? s.label.en : '')
  const platform = platformOf(room)
  const line = platform
    ? { code: String(platform.n), color: platform.color, name: platformTag(room, lang) }
    : { code: SYSTEM.code, color: 'yellow', name: SYSTEM.name[lang] ?? SYSTEM.name.en }
  const remaining = lang === 'ko' ? (left === 0 ? '마지막 단계' : `${left}단계 남음`) : left === 0 ? 'Last stop' : `${left} to go`
  const last = lang === 'ko' ? '마지막 단계' : 'Last stop'

  return (
    <div className={className}>
      <LiveIsland
        line={line}
        thisLabel={label(cur)}
        nextLabel={nxt ? label(nxt) : last}
        subLabel={`${STATION.code} ${STATION.name[lang] ?? STATION.name.en}`}
        progress={steps.length > 1 ? idx / (steps.length - 1) : 0}
        remainingLabel={remaining}
        stops={steps.map((s) => ({ id: s.id, label: label(s) }))}
      />
    </div>
  )
}
