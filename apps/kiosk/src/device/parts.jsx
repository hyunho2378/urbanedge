// parts.jsx: 기기 부품을 inline SVG로 그린다. 색은 tokens의 --ue-* 채널 변수만 쓴다.
// 각 부품은 자기 viewBox를 가지며 부모 박스(geometry.js의 퍼센트 박스)를 가득 채운다.
import { useId } from 'react'

const c = (name, a = 1) => `rgb(var(--ue-${name}) / ${a})`
const fill = (name, a = 1) => ({ fill: c(name, a) })
const stroke = (name, a = 1, w = 1) => ({ fill: 'none', stroke: c(name, a), strokeWidth: w })
const stop = (name, a = 1) => ({ stopColor: c(name, a) })

// 렌즈 구멍: 흰 테두리, 어두운 내부, 오른쪽 아래 푸른 아크릴 반사, 웹캠 본체와 렌즈통, 표시등
export function LensPart({ active }) {
  const u = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 100 100" className="dv-svg" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${u}-hole`}>
          <circle cx="50" cy="50" r="45.5" />
        </clipPath>
        <radialGradient id={`${u}-glass`} cx="0.78" cy="0.8" r="0.7">
          <stop offset="0" style={stop('line-blue', 0.6)} />
          <stop offset="1" style={stop('line-blue', 0)} />
        </radialGradient>
        <radialGradient id={`${u}-barrel`} cx="0.38" cy="0.36" r="0.75">
          <stop offset="0" style={stop('white', 0.34)} />
          <stop offset="0.45" style={stop('white', 0.05)} />
          <stop offset="1" style={stop('black', 0.55)} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" style={fill('black', 0.2)} />
      <circle cx="50" cy="50" r="48" style={fill('white')} />
      <g clipPath={`url(#${u}-hole)`}>
        <rect width="100" height="100" style={fill('bg-base')} />
        <rect width="100" height="100" fill={`url(#${u}-glass)`} />
        <path d="M52 100 L100 36 V100 Z" style={fill('line-blue', 0.38)} />
        <g transform="rotate(-9 42 52)">
          <rect x="14" y="24" width="60" height="50" rx="10" style={fill('black', 0.92)} />
          <rect x="14.5" y="24.5" width="59" height="49" rx="9.5" style={stroke('white', 0.14, 0.8)} />
          <circle cx="42" cy="49" r="21" style={fill('bg-panel')} />
          <circle cx="42" cy="49" r="21" fill={`url(#${u}-barrel)`} />
          <circle cx="42" cy="49" r="13.5" style={fill('black', 0.94)} />
          <circle cx="42" cy="49" r="13.5" style={stroke('white', 0.18, 0.8)} />
          <circle cx="42" cy="49" r="6.5" style={fill('line-blue', 0.3)} />
          <circle cx="37.5" cy="44.5" r="2.4" style={fill('white', 0.65)} />
          <path d="M26 36 A21 21 0 0 1 40 28" style={stroke('white', 0.35, 1.2)} />
        </g>
      </g>
      <circle cx="50" cy="50" r="46" style={stroke('black', 0.28, 1.4)} />
      {/* 표시등: 평소에는 꺼진 점, cameraActive에서 빨간 점과 번짐 */}
      <circle cx="73" cy="30" r="3.2" style={fill('black', 0.75)} />
      <circle cx="73" cy="30" r="3.2" style={stroke('white', 0.2, 0.7)} />
      <g className="dv-lens-glow" data-on={active ? 'true' : 'false'}>
        <circle cx="73" cy="30" r="9" style={fill('line-red', 0.28)} />
        <circle cx="73" cy="30" r="4.4" style={fill('line-red', 0.5)} />
        <circle cx="73" cy="30" r="3.2" style={fill('line-red')} />
        <circle cx="50" cy="50" r="47" style={stroke('line-red', 0.55, 2)} />
      </g>
    </svg>
  )
}

