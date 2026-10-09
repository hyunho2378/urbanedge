// PlatformScene.jsx: 승강장 일러스트 키트. 타일 기둥, 조명, 행선 전광판, 역명판, 노란 점자 블록, 의자, 벽 포스터, 열차.
// 같은 부품(TrainCars, StationIconGroup)으로 조립하고 승강장 1에서 4의 강조색(노랑, 빨강, 파랑, 초록)으로 바꾼다.
// viewBox 0 0 1600 1000. 색은 토큰 변수만 쓴다. 글자는 역 코드와 안내판 같은 그림 속 표기만 쓴다.
import { useId } from 'react'
import { cx } from '../../components/cx.js'
import { typography } from '../../tokens.js'
import { INK, lineRgb, tok } from '../colors.js'
import { useReducedMotion } from '../hooks.js'
import { useLangValue } from '../../components/Bi.jsx'
import { StationIconGroup } from '../icons.jsx'
import { PAINT as P, grey, lineShade, lineTint } from './paint.js'
import { TrainCars, trainWidth } from './TrainSide.jsx'
import { UEGlyph } from './ueMark.jsx'

const LABEL = typography.family.label
const SANS = typography.family.sans

export const PLATFORM_SCENES = {
  1: { accent: 'green', name: 'RETRO SHOT', ko: '레트로 샷', icon: 'retro' },
  2: { accent: 'red', name: 'KARAOKE SHOT', ko: '노래방 샷', icon: 'mic' },
  3: { accent: 'yellow', name: 'SUBWAY SHOT', ko: '지하철 샷', icon: 'subway' },
}

function Ceiling({ uid }) {
  return (
    <g>
      <rect x="0" y="0" width="1600" height="118" fill={tok('bg-elev')} />
      {[0, 200, 400, 600, 800, 1000, 1200, 1400].map((x) => <rect key={x} x={x} y="0" width="14" height="96" fill={tok('bg-panel')} />)}
      <rect x="0" y="84" width="1600" height="12" fill={tok('bg-raised')} />
      <rect x="0" y="96" width="1600" height="22" fill={grey(30)} />
      <rect x="0" y="116" width="1600" height="3" fill={grey(58)} />
      <defs>
        <radialGradient id={`${uid}-glow`} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor={tok('white')} stopOpacity="0.55" />
          <stop offset="1" stopColor={tok('white')} stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  )
}

function LightFixture({ uid, x, y = 150, w = 200 }) {
  return (
    <g>
      <rect x={x - w * 0.36} y="96" width="6" height={y - 92} fill={grey(26)} />
      <rect x={x + w * 0.36 - 6} y="96" width="6" height={y - 92} fill={grey(26)} />
      <ellipse cx={x} cy={y + 70} rx={w * 0.85} ry="90" fill={`url(#${uid}-glow)`} />
      <path d={`M${x - w / 2} ${y}H${x + w / 2}L${x + w / 2 - 8} ${y + 20}H${x - w / 2 + 8}Z`} fill={grey(24)} />
      <rect x={x - w / 2 + 10} y={y + 15} width={w - 20} height="7" rx="3.5" fill={tok('white')} />
      <rect x={x - w / 2} y={y} width={w} height="3" fill={grey(46)} />
    </g>
  )
}

function Pillar({ uid, x, w = 176, accent, n }) {
  return (
    <g>
      <rect x={x} y="118" width={w} height="532" fill={`url(#${uid}-tile)`} />
      <rect x={x} y="118" width={w} height="532" fill={`url(#${uid}-cyl)`} />
      <rect x={x - 4} y="118" width={w + 8} height="16" fill={grey(70)} />
      <rect x={x} y="350" width={w} height="86" fill={tok('bg-base')} />
      <rect x={x} y="350" width={w} height="86" fill={`url(#${uid}-cyl)`} opacity="0.6" />
      <rect x={x + w / 2 - 34} y="361" width="68" height="64" rx="10" fill={lineRgb(accent)} />
      <text x={x + w / 2} y="414" textAnchor="middle" fill={INK} style={{ fontFamily: LABEL, fontSize: 56, fontWeight: 800 }}>{n}</text>
      <rect x={x - 6} y="624" width={w + 12} height="26" fill={grey(48)} />
      <rect x={x - 6} y="624" width={w + 12} height="3" fill={grey(76)} />
    </g>
  )
}

