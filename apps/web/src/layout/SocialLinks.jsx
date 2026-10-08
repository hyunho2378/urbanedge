import { cx } from '@urbanedge/ds'
import { SITE } from '../data/site.js'
import { usePick } from '../i18n/index.jsx'
import { NaverMark } from '../components/pages/NaverMark.jsx'

export function InstagramGlyph({ size = 18, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={cx('shrink-0', className)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// 네이버 플레이스 표시: 초록 사각형 위 흰 N.
export function NaverGlyph({ size = 18, className }) {
  return <NaverMark size={size} className={className} />
}

const base =
  'ue-press inline-flex min-h-48 items-center justify-center gap-8 whitespace-nowrap rounded-pill px-20 font-ui text-body-sm font-semibold transition-colors duration-fast ease-out'

// 실제 링크 버튼. kind: 'instagram' | 'naver'. tone: 'solid' | 'ghost' | 'onYellow'
export function SocialButton({ kind, tone = 'ghost', iconOnly = false, className }) {
  const pick = usePick()
  const ig = kind === 'instagram'
  const href = ig ? SITE.instagram.url : SITE.naverPlace
  const label = ig ? 'Instagram' : pick({ en: 'Naver Place', ko: '네이버 플레이스' })
  const tones = {
    solid: 'bg-yellow text-text-onYellow hover:bg-yellow-hover',
    ghost: 'bg-bg-raised text-text-pri hover:bg-yellow hover:text-text-onYellow',
    onYellow: 'bg-bg-base text-text-pri hover:bg-bg-raised',
  }
  if (tone === 'link') {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cx('inline-flex min-h-48 items-center gap-8 whitespace-nowrap font-ui text-body font-semibold text-yellow underline underline-offset-8 transition-colors duration-fast ease-out hover:text-yellow-hover', className)}>
        {ig ? <InstagramGlyph /> : <NaverGlyph />}
        <span>{label}</span>
        <span className="sr-only">{pick({ en: '(opens in a new tab)', ko: '(새 탭에서 열림)' })}</span>
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={iconOnly ? `${label} ${pick({ en: '(opens in a new tab)', ko: '(새 탭에서 열림)' })}` : undefined}
      className={cx(base, iconOnly && 'size-48 min-w-48 px-0', tones[tone], className)}
    >
      {ig ? <InstagramGlyph /> : <NaverGlyph />}
      {!iconOnly && (
        <>
          <span>{label}</span>
          <span className="sr-only">{pick({ en: '(opens in a new tab)', ko: '(새 탭에서 열림)' })}</span>
        </>
      )}
    </a>
  )
}
