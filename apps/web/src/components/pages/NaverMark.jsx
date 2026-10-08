// 네이버 N 로고(초록 사각형 위 흰 N). 링크 옆 아이콘 전용이라 스크린리더에서는 숨긴다.
export function NaverMark({ size = 18, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className} style={{ flexShrink: 0 }}>
      <rect width="24" height="24" rx="5" fill="#03C75A" />
      <path d="M13.6 12.4 10.2 7.5H7.5v9h2.9v-4.9l3.4 4.9h2.7v-9h-2.9z" fill="#FFFFFF" />
    </svg>
  )
}
