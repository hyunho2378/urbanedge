import { cx } from '@urbanedge/ds'

// 대기 화면의 샘플 인화물 띠: 포스터와 패턴 이미지를 인화 스트립 모양으로 잘라 천천히 흘려 보낸다.
// 브랜드 이미지만 쓰고 사람 사진은 쓰지 않는다.
const PRINTS = [
  { kind: 'strip', tone: 'black', imgs: [['biz_02', 50, 20], ['cr_crosswalk', 40, 50], ['biz_06', 60, 40], ['cr_tape', 50, 50]] },
  { kind: 'grid', tone: 'white', imgs: [['biz_07', 50, 30], ['biz_00', 50, 60], ['cr_pattern', 30, 50], ['biz_04', 50, 40]] },
  { kind: 'strip', tone: 'yellow', imgs: [['cr_crosswalk', 70, 40], ['biz_01', 50, 55], ['biz_02', 50, 70], ['biz_07', 50, 20]] },
  { kind: 'grid', tone: 'black', imgs: [['biz_06', 30, 30], ['cr_tape', 50, 50], ['biz_05', 50, 40], ['biz_00', 50, 30]] },
  { kind: 'strip', tone: 'white', imgs: [['biz_04', 50, 25], ['biz_07', 50, 45], ['cr_pattern', 50, 60], ['biz_02', 50, 35]] },
  { kind: 'grid', tone: 'yellow', imgs: [['cr_crosswalk', 20, 30], ['biz_00', 50, 55], ['biz_06', 70, 60], ['cr_tape', 30, 50]] },
]
const TONE = { black: 'bg-bg-base border-hairlineStrong', white: 'bg-white border-white', yellow: 'bg-yellow border-yellow' }

function Print({ p }) {
  const strip = p.kind === 'strip'
  return (
    <li
      className={cx('shrink-0 rounded-md border-2 p-12', TONE[p.tone], strip ? 'flex w-160 flex-col gap-8' : 'grid w-240 grid-cols-2 gap-8')}
      style={{ height: strip ? 340 : 220 }}
    >
      {p.imgs.map(([n, x, y], i) => (
        <img
          key={i}
          src={`/img/${n}.jpg`}
          alt=""
          draggable={false}
          className={cx('min-h-0 w-full rounded-sm object-cover', strip ? 'flex-1' : 'h-full')}
          style={{ objectPosition: `${x}% ${y}%` }}
        />
      ))}
    </li>
  )
}

export function SampleStrip({ paused, className }) {
  const row = (hidden) => (
    <ul className="flex h-full shrink-0 items-center gap-24 pr-24" aria-hidden={hidden || undefined}>
      {PRINTS.map((p, i) => (
        <Print key={i} p={p} />
      ))}
    </ul>
  )
  return (
    <div className={cx('overflow-hidden', className)} role="presentation">
      <div className="flex h-full w-max animate-marquee will-change-transform motion-reduce:animate-none" style={{ animationDuration: '90s', animationPlayState: paused ? 'paused' : 'running' }}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
