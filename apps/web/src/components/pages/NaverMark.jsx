// 네이버 표시: 인스타그램 아이콘처럼 단색(currentColor) 선 사각형 안에 N. 링크 옆 아이콘 전용이라 스크린리더에서는 숨긴다.
export function NaverMark({ size = 18, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} style={{ flexShrink: 0 }}>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M13.2 12.3 10.4 8.2H8.4v7.6h2.4v-4.1l2.8 4.1h2V8.2h-2.4z" fill="currentColor" />
    </svg>
  )
}
