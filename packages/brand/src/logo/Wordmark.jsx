import { WORDMARK_PATH, WORDMARK_VIEWBOX } from './wordmarkPath.js'

// UrbanEdgeWordmark: 공식 워드마크(UrbanEdge + Metrography) 트레이스 벡터. 색은 currentColor.
export function UrbanEdgeWordmark({ className, title = 'UrbanEdge Metrography', ...rest }) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} role="img" aria-label={title} className={className} {...rest}>
      <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
