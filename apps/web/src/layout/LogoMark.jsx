import { cx } from '@urbanedge/ds'

// 로고 마크: 노란 원 안에 검은 U. 헤더와 푸터가 같은 마크를 쓴다.
export default function LogoMark({ className }) {
  return (
    <span aria-hidden="true" className={cx('grid shrink-0 place-items-center rounded-pill bg-yellow text-text-onYellow', className)}>
      <svg viewBox="0 0 24 24" className="h-[52%] w-[52%]" role="presentation">
        <path fill="currentColor" d="M3 2h6v11a3 3 0 0 0 6 0V2h6v11a9 9 0 0 1-18 0Z" />
      </svg>
    </span>
  )
}
