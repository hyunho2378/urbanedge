import { useMemo, useState } from 'react'
import { Check, Lock, MessageSquare, Stamp as StampIcon, Train, X } from 'lucide-react'
import { LineBadge, cx } from '@urbanedge/ds'
import { StationBadge } from '../../components/StationBadge.jsx'
import { FrameCanvas } from '../../components/FrameCanvas.jsx'
import { OnScreenKeyboard } from '../../components/OnScreenKeyboard.jsx'
import { Stamp } from '../../components/Stamp.jsx'
import { useT } from '../../components/lang.jsx'
import { COPY } from '../copy.js'
import { FLOW } from '../config.js'
import { ROOMS, roomById } from '../rooms.js'
import { glyphCount } from '../hangul.js'

// 11. print: 인화 대기. 기다리는 동안 노선 스탬프, 한 줄 메시지(한글과 영문 온스크린 키보드), 다른 방 소개를 즐긴다.
// 진행률 바는 transform으로 표시한다. 인화가 끝나면 합성 결과가 printUrl로 나가고 편집은 잠긴다.
const TABS = [
  { id: 'stamp', icon: StampIcon },
  { id: 'message', icon: MessageSquare },
  { id: 'rooms', icon: Train },
]

function StampPanel({ ctrl, locked }) {
  const t = useT()
  return (
    <div className="flex h-full flex-col gap-16">
      <p className="text-k-body text-text-sec">{t(COPY.print.stampHint)}</p>
      <ul className="grid min-h-0 flex-1 grid-cols-5 gap-12">
        {ROOMS.map((r) => {
          const on = ctrl.stamps.includes(r.id)
          return (
            <li key={r.id} className="flex">
              <button
                type="button"
                aria-pressed={on}
                disabled={locked}
                onClick={() => ctrl.toggleStamp(r.id)}
                className={cx(
                  'ue-press relative flex min-h-touch flex-1 flex-col items-center justify-center gap-12 rounded-xl border-2 bg-bg-panel p-12 transition-[transform,opacity] duration-fast ease-out disabled:opacity-60',
                  on ? 'border-yellow' : 'border-hairlineStrong',
                )}
              >
                <Stamp room={r} className={cx('w-full', on && 'k-stamp')} tilt={on ? -6 : 0} />
                <span className="ue-label text-k-label text-text-pri">{r.name}</span>
                <span className={cx('rounded-pill px-16 py-4 font-ui text-k-label font-bold', on ? 'bg-yellow text-text-onYellow' : 'text-text-meta')}>
                  {on ? t(COPY.print.stampOn) : t(r.copy.title)}
                </span>
                {on && (
                  <span className="absolute right-8 top-8 grid size-40 place-items-center rounded-pill bg-yellow text-text-onYellow">
                    <Check size={26} strokeWidth={4} aria-hidden="true" />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function MessagePanel({ ctrl, locked, onDone }) {
  const t = useT()
  const len = glyphCount(ctrl.message)
  return (
    <div className="flex h-full flex-col gap-12">
      <div className="flex items-center gap-16">
        <div
          className="flex flex-1 items-center justify-between rounded-lg border-2 border-yellow bg-bg-raised px-24"
          style={{ height: 120 }}
          aria-live="polite"
        >
          <p className="min-w-0 truncate font-display text-k-body font-bold leading-none">
            {ctrl.message ? (
              <>
                {ctrl.message}
                {!locked && <span className="k-caret ml-4 inline-block h-36 w-4 translate-y-8 bg-yellow" aria-hidden="true" />}
              </>
            ) : (
              <span className="text-text-meta">{t(COPY.print.msgPlaceholder)}</span>
            )}
          </p>
          <p className="shrink-0 pl-16 font-label text-k-label text-text-meta">{t(COPY.print.msgLimit, { n: len, max: FLOW.messageMax })}</p>
        </div>
        <button
          type="button"
          disabled={locked || !ctrl.message}
          onClick={() => ctrl.setMessage('')}
          aria-label={t(COPY.keyboard.clear)}
          className="ue-press grid shrink-0 place-items-center rounded-lg border border-hairlineStrong bg-bg-panel text-text-pri disabled:opacity-40"
          style={{ width: 120, height: 120 }}
        >
          <X size={36} aria-hidden="true" />
        </button>
      </div>
      <OnScreenKeyboard value={ctrl.message} onChange={ctrl.setMessage} onDone={onDone} disabled={locked} />
    </div>
  )
}

function RoomsPanel({ ctrl }) {
  const t = useT()
  const [open, setOpen] = useState(ROOMS.find((r) => r.id !== ctrl.room).id)
  const cur = roomById(open)
  return (
    <div className="flex h-full flex-col gap-16">
      <p className="text-k-body text-text-sec">{t(COPY.print.roomsHint)}</p>
      <ul className="grid grid-cols-5 gap-12" role="group" aria-label={t(COPY.print.tabs.rooms)}>
        {ROOMS.map((r) => {
          const here = r.id === ctrl.room
          const on = r.id === open
          return (
            <li key={r.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setOpen(r.id)}
                className={cx(
                  'ue-press relative flex w-full flex-col overflow-hidden rounded-xl border-2 bg-bg-panel text-left transition-[transform,opacity] duration-fast ease-out',
                  on ? 'border-yellow' : 'border-hairlineStrong',
                )}
              >
                <img src={r.img} alt="" draggable={false} className="h-160 w-full object-cover" />
                <span className="flex flex-col gap-4 p-12">
                  <span className="flex items-center gap-12">
                    <LineBadge code={r.code} color={r.color} size="lg" />
                    <span className="min-w-0 font-ui text-k-label font-bold leading-tight text-text-sec">{here ? t(COPY.common.thisRoom) : t(r.copy.title)}</span>
                  </span>
                  <span className="ue-label text-k-label leading-tight">{r.name}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="flex flex-1 items-center gap-24 rounded-xl border border-hairlineStrong bg-bg-elev px-32">
        <StationBadge code={cur.code} color={cur.color} size="lg" />
        <div>
          <p className="font-display text-k-h3 font-black leading-tight tracking-tightest">
            {cur.name} <span className="text-text-sec">{t(cur.copy.title)}</span>
          </p>
          <p className="mt-4 text-k-body leading-snug text-text-sec">{t(cur.copy.summary)}</p>
        </div>
      </div>
    </div>
  )
}

export default function Print({ ctrl }) {
  const t = useT()
  const [tab, setTab] = useState('stamp')
  const done = ctrl.printDone
  const onTabKey = (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const i = TABS.findIndex((x) => x.id === tab)
    const nx = TABS[(i + d + TABS.length) % TABS.length].id
    setTab(nx)
    requestAnimationFrame(() => document.getElementById(`tab-${nx}`)?.focus())
  }
  const pct = Math.round(ctrl.printProgress * 100)
  const sel = ctrl.selected
  const photos = useMemo(() => sel.map((i) => (ctrl.shots[i] ? { src: ctrl.shots[i].canvas } : null)), [sel, ctrl.shots])

  return (
    <div className="flex h-full gap-40 px-64 pb-16 pt-16">
      <div className="flex shrink-0 flex-col gap-12" style={{ width: 480 }}>
        <h1 className="font-display text-k-h3 font-black leading-tight tracking-tightest">{t(done ? COPY.print.titleDone : COPY.print.title)}</h1>
        <div className="flex flex-1 items-center justify-center rounded-xl border border-hairlineStrong bg-bg-elev p-16">
          {ctrl.frame && (
            <div className={done ? '' : 'k-print-bob'}>
              <FrameCanvas frame={ctrl.frame} photos={photos} stamps={ctrl.stamps} message={ctrl.message} room={ctrl.room} maxW={400} maxH={470} label={t(COPY.print.title)} />
            </div>
          )}
        </div>
        <div role="progressbar" aria-label={t(COPY.print.progress)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="mb-8 flex items-baseline justify-between">
            <span className="text-balance font-ui text-k-label font-bold text-text-sec">{t(done ? COPY.print.doneLine : COPY.print.waitLine)}</span>
          </div>
          <div className="flex items-center gap-16">
            <div className="h-16 flex-1 overflow-hidden rounded-pill bg-bg-raised">
              <div className="h-full w-full origin-left rounded-pill bg-yellow transition-transform duration-base ease-linear" style={{ transform: `scaleX(${ctrl.printProgress})` }} />
            </div>
            <span className="w-96 text-right font-label text-k-btn font-bold text-yellow">{t(COPY.print.pct, { n: pct })}</span>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-16">
        <div role="tablist" aria-label={t(COPY.print.waitLine)} className="flex gap-8" onKeyDown={onTabKey}>
          {TABS.map((x) => {
            const on = tab === x.id
            const Icon = x.icon
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                aria-controls={`panel-${x.id}`}
                onClick={() => setTab(x.id)}
                className={cx(
                  'ue-press flex min-h-touch flex-1 items-center justify-center gap-16 rounded-lg border font-ui text-k-btn font-semibold transition-[transform,opacity,background-color] duration-fast ease-out',
                  on ? 'border-yellow bg-yellow text-text-onYellow' : 'border-hairlineStrong bg-bg-panel text-text-pri',
                )}
              >
                <Icon size={40} aria-hidden="true" />
                {t(COPY.print.tabs[x.id])}
              </button>
            )
          })}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="relative min-h-0 flex-1">
          {tab === 'stamp' && <StampPanel ctrl={ctrl} locked={done} />}
          {tab === 'message' && <MessagePanel ctrl={ctrl} locked={done} onDone={() => setTab('stamp')} />}
          {tab === 'rooms' && <RoomsPanel ctrl={ctrl} />}
          {done && tab !== 'rooms' && (
            <p className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-12 rounded-lg bg-scrim py-16 font-ui text-k-body font-bold">
              <Lock size={32} aria-hidden="true" />
              {t(COPY.print.locked)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