function Board({ x = 800, y = 196, accent, n, name, lang }) {
  const w = 600
  const h = 150
  const x0 = x - w / 2
  return (
    <g>
      <rect x={x - 200} y="96" width="8" height={y - 92} fill={grey(26)} />
      <rect x={x + 192} y="96" width="8" height={y - 92} fill={grey(26)} />
      <rect x={x0 - 4} y={y + 10} width={w + 8} height={h} rx="16" fill={tok('black')} opacity="0.25" />
      <rect x={x0} y={y} width={w} height={h} rx="14" fill={grey(34)} />
      <rect x={x0 + 8} y={y + 8} width={w - 16} height={h - 16} rx="9" fill={tok('bg-base')} />
      <circle cx={x0 + 52} cy={y + 46} r="22" fill={lineRgb('yellow')} />
      <circle cx={x0 + 52} cy={y + 46} r="18.5" fill="none" stroke={tok('white')} strokeOpacity="0.9" strokeWidth="2" />
      <text x={x0 + 52} y={y + 54} textAnchor="middle" fill={INK} style={{ fontFamily: LABEL, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>GY</text>
      <text x={x0 + 86} y={y + 56} fill={tok('white')} style={{ fontFamily: LABEL, fontSize: 30, fontWeight: 700, letterSpacing: '0.04em' }}>URBANEDGE</text>
      <path d={`M${x0 + 262} ${y + 46}h30m-10 -9l10 9l-10 9`} fill="none" stroke={tok('white')} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x={x0 + 308} y={y + 56} fill={lineRgb(accent)} style={{ fontFamily: LABEL, fontSize: 30, fontWeight: 700, letterSpacing: '0.06em' }}>PLATFORM {n}</text>
      <rect x={x0 + 24} y={y + 80} width={w - 48} height="2" fill={tok('white')} opacity="0.16" />
      <text x={x0 + 32} y={y + 120} fill={P.amber} visibility={lang === 'ko' ? 'hidden' : 'visible'} style={{ fontFamily: LABEL, fontSize: 28, fontWeight: 700, letterSpacing: '0.12em' }}>NOW BOARDING</text>
      <text x={x0 + 32} y={y + 120} fill={P.amber} visibility={lang === 'ko' ? 'visible' : 'hidden'} style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700 }}>지금 탑승</text>
      <text x={x0 + w - 32} y={y + 120} textAnchor="end" fill={P.amber} style={{ fontFamily: LABEL, fontSize: 28, fontWeight: 700, letterSpacing: '0.08em' }}>{name}</text>
    </g>
  )
}

