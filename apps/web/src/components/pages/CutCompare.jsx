import { useEffect, useMemo, useState } from 'react'
import { FRAMES, StripPreview, formatShotDate } from '@urbanedge/brand'
import { Bi, cx } from '@urbanedge/ds'
import { Tx, useV } from './Bilingual.jsx'
import { TEAM_PHOTOS } from './content.js'

// 4컷과 8컷 비교: 컷 수를 고르면 그 컷 수의 프레임이 나오고, 8컷에서는 찍은 여덟 장 가운데 프레임이 받는 장수만큼 직접 고른다.
// 미리보기는 작업 B의 StripPreview(composeStrip)가 실제 프레임에 팀 샘플 사진을 합성한 것이다.
const SHOTS = [0, 1, 2, 3, 4, 0, 1, 2]
const POS = ['50% 28%', '50% 22%', '50% 36%', '50% 30%', '50% 20%', '22% 34%', '78% 30%', '50% 54%']

function Tile({ i, on, order, interactive, onToggle, label }) {
  const src = TEAM_PHOTOS[SHOTS[i]].thumb
  const base = 'relative block aspect-square w-full overflow-hidden rounded-md bg-bg-panel'
  const img = <img src={src} alt="" loading="lazy" decoding="async" className={cx('size-full object-cover transition-opacity duration-base ease-out', on ? 'opacity-100' : 'opacity-40')} style={{ objectPosition: POS[i] }} />
  const badge = on && order > 0 && <span className="absolute left-4 top-4 grid size-24 place-items-center rounded-pill bg-yellow font-label text-caption font-bold text-text-onYellow">{order}</span>
  if (!interactive) {
    return (
      <div className={base}>
        {img}
        {badge}
      </div>
    )
  }
  return (
    <button type="button" aria-pressed={on} aria-label={label} onClick={onToggle} className={cx(base, 'ue-press')}>
      {img}
      {badge}
    </button>
  )
}

export function CutCompare({ copy }) {
  const v = useV()
  const [cuts, setCuts] = useState(4)
  const frames = useMemo(() => FRAMES.filter((f) => f.cuts === cuts), [cuts])
  const [frameId, setFrameId] = useState(frames[0]?.id)
  const frame = frames.find((f) => f.id === frameId) || frames[0]
  const slots = frame?.slots ?? 4
  const eight = cuts === 8
  const [chosen, setChosen] = useState([0, 2, 5, 6])

  useEffect(() => {
    setFrameId(frames[0]?.id)
  }, [frames])
  useEffect(() => {
    // 프레임이 받는 장수에 맞춰 고른 컷을 줄이거나 늘린다.
    setChosen((c) => {
      const next = c.slice(0, slots)
      for (let i = 0; next.length < slots && i < 8; i++) if (!next.includes(i)) next.push(i)
      return next
    })
  }, [slots])

  const toggle = (i) =>
    setChosen((c) => {
      if (c.includes(i)) return c.filter((x) => x !== i)
      if (c.length >= slots) return c
      return [...c, i]
    })

  const shots = eight ? chosen : [0, 1, 2, 3]
  const photos = shots.map((i) => TEAM_PHOTOS[SHOTS[i]].thumb)
  const full = shots.length === slots
  const seg = (n) =>
    cx('ue-press flex-1 rounded-pill px-20 py-12 font-ui text-body font-semibold transition-colors duration-fast ease-out', cuts === n ? 'bg-yellow text-text-onYellow' : 'text-text-pri hover:text-yellow')

  const status = eight
    ? full
      ? copy.full
      : { en: `${copy.picked.en} ${chosen.length} / ${slots}`, ko: `${copy.picked.ko} ${chosen.length} / ${slots}` }
    : copy.all

  return (
    <div className="grid gap-x-64 gap-y-32 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div role="group" aria-label={v(copy.group)} className="flex max-w-read gap-4 rounded-pill bg-bg-panel p-4">
          <button type="button" aria-pressed={cuts === 4} onClick={() => setCuts(4)} className={seg(4)}>
            <Tx inline {...copy.four} />
          </button>
          <button type="button" aria-pressed={cuts === 8} onClick={() => setCuts(8)} className={seg(8)}>
            <Tx inline {...copy.eight} />
          </button>
        </div>
        {/* 두 문장을 같은 칸에 겹쳐 높이를 고정한다 */}
        <div className="mt-24 grid max-w-read">
          <Tx {...copy.fourText} as="p" role="lead" className={cx('col-start-1 row-start-1 text-text-pri', eight && 'invisible')} />
          <Tx {...copy.eightText} as="p" role="lead" className={cx('col-start-1 row-start-1 text-text-pri', !eight && 'invisible')} />
        </div>

        <Tx {...copy.shots} as="p" role="label" className="mt-32 text-text-meta" />
        <div className="mt-12 grid grid-cols-4 gap-8 md:gap-12" key={cuts}>
          {Array.from({ length: cuts }).map((_, i) => (
            <div key={i} className="animate-fade-in">
              <Tile i={i} interactive={eight} on={eight ? chosen.includes(i) : true} order={eight ? chosen.indexOf(i) + 1 : i + 1} onToggle={() => toggle(i)} label={`${v(copy.shot)} ${i + 1}`} />
            </div>
          ))}
        </div>
        <p className="mt-12 min-h-24" role="status" aria-live="polite">
          <Tx {...status} role="caption" className="text-text-meta" />
        </p>

        <Tx {...copy.frames} as="p" role="label" className="mt-24 text-text-meta" />
        <ul className="mt-12 flex snap-x gap-12 overflow-x-auto pb-8" style={{ scrollbarWidth: 'none' }} aria-label={v(copy.frames)}>
          {frames.map((f) => (
            <li key={f.id} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={f.id === frame?.id}
                onClick={() => setFrameId(f.id)}
                className={cx('ue-press block w-72 rounded-md p-4 text-left transition-colors duration-fast ease-out md:w-80', f.id === frame?.id ? 'bg-yellow' : 'bg-bg-panel hover:bg-bg-raised')}
              >
                <StripPreview frameId={f.id} mode="single" scale={0.16} alt={f.name.en} className="rounded-sm" />
                <Tx {...f.name} as="span" role="caption" className={cx('mt-4 block truncate', f.id === frame?.id ? 'text-text-onYellow' : 'text-text-sec')} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-5">
        <div className="mx-auto w-full max-w-read">
          {frame && <StripPreview frameId={frame.id} photos={photos} date={formatShotDate()} roomId="karaoke" mode="sheet" scale={0.4} alt={frame.name.en} className="rounded-sm shadow-lift" />}
          <Tx {...copy.printNote} as="p" role="caption" className="mt-16 text-text-meta" />
        </div>
      </div>
    </div>
  )
}
