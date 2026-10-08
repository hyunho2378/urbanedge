// TrainSide.jsx: 한국 전동차 옆모습 일러스트. 평면 벡터 안에서 사실감을 내도록 부품을 나눠 그린다.
// 좌표: 한 량 길이 CAR_L(480), 운전실 코 NOSE(44), 차간 GAP(16). y는 -18(팬터그래프 끝)부터 204(레일 아래)까지.
// 색은 전부 토큰 CSS 변수에서 온다(paint.js). 문자는 역 코드와 차량 번호 같은 그림 속 표기만 쓴다.
import { typography } from '../../tokens.js'
import { lineRgb, tok } from '../colors.js'
import { PAINT as P, grey, lineShade, mix } from './paint.js'
import { UEGlyph, UE_PATH } from './ueMark.jsx'

export const CAR_L = 480
export const NOSE = 44
export const GAP = 16
export const VB_TOP = -18
export const VB_H = 222

const LABEL = typography.family.label
const MID = { doors: [60, 180, 300, 420], wins: [120, 240, 360], ac: [[100, 196], [284, 380]] }
const CAB = { doors: [60, 180, 300], wins: [120, 240, 352], ac: [[96, 192], [262, 352]] }

// 열차 전체 폭. n량, 양 끝 운전실.
export const trainWidth = (n) => (n > 1 ? NOSE : 0) + n * CAR_L + (n - 1) * GAP + NOSE

