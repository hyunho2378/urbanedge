import { lineRgb, tok } from './colors.js'
import { grey } from './art/paint.js'

// 노선도와 진행 표시에서 쓰는 작은 전동차 글리프. 16px에서 64px까지 읽히도록 굵은 덩어리로만 그린다.
// side(기본): 옆모습, 앞쪽이 +x. 기준 상자는 x -16..16, y -9..9(길이 32). 검은 경사 앞유리, 노선색 띠, 창, 문, 바퀴.
// front: 정면, 기준 상자 x -10..10, y -10..10. 검은 유리 앞면, 노선색 띠, 전조등 두 개.
// 색은 토큰만 쓴다. 바깥 테두리(bg-base)로 어떤 노선 위에서도 윤곽이 남는다.
const SIDE_BODY = 'M-14.2 -7.6H8.6Q11.4 -7.6 12.7 -5.4L15.6 0.4Q16.2 1.6 16.2 2.8V4.4Q16.2 5.6 15 5.6H-14.2Q-15.4 5.6 -15.4 4.4V-6.4Q-15.4 -7.6 -14.2 -7.6Z'

export function TrainGlyph({ color = 'yellow', variant = 'side' }) {
  if (variant === 'front') return <TrainGlyphFront color={color} />
  const dark = tok('bg-base')
  const glass = tok('bg-panel')
  return (
    <g>
      <rect x="-7" y="-9.4" width="10" height="2.4" rx="1" fill={grey(70)} stroke={dark} strokeWidth="1.2" paintOrder="stroke" />
      <path d={SIDE_BODY} fill={tok('white')} stroke={dark} strokeWidth="2.4" strokeLinejoin="round" paintOrder="stroke" />
      <path d="M8.2 -7.6H8.6Q11.4 -7.6 12.7 -5.4L15.4 0H8.2Z" fill={glass} />
      <path d="M9.6 -6.6L11.2 -6.6L10.2 -1.4L9.6 -1.4Z" fill={tok('white')} opacity="0.35" />
      <rect x="-13.6" y="-5.2" width="4.4" height="3.8" rx="0.9" fill={glass} />
      <rect x="-3.8" y="-5.2" width="4.4" height="3.8" rx="0.9" fill={glass} />
      <rect x="-8.2" y="-6" width="3.4" height="10.4" rx="0.6" fill={grey(74)} />
      <rect x="1.6" y="-6" width="3.4" height="10.4" rx="0.6" fill={grey(74)} />
      <rect x="-7.6" y="-5.2" width="2.2" height="3.6" rx="0.5" fill={glass} />
      <rect x="2.2" y="-5.2" width="2.2" height="3.6" rx="0.5" fill={glass} />
      <path d="M-15.4 0.8H15.9L16.2 2.8H-15.4Z" fill={lineRgb(color)} />
      <circle cx="14.4" cy="4" r="0.9" fill={tok('yellow')} />
      <rect x="-13" y="5.6" width="26" height="1.4" fill={dark} />
      {[-10.4, -6.6, 6.6, 10.4].map((x) => <circle key={x} cx={x} cy="7.2" r="1.7" fill={dark} />)}
    </g>
  )
}

function TrainGlyphFront({ color }) {
  const dark = tok('bg-base')
  return (
    <g>
      <path d="M-6.6 -9.4H6.6Q8.8 -9.4 9 -7.2L9.6 6.4Q9.7 8 8 8H-8Q-9.7 8 -9.6 6.4L-9 -7.2Q-8.8 -9.4 -6.6 -9.4Z" fill={tok('white')} stroke={dark} strokeWidth="2.2" strokeLinejoin="round" paintOrder="stroke" />
      <path d="M-6.4 -8H6.4Q7.6 -8 7.7 -6.8L8 -0.6H-8L-7.7 -6.8Q-7.6 -8 -6.4 -8Z" fill={tok('bg-panel')} />
      <rect x="-4.6" y="-7.2" width="9.2" height="1.8" rx="0.5" fill={tok('yellow')} opacity="0.9" />
      <path d="M-5.6 -4.4L-3.2 -4.4L-5 -1.2L-7 -1.2Z" fill={tok('white')} opacity="0.35" />
      <rect x="-9.4" y="1" width="18.8" height="2" fill={lineRgb(color)} />
      <rect x="-7.6" y="4.4" width="3.4" height="1.8" rx="0.9" fill={tok('yellow')} />
      <rect x="4.2" y="4.4" width="3.4" height="1.8" rx="0.9" fill={tok('yellow')} />
      <rect x="-1.6" y="4" width="3.2" height="2.6" rx="0.6" fill={dark} />
      <rect x="-7" y="8" width="3" height="2" fill={dark} />
      <rect x="4" y="8" width="3" height="2" fill={dark} />
    </g>
  )
}

// HTML에서 쓰는 독립 SVG. rotate는 도 단위(세로 진행 표시는 90). variant: 'side' | 'front'.
// side의 상자 비율(34x20)과 중심은 이전과 같아 TrainTrack의 위치 계산이 그대로 맞는다.
export function TrainIcon({ color = 'yellow', size = 28, rotate = 0, variant = 'side', className, style, title }) {
  const front = variant === 'front'
  const vb = front ? '-11 -11 22 22' : '-17 -10 34 20'
  const h = front ? size : (size * 20) / 34
  return (
    <svg viewBox={vb} width={size} height={h} className={className} style={{ overflow: 'visible', transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : 'true'} focusable="false">
      <TrainGlyph color={color} variant={variant} />
    </svg>
  )
}
