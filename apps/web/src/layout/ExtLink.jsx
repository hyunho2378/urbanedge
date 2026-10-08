import { ArrowUpRight } from 'lucide-react'
import { cx } from '@urbanedge/ds'
import { usePick } from '../i18n/index.jsx'

// 새 탭으로 열리는 외부 링크. 화살표 아이콘과 스크린리더용 안내 문구를 붙인다.
export function ExtLink({ href, className, children, icon = true, ...rest }) {
  const pick = usePick()
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx('inline-flex items-center gap-8', className)} {...rest}>
      {children}
      {icon && <ArrowUpRight size={16} aria-hidden="true" className="shrink-0" />}
      <span className="sr-only">{pick({ ko: '(새 탭에서 열림)', en: '(opens in a new tab)' })}</span>
    </a>
  )
}
