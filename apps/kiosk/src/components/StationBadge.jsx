import { cx } from '@urbanedge/ds'

// 큰 노선 배지. 디자인시스템 LineBadge의 kiosk 크기는 spacing 스케일에 없는 size-88을 쓰므로, 같은 모양을 스케일 안의 크기로 다시 만들었다.
// 색 규칙은 LineBadge와 같다(노랑과 초록은 어두운 글자, 빨강과 파랑은 밝은 글자).
const BG = { yellow: 'bg-line-yellow text-text-onYellow', red: 'bg-line-red text-text-pri', blue: 'bg-line-blue text-text-pri', green: 'bg-line-green text-text-onYellow' }
const SIZE = { md: 'size-64 text-k-btn', lg: 'size-80 text-k-h3', xl: 'size-96 text-k-h3' }

export function StationBadge({ code, color = 'yellow', size = 'lg', className }) {
  return <span className={cx('inline-grid shrink-0 place-items-center rounded-pill font-label font-bold leading-none tracking-tight', SIZE[size], BG[color], className)}>{code}</span>
}
