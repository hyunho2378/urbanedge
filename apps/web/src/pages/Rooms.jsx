import { PageShell, Tx } from '../components/pages/Bilingual.jsx'
import { usePageTitle } from '../components/pages/usePageTitle.js'
import { RoomExplorer } from '../components/rooms/RoomExplorer.jsx'

const T = {
  title: { en: 'Platforms', ko: '승강장' },
  h1: { en: 'Inside the shop', ko: '매장 안' },
}

// 한 화면 안에 들어오는 매장 투시도 탐색기. 방 전환은 탐색기 안의 한 곳에서만 한다.
export default function Rooms() {
  usePageTitle(T.title)
  return (
    <PageShell>
      <Tx {...T.h1} as="h1" className="sr-only" />
      <RoomExplorer />
    </PageShell>
  )
}
