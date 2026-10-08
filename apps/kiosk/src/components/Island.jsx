import { useEffect, useState } from 'react'
import { LiveIsland } from '@urbanedge/ds'
import { COPY, tr } from '../flow/copy.js'
import { LINE } from '../flow/rooms.js'
import { STEP_IDS } from '../flow/steps.js'
import { FLOW } from '../flow/config.js'

// Island.jsx: 화면 위에 늘 떠 있는 라이브 액티비티(DS LiveIsland). 경주 메트로(GY)의 현재 역, 다음 역, 남은 정거장, 선을 따라 움직이는 열차를 보여 준다.
// 단계가 바뀌면 펼쳐졌다가 잠시 뒤 접힌다. 안내용이라 터치를 받지 않는다(접힌 알약 높이가 120보다 낮고, 아래 화면의 터치를 가리지 않기 위해). 같은 내용은 위 왼쪽 안내 방송 줄이 읽어 준다.
const STOPS = STEP_IDS.length - 1 // attract 이후의 정거장 수
const SIZE = 2.1 // 1920x1080 캔버스에 맞춘 배율
// 자동으로 펼치지 않는 단계: 화면의 주 내용(언어 선택, 카운트다운, 카메라 확인)을 가리지 않는다.
const QUIET = ['attract', 'language', 'ready', 'shoot']

export function Island({ step, steps, lang, introKey, announce }) {
  const index = STEP_IDS.indexOf(step)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (QUIET.includes(step)) {
      setExpanded(false)
      return undefined
    }
    setExpanded(true)
    const id = setTimeout(() => setExpanded(false), FLOW.islandMs)
    return () => clearTimeout(id)
  }, [step])

  const t = (n, v) => tr(n, lang, v)
  const nxt = steps[index + 1]
  const left = STOPS - Math.max(0, index)
  const stops = steps.slice(1).map((s) => ({ id: s.id, label: t(s.label) }))
  return (
    <div className="pointer-events-none absolute inset-x-0 z-header" style={{ top: 28 }} inert="">
      <div style={{ marginInline: 'auto', width: 820 }}>
        <LiveIsland
          expanded={expanded}
          onToggle={setExpanded}
          line={{ code: LINE.code, color: LINE.color, name: t(LINE.name) }}
          thisLabel={t(steps[index].label)}
          nextLabel={nxt ? t(nxt.label) : t(COPY.island.last)}
          subLabel={announce}
          progress={Math.max(0, (index - 1) / (STOPS - 1))}
          remainingLabel={index >= STOPS ? undefined : left === 1 ? t(COPY.island.stopLeft) : t(COPY.island.stopsLeft, { n: left })}
          stops={stops}
          size={SIZE}
        />
      </div>
    </div>
  )
}
