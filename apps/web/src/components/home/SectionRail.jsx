import { useEffect, useState } from 'react'
import { cx } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'

const ITEMS = [
  { id: 'about', n: '01', label: { ko: '소개', en: 'About' } },
  { id: 'rooms', n: '02', label: { ko: '포토 룸', en: 'Rooms' } },
  { id: 'how', n: '03', label: { ko: '이용 방법', en: 'How it works' } },
  { id: 'first', n: '04', label: { ko: '처음 오는 분께', en: 'First time' } },
  { id: 'gallery', n: '05', label: { ko: '갤러리', en: 'Gallery' } },
  { id: 'visit', n: '06', label: { ko: '방문 정보', en: 'Visit' } },
  { id: 'kiosk', n: '07', label: { ko: '키오스크', en: 'Kiosk' } },
]

// 떠 있는 목차(전시회 사이트의 구간 번호 방식). 1280 이상에서 히어로를 지나면 오른쪽 가장자리에 나타난다.
export default function SectionRail() {
  const pick = usePick()
  const [active, setActive] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean)
    if (!els.length || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const go = (e, id) => {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label={pick({ ko: '페이지 구간', en: 'Page sections' })}
      className={cx(
        'fixed right-8 top-1/2 z-sticky hidden -translate-y-1/2 transition-opacity duration-base ease-out xl:block 3xl:right-24',
        show ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <ul className="flex flex-col items-end">
        {ITEMS.map((i) => {
          const on = active === i.id
          return (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                onClick={(e) => go(e, i.id)}
                tabIndex={show ? 0 : -1}
                aria-current={on ? 'location' : undefined}
                className="group flex min-h-40 items-center gap-12 rounded-pill pl-12 pr-8"
              >
                <span
                  className={cx(
                    'ue-label rounded-sm bg-bg-base/80 px-8 py-4 text-label transition-opacity duration-fast ease-out group-hover:opacity-100 group-focus-visible:opacity-100',
                    'text-text-pri opacity-0',
                  )}
                >
                  {i.n} {pick(i.label)}
                </span>
                <span
                  aria-hidden="true"
                  className={cx(
                    'block rounded-pill transition-transform duration-base ease-out',
                    on ? 'size-12 bg-yellow' : 'size-8 bg-text-meta group-hover:bg-text-pri',
                  )}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