function StationNameSign({ x = 800, y = 392, accent }) {
  const w = 520
  const h = 72
  const x0 = x - w / 2
  return (
    <g>
      <rect x={x0} y={y + 6} width={w} height={h} rx={h / 2} fill={tok('black')} opacity="0.12" />
      <rect x={x0} y={y} width={w} height={h} rx={h / 2} fill={tok('white')} stroke={lineRgb(accent)} strokeWidth="8" />
      <circle cx={x0 + h / 2} cy={y + h / 2} r={h / 2 - 9} fill={lineRgb('yellow')} />
      <circle cx={x0 + h / 2} cy={y + h / 2} r={h / 2 - 14} fill="none" stroke={tok('white')} strokeWidth="2.4" />
      <text x={x0 + h / 2} y={y + h / 2 + 8} textAnchor="middle" fill={INK} style={{ fontFamily: LABEL, fontSize: 23, fontWeight: 800 }}>GY</text>
      <text x={x0 + 86} y={y + 46} fill={INK} style={{ fontFamily: SANS, fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em' }}>어반엣지</text>
      <text x={x0 + 238} y={y + 45} fill={grey(34)} style={{ fontFamily: LABEL, fontSize: 26, fontWeight: 700, letterSpacing: '0.05em' }}>URBANEDGE</text>
      <rect x={x0 + w - 108} y={y + 18} width="80" height="36" rx="18" fill={tok('white')} stroke={lineRgb('yellow')} strokeWidth="4" />
      <text x={x0 + w - 68} y={y + 44} textAnchor="middle" fill={INK} style={{ fontFamily: LABEL, fontSize: 24, fontWeight: 800 }}>GY-01</text>
    </g>
  )
}

function Bench({ x = 800, y = 498, accent, seats = 4 }) {
  const sw = 96
  const gap = 10
  const total = seats * sw + (seats - 1) * gap
  const x0 = x - total / 2
  return (
    <g>
      <ellipse cx={x} cy="652" rx={total / 2 + 30} ry="14" fill={tok('black')} opacity="0.18" />
      <rect x={x0 - 14} y={y + 94} width={total + 28} height="12" rx="4" fill={grey(30)} />
      <rect x={x0 - 14} y={y + 94} width={total + 28} height="3" fill={grey(64)} />
      {[x0 + 18, x0 + total - 30].map((lx) => (
        <g key={lx}>
          <rect x={lx} y={y + 104} width="12" height="40" fill={grey(26)} />
          <rect x={lx - 10} y={y + 140} width="32" height="8" rx="3" fill={grey(22)} />
        </g>
      ))}
      {Array.from({ length: seats }, (_, i) => {
        const sx = x0 + i * (sw + gap)
        return (
          <g key={i}>
            <path d={`M${sx + 6} ${y + 8}Q${sx + 6} ${y} ${sx + 16} ${y}H${sx + sw - 16}Q${sx + sw - 6} ${y} ${sx + sw - 6} ${y + 8}L${sx + sw - 2} ${y + 62}H${sx + 2}Z`} fill={lineRgb(accent)} />
            <path d={`M${sx + 18} ${y + 10}H${sx + sw - 18}`} stroke={lineTint(accent, 46)} strokeWidth="5" strokeLinecap="round" />
            <path d={`M${sx + 22} ${y + 34}Q${sx + sw / 2} ${y + 42} ${sx + sw - 22} ${y + 34}`} fill="none" stroke={lineShade(accent, 78)} strokeWidth="3" strokeLinecap="round" />
            <path d={`M${sx - 2} ${y + 62}H${sx + sw + 2}Q${sx + sw + 6} ${y + 62} ${sx + sw + 4} ${y + 72}L${sx + sw} ${y + 90}Q${sx + sw - 2} ${y + 96} ${sx + sw - 10} ${y + 96}H${sx + 10}Q${sx + 2} ${y + 96} ${sx} ${y + 90}L${sx - 4} ${y + 72}Q${sx - 6} ${y + 62} ${sx - 2} ${y + 62}Z`} fill={lineShade(accent, 86)} />
            <path d={`M${sx + 10} ${y + 68}H${sx + sw - 10}`} stroke={lineTint(accent, 60)} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          </g>
        )
      })}
    </g>
  )
}

function Poster({ x, y = 404, w = 118, h = 156, accent, icon }) {
  return (
    <g>
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx="6" fill={grey(36)} />
      <rect x={x} y={y} width={w} height={h} rx="2" fill={tok('bg-base')} />
      <rect x={x} y={y} width={w} height={h * 0.56} fill={lineRgb(accent)} />
      <StationIconGroup name={icon} cx={x + w / 2} cy={y + h * 0.28} size={w * 0.5} stroke={INK} strokeWidth={2.4} />
      <UEGlyph x={x + 12} y={y + h * 0.64} h={18} fill={tok('white')} />
      <rect x={x + 12} y={y + h * 0.84} width={w * 0.6} height="5" rx="2.5" fill={tok('white')} opacity="0.6" />
      <rect x={x + 12} y={y + h * 0.84 + 11} width={w * 0.4} height="5" rx="2.5" fill={tok('white')} opacity="0.35" />
      <path d={`M${x} ${y}L${x + w * 0.5} ${y}L${x} ${y + h * 0.5}Z`} fill={tok('white')} opacity="0.08" />
    </g>
  )
}

function ExitSign({ x, y = 136 }) {
  return (
    <g>
      <rect x={x + 30} y="96" width="5" height={y - 96} fill={grey(26)} />
      <rect x={x + 125} y="96" width="5" height={y - 96} fill={grey(26)} />
      <rect x={x} y={y} width="160" height="46" rx="6" fill={lineRgb('yellow')} />
      <rect x={x + 8} y={y + 8} width="30" height="30" rx="4" fill={tok('bg-base')} />
      <StationIconGroup name="exit" cx={x + 23} cy={y + 23} size={22} stroke={lineRgb('yellow')} strokeWidth={2.6} />
      <text x={x + 48} y={y + 33} fill={INK} style={{ fontFamily: LABEL, fontSize: 26, fontWeight: 800, letterSpacing: '0.04em' }}>EXIT 1</text>
      <path d={`M${x + 126} ${y + 23}h20m-8 -8l8 8l-8 8`} fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

function Floor({ uid }) {
  const vp = 800
  return (
    <g>
      <rect x="0" y="650" width="1600" height="110" fill={grey(84)} />
      <rect x="0" y="650" width="1600" height="110" fill={`url(#${uid}-floor)`} />
      {[672, 698, 728].map((yy) => <rect key={yy} x="0" y={yy} width="1600" height="1.6" fill={grey(70)} />)}
      {Array.from({ length: 17 }, (_, k) => {
        const bx = k * 100
        const tx = vp + (bx - vp) * 0.62
        return <line key={k} x1={tx} y1="650" x2={bx} y2="760" stroke={grey(70)} strokeWidth="1.6" />
      })}
      <rect x="0" y="648" width="1600" height="4" fill={grey(60)} />
    </g>
  )
}

function Tactile({ uid }) {
  return (
    <g>
      <rect x="0" y="760" width="1600" height="34" fill={P.tactile} />
      <rect x="0" y="760" width="1600" height="34" fill={`url(#${uid}-dots)`} />
      <rect x="0" y="760" width="1600" height="2" fill={lineShade('yellow', 70)} />
      <rect x="0" y="794" width="1600" height="12" fill={grey(92)} />
      <rect x="0" y="806" width="1600" height="10" fill={grey(54)} />
      <rect x="0" y="816" width="1600" height="12" fill={tok('bg-base')} />
    </g>
  )
}

export function PlatformSceneArt({ uid, supergraphic = false, platform = 1, accent, name, train = true, doorsOpen = false, reduced = false, trainShift = 0, cars = 3, lang = 'en' }) {
  const meta = PLATFORM_SCENES[platform] || PLATFORM_SCENES[1]
  const acc = accent || meta.accent
  const nm = name || meta.name
  const tW = trainWidth(cars)
  const s = 1
  const tx = 1520 - tW * s + trainShift * (tW * s + 200)
  return (
    <g>
      <defs>
        <pattern id={`${uid}-tile`} width="44" height="44" patternUnits="userSpaceOnUse">
          <rect width="44" height="44" fill={grey(97)} />
          <rect x="0" y="0" width="44" height="2" fill={grey(80)} />
          <rect x="0" y="0" width="2" height="44" fill={grey(80)} />
          <rect x="3" y="3" width="38" height="5" fill={tok('white')} opacity="0.7" />
        </pattern>
        <linearGradient id={`${uid}-cyl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={tok('black')} stopOpacity="0.2" />
          <stop offset="0.28" stopColor={tok('black')} stopOpacity="0" />
          <stop offset="0.42" stopColor={tok('white')} stopOpacity="0.35" />
          <stop offset="0.7" stopColor={tok('black')} stopOpacity="0.02" />
          <stop offset="1" stopColor={tok('black')} stopOpacity="0.26" />
        </linearGradient>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tok('black')} stopOpacity="0.16" />
          <stop offset="0.3" stopColor={tok('black')} stopOpacity="0" />
          <stop offset="1" stopColor={tok('black')} stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tok('black')} stopOpacity="0.12" />
          <stop offset="1" stopColor={tok('white')} stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={`${uid}-pit`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tok('bg-base')} />
          <stop offset="1" stopColor={tok('bg-elev')} />
        </linearGradient>
        <pattern id={`${uid}-dots`} width="14" height="11.3" patternUnits="userSpaceOnUse" y="762">
          <circle cx="7" cy="5.6" r="2.6" fill={lineShade('yellow', 74)} />
          <circle cx="6.4" cy="5" r="1.1" fill={lineTint('yellow', 50)} />
        </pattern>
      </defs>
      <rect x="0" y="118" width="1600" height="532" fill={`url(#${uid}-tile)`} />
      <rect x="0" y="118" width="1600" height="532" fill={`url(#${uid}-wall)`} />
      <rect x="0" y="560" width="1600" height="16" fill={lineRgb(acc)} />
      <rect x="0" y="576" width="1600" height="3" fill={lineShade(acc, 70)} />
      <rect x="0" y="624" width="1600" height="26" fill={grey(70)} />
      <Ceiling uid={uid} />
      <LightFixture uid={uid} x={606} w={170} />
      <LightFixture uid={uid} x={994} w={170} />
      <ExitSign x={330} />
      <Board accent={acc} n={platform} name={nm} lang={lang} />
      <StationNameSign accent={acc} />
      <Poster x={372} accent={acc} icon={meta.icon} />
      <Poster x={1110} accent={acc} icon="landmark" />
      <Bench accent={acc} />
      <Pillar uid={uid} x={120} accent={acc} n={platform} />
      <Pillar uid={uid} x={1304} accent={acc} n={platform} />
      <Floor uid={uid} />
      <Tactile uid={uid} />
      <rect x="0" y="828" width="1600" height="172" fill={`url(#${uid}-pit)`} />
      {[880, 980].map((yy) => <rect key={yy} x="0" y={yy} width="1600" height="6" fill={grey(36)} />)}
      {train && (
        <g style={{ transform: `translate3d(${tx}px, 0, 0)`, transition: reduced ? 'none' : 'transform 1400ms var(--ue-ease-out)' }}>
          <g transform={`translate(0 796) scale(${s})`}>
            <TrainCars uid={`${uid}t`} n={cars} color={acc} doorsOpen={doorsOpen} reduced={reduced} dest={`GY-01 P${platform}`} rail={false} supergraphic={supergraphic} pantograph={false} />
          </g>
        </g>
      )}
      <rect x="0" y="984" width="1600" height="16" fill={tok('bg-base')} />
    </g>
  )
}

// 독립 SVG. platform 1에서 3이 강조색과 포스터를 정한다(1 Retro 초록, 2 Karaoke 빨강, 3 Subway 노랑)(accent로 덮어쓸 수 있음).
// trainShift 0이면 열차가 승강장에 정차, 1이면 화면 오른쪽 밖. 감속 모션에서는 즉시 이동한다.
export function PlatformScene({ platform = 1, accent, name, train = true, doorsOpen = false, trainShift = 0, cars = 3, lang: langProp, className, title }) {
  const ctxLang = useLangValue()
  const lang = langProp || ctxLang
  const uid = `ps${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const reduced = useReducedMotion()
  const meta = PLATFORM_SCENES[platform] || PLATFORM_SCENES[1]
  return (
    <svg viewBox="0 0 1600 1000" className={cx('block h-auto w-full', className)} role="img" aria-label={title || `Platform ${platform}, ${meta.name}`} style={{ overflow: 'hidden' }}>
      <PlatformSceneArt uid={uid} platform={platform} accent={accent} name={name} train={train} doorsOpen={doorsOpen} reduced={reduced} trainShift={trainShift} cars={cars} lang={lang} />
    </svg>
  )
}
