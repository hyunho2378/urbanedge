import { T } from './lang.jsx'
import { KButton } from './KButton.jsx'
import { MiniDevice } from './MiniDevice.jsx'
import { COPY } from '../flow/copy.js'

// Tip: 온보딩 팁 카드. 화면을 덮지 않고 자기 칸 안에 놓인다. 기기 축소도에서 부품 위치를 보여 주고 "Got it"으로 닫는다.
// 닫은 기록은 컨트롤러의 React 상태(coach.seen)에만 남고, 처음으로 돌아가면 지워진다. 키오스크 전체에서 세 번만 쓴다(docs/KIOSK_V3.md).
export function Tip({ focus, title, body, onDone, style }) {
  return (
    <section className="k-rise flex items-start gap-48 rounded-xl bg-bg-panel" style={{ padding: 48, ...style }} aria-live="polite">
      <MiniDevice focus={focus} width={220} />
      <div className="min-w-0 flex-1">
        <T n={COPY.tip.kicker} as="p" className="kt-label text-yellow" />
        <T n={title} as="h2" className="kt-subhead mt-12" />
        <T n={body} as="p" className="kt-body mt-12 text-text-sec" />
        <KButton tone="soft" onClick={onDone} className="mt-32">
          <T n={COPY.common.gotIt} inline />
        </KButton>
      </div>
    </section>
  )
}
