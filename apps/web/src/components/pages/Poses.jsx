import { cx } from '@urbanedge/ds'

// 포즈 아이디어를 보여 주는 선 도식(hairline 스타일). 한 사람의 뼈대를 관절 좌표로 정하고, 방의 소품을 노랑 선으로 얹는다.
// 팔다리는 외곽선을 두른 관(outline tube)으로 그려서 얇은 선만으로도 부피가 느껴진다. 색은 모두 토큰 클래스다.
// viewBox 240 x 300. 사람은 가운데(x 120)에 서고 발은 y 280 근처에 놓인다.
const N = {
  head: [120, 62],
  sh: [[98, 98], [142, 98]],
  hip: [[108, 172], [132, 172]],
  arms: [[[90, 134], [92, 168]], [[150, 134], [148, 168]]],
  legs: [[[108, 226], [106, 280]], [[132, 226], [134, 280]]],
}
const mk = (o) => ({ ...N, ...o })

const L = (...pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')

function Tube({ d }) {
  return (
    <>
      <path d={d} className="stroke-text-pri" strokeWidth="11" />
      <path d={d} className="stroke-bg-panel" strokeWidth="7.4" />
    </>
  )
}

function Figure({ j }) {
  const { head, sh, hip, arms, legs } = j
  const midSh = [(sh[0][0] + sh[1][0]) / 2, (sh[0][1] + sh[1][1]) / 2]
  const midHip = [(hip[0][0] + hip[1][0]) / 2, (hip[0][1] + hip[1][1]) / 2]
  const torso = `M${sh[0][0]} ${sh[0][1]} Q${midSh[0]} ${midSh[1] - 9} ${sh[1][0]} ${sh[1][1]} L${hip[1][0]} ${hip[1][1]} Q${midHip[0]} ${midHip[1] + 10} ${hip[0][0]} ${hip[0][1]} Z`
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Tube d={L(hip[0], ...legs[0])} />
      <Tube d={L(hip[1], ...legs[1])} />
      <Tube d={L(midSh, [head[0], head[1] + 14])} />
      <path d={torso} className="fill-bg-panel stroke-text-pri" strokeWidth="2.6" />
      <Tube d={L(sh[0], ...arms[0])} />
      <Tube d={L(sh[1], ...arms[1])} />
      <circle cx={head[0]} cy={head[1]} r="17" className="fill-bg-panel stroke-text-pri" strokeWidth="2.6" />
    </g>
  )
}

const Y = 'fill-none stroke-yellow'
const tiles = (x, y, n, w, h, skip = 0) =>
  Array.from({ length: n }).map((_, i) => (
    <rect key={i} x={x + i * w} y={y} width={w} height={h} className={(i + skip) % 2 ? 'fill-none stroke-text-meta' : 'fill-yellow stroke-yellow'} strokeWidth="1.5" />
  ))

