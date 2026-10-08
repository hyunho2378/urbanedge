import { cx } from './cx.js'

// width: wide(기본, 1760px 상한 + 대형 화면은 여백 유지) | read(본문 68ch) | full
export function Container({ as: Tag = 'div', width = 'wide', className, children, ...rest }) {
  const w = { wide: 'max-w-wide', read: 'max-w-read', full: '' }[width]
  return (
    <Tag className={cx('px-page mx-auto w-full', w, className)} {...rest}>
      {children}
    </Tag>
  )
}
