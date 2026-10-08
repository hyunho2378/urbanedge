import { Reveal, cx } from '@urbanedge/ds'
import { LINE_BG, LINE_BORDER } from './content.js'

// 이용 단계 카드. 노선 리본처럼 정거장 점과 선으로 단계를 잇는다.
// 선은 모바일에서 세로, md 이상에서 가로다. 노선 색은 단계 구분용이다.
export function StepCard({ n, color, icon: Icon, title, body, note, last, delay = 0 }) {
  return (
    <Reveal as="li" delay={delay} className="relative">
      <span
        aria-hidden="true"
        className={cx(
          'absolute left-12 top-32 -bottom-24 w-8 md:-right-16 md:bottom-auto md:left-16 md:top-12 md:h-8 md:w-full',
          last && 'hidden',
          LINE_BG[color],
        )}
      />
      <span aria-hidden="true" className={cx('absolute left-0 top-16 size-32 rounded-pill border-4 bg-bg-base md:top-0', LINE_BORDER[color])} />
      <div className="h-full pb-32 pl-64 pt-8 md:pb-0 md:pl-0 md:pr-24 md:pt-72">
        <p className="ue-label flex items-center gap-12 text-label 4xl:text-bodySm text-text-sec">
          <span className="text-yellow">{String(n).padStart(2, '0')}</span>
          <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
        </p>
        <div className="mt-20 grid size-56 place-items-center rounded-md border border-hairlineStrong bg-bg-panel text-yellow">
          <Icon size={26} aria-hidden="true" />
        </div>
        <h3 className="mt-20 text-h3 4xl:text-h2 font-black tracking-tightest text-text-pri">{title}</h3>
        <p className="mt-12 text-body 4xl:text-lead text-text-sec text-pretty">{body}</p>
        {note && <p className="mt-16 border-l-2 border-yellow pl-12 text-bodySm 4xl:text-body text-text-meta">{note}</p>}
      </div>
    </Reveal>
  )
}