// 카드 단말기: 검은 본체, 초록 LED 바, 카드 슬릿, 파란 점, 아래 받침판
export function CardReaderPart({ hint }) {
  const u = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 185 84" className="dv-svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${u}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop('white', 0.2)} />
          <stop offset="0.25" style={stop('white', 0.04)} />
          <stop offset="1" style={stop('black', 0.2)} />
        </linearGradient>
        <filter id={`${u}-blur`} x="-30%" y="-300%" width="160%" height="700%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path d="M30 70 H168 L173 79 Q173 82 169 82 H34 Q30 82 30 79 Z" style={fill('black', 0.82)} />
      <path d="M6 14 Q6 4 16 4 H172 Q181 4 181 13 V64 Q181 74 172 74 H15 Q6 74 6 65 Z" style={fill('bg-base')} />
      <path d="M6 14 Q6 4 16 4 H172 Q181 4 181 13 V64 Q181 74 172 74 H15 Q6 74 6 65 Z" fill={`url(#${u}-top)`} />
      <path d="M12 5.5 H175" style={stroke('white', 0.28, 1.2)} />
      <rect x="20" y="13" width="26" height="2.6" rx="1" style={fill('white', 0.32)} />
      <rect x="20" y="18" width="14" height="2" rx="1" style={fill('white', 0.18)} />
      <rect x="26" y="26" width="132" height="26" rx="3" style={fill('black', 0.7)} />
      <rect x="26.5" y="26.5" width="131" height="25" rx="2.6" style={stroke('white', 0.1, 0.8)} />
      <g className="dv-card-led" data-hint={hint ? 'true' : 'false'}>
        <rect x="50" y="31" width="82" height="6" rx="3" style={fill('state-success', 0.9)} filter={`url(#${u}-blur)`} />
        <rect x="50" y="31" width="82" height="5" rx="2.5" style={fill('state-success')} />
      </g>
      <rect x="36" y="42" width="112" height="3" rx="1.5" style={fill('white', 0.14)} />
      <rect x="62" y="56" width="52" height="2.2" rx="1" style={fill('white', 0.22)} />
      <circle cx="166" cy="44" r="5" style={fill('line-blue', 0.35)} filter={`url(#${u}-blur)`} />
      <circle cx="166" cy="44" r="2.6" style={fill('line-blue')} />
    </svg>
  )
}

// 문 손잡이: 은색 레버
export function HandlePart() {
  const u = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 38 61" className="dv-svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${u}-metal`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={stop('black', 0.3)} />
          <stop offset="0.35" style={stop('white', 1)} />
          <stop offset="0.7" style={stop('black', 0.08)} />
          <stop offset="1" style={stop('black', 0.38)} />
        </linearGradient>
      </defs>
      <rect x="5" y="2" width="28" height="57" rx="14" style={fill('black', 0.25)} />
      <rect x="6" y="1" width="26" height="56" rx="13" fill={`url(#${u}-metal)`} />
      <rect x="6" y="1" width="26" height="56" rx="13" style={stroke('black', 0.32, 1)} />
      <rect x="15" y="12" width="8" height="28" rx="4" style={fill('black', 0.55)} />
      <rect x="16" y="13" width="2" height="26" rx="1" style={fill('white', 0.35)} />
    </svg>
  )
}

// 문 위의 검은 슬롯 판
export function SlotPlatePart() {
  return (
    <svg viewBox="0 0 117 49" className="dv-svg" aria-hidden="true" focusable="false">
      <rect x="5" y="40" width="107" height="8" rx="1.5" style={fill('black', 0.5)} />
      <rect x="0" y="0" width="117" height="42" rx="2.5" style={fill('bg-base')} />
      <rect x="0.5" y="0.5" width="116" height="41" rx="2" style={stroke('white', 0.14, 1)} />
      <rect x="10" y="13" width="97" height="9" rx="1.5" style={fill('black')} />
      <rect x="10" y="13" width="97" height="9" rx="1.5" style={stroke('white', 0.16, 0.8)} />
      <rect x="2" y="9" width="6" height="18" rx="1" style={fill('white', 0.3)} />
      <rect x="109" y="9" width="6" height="18" rx="1" style={fill('white', 0.3)} />
    </svg>
  )
}

// 안내 스티커. 전화번호는 숫자를 옮기지 않고 막대로만 표현한다.
export function StickerPart() {
  return (
    <svg viewBox="0 0 83 46" className="dv-svg" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="82" height="45" rx="3" style={fill('white')} />
      <rect x="0.5" y="0.5" width="82" height="45" rx="3" style={stroke('black', 0.24, 1)} />
      <text x="7" y="15" fontSize="8.4" fontWeight="700" className="font-sans" style={fill('black', 0.82)}>
        If you need help.
      </text>
      <rect x="7" y="21" width="69" height="0.8" style={fill('black', 0.18)} />
      <rect x="8" y="28" width="8" height="11" rx="1.6" style={stroke('black', 0.8, 1.2)} />
      <rect x="10.6" y="36" width="2.8" height="1" rx="0.5" style={fill('black', 0.8)} />
      <rect x="21" y="30" width="54" height="5.4" rx="1.2" style={fill('black', 0.5)} />
    </svg>
  )
}

