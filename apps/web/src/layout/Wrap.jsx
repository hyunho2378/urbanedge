import { cx } from '@urbanedge/ds'

// 페이지 폭 래퍼. 1760px 상한(wide)에서 시작해 2560 이상 화면에서는 2560까지 넓힌다.
export function Wrap({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cx('px-page mx-auto w-full max-w-wide 4xl:max-w-screen-4xl', className)} {...rest}>
      {children}
    </Tag>
  )
}
