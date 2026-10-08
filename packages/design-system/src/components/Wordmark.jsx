import { cx } from './cx.js'

// 텍스트 워드마크. 공식 로고 이미지는 apps의 public/img를 쓴다.
export function Wordmark({ className, sub = true }) {
  return (
    <span className={cx('inline-flex flex-col leading-none text-text-pri', className)}>
      <span className="font-brand text-h4 font-bold tracking-tightest">UrbanEdge</span>
      {sub && <span className="ue-label mt-4 text-caption text-text-sec">Metrography</span>}
    </span>
  )
}
