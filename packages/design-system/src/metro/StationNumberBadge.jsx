import { cx } from '../components/cx.js'
import { typography } from '../tokens.js'
import { lineRgb, tok, INK } from './colors.js'

// 높이(px)
const SIZES = { xs: 16, sm: 20, md: 26, lg: 38, xl: 56, kiosk: 72 }
const LABEL = typography.family.label
// Barlow Condensed 굵은 숫자의 평균 폭(em). 글자 수로 알약 폭을 잡는다.
const ADV = 0.52

// 서울 지하철식 역 번호 캡슐. 왼쪽은 노선색 원(노선 문자), 오른쪽은 흰 바탕 위 역 번호, 바깥은 accent 색 테두리.
// code는 'GY-01', 'H03'처럼 노선 문자 뒤에 번호가 붙은 문자열이다. split=false이면 흰 캡슐 안에 코드 전체를 쓴다.
export function StationNumberBadge({ code = 'GY-01', lineColor = 'yellow', accent, size = 'md', split = true, className, label }) {
  const h = typeof size === 'number' ? size : SIZES[size] || SIZES.md
  const ring = accent || lineColor
  const m = /^([A-Za-z]+)-?(\d+)$/.exec(code)
  const useSplit = split && !!m
  const letter = m ? m[1].toUpperCase() : ''
  const num = m ? m[2] : String(code)
  const bw = Math.max(1.4, h * 0.11)
  const fNum = h * 0.66
  const numW = (useSplit ? num : String(code)).length * fNum * ADV
  const circ = h
  const w = useSplit ? circ + numW + h * 0.46 : numW + h * 0.9
  const fLet = letter.length > 1 ? h * 0.46 : h * 0.58
  return (
    <span role="img" aria-label={label || `Station ${code}`} className={cx('inline-block shrink-0 select-none align-middle', className)} style={{ width: w, height: h, lineHeight: 0 }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true" focusable="false" style={{ display: 'block', overflow: 'visible' }}>
        <rect x={bw / 2} y={bw / 2} width={w - bw} height={h - bw} rx={(h - bw) / 2} fill={tok('white')} stroke={lineRgb(ring)} strokeWidth={bw} />
        {useSplit ? (
          <>
            <circle cx={h / 2} cy={h / 2} r={h / 2} fill={lineRgb(lineColor)} />
            {h >= 30 && <circle cx={h / 2} cy={h / 2} r={h * 0.42} fill="none" stroke={tok('white')} strokeOpacity="0.9" strokeWidth={h * 0.045} />}
            <text x={h / 2} y={h / 2 + fLet * 0.355} textAnchor="middle" fill={INK} style={{ fontFamily: LABEL, fontSize: fLet, fontWeight: 800, letterSpacing: '-0.02em' }}>{letter}</text>
            <text x={circ + h * 0.16 + numW / 2} y={h / 2 + fNum * 0.355} textAnchor="middle" fill={INK} style={{ fontFamily: LABEL, fontSize: fNum, fontWeight: 800, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums' }}>{num}</text>
          </>
        ) : (
          <text x={w / 2} y={h / 2 + fNum * 0.355} textAnchor="middle" fill={INK} style={{ fontFamily: LABEL, fontSize: fNum, fontWeight: 800, letterSpacing: '0.01em', fontVariantNumeric: 'tabular-nums' }}>{code}</text>
        )}
      </svg>
    </span>
  )
}

// 승강장 번호판. 둥근 사각 판(accent) 위 굵은 숫자, 위쪽 검은 띠에 작은 PLATFORM 표기(그림 속 표기).
// 판 아래 선로 두 줄 기호로 승강장임을 알린다. caption=false면 숫자만.
export function PlatformNumberBadge({ n = 1, accent = 'yellow', size = 'md', caption = true, className, label }) {
  const h = typeof size === 'number' ? size : SIZES[size] || SIZES.md
  const showCap = caption && h >= 30
  const w = h * 0.86
  const r = h * 0.16
  return (
    <span role="img" aria-label={label || `Platform ${n}`} className={cx('inline-block shrink-0 select-none align-middle', className)} style={{ width: w, height: h, lineHeight: 0 }}>
      <svg viewBox="0 0 86 100" width={w} height={h} aria-hidden="true" focusable="false" style={{ display: 'block', overflow: 'visible' }}>
        <rect x="0" y="0" width="86" height="100" rx={(r / h) * 100} fill={tok('bg-base')} stroke={tok('white')} strokeOpacity="0.28" strokeWidth={Math.max(1.6, 100 / h)} />
        <rect x="4" y={showCap ? 20 : 4} width="78" height={showCap ? 76 : 92} rx="11" fill={lineRgb(accent)} />
        {showCap && <text x="43" y="14.6" textAnchor="middle" fill={tok('white')} style={{ fontFamily: LABEL, fontSize: 12.5, fontWeight: 700, letterSpacing: '0.16em' }}>PLATFORM</text>}
        <text x="43" y={showCap ? 81 : 76} textAnchor="middle" fill={INK} style={{ fontFamily: LABEL, fontSize: showCap ? 66 : 82, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{n}</text>
      </svg>
    </span>
  )
}
