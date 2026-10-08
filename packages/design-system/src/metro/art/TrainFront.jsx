// TrainFront.jsx: 전동차 정면(히어로용). 경사진 검은 유리 앞면, 호박색 행선 표시기, 와이퍼, 전조등과 후미등,
// 노선색 띠, UE 심볼, 충돌 방지대, 연결기, 배장기, 바퀴, 레일. 색은 토큰 변수만 쓴다.
import { useId } from 'react'
import { cx } from '../../components/cx.js'
import { typography } from '../../tokens.js'
import { lineRgb, tok } from '../colors.js'
import { PAINT as P, grey, lineShade } from './paint.js'
import { UEGlyph } from './ueMark.jsx'

const LABEL = typography.family.label

export function TrainFrontArt({ uid, color = 'yellow', destination = 'GY-01 URBANEDGE', number = '1101', lights = true }) {
  const body = 'M58 34H242Q266 34 270 58L280 238Q281 254 265 254H35Q19 254 20 238L30 58Q34 34 58 34Z'
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-fb`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={grey(78)} />
          <stop offset="0.16" stopColor={P.body} />
          <stop offset="0.84" stopColor={P.body} />
          <stop offset="1" stopColor={grey(76)} />
        </linearGradient>
        <linearGradient id={`${uid}-fg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={P.glassHi} />
          <stop offset="0.5" stopColor={P.glassDeep} />
          <stop offset="1" stopColor={P.glassDeep} />
        </linearGradient>
        <linearGradient id={`${uid}-fw`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={grey(30)} />
          <stop offset="1" stopColor={P.glass} />
        </linearGradient>
        <linearGradient id={`${uid}-fs`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lineRgb(color)} />
          <stop offset="1" stopColor={lineShade(color, 82)} />
        </linearGradient>
        <radialGradient id={`${uid}-fl`}>
          <stop offset="0" stopColor={tok('white')} stopOpacity="0.9" />
          <stop offset="1" stopColor={tok('white')} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-fc`}><path d={body} /></clipPath>
      </defs>
      <ellipse cx="150" cy="292" rx="150" ry="10" fill={tok('black')} opacity="0.35" />
      {[[56, 96], [204, 244]].map(([a, b]) => (
        <g key={a}>
          <rect x={a - 18} y={286} width={b - a + 36} height={6} rx={1.5} fill={grey(42)} />
          <rect x={a - 18} y={286} width={b - a + 36} height={1.6} fill={grey(74)} />
        </g>
      ))}
      <path d="M78 22H222Q232 22 234 32V38H66V32Q68 22 78 22Z" fill={grey(72)} />
      {[96, 112, 128, 172, 188, 204].map((x) => <line key={x} x1={x} x2={x} y1={26} y2={34} stroke={grey(52)} strokeWidth="2" strokeLinecap="round" />)}
      <path d={body} fill={`url(#${uid}-fb)`} />
      <g clipPath={`url(#${uid}-fc)`}>
        <path d="M60 44H240Q258 44 260 62L266 162Q267 176 252 176H48Q33 176 34 162L40 62Q42 44 60 44Z" fill={`url(#${uid}-fg)`} />
        <rect x="84" y="51" width="132" height="22" rx="3" fill={P.glassDeep} stroke={grey(26)} strokeWidth="1.2" />
        <text x="150" y="67" textAnchor="middle" fill={P.amber} style={{ fontFamily: LABEL, fontSize: 14, fontWeight: 700, letterSpacing: '0.1em' }}>{destination}</text>
        <path d="M58 82H242L250 164H50Z" fill={`url(#${uid}-fw)`} opacity="0.92" />
        <path d="M70 140H118L114 164H62Z" fill={P.glassDeep} opacity="0.7" />
        <path d="M182 140H230L238 164H186Z" fill={P.glassDeep} opacity="0.7" />
        <rect x="128" y="94" width="44" height="46" rx="5" fill={grey(20)} />
        <rect x="132" y="98" width="36" height="34" rx="3" fill={P.warm} opacity="0.42" />
        <rect x="134" y="120" width="32" height="10" rx="2" fill={P.seat} opacity="0.6" />
        <path d="M70 84L110 84L74 164L52 164Z" fill={P.shine} />
        <path d="M124 84L134 84L102 164L92 164Z" fill={P.shine2} />
        <path d="M74 160L128 128M172 160L226 128" stroke={P.underLo} strokeWidth="2.6" strokeLinecap="round" />
        <text x="58" y="171" fill={tok('white')} opacity="0.85" style={{ fontFamily: LABEL, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>{number}</text>
        <rect x="0" y="184" width="300" height="12" fill={`url(#${uid}-fs)`} />
        <rect x="0" y="196" width="300" height="1.6" fill={lineShade(color, 60)} />
        <rect x="0" y="236" width="300" height="20" fill={P.rubber} />
        <rect x="0" y="236" width="300" height="1.6" fill={tok('white')} opacity="0.2" />
      </g>
      <path d="M58 35H242Q264 35 268 58" fill="none" stroke={tok('white')} strokeOpacity="0.9" strokeWidth="1.6" />
      {[-1, 1].map((s) => {
        const x0 = s < 0 ? 42 : 214
        return (
          <g key={s}>
            <rect x={x0} y={206} width={44} height={16} rx={6} fill={P.rubber} />
            <rect x={s < 0 ? x0 + 4 : x0 + 22} y={209} width={18} height={10} rx={4} fill={lights ? P.headlight : grey(70)} />
            <rect x={s < 0 ? x0 + 25 : x0 + 4} y={210} width={14} height={8} rx={3.4} fill={P.tail} opacity="0.55" />
            {lights && <circle cx={s < 0 ? x0 + 13 : x0 + 31} cy={214} r={20} fill={`url(#${uid}-fl)`} />}
          </g>
        )
      })}
      <UEGlyph x={136.4} y={205} h={20} fill={tok('bg-base')} />
      <rect x="128" y="254" width="44" height="10" rx="3" fill={P.underLo} />
      <rect x="140" y="250" width="20" height="22" rx="4" fill={grey(36)} stroke={P.underLo} strokeWidth="1.4" />
      <rect x="144" y="256" width="12" height="8" rx="2" fill={P.underLo} />
      <path d="M30 254H270L262 274Q260 278 254 278H46Q40 278 38 274Z" fill={P.under} />
      {[60, 90, 120, 180, 210, 240].map((x) => <line key={x} x1={x} x2={x + (x < 150 ? -3 : 3)} y1={258} y2={274} stroke={P.rubber} strokeWidth="2" />)}
      {[60, 220].map((x) => (
        <g key={x}>
          <rect x={x} y={276} width={20} height={12} rx={2} fill={P.underLo} />
          <rect x={x + 2} y={277} width={16} height={2} fill={grey(46)} />
        </g>
      ))}
    </g>
  )
}

// 정면 히어로 SVG. viewBox 0 0 300 300.
export function TrainFront({ color = 'yellow', destination = 'GY-01 URBANEDGE', number = '1101', lights = true, className, title }) {
  const uid = `tf${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox="0 0 300 300" className={cx('block h-auto w-full', className)} role="img" aria-label={title || 'UrbanEdge metro train, front view'}>
      <TrainFrontArt uid={uid} color={color} destination={destination} number={number} lights={lights} />
    </svg>
  )
}
