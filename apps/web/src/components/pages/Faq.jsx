import { useId, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { Tx } from './Bilingual.jsx'

// 자주 묻는 질문. 버튼은 aria-expanded와 aria-controls를 갖고, 위아래 화살표와 Home, End로 질문 사이를 오간다.
// 열린 항목은 서로 독립이다. 구분은 헤어라인 한 줄이며 항목마다 박스를 두르지 않는다. items: [{ q: {en,ko}, a: {en,ko} }]
export function Faq({ items }) {
  const base = useId()
  const [open, setOpen] = useState(() => new Set([0]))
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
    <div className="divide-y divide-hairline border-y border-hairline">
      {items.map((it, i) => {
        const isOpen = open.has(i)
        const bid = `${base}-b${i}`
        const pid = `${base}-p${i}`
        return (
          <div key={i}>
            <h3>
              <button
                ref={(el) => (refs.current[i] = el)}
                id={bid}
                type="button"
                aria-expanded={isOpen}
                aria-controls={pid}
                onClick={() => toggle(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="group flex min-h-56 w-full items-center gap-16 py-16 text-left lg:gap-24 lg:py-24"
              >
                <Tx {...it.q} role="subhead" className={cx('min-w-0 flex-1 transition-colors duration-fast ease-out group-hover:text-yellow', isOpen ? 'text-yellow' : 'text-text-pri')} />
                <span
                  aria-hidden="true"
                  className={cx('grid size-40 shrink-0 place-items-center rounded-pill bg-bg-panel text-text-pri transition-transform duration-base ease-out', isOpen && 'rotate-45 bg-yellow text-text-onYellow')}
                >
                  <Plus size={18} />
                </span>
              </button>
            </h3>
            <div id={pid} role="region" aria-labelledby={bid} hidden={!isOpen}>
              <Tx {...it.a} as="p" role="body" className="max-w-read animate-fade-in pb-24 pr-56 text-text-sec lg:pb-32" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
