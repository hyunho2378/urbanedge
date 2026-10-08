import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { RouteRibbon, Wordmark, cx } from '@urbanedge/ds'
import { NAV, SITE } from '../data/site.js'
import { usePick } from '../i18n/index.jsx'
import LangToggle from './LangToggle.jsx'
import { Wrap } from './Wrap.jsx'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

// 헤더: 워드마크, 내비게이션, KR/EN 토글, 하단 1px 노란 라인.
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

  // 데스크톱 폭으로 넓어지면 모바일 메뉴를 닫는다.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => mq.matches && setOpen(false)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // 메뉴가 열리면 스크롤을 잠그고 닫기 버튼에 포커스를 둔다. 닫히면 열었던 버튼으로 돌아간다.
  useEffect(() => {
    if (!open) return undefined
    const body = document.body
    const prev = { overflow: body.style.overflow, pad: body.style.paddingRight }
    const bar = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (bar > 0) body.style.paddingRight = `${bar}px`
    closeBtn.current?.focus()
    const btn = menuBtn.current
    return () => {
      body.style.overflow = prev.overflow
      body.style.paddingRight = prev.pad
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

  const navLabel = pick({ ko: '주 메뉴', en: 'Main menu' })

  return (
    <header className="fixed inset-x-0 top-0 z-header">
      <div className="relative h-header-m border-b border-yellow lg:h-header">
        <span
          aria-hidden="true"
          className={cx(
            'absolute inset-0 bg-gradient-to-b from-bg-base/80 to-transparent transition-opacity duration-base ease-out',
            solid ? 'opacity-0' : 'opacity-100',
          )}
        />
        <span
          aria-hidden="true"
          className={cx('absolute inset-0 bg-bg-base transition-opacity duration-base ease-out', solid ? 'opacity-100' : 'opacity-0')}
        />
        <Wrap className="relative flex h-full items-center gap-16 lg:gap-24">
          <div className="flex min-w-0 flex-1 items-center">
            <Link to="/" aria-label={pick({ ko: '어반엣지 메트로그래피 홈', en: 'UrbanEdge Metrography home' })} className="ue-press rounded-sm">
              <Wordmark className="3xl:scale-125 3xl:origin-left" />
            </Link>
          </div>

          <nav aria-label={navLabel} className="hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-16 3xl:gap-24">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'ue-label relative inline-flex min-h-48 items-center px-12 text-body tracking-wide transition-colors duration-fast ease-out 3xl:text-lead',
                        isActive ? 'text-yellow' : 'text-text-sec hover:text-text-pri',
                      )
                    }
                  >
                    {pick(n.label)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-8 lg:flex-1 lg:gap-12">
            <LangToggle />
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={pick({ ko: '메뉴 열기', en: 'Open menu' })}
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
          className="fixed inset-0 z-overlay flex animate-fade-in flex-col overflow-y-auto bg-bg-base lg:hidden"
        >
          <div className="flex h-header-m shrink-0 items-center justify-between border-b border-yellow px-page">
            <Link to="/" className="ue-press rounded-sm" aria-label={pick({ ko: '홈', en: 'Home' })}>
              <Wordmark />
            </Link>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => setOpen(false)}
              aria-label={pick({ ko: '메뉴 닫기', en: 'Close menu' })}
              className="ue-press grid size-48 place-items-center rounded-md text-text-pri hover:text-yellow"
            >
              <X size={28} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label={navLabel} className="px-page pt-24">
            <ul>
              {NAV.map((n, i) => (
                <li key={n.to} className="animate-fade-up border-b border-hairline" style={{ animationDelay: `${80 + i * 60}ms` }}>
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'group flex min-h-72 items-center gap-20 py-12 transition-colors duration-fast ease-out',
                        isActive ? 'text-yellow' : 'text-text-pri hover:text-yellow',
                      )
                    }
                  >
                    <span className="ue-label w-32 text-label text-yellow">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 font-display text-h1 font-black leading-tight tracking-tightest">{pick(n.label)}</span>
                    <ArrowRight size={22} aria-hidden="true" className="shrink-0 text-text-meta transition-transform duration-base ease-out group-hover:translate-x-4" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto px-page pb-32 pt-40">
            <p className="ue-label text-label text-text-meta">{SITE.slogan}</p>
            <p className="mt-12 text-body-sm leading-relaxed text-text-sec">
              {pick(SITE.address)}
              <br />
              {SITE.hours.open} ~ {SITE.hours.close}
            </p>
            <div className="mt-24">
              <LangToggle />
            </div>
          </div>
          <RouteRibbon className="h-8 shrink-0" />
        </div>
      )}
    </header>
  )
}
