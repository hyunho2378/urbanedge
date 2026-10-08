import { Hand, QrCode as QrIcon, Ticket, ArrowDown } from 'lucide-react'

import { TrainIcon } from '@urbanedge/ds'
import { T } from './lang.jsx'
import { COPY } from '../flow/copy.js'

// 온보딩 슬라이드용 도식. 전부 inline SVG와 CSS이며 색은 토큰 클래스만 쓴다.
const PULSE = { transformBox: 'fill-box', transformOrigin: 'center' }

// 1) 네 정거장: 세로 노선에 선택, 촬영, 배치, 인화
export function HowRoute({ stops }) {
  const n = stops.en.length
  return (
    <div className="relative" style={{ width: 560, height: 700 }}>
      <div className="absolute rounded-pill bg-yellow" style={{ left: 52, top: 56, width: 20, height: 590 }} aria-hidden="true" />
      <div className="absolute" style={{ left: 20, top: -8 }}>
        <TrainIcon size={84} rotate={90} />
      </div>
      <ol className="absolute inset-x-0" style={{ top: 28 }}>
        {Array.from({ length: n }, (_, i) => (
          <li key={i} className="absolute flex items-center gap-28" style={{ top: 22 + i * 196, left: 0 }}>
            <span className="grid place-items-center rounded-pill bg-black ring-8 ring-yellow" style={{ width: 120, height: 120, marginLeft: 0 }}>
              <span className="kt-subhead text-yellow">{i + 1}</span>
            </span>
            <T n={{ en: stops.en[i], ko: stops.ko[i] }} as="span" className="kt-headline" />
          </li>
        ))}
      </ol>
    </div>
  )
}

// 2) 거울과 렌즈: 화면은 거울이고 렌즈는 화면 아래에 있다
export function LensDiagram() {
  const L = COPY.intro.slides.lens
  return (
    <div className="relative" style={{ width: 640, height: 760 }}>
      <svg viewBox="0 0 640 760" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect x="20" y="20" width="600" height="360" rx="36" className="fill-black" />
        <rect x="44" y="44" width="552" height="312" rx="20" className="fill-bg-raised" />
        <circle cx="320" cy="170" r="52" className="fill-text-pri/60" />
        <path d="M200 356 C206 262 260 232 320 232 C380 232 434 262 440 356 Z" className="fill-text-pri/60" />
        <rect x="20" y="380" width="600" height="44" rx="0" className="fill-black/30" />
        <path d="M320 436 V548" className="stroke-black" strokeWidth="18" strokeLinecap="round" />
        <path d="M280 520 L320 568 L360 520" className="fill-none stroke-black" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="320" cy="660" r="84" className="k-ripple fill-none stroke-black" strokeWidth="6" style={PULSE} />
        <circle cx="320" cy="660" r="84" className="k-ripple k-ripple-2 fill-none stroke-black" strokeWidth="6" style={PULSE} />
        <circle cx="320" cy="660" r="72" className="fill-black" />
        <circle cx="320" cy="660" r="46" className="fill-bg-raised" />
        <circle cx="320" cy="660" r="20" className="fill-yellow" />
      </svg>
      <span className="kt-label absolute left-1/2 -translate-x-1/2 rounded-pill bg-bg-base px-20 py-4 text-text-pri" style={{ top: 28 }}>
        <T n={L.screen} inline />
      </span>
      <span className="kt-label absolute rounded-pill bg-bg-base px-20 py-4 text-yellow" style={{ left: 432, top: 636 }}>
        <T n={L.lens} inline />
      </span>
    </div>
  )
}