// 각 포즈: [뼈대, 소품(뒤), 소품(앞)]
const POSES = {
  // Platform 3 Subway Shot
  'strap-hang': [
    mk({ head: [116, 62], sh: [[96, 98], [140, 100]], arms: [[[88, 134], [90, 168]], [[160, 74], [158, 52]]], legs: [[[104, 226], [96, 280]], [[136, 226], [146, 280]]] }),
    <g key="b" className={Y} strokeWidth="3.4">
      <path d={L([34, 20], [206, 20])} />
      <path d={L([158, 20], [158, 40])} />
    </g>,
    <circle key="f" cx="158" cy="48" r="9" className={Y} strokeWidth="3.4" />,
  ],
  'doors-closing': [
    mk({ arms: [[[78, 74], [66, 44]], [[162, 74], [174, 44]]], legs: [[[100, 228], [90, 280]], [[140, 228], [150, 280]]] }),
    <g key="b" className={Y} strokeWidth="3">
      <rect x="12" y="22" width="64" height="262" />
      <rect x="22" y="40" width="44" height="70" />
      <rect x="164" y="22" width="64" height="262" />
      <rect x="174" y="40" width="44" height="70" />
    </g>,
    null,
  ],
  'bench-nap': [
    mk({ head: [128, 112], sh: [[96, 140], [140, 134]], hip: [[100, 206], [132, 206]], arms: [[[92, 172], [128, 170]], [[146, 172], [106, 166]]], legs: [[[96, 230], [92, 274]], [[136, 230], [140, 274]]] }),
    <g key="b" className={Y} strokeWidth="3">
      <rect x="36" y="214" width="168" height="14" />
      <path d={L([56, 228], [52, 282])} />
      <path d={L([184, 228], [188, 282])} />
    </g>,
    null,
  ],
  // Platform 2 Karaoke Shot
  'chorus-face': [
    mk({ head: [124, 58], sh: [[100, 98], [144, 100]], arms: [[[76, 104], [60, 64]], [[160, 126], [134, 88]]], legs: [[[104, 226], [98, 280]], [[136, 226], [144, 280]]] }),
    null,
    <g key="f" className={Y} strokeWidth="3.4">
      <path d={L([134, 88], [124, 76])} />
      <circle cx="120" cy="70" r="7" className="fill-yellow stroke-yellow" />
    </g>,
  ],
  'tambourine-shake': [
    mk({ arms: [[[74, 100], [78, 58]], [[152, 134], [146, 162]]], legs: [[[100, 214], [92, 248]], [[134, 226], [138, 280]]] }),
    null,
    <g key="f" className={Y} strokeWidth="3.4">
      <circle cx="78" cy="40" r="17" />
      <circle cx="78" cy="23" r="2.6" className="fill-yellow" />
      <circle cx="95" cy="40" r="2.6" className="fill-yellow" />
      <circle cx="61" cy="40" r="2.6" className="fill-yellow" />
    </g>,
  ],
  'song-queue': [
    mk({ head: [124, 98], sh: [[96, 134], [140, 134]], hip: [[100, 206], [132, 206]], arms: [[[88, 172], [104, 202]], [[160, 126], [190, 96]]], legs: [[[96, 232], [90, 274]], [[136, 232], [144, 274]]] }),
    <g key="b" className={Y} strokeWidth="3">
      <rect x="36" y="214" width="150" height="14" />
      <rect x="150" y="34" width="76" height="104" />
      <path d={L([162, 56], [214, 56])} />
      <path d={L([162, 74], [204, 74])} />
      <path d={L([162, 92], [214, 92])} />
      <path d={L([162, 110], [196, 110])} />
    </g>,
    null,
  ],
  // Platform 1 Retro Shot
  'stool-sit': [
    mk({ head: [120, 104], sh: [[98, 138], [142, 138]], hip: [[102, 214], [138, 214]], arms: [[[80, 172], [96, 206]], [[160, 172], [144, 206]]], legs: [[[96, 242], [90, 282]], [[144, 242], [150, 282]]] }),
    <g key="b" className={Y} strokeWidth="3.4">
      <path d={L([92, 230], [84, 284])} />
      <path d={L([148, 230], [156, 284])} />
    </g>,
    <ellipse key="f" cx="120" cy="226" rx="44" ry="9" className="fill-bg-panel stroke-yellow" strokeWidth="3.4" />,
  ],
  'curtain-peek': [
    mk({ arms: [[[88, 128], [97, 116]], [[152, 134], [150, 168]]] }),
    null,
    <g key="f" className="fill-bg-raised stroke-yellow" strokeWidth="3" strokeLinejoin="round">
      <path d="M0 8 H96 Q86 80 98 150 Q86 222 94 292 H0 Z" />
      <path d="M240 8 H146 Q156 80 144 150 Q156 222 148 292 H240 Z" />
      <path d={L([24, 8], [24, 292])} className="fill-none stroke-text-meta" strokeWidth="1.4" />
      <path d={L([50, 8], [50, 292])} className="fill-none stroke-text-meta" strokeWidth="1.4" />
      <path d={L([190, 8], [190, 292])} className="fill-none stroke-text-meta" strokeWidth="1.4" />
      <path d={L([216, 8], [216, 292])} className="fill-none stroke-text-meta" strokeWidth="1.4" />
    </g>,
  ],
  'crate-lean': [
    mk({ head: [116, 64], sh: [[98, 102], [144, 106]], hip: [[110, 172], [134, 176]], arms: [[[92, 138], [100, 170]], [[170, 192], [158, 170]]], legs: [[[108, 228], [104, 280]], [[138, 230], [122, 276]]] }),
    null,
    <g key="f" className={Y} strokeWidth="3.4">
      <rect x="150" y="196" width="74" height="86" />
      <path d={L([150, 224], [224, 224])} />
      <path d={L([150, 252], [224, 252])} />
    </g>,
  ],
}

export function PoseDrawing({ id, label, className }) {
  const pose = POSES[id]
  if (!pose) return null
  const [j, back, front] = pose
  return (
    <svg viewBox="0 0 240 300" role="img" aria-label={label} className={cx('block h-auto w-full', className)}>
      {back}
      <Figure j={j} />
      {front}
    </svg>
  )
}