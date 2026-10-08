import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { UrbanEdgeWordmark } from '@urbanedge/brand'
import { NAV } from '../data/site.js'
import { usePick } from '../i18n/index.jsx'
import LangToggle from './LangToggle.jsx'
import { lockScroll, unlockScroll } from './scroll.js'
import LogoMark from './LogoMark.jsx'
import { Wrap } from './Wrap.jsx'
import { B } from './B.jsx'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

// 헤더: UE 심볼 + 워드마크, 내비게이션, KR/EN 토글. 하단 노선 라인 위를 노란 표시 막대가 활성 항목으로 미끄러진다.
// 홈은 히어로 위에서 투명하게 시작해 스크롤하면 불투명해지고, 하위 페이지는 처음부터 불투명하다.
export default function Header() {
  const { pathname } = useLocation()
  const pick = usePick()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuBtn = useRef(null)
  const closeBtn = useRef(null)
  const panel = useRef(null)
  const navRef = useRef(null)
  const [bar, setBar] = useState({ x: 0, w: 0, show: false })
  const solid = scrolled || !isHome || open

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => mq.matches && setOpen(false)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // 표시 막대 위치: 활성 링크의 가로 위치와 폭을 읽어 transform으로 옮긴다.
  const measure = useCallback(() => {
    const nav = navRef.current
    if (!nav) return
    const a = nav.querySelector('a[aria-current="page"]')
    if (!a) return setBar((b) => ({ ...b, show: false }))
    const n = nav.getBoundingClientRect()
    const r = a.getBoundingClientRect()
    setBar({ x: r.left - n.left + 12, w: r.width - 24, show: true })
  }, [])
  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, pathname, pick])

  useEffect(() => {
    if (!open) return undefined
    const body = document.body
    const prev = { overflow: body.style.overflow, pad: body.style.paddingRight }
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    lockScroll()
    closeBtn.current?.focus()
    const btn = menuBtn.current
    return () => {
      body.style.overflow = prev.overflow
      body.style.paddingRight = prev.pad
      unlockScroll()
      btn?.focus({ preventScroll: true })
    }
  }, [open])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      return
    }
    if (e.key !== 'Tab' || !panel.current) return
    const nodes = [...panel.current.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null)
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  const navLabel = pick({ en: 'Main menu', ko: '주 메뉴' })

  return (
    <header className="fixed inset-x-0 top-0 z-header">
      <div className="relative h-header-m lg:h-header">
        <span aria-hidden="true" className={cx('absolute inset-0 bg-gradient-to-b from-bg-base/85 to-transparent transition-opacity duration-base ease-out', solid ? 'opacity-0' : 'opacity-100')} />
        <span aria-hidden="true" className={cx('absolute inset-0 bg-bg-base transition-opacity duration-base ease-out', solid ? 'opacity-100' : 'opacity-0')} />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-yellow/50" />
        <Wrap className="relative flex h-full items-center gap-16 lg:gap-24">
          <div className="flex min-w-0 flex-1 items-center">
            <Link
              to="/"
              aria-label={pick({ en: 'UrbanEdge Metrography, home', ko: '어반엣지 메트로그래피 홈' })}
              className="ue-press flex items-center gap-10 rounded-md"
            >
              <LogoMark className="size-36" />
              <UrbanEdgeWordmark className="hidden h-16 w-auto text-text-pri md:block" aria-hidden="true" role="presentation" />
            </Link>
          </div>

          <nav ref={navRef} aria-label={navLabel} className="relative hidden h-full lg:block">
            <ul className="flex h-full items-stretch">
              {NAV.filter((n) => n.to !== '/').map((n) => (
                <li key={n.to} className="flex">
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'ue-label flex items-center px-12 text-body-sm tracking-wide transition-colors duration-fast ease-out xl:px-16',
                        isActive ? 'text-yellow' : 'text-text-sec hover:text-text-pri',
                      )
                    }
                  >
                    <B v={n.label} inline className="justify-items-center" />
                  </NavLink>
                </li>
              ))}
            </ul>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-4 rounded-t-sm bg-yellow transition-[transform,opacity] duration-slow ease-out"
              style={{ width: bar.w, transform: `translateX(${bar.x}px)`, opacity: bar.show ? 1 : 0 }}
            />
          </nav>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-8">
            <LangToggle />
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={pick({ en: 'Open menu', ko: '메뉴 열기' })}
              className="ue-press grid size-48 place-items-center rounded-md text-text-pri hover:text-yellow lg:hidden"
            >
              <Menu size={26} aria-hidden="true" />
            </button>
          </div>
        </Wrap>
      </div>

      {open && (
        <div
          id="mobile-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={navLabel}
          onKeyDown={onKeyDown}
          data-lenis-prevent
          className="fixed inset-0 z-overlay flex animate-fade-in flex-col overflow-y-auto bg-bg-base lg:hidden"
        >
          <div className="relative flex h-header-m shrink-0 items-center justify-between px-page">
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-yellow/50" />
            <Link to="/" className="ue-press flex items-center gap-10 rounded-md" aria-label={pick({ en: 'Home', ko: '홈' })}>
              <LogoMark className="size-36" />
            </Link>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={pick({ en: 'Close menu', ko: '메뉴 닫기' })}
              className="ue-press grid size-48 place-items-center rounded-md text-text-pri hover:text-yellow"
            >
              <X size={28} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label={navLabel} className="px-page pt-16">
            <ul>
              {NAV.map((n, i) => (
                <li key={n.to} className="animate-fade-up" style={{ animationDelay: `${40 + i * 35}ms` }}>
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    className={({ isActive }) =>
                      cx('flex min-h-48 items-center border-b border-text-pri/10 text-body font-medium transition-colors duration-fast ease-out', isActive ? 'text-yellow' : 'text-text-pri hover:text-yellow')
                    }
                  >
                    <B v={n.label} inline />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