// 3) 서는 곳과 출구: 기기 정면과 출구 표지
export function StandDiagram() {
  const L = COPY.intro.slides.stand
  return (
    <div className="relative" style={{ width: 640, height: 760 }}>
      <svg viewBox="0 0 640 760" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <rect x="120" y="10" width="400" height="700" rx="28" className="fill-text-pri" />
        <rect x="150" y="40" width="340" height="230" rx="10" className="fill-bg-base" />
        <rect x="158" y="48" width="324" height="26" rx="4" className="fill-yellow" />
        <circle cx="320" cy="334" r="34" className="fill-bg-base" />
        <circle cx="320" cy="334" r="20" className="fill-bg-raised" />
        <circle cx="320" cy="334" r="7" className="fill-yellow" />
        <rect x="372" y="396" width="116" height="42" rx="9" className="fill-bg-base" />
        <rect x="392" y="412" width="70" height="7" rx="3.5" className="fill-state-success" />
        <rect x="150" y="480" width="340" height="150" rx="12" className="fill-none stroke-text-meta" strokeWidth="3" />
        <rect x="210" y="648" width="220" height="14" rx="7" className="fill-bg-base" />
        <rect x="186" y="662" width="268" height="30" rx="6" className="fill-yellow" />
        <ellipse cx="320" cy="728" rx="90" ry="14" className="fill-text-pri/20" />
      </svg>
      <span className="kt-label absolute rounded-pill bg-yellow px-20 py-4 text-text-onYellow" style={{ left: 480, top: 640 }}>
        <T n={L.slot} inline />
      </span>
      <ArrowDown className="k-nudge absolute -rotate-90 text-yellow" size={64} strokeWidth={3} style={{ left: 410, top: 628 }} aria-hidden="true" />
      <span className="kt-label absolute rounded-pill bg-yellow px-20 py-4 text-text-onYellow" style={{ left: 8, top: 304 }}>
        <T n={L.stand} inline />
      </span>
      <ArrowDown className="k-nudge absolute text-yellow" size={64} strokeWidth={3} style={{ left: 8, top: 360 }} aria-hidden="true" />
    </div>
  )
}

// 4) 끌어서 바꾸기: 컷이 칸으로 끌려 들어가는 모습
export function DragDemo({ tiles }) {
  return (
    <div className="relative" style={{ width: 760, height: 360 }} aria-hidden="true">
      <div className="absolute flex gap-24" style={{ left: 0, top: 24 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-bg-raised" style={{ width: 200, height: 266 }} />
        ))}
      </div>
      {tiles.map((src, i) => (
        <img key={src} src={src} alt="" draggable={false} className="k-photo-edge absolute rounded-xl object-cover" style={{ width: 200, height: 266, left: i === 0 ? 0 : 224 * i, top: i === 0 ? 24 : 24, opacity: i === 2 ? 0.9 : 1 }} />
      ))}
      <div className="k-drag-demo absolute" style={{ left: 120, top: 150, '--k-dx': '224px', '--k-dy': '0px' }}>
        <Hand size={104} className="fill-white text-bg-base" strokeWidth={1.6} />
      </div>
    </div>
  )
}

// 5) 쿠폰: 웹사이트 스크래치 카드와 QR
export function CouponDemo({ code }) {
  return (
    <div className="relative" style={{ width: 760, height: 380 }} aria-hidden="true">
      <div className="absolute rounded-xl bg-yellow text-text-onYellow k-lift" style={{ left: 0, top: 30, width: 480, height: 300, transform: 'rotate(-5deg)' }}>
        <div className="flex items-center gap-12 px-32 pt-28">
          <Ticket size={44} strokeWidth={2.4} />
          <span className="kt-label">Urban Edge</span>
        </div>
        <div className="mx-32 mt-28 rounded-xl bg-bg-base px-24 py-20 text-center text-text-pri">
          <p className="kt-subhead font-label tracking-wider">{code}</p>
        </div>
        <p className="kt-caption px-32 pt-16">Scratch card</p>
      </div>
      <div className="absolute grid place-items-center rounded-xl bg-white text-bg-base k-lift" style={{ left: 440, top: 100, width: 250, height: 250, transform: 'rotate(4deg)' }}>
        <QrIcon size={176} strokeWidth={1.6} />
      </div>
    </div>
  )
}

