import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Link2, Mail, MessageCircle, Send, Share2 } from 'lucide-react'
import { LineBadge, cx } from '@urbanedge/ds'
import { LINE_BG, LINE_ON, SITE } from '../../data/site.js'
import Modal from '../../layout/Modal.jsx'
import { usePick } from '../../i18n/index.jsx'
import { useWidth } from './hooks.js'
import TrainSvg from './TrainSvg.jsx'

// 작업 M, B, G가 실제 구현을 올리기 전까지(또는 실패했을 때) 쓰는 대체 구현. kit.jsx가 스텁을 감지해 자동으로 고른다.

// ---- 라이브 액티비티 대체: 검정 알약, 누르면 펼쳐진다 ----
export function IslandFallback({ expanded, onToggle, line, nextLabel, subLabel, progress = 0, remainingLabel, etaLabel, className }) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100)
  return (
    <div className={cx('w-full', expanded ? 'max-w-sm' : 'max-w-xs', className)}>
      <div className={cx('overflow-hidden bg-black text-text-pri shadow-lift transition-colors duration-base ease-out', expanded ? 'rounded-xl' : 'rounded-pill')}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-h-48 w-full items-center gap-12 py-8 pl-8 pr-16 text-left"
        >
          <LineBadge code={line.code} color={line.color} size="md" />
          <span className="min-w-0 flex-1">
            <span className="t-caption block truncate text-text-meta">{expanded ? line.name : subLabel}</span>
            <span className="t-strong block truncate">{nextLabel}</span>
          </span>
          <ChevronDown size={18} aria-hidden="true" className={cx('shrink-0 text-text-meta transition-transform duration-base ease-out', expanded && 'rotate-180')} />
        </button>
        {expanded && (
          <div className="animate-fade-in px-16 pb-16">
            <div className="relative mt-4 h-2 w-full rounded-pill bg-bg-raised">
              <div className="absolute inset-y-0 left-0 w-full origin-left rounded-pill bg-yellow transition-transform duration-slow ease-out" style={{ transform: `scaleX(${pct / 100})` }} />
            </div>
            <div className="t-caption mt-12 flex items-center justify-between text-text-sec">
              <span>{remainingLabel}</span>
              <span>{etaLabel}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- 열차 진행선 대체 ----
export function TrainTrackFallback({ stops, current = 0, className, onSelect }) {
  const [ref, w] = useWidth()
  const last = Math.max(1, stops.length - 1)
  const x = (Math.min(last, Math.max(0, current)) / last) * w
  return (
    <div className={cx('relative', className)}>
      <div ref={ref} className="relative mx-16 h-48">
        <div className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-pill bg-bg-raised" />
        <div className="absolute inset-y-0 left-0 w-full origin-left" style={{ transform: `scaleX(${current / last})`, transition: 'transform 500ms var(--ue-ease-out)' }}>
          <div className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-pill bg-yellow" />
        </div>
        {stops.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect?.(i)}
            aria-label={s.label}
            aria-current={Math.round(current) === i ? 'step' : undefined}
            className="absolute top-1/2 grid size-48 -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${(i / last) * 100}%` }}
          >
            <span className={cx('block size-12 rounded-pill transition-colors duration-base ease-out', i <= current + 0.01 ? 'bg-yellow' : 'bg-text-disabled')} />
          </button>
        ))}
        <div className="pointer-events-none absolute left-0 top-1/2 w-56 -translate-y-1/2" style={{ transform: `translate(${x - 28}px, -50%)`, transition: 'transform 500ms var(--ue-ease-out)' }}>
          <TrainSvg />
        </div>
      </div>
    </div>
  )
}

// ---- 역명판 대체 ----
export function StationSignFallback({ name, sub, code, color = 'yellow', className }) {
  return (
    <div className={cx('inline-flex items-center gap-12 rounded-md bg-white py-12 pl-12 pr-20 text-bg-base', className)}>
      <span aria-hidden="true" className={cx('grid size-48 shrink-0 place-items-center rounded-pill font-label text-h4 font-bold', LINE_BG[color], LINE_ON[color])}>{code}</span>
      <span>
        <span className="t-subhead block">{name}</span>
        {sub && <span className="t-caption block text-bg-raised">{sub}</span>}
      </span>
    </div>
  )
}

// ---- 공유 시트 대체(작업 B의 ShareSheet가 오기 전) ----
export function ShareSheetFallback({ open, onClose, url, title, text }) {
  const pick = usePick()
  const [copied, setCopied] = useState(false)
  const link = url || (typeof window !== 'undefined' ? window.location.href : '')
  const enc = encodeURIComponent
  const items = [
    { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?url=${enc(link)}&text=${enc(title || '')}`, Icon: Share2 },
    { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}`, Icon: Share2 },
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${enc(`${text || title || ''} ${link}`)}`, Icon: MessageCircle },
    { id: 'line', label: 'LINE', href: `https://social-plugins.line.me/lineit/share?url=${enc(link)}`, Icon: MessageCircle },
    { id: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${enc(link)}&text=${enc(title || '')}`, Icon: Send },
    { id: 'mail', label: 'Email', href: `mailto:?subject=${enc(title || '')}&body=${enc(`${text || ''} ${link}`)}`, Icon: Mail },
  ]
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      /* 클립보드가 막힌 환경에서는 표시만 한다 */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <Modal open={open} onClose={onClose} label={pick({ en: "Share", ko: "공유" })}>
      <div className="p-24 pt-32">
        <p className="t-subhead">{pick({ en: 'Share the line', ko: '노선 공유하기' })}</p>
        <p className="t-caption mt-4 text-text-meta">{title}</p>
        <div className="mt-24 grid grid-cols-3 gap-12 md:grid-cols-3">
          <button type="button" onClick={copy} className="ue-press flex min-h-72 flex-col items-center justify-center gap-6 rounded-lg bg-bg-raised t-caption">
            <Link2 size={20} aria-hidden="true" />
            {copied ? pick({ en: 'Copied', ko: '복사됨' }) : pick({ en: 'Copy link', ko: '링크 복사' })}
          </button>
          {items.map(({ id, label, href, Icon }) => (
            <a key={id} href={href} target="_blank" rel="noopener noreferrer" className="ue-press flex min-h-72 flex-col items-center justify-center gap-6 rounded-lg bg-bg-raised t-caption">
              <Icon size={20} aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
        <p className="t-caption mt-16 text-text-meta">{SITE.instagram.handle}</p>
      </div>
    </Modal>
  )
}

// ---- 구글 지도 키 없는 임베드 대체 ----
export function GoogleEmbedFallback({ className, lat, lng, title }) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
  const src = key
    ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lng}&zoom=17`
    : `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`
  return <iframe title={title} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className={cx('block size-full border-0', className)} />
}

// 프레임 안 스크롤 이벤트용 ref 보조(사용처에서 필요할 때)
export function useStable(fn) {
  const r = useRef(fn)
  useEffect(() => {
    r.current = fn
  })
  return r
}
