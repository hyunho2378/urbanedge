import { useId, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'

// 자주 묻는 질문 아코디언. 버튼은 aria-expanded 와 aria-controls 를 갖고,
// 위 아래 화살표, Home, End 로 질문 사이를 이동한다. 열린 항목은 서로 독립이다.
export function Faq({ items }) {
  const pick = usePick()
  const base = useId()
  const [open, setOpen] = useState(() => new Set())
  const refs = useRef([])

  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const onKeyDown = (e, i) => {
    const last = items.length - 1
    let to = null
    if (e.key === 'ArrowDown') to = i === last ? 0 : i + 1
    else if (e.key === 'ArrowUp') to = i === 0 ? last : i - 1
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = last
    if (to == null) return
    e.preventDefault()
    refs.current[to]?.focus()
  }

  return (
    <div className="border-t border-hairlineStrong">
      {items.map((it, i) => {
        const isOpen = open.has(i)
        const bid = `${base}-b${i}`
        const pid = `${base}-p${i}`
        return (
          <div key={i} className="border-b border-hairline">
            <h3>
              <button
                ref={(el) => (refs.current[i] = el)}
                id={bid}
                type="button"
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => toggle(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="group flex min-h-56 w-full items-center gap-20 py-20 text-left transition-colors duration-fast ease-out lg:gap-32 lg:py-28"
              >
                <span className="ue-label w-36 shrink-0 text-label 4xl:text-bodySm text-yellow lg:w-48">{String(i + 1).padStart(2, '0')}</span>
                <span className={cx('flex-1 text-h4 4xl:text-h3 font-bold group-hover:text-yellow', isOpen ? 'text-yellow' : 'text-text-pri')}>{pick(it.q)}</span>
                <span
                  aria-hidden="true"
                  className={cx(
                    'grid size-40 shrink-0 place-items-center rounded-pill border border-hairlineStrong text-text-pri transition-[transform,opacity] duration-base ease-out group-hover:border-yellow',
                    isOpen && 'rotate-45 border-yellow text-yellow',
                  )}
                >
                  <Plus size={18} />
                </span>
              </button>
            </h3>
            <div id={pid} role="region" aria-labelledby={bid} hidden={!isOpen}>
              <p className="animate-fade-in pb-28 pl-56 pr-16 text-body 4xl:text-lead text-text-sec text-pretty max-w-read lg:pb-36 lg:pl-80 lg:pr-24">{pick(it.a)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
