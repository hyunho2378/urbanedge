import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Share2, X } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { UrbanEdgeWordmark } from '@urbanedge/brand'
import { LINE, NAV, SITE } from '../data/site.js'
import { useShare } from '../components/home/kit.jsx'
import { usePick } from '../i18n/index.jsx'
import LangToggle from './LangToggle.jsx'
import { lockScroll, unlockScroll } from './scroll.js'
import { SocialButton } from './SocialLinks.jsx'
import { Wrap } from './Wrap.jsx'
import { B } from './B.jsx'

// 헤더 로고: 굵은 U 한 글자. 직각 끝을 둔 블록 형태라 UE 심볼과 같은 결을 쓴다.
function UGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="w-24" aria-hidden="true" role="presentation">
      <path fill="currentColor" d="M3 2h6v11a3 3 0 0 0 6 0V2h6v11a9 9 0 0 1-18 0Z" />
    </svg>
  )
}

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
  const share = useShare({ title: SITE.name, text: pick(SITE.tagline) })

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
              <span className="grid size-40 shrink-0 place-items-center rounded-md bg-yellow text-text-onYellow">
                <UGlyph />
              </span>
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
            <button
              type="button"
              onClick={share.open}
              aria-label={pick({ en: 'Share this site', ko: '사이트 공유' })}
              className="ue-press hidden size-48 place-items-center rounded-pill text-text-pri transition-colors duration-fast ease-out hover:text-yellow md:grid"
            >
              <Share2 size={20} aria-hidden="true" />
            </button>
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
      {share.sheet}

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
              <span className="grid size-40 shrink-0 place-items-center rounded-md bg-yellow text-text-onYellow">
                <UGlyph />
              </span>
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

          <nav aria-label={navLabel} className="px-page pt-24">
            <p className="t-label mb-12 text-text-meta"><B v={LINE.name} inline /></p>
            <ol className="relative">
              <span aria-hidden="true" className="absolute bottom-24 left-12 top-24 w-6 -translate-x-1/2 rounded-pill bg-yellow" />
              {NAV.map((n, i) => (
                <li key={n.to} className="animate-fade-up" style={{ animationDelay: `${60 + i * 45}ms` }}>
                  <NavLink
                    to={n.to}
                    end={n.to === '/'}
                    className={({ isActive }) =>
                      cx('group flex min-h-56 items-center gap-20 py-4 transition-colors duration-fast ease-out', isActive ? 'text-yellow' : 'text-text-pri hover:text-yellow')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span aria-hidden="true" className={cx('relative z-10 block size-24 shrink-0 rounded-pill border-4 border-bg-base', isActive ? 'bg-yellow ring-4 ring-yellow/40' : 'bg-white')} />
                        <span className="t-title"><B v={n.label} inline /></span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-auto px-page pb-32 pt-32">
            <div className="flex flex-wrap gap-12">
              <SocialButton kind="instagram" tone="solid" />
              <SocialButton kind="naver" tone="ghost" />
            </div>
            <p className="t-caption mt-24 text-text-sec">
              <B v={SITE.address} inline />
              <br />
              {SITE.hours.open} ~ {SITE.hours.close}
            </p>
            <div className="mt-16">
              <LangToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