// 공용 그라데이션. id 접두사(uid)로 여러 열차가 한 문서에 있어도 충돌하지 않는다.
export function TrainDefs({ uid, color }) {
  return (
    <defs>
      <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={grey(86)} />
        <stop offset="0.1" stopColor={P.body} />
        <stop offset="0.72" stopColor={P.body} />
        <stop offset="1" stopColor={grey(82)} />
      </linearGradient>
      <linearGradient id={`${uid}-roof`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={grey(88)} />
        <stop offset="0.55" stopColor={P.roof} />
        <stop offset="1" stopColor={P.roofLo} />
      </linearGradient>
      <linearGradient id={`${uid}-door`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={grey(78)} />
        <stop offset="0.45" stopColor={grey(90)} />
        <stop offset="1" stopColor={grey(74)} />
      </linearGradient>
      <linearGradient id={`${uid}-win`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={P.glassHi} />
        <stop offset="1" stopColor={P.glassDeep} />
      </linearGradient>
      <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={P.glassHi} />
        <stop offset="0.6" stopColor={P.glassDeep} />
        <stop offset="1" stopColor={P.glassDeep} />
      </linearGradient>
      <linearGradient id={`${uid}-warm`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={P.warmHi} />
        <stop offset="0.7" stopColor={P.warm} />
        <stop offset="1" stopColor={mix(lineRgb('yellow'), tok('white'), 60)} />
      </linearGradient>
      <linearGradient id={`${uid}-low`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={tok('black')} stopOpacity="0" />
        <stop offset="1" stopColor={tok('black')} stopOpacity="0.14" />
      </linearGradient>
      <linearGradient id={`${uid}-endL`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={tok('black')} stopOpacity="0.16" />
        <stop offset="1" stopColor={tok('black')} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${uid}-endR`} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stopColor={tok('black')} stopOpacity="0.16" />
        <stop offset="1" stopColor={tok('black')} stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`${uid}-stripe`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={lineRgb(color)} />
        <stop offset="1" stopColor={lineShade(color, 84)} />
      </linearGradient>
      <radialGradient id={`${uid}-lamp`}>
        <stop offset="0" stopColor={tok('white')} stopOpacity="0.85" />
        <stop offset="1" stopColor={tok('white')} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${uid}-tail`}>
        <stop offset="0" stopColor={lineRgb('red')} stopOpacity="0.7" />
        <stop offset="1" stopColor={lineRgb('red')} stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

const bodyPath = (cab) => (cab
  ? 'M5 24H478Q494 24 501 34L519 88Q524 100 524 113V150Q524 160 514 160H5Q0 160 0 155V29Q0 24 5 24Z'
  : 'M4 24H476Q480 24 480 28V156Q480 160 476 160H4Q0 160 0 156V28Q0 24 4 24Z')

// 그림 속 글자와 심볼을 거울 반전에서 되돌린다(뒤쪽 운전실은 좌우 반전으로 그린다).
const Unflip = ({ on, cx, children }) => (on ? <g transform={`translate(${2 * cx} 0) scale(-1 1)`}>{children}</g> : <>{children}</>)

function PassengerWindow({ uid, pid, cx, w = 60, open }) {
  const x = cx - w / 2
  const gx = x + 2.4
  const gw = w - 4.8
  const seats = Math.max(3, Math.round(gw / 13))
  const sw = gw / seats
  return (
    <g>
      <rect x={x} y={48} width={w} height={54} rx={7} fill={P.rubber} />
      <rect x={gx} y={50.4} width={gw} height={49.2} rx={5} fill={`url(#${uid}-win)`} />
      <g clipPath={`url(#${pid}-w${Math.round(cx)})`}>
        <clipPath id={`${pid}-w${Math.round(cx)}`}><rect x={gx} y={50.4} width={gw} height={49.2} rx={5} /></clipPath>
        <rect x={gx} y={50.4} width={gw} height={49.2} fill={P.warm} opacity={open ? 0.34 : 0.1} style={{ transition: 'opacity 520ms var(--ue-ease-out)' }} />
        <rect x={gx + 3} y={53} width={gw - 6} height={2.4} rx={1.2} fill={tok('white')} opacity={open ? 0.85 : 0.42} />
        <line x1={gx} x2={gx + gw} y1={63} y2={63} stroke={P.steel} strokeOpacity="0.4" strokeWidth="1.1" />
        {Array.from({ length: seats }, (_, k) => (
          <g key={k}>
            <rect x={gx + k * sw + 1} y={84} width={sw - 2} height={18} rx={3.2} fill={P.seat} />
            <rect x={gx + k * sw + 2.2} y={85.2} width={sw - 4.4} height={2} rx={1} fill={tok('white')} opacity="0.32" />
            <rect x={gx + k * sw + 1} y={96} width={sw - 2} height={6} fill={P.seatLo} opacity="0.55" />
          </g>
        ))}
        <path d={`M${gx + gw * 0.18} 50L${gx + gw * 0.42} 50L${gx + gw * 0.12} 100L${gx - gw * 0.12} 100Z`} fill={P.shine} />
        <path d={`M${gx + gw * 0.5} 50L${gx + gw * 0.58} 50L${gx + gw * 0.3} 100L${gx + gw * 0.22} 100Z`} fill={P.shine2} />
      </g>
      <rect x={x + 1} y={48.6} width={w - 2} height={1.2} rx={0.6} fill={tok('white')} opacity="0.18" />
    </g>
  )
}

function DoorLeaf({ uid, x, w, side }) {
  const wx = side < 0 ? x + 3.4 : x + w - 3.4 - 14.4
  return (
    <g>
      <rect x={x} y={38} width={w} height={118} rx={1.6} fill={`url(#${uid}-door)`} />
      <rect x={wx - 1.6} y={46.4} width={17.6} height={55.2} rx={3.6} fill={P.rubber} />
      <rect x={wx} y={48} width={14.4} height={52} rx={2.6} fill={`url(#${uid}-win)`} />
      <path d={`M${wx + 2} 48L${wx + 8} 48L${wx + 2} 74L${wx} 74L${wx} 52Z`} fill={P.shine} />
      <rect x={side < 0 ? x + w - 1.3 : x} y={38} width={1.3} height={118} fill={P.rubber} />
      <rect x={x} y={150} width={w} height={6} fill={grey(70)} />
      <rect x={side < 0 ? x + 2 : x + w - 4} y={104} width={2} height={12} rx={1} fill={grey(62)} />
    </g>
  )
}

function Door({ uid, pid, c, open, reduced, color }) {
  const dx = open ? 23.4 : 0
  const tr = reduced ? 'none' : 'transform 620ms var(--ue-ease-out)'
  const id = `${pid}-d${c}`
  return (
    <g>
      <rect x={c - 25.5} y={35.5} width={51} height={123} rx={3.4} fill={grey(62)} />
      <rect x={c - 23.4} y={38} width={46.8} height={118} rx={2} fill={`url(#${uid}-warm)`} />
      <g opacity={open ? 1 : 0} style={{ transition: reduced ? 'none' : 'opacity 420ms var(--ue-ease-out)' }}>
        <rect x={c - 23.4} y={38} width={46.8} height={5} fill={tok('white')} opacity="0.9" />
        <rect x={c - 17} y={50} width={34} height={98} rx={2} fill={P.warmLo} opacity="0.28" />
        <rect x={c - 14} y={56} width={11} height={34} rx={2} fill={P.glass} opacity="0.55" />
        <rect x={c + 3} y={56} width={11} height={34} rx={2} fill={P.glass} opacity="0.55" />
        <rect x={c - 0.6} y={50} width={1.2} height={98} fill={P.warmLo} opacity="0.5" />
        <rect x={c - 23.4} y={60} width={46.8} height={2} fill={P.steel} opacity="0.8" />
        <rect x={c - 7.6} y={43} width={2.6} height={113} rx={1.3} fill={P.steel} />
        <rect x={c - 7.6} y={43} width={1} height={113} fill={tok('white')} opacity="0.7" />
        <rect x={c - 23.4} y={146} width={46.8} height={10} fill={grey(46)} />
      </g>
      <clipPath id={id}><rect x={c - 23.4} y={38} width={46.8} height={118} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <g style={{ transform: `translate3d(${-dx}px,0,0)`, transition: tr }}>
          <DoorLeaf uid={uid} x={c - 23.4} w={23.4} side={-1} />
        </g>
        <g style={{ transform: `translate3d(${dx}px,0,0)`, transition: tr }}>
          <DoorLeaf uid={uid} x={c} w={23.4} side={1} />
        </g>
      </g>
      <rect x={c - 5} y={28} width={10} height={4.4} rx={2.2} fill={open ? P.seat : grey(58)} style={{ transition: reduced ? 'none' : 'fill 300ms linear' }} />
      <rect x={c - 26} y={156} width={52} height={3.4} rx={1} fill={P.steelDark} />
      <rect x={c + 26.5} y={118} width={2.6} height={2.6} fill={lineRgb(color)} opacity="0" />
    </g>
  )
}

function Bogie({ x }) {
  const wheel = (wx) => (
    <g key={wx}>
      <circle cx={wx} cy={182} r={14} fill={P.underLo} />
      <circle cx={wx} cy={182} r={12.6} fill="none" stroke={grey(40)} strokeWidth="1.4" />
      <circle cx={wx} cy={182} r={8.6} fill={P.under} stroke={grey(30)} strokeWidth="1" />
      <circle cx={wx} cy={182} r={3.4} fill={P.steelDark} />
      <path d={`M${wx - 10} 174A12.6 12.6 0 0 1 ${wx + 4} 169.6`} fill="none" stroke={tok('white')} strokeOpacity="0.22" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  )
  const spring = (sx) => (
    <g key={`s${sx}`}>
      <rect x={sx - 5} y={168} width={10} height={9} rx={2} fill={P.under} />
      {[169.6, 172.2, 174.8].map((yy) => <line key={yy} x1={sx - 4.6} x2={sx + 4.6} y1={yy} y2={yy + 1.4} stroke={grey(56)} strokeWidth="1.3" />)}
    </g>
  )
  return (
    <g>
      {wheel(x - 30)}
      {wheel(x + 30)}
      <path d={`M${x - 48} 170H${x + 48}Q${x + 52} 170 ${x + 52} 174V178Q${x + 52} 181 ${x + 48} 181H${x + 18}L${x + 12} 188H${x - 12}L${x - 18} 181H${x - 48}Q${x - 52} 181 ${x - 52} 178V174Q${x - 52} 170 ${x - 48} 170Z`} fill={P.rubber} />
      <rect x={x - 48} y={170.6} width={96} height={1.4} fill={tok('white')} opacity="0.16" />
      {[x - 30, x + 30].map((ax) => <rect key={`a${ax}`} x={ax - 7} y={176} width={14} height={11} rx={2.4} fill={P.under} stroke={grey(34)} strokeWidth="1" />)}
      {[x - 30, x + 30].map((ax) => <circle key={`h${ax}`} cx={ax} cy={181.5} r={2.6} fill={grey(58)} />)}
      {spring(x - 12)}
      {spring(x + 12)}
      <rect x={x - 9} y={163} width={18} height={9} rx={2} fill={P.underLo} />
      <rect x={x + 36} y={170} width={10} height={7} rx={1.6} fill={grey(30)} />
      <rect x={x - 46} y={170} width={10} height={7} rx={1.6} fill={grey(30)} />
    </g>
  )
}

function Underframe({ L, cab }) {
  const boxes = [[140, 58, 16], [204, 54, 12], [264, 72, 18], [342, 0, 0]]
  return (
    <g>
      <rect x={6} y={159} width={L - 12 + (cab ? 30 : 0)} height={9} rx={2} fill={grey(18)} />
      {boxes.filter((b) => b[1]).map(([bx, bw, bh]) => (
        <g key={bx}>
          <rect x={bx} y={164} width={bw} height={bh} rx={2} fill={grey(22)} />
          <rect x={bx + 2} y={165.4} width={bw - 4} height={1.4} fill={tok('white')} opacity="0.12" />
          {Array.from({ length: Math.floor(bw / 9) }, (_, k) => <rect key={k} x={bx + 5 + k * 9} y={169} width={2} height={bh - 8} rx={1} fill={grey(12)} />)}
        </g>
      ))}
      <rect x={6} y={159} width={L - 12} height={1.4} fill={tok('white')} opacity="0.1" />
    </g>
  )
}

function Pantograph({ x }) {
  const s = { stroke: P.steelDark, strokeWidth: 2.2, strokeLinecap: 'round', fill: 'none' }
  return (
    <g>
      <rect x={x - 30} y={18} width={60} height={5} rx={2} fill={P.roofLo} />
      {[x - 24, x + 24].map((ix) => <rect key={ix} x={ix - 3} y={13} width={6} height={7} rx={1.6} fill={grey(88)} stroke={grey(56)} strokeWidth="0.8" />)}
      <path d={`M${x - 16} 16L${x + 18} -2L${x - 6} -12`} {...s} />
      <path d={`M${x - 10} 16L${x + 18} -2`} {...s} strokeWidth="1.2" />
      <path d={`M${x - 24} -13.5H${x + 10}`} {...s} strokeWidth="2.6" />
      <path d={`M${x - 26} -11Q${x - 28} -13.5 ${x - 24} -13.5M${x + 10} -13.5Q${x + 14} -13.5 ${x + 12} -11`} {...s} strokeWidth="1.4" />
    </g>
  )
}

// 한 량. 운전실 차(cab)는 코가 +x 방향이다. mirrored면 상위에서 좌우 반전한다.
export function TrainCar({ uid, idx, cab, lamp = 'head', mirrored, color, doorsOpen, reduced, dest, number, pantograph, supergraphic }) {
  const L = CAR_L
  const lay = cab ? CAB : MID
  const clip = `${uid}-b${idx}`
  return (
    <g>
      {lay.ac.map(([a, b]) => (
        <g key={a}>
          <path d={`M${a} 26V16Q${a} 9 ${a + 7} 9H${b - 7}Q${b} 9 ${b} 16V26Z`} fill={`url(#${uid}-roof)`} />
          {Array.from({ length: Math.floor((b - a - 20) / 8) }, (_, k) => <line key={k} x1={a + 12 + k * 8} x2={a + 12 + k * 8} y1={14} y2={22} stroke={P.roofLo} strokeWidth="1.6" strokeLinecap="round" />)}
          <rect x={a + 4} y={10} width={b - a - 8} height={1.4} rx={0.7} fill={tok('white')} opacity="0.55" />
        </g>
      ))}
      {pantograph && <Pantograph x={cab ? 228 : 240} />}
      <rect x={6} y={20} width={L - 12} height={6} rx={3} fill={P.roof} />
      <clipPath id={clip}><path d={bodyPath(cab)} /></clipPath>
      <path d={bodyPath(cab)} fill={`url(#${uid}-body)`} />
      <g clipPath={`url(#${clip})`}>
        <rect x={0} y={24} width={L + NOSE} height={10} fill={P.bodyLo2} />
        <rect x={0} y={34} width={L + NOSE} height={1.6} fill={P.steelLo} />
        <rect x={0} y={35.6} width={L + NOSE} height={1.4} fill={tok('white')} />
        {supergraphic && <Unflip on={mirrored} cx={384.7}><path d={UE_PATH} transform={`translate(306 36) scale(${116 / 280})`} fill={lineRgb(color)} fillRule="evenodd" opacity="0.94" /></Unflip>}
        <rect x={0} y={110} width={L + NOSE} height={11} fill={`url(#${uid}-stripe)`} />
        <rect x={0} y={121} width={L + NOSE} height={1.4} fill={lineShade(color, 64)} />
        <rect x={0} y={124.6} width={L + NOSE} height={2.6} fill={lineRgb(color)} opacity="0.55" />
        <rect x={0} y={136} width={L + NOSE} height={24} fill={`url(#${uid}-low)`} />
        <rect x={0} y={155.6} width={L + NOSE} height={4.4} fill={grey(72)} />
        <rect x={0} y={24} width={14} height={136} fill={`url(#${uid}-endL)`} />
        {!cab && <rect x={L - 14} y={24} width={14} height={136} fill={`url(#${uid}-endR)`} />}
        {cab && (
          <g>
            <path d="M464 31Q464 24 471 24H530V104H471Q464 104 464 97Z" fill={`url(#${uid}-glass)`} />
            <path d="M472 40H480V96H472Z" fill={P.glassHi} opacity="0.55" />
            <path d="M499 30L509 30L522 90L515 90Z" fill={P.shine2} />
            <path d="M486 30L490 30L490 96L486 96Z" fill={P.shine2} />
            <path d="M479 25Q494 25 500 34L518 88" fill="none" stroke={tok('white')} strokeOpacity="0.32" strokeWidth="1.4" />
            <path d="M484 146H530V160H484Z" fill={P.rubber} />
            <rect x={484} y={146} width={46} height={1.2} fill={tok('white')} opacity="0.2" />
            <rect x={509} y={127} width={14} height={9} rx={3} fill={P.rubber} />
            {lamp === 'head'
              ? <rect x={511} y={129} width={10} height={5} rx={2.2} fill={P.headlight} />
              : <rect x={511} y={129} width={10} height={5} rx={2.2} fill={P.tail} />}
            <rect x={497} y={129.6} width={8} height={4} rx={2} fill={lamp === 'head' ? P.amberDim : P.tail} opacity={lamp === 'head' ? 1 : 0.6} />
          </g>
        )}
      </g>
      {cab && <circle cx={522} cy={131.5} r={16} fill={`url(#${uid}-${lamp === 'head' ? 'lamp' : 'tail'})`} />}
      {cab && (
        <g>
          <rect x={398} y={35.5} width={30} height={123} rx={3} fill={grey(62)} />
          <rect x={400} y={38} width={26} height={118} rx={2} fill={`url(#${uid}-door)`} />
          <rect x={404} y={46} width={18} height={50} rx={3} fill={P.rubber} />
          <rect x={405.6} y={47.6} width={14.8} height={46.8} rx={2.2} fill={`url(#${uid}-win)`} />
          <path d="M407 48L413 48L407 70L405.6 70Z" fill={P.shine} />
          <rect x={421} y={102} width={2.2} height={14} rx={1.1} fill={grey(58)} />
          <rect x={436} y={44} width={30} height={56} rx={6} fill={P.rubber} />
          <rect x={438.4} y={46.4} width={25.2} height={51.2} rx={4.4} fill={`url(#${uid}-win)`} />
          <path d="M442 47L450 47L440 80L438.4 80Z" fill={P.shine} />
          <rect x={436} y={138} width={30} height={2} rx={1} fill={grey(70)} />
          <rect x={436} y={143} width={30} height={2} rx={1} fill={grey(70)} />
        </g>
      )}
      {lay.wins.map((cx) => <PassengerWindow key={cx} uid={uid} pid={clip} cx={cx} w={cab && cx > 300 ? 52 : 60} open={doorsOpen} />)}
      {lay.doors.map((c) => <Door key={c} uid={uid} pid={clip} c={c} open={doorsOpen} reduced={reduced} color={color} />)}
      {cab && dest && (
        <g>
          <rect x={326} y={37.6} width={52} height={9.4} rx={1.6} fill={P.glassDeep} />
          <Unflip on={mirrored} cx={352}>
            <text x={352} y={45} textAnchor="middle" fill={P.amber} style={{ fontFamily: LABEL, fontSize: 7.6, fontWeight: 700, letterSpacing: '0.08em' }}>{dest}</text>
          </Unflip>
        </g>
      )}
      <Unflip on={mirrored} cx={240}>
        <UEGlyph x={210.5} y={131.4} h={11.6} fill={tok('bg-base')} />
        <text x={250.6} y={141.2} textAnchor="middle" fill={tok('bg-base')} style={{ fontFamily: LABEL, fontSize: 9.6, fontWeight: 800, letterSpacing: '0.03em' }}>URBANEDGE</text>
      </Unflip>
      {number && (
        <Unflip on={mirrored} cx={cab ? 352 : 360}>
          <text x={cab ? 352 : 360} y={140.6} textAnchor="middle" fill={grey(46)} style={{ fontFamily: LABEL, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em' }}>{number}</text>
        </Unflip>
      )}
      {number && (
        <Unflip on={mirrored} cx={98}>
          <rect x={92} y={37.4} width={12} height={9.4} rx={1.6} fill={P.body} stroke={lineRgb(color)} strokeWidth="1.3" />
          <text x={98} y={45} textAnchor="middle" fill={tok('bg-base')} style={{ fontFamily: LABEL, fontSize: 8.4, fontWeight: 800 }}>{idx + 1}</text>
        </Unflip>
      )}
      <Underframe L={L} cab={cab} />
      {cab && <path d="M486 160H526Q530 160 530 164L524 178H486Z" fill={P.underLo} />}
      {cab && [492, 502, 512].map((x) => <line key={x} x1={x} x2={x - 2} y1={162} y2={176} stroke={P.rubber} strokeWidth="1.6" />)}
      <Bogie x={78} />
      <Bogie x={L - 78} />
    </g>
  )
}

// 차간 연결부: 고무 주름 통로와 연결기
export function Gangway({ x }) {
  return (
    <g>
      <rect x={x - 2} y={40} width={GAP + 4} height={110} rx={3} fill={P.rubber} />
      {Array.from({ length: 5 }, (_, k) => <rect key={k} x={x + 0.6 + k * 3.2} y={42} width={1.4} height={106} rx={0.7} fill={P.underLo} />)}
      <rect x={x - 6} y={150} width={GAP + 12} height={6} rx={2} fill={P.steelDark} />
      <rect x={x + GAP / 2 - 4} y={148} width={8} height={10} rx={1.6} fill={grey(30)} />
    </g>
  )
}

// 여러 량을 그린다. 상위 svg 안에 넣는 그룹이다.
export function TrainCars({ uid, n = 3, color = 'yellow', doorsOpen = false, reduced = false, dest = 'GY-01', number = 1101, rail = true, supergraphic = false, flip = false, pantograph = true }) {
  const cars = Math.max(1, Math.min(8, n))
  const x0 = cars > 1 ? NOSE : 0
  const W = trainWidth(cars)
  const out = []
  for (let i = 0; i < cars; i += 1) {
    const x = x0 + i * (CAR_L + GAP)
    const last = i === cars - 1
    const first = i === 0 && cars > 1
    const cab = last || first
    const props = { uid, idx: i, cab, color, doorsOpen, reduced, dest, number: number != null ? String(Number(number) + i) : null, pantograph: pantograph && !cab && i % 2 === 1, supergraphic: supergraphic && !cab && i === Math.floor((cars - 1) / 2) }
    if (first) out.push(<g key={i} transform={`translate(${x + CAR_L} 0) scale(-1 1)`}><TrainCar {...props} mirrored={!flip} lamp="tail" /></g>)
    else out.push(<g key={i} transform={`translate(${x} 0)`}><TrainCar {...props} mirrored={flip} lamp="head" /></g>)
    if (!last) out.push(<Gangway key={`g${i}`} x={x + CAR_L} />)
  }
  if (cars === 1) out.push(<rect key="cp" x={-6} y={150} width={10} height={6} rx={2} fill={P.steelDark} />)
  return (
    <g>
      <TrainDefs uid={uid} color={color} />
      {rail && (
        <g>
          <ellipse cx={W / 2} cy={197} rx={W / 2 + 10} ry={5} fill={tok('black')} opacity="0.32" />
          <rect x={-20} y={195} width={W + 40} height={5} rx={1.4} fill={grey(40)} />
          <rect x={-20} y={195} width={W + 40} height={1.4} fill={grey(72)} />
        </g>
      )}
      <g transform={flip ? `translate(${W} 0) scale(-1 1)` : undefined}>{out}</g>
    </g>
  )
}