// CCTV 안내문 왼쪽: 기기이동금지(빨간 글자의 종이 안내문)
export function NoticeMovePart() {
  return (
    <svg viewBox="0 0 96 58" className="dv-svg" aria-hidden="true" focusable="false">
      <rect x="1" y="1.6" width="94" height="56" style={fill('black', 0.16)} />
      <rect x="0.5" y="0.5" width="95" height="56" style={fill('white')} />
      <rect x="0.5" y="0.5" width="95" height="56" style={stroke('black', 0.14, 0.8)} />
      <text x="48" y="19" textAnchor="middle" fontSize="12.5" fontWeight="600" letterSpacing="1" className="font-sans" style={fill('line-red')}>
        기기이동금지
      </text>
      <text x="48" y="31" textAnchor="middle" fontSize="5.2" className="font-sans" style={fill('black', 0.8)}>
        기기 위치가 변경되면
      </text>
      <text x="48" y="39.5" textAnchor="middle" fontSize="5.2" className="font-sans" style={fill('black', 0.8)}>
        배경의 벽이 함께 촬영될
      </text>
      <text x="48" y="48" textAnchor="middle" fontSize="5.2" className="font-sans" style={fill('black', 0.8)}>
        수 있습니다
      </text>
    </svg>
  )
}

// CCTV 안내문 오른쪽: 빨간 금지 원 안의 카메라와 CCTV 녹화중
export function NoticeCctvPart() {
  return (
    <svg viewBox="0 0 61 58" className="dv-svg" aria-hidden="true" focusable="false">
      <rect x="1" y="1.6" width="59" height="56" rx="3" style={fill('black', 0.16)} />
      <rect x="0.5" y="0.5" width="60" height="56" rx="3" style={fill('white')} />
      <rect x="0.5" y="0.5" width="60" height="56" rx="3" style={stroke('black', 0.16, 0.8)} />
      <circle cx="30.5" cy="21" r="13.5" style={stroke('line-red', 1, 2.4)} />
      <rect x="21.5" y="16.5" width="14" height="7.6" rx="1.2" style={fill('black', 0.85)} />
      <path d="M35.5 17.5 L40 15 V25 L35.5 22.5 Z" style={fill('black', 0.85)} />
      <rect x="25" y="24" width="4" height="4" style={fill('black', 0.85)} />
      <path d="M21 11.5 L40 30.5" style={stroke('line-red', 1, 2.4)} />
      <text x="30.5" y="45" textAnchor="middle" fontSize="6.8" fontWeight="800" className="font-sans" style={fill('black', 0.88)}>
        CCTV 녹화중
      </text>
      <text x="30.5" y="51.4" textAnchor="middle" fontSize="3.8" fontWeight="500" className="font-sans" style={fill('black', 0.7)}>
        CCTV in Operation
      </text>
    </svg>
  )
}

// 인화 출구와 트레이: 위쪽 어두운 틈, 안쪽 벽, 오른쪽 벽, 흰 선반. 사진처럼 무광으로 그린다.
export function TrayPart() {
  const u = useId().replace(/:/g, '')
  const pocket = 'M0 0 H236 Q264 0 264 28 V191 Q264 207 248 207 H16 Q0 207 0 191 Z'
  return (
    <svg viewBox="0 0 264 207" className="dv-svg" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${u}-pocket`}>
          <path d={pocket} />
        </clipPath>
        <linearGradient id={`${u}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop('black', 0.3)} />
          <stop offset="1" style={stop('black', 0)} />
        </linearGradient>
        <linearGradient id={`${u}-shelf`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop('black', 0.09)} />
          <stop offset="0.45" style={stop('black', 0)} />
          <stop offset="1" style={stop('black', 0)} />
        </linearGradient>
        <linearGradient id={`${u}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={stop('black', 0.1)} />
          <stop offset="1" style={stop('black', 0)} />
        </linearGradient>
      </defs>
      <path d="M-3 -2 H238 Q267 -2 267 28 V193 Q267 210 249 210 H15 Q-3 210 -3 193 Z" style={fill('black', 0.1)} />
      <g clipPath={`url(#${u}-pocket)`}>
        <rect width="264" height="207" style={fill('white')} />
        <rect width="264" height="207" style={fill('black', 0.08)} />
        <rect width="264" height="60" fill={`url(#${u}-top)`} />
        <rect x="3" y="3" width="206" height="10" rx="1" style={fill('black', 0.92)} />
        <path d="M225 14 L264 28 V196 L219 105 Z" style={fill('white')} />
        <path d="M225 14 L264 28 V196 L219 105 Z" fill={`url(#${u}-side)`} />
        <path d="M0 105 H219 L264 196 L250 207 H30 L6 190 Z" style={fill('white')} />
        <path d="M0 105 H219 L264 196 L250 207 H30 L6 190 Z" fill={`url(#${u}-shelf)`} />
        <path d="M225 14 L219 105" style={stroke('black', 0.16, 1)} />
        <path d="M6 190 L30 207 H250" style={stroke('black', 0.14, 1)} />
      </g>
      <path d={pocket} style={stroke('black', 0.26, 1.2)} />
    </svg>
  )
}
