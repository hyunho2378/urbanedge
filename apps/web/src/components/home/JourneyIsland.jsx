import { useEffect, useState } from 'react'
import { LINE, ROOMS, STATION } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { onScrollFrame } from '../../layout/scroll.js'
import { LiveIsland } from './kit.jsx'

// 홈 전체를 하나의 여정으로 보는 라이브 액티비티. 히어로를 지나면 나타나고, 내려가는 동안 지금 탑승 중인 승강장이 바뀐다.
export default function JourneyIsland() {
  const pick = usePick()
  const [expanded, setExpanded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let last = -1
    const calc = (y) => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const q = Math.round(Math.min(1, Math.max(0, y / max)) * 200) / 200
      if (q !== last) {
        last = q
        setProgress(q)
      }
      setShow(y > window.innerHeight * 0.8)
    }
    calc(window.scrollY)
    return onScrollFrame(calc)
  }, [])

  const i = Math.min(ROOMS.length - 1, Math.floor(progress * ROOMS.length))
  const room = ROOMS[i]
  const left = ROOMS.length - 1 - i
  const atEnd = progress > 0.985

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-sticky flex justify-center px-16 transition-opacity duration-base ease-out ${show ? 'opacity-100' : 'invisible opacity-0'}`}
      style={{ top: 'calc(var(--ue-header-h) + 10px)' }}
    >
      <div className="pointer-events-auto flex w-full justify-center">
        <LiveIsland
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
          line={{ code: LINE.code, color: LINE.color, name: pick(LINE.name) }}
          thisLabel={`${pick({ en: 'Platform', ko: '승강장' })} ${room.platform} ${pick(room.title)}`}
          subLabel={pick({ en: 'Destination: UrbanEdge', ko: '행선지: 어반엣지' })}
          nextLabel={atEnd ? pick({ en: 'Exit 1', ko: '1번 출구' }) : pick(ROOMS[Math.min(ROOMS.length - 1, i + 1)].title)}
          progress={progress}
          remainingLabel={left === 0 ? pick({ en: 'You have arrived', ko: '도착했습니다' }) : pick({ en: left === 1 ? '1 platform to go' : `${left} platforms to go`, ko: `남은 승강장 ${left}곳` })}
          etaLabel={pick({ en: 'Open until 24:00', ko: '24:00까지 운영' })}
        />
      </div>
    </div>
  )
}
