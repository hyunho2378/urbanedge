import { WORDMARK_ONLY_PATH, WORDMARK_ONLY_VIEWBOX } from './wordmarkOnly.js'

// UrbanEdge 워드마크(Metrography 없음). 색은 currentColor. 헤더, 모바일 메뉴, 푸터가 함께 쓴다.
export default function Wordmark({ className, ...rest }) {
  return (
    <svg viewBox={WORDMARK_ONLY_VIEWBOX} aria-hidden="true" role="presentation" className={className} {...rest}>
      <path d={WORDMARK_ONLY_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
