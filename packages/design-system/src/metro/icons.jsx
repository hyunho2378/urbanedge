// icons.jsx: 방과 이용 단계 아이콘. 24x24 격자, 선 아이콘. 경로 일부는 lucide(ISC)를 따랐고 출처는 docs/CREDITS.md에 있다.
// subway(정면 전동차)와 train(옆모습 전동차)은 이 키트의 열차 일러스트에 맞춰 새로 그렸다.
const P = {
  door: (<><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></>),
  subway: (<><path d="M7 3.5h10a3 3 0 0 1 3 3v9.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16V6.5a3 3 0 0 1 3-3Z" /><path d="M4.4 11h15.2" /><path d="M9 3.5 8.2 11M15 3.5l.8 7.5" /><circle cx="8" cy="15" r="0.6" /><circle cx="16" cy="15" r="0.6" /><path d="m8 18.5-2 3M16 18.5l2 3M7 21.5h10" /></>),
  train: (<><path d="M2 7.5h15.2a3 3 0 0 1 2.7 1.7l1.8 3.8a3 3 0 0 1 .3 1.3V16a1.5 1.5 0 0 1-1.5 1.5H2" /><path d="M17 7.5V12h4.8" /><path d="M5 10.5h3M10.5 10.5h3" /><circle cx="6" cy="19.5" r="1.5" /><circle cx="16" cy="19.5" r="1.5" /></>),
  mic: (<><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></>),
  phone: (<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />),
  retro: (<><rect width="20" height="16" x="2" y="4" rx="2" /><circle cx="8" cy="10" r="2" /><path d="M8 12h8" /><circle cx="16" cy="10" r="2" /><path d="m6 20 .7-2.9A1.4 1.4 0 0 1 8.1 16h7.8a1.4 1.4 0 0 1 1.4 1.1l.7 2.9" /></>),
  grid: (<><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></>),
  user: (<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>),
  camera: (<><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>),
  printer: (<><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></>),
  exit: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></>),
  landmark: (<><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></>),
  star: (<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />),
  waves: (<><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" /></>),
  check: (<polyline points="20 6 9 17 4 12" />),
  arrow: (<><line x1="5" x2="19" y1="12" y2="12" /><polyline points="12 5 19 12 12 19" /></>),
}

export const ICON_NAMES = Object.keys(P)

// SVG 안에 넣는 그룹. (cx, cy) 중심에 size px 크기로 그린다. 색은 currentColor가 아니라 stroke prop을 따른다.
export function StationIconGroup({ name, cx = 0, cy = 0, size = 16, stroke, strokeWidth = 2.2 }) {
  const body = P[name]
  if (!body) return null
  const s = size / 24
  return (
    <g transform={`translate(${cx - size / 2} ${cy - size / 2}) scale(${s})`} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {body}
    </g>
  )
}

// HTML 안에서 쓰는 독립 SVG 아이콘
export function StationIcon({ name, size = 20, className, style, strokeWidth = 2.25 }) {
  const body = P[name]
  if (!body) return null
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={{ stroke: 'currentColor', ...style }} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {body}
    </svg>
  )
}
