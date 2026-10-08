import { useEffect, useRef, useState } from 'react'
import { cx } from '../components/cx.js'
import { LineBadge } from '../components/Line.jsx'
import { INK, lineRgb, tok } from './colors.js'
import { TrainTrack } from './TrainTrack.jsx'
import { useElementSize } from './hooks.js'
import { Bi, pickLang, useLangValue } from '../components/Bi.jsx'

const KO = '[&_[lang=ko]]:tracking-normal [&_[lang=ko]]:normal-case'

const SCALE = { md: 1, lg: 2.2 }

// 다이내믹 아일랜드형 라이브 액티비티. 검정 알약이 접힘(compact)과 펼침(expanded) 사이를 전환한다.
// 모양은 9조각(모서리 4개 + 가로띠 + 세로띠)이고 조각마다 translate와 scale만 바뀌므로 모서리 반경이 일그러지지 않는다.
// line: { code, color, name }, thisLabel: 이번 역, nextLabel: 다음 역, subLabel: 안내 문구, progress: 0에서 1,
// remainingLabel: '2 stops left', etaLabel: 도착 예정 문구, stops: [{ id, label }] 선택
export function LiveIsland({
  expanded,
  defaultExpanded = false,
  onToggle,
  line = { code: 'GY', color: 'yellow', name: 'Gyeongju Metro' },
  thisLabel,
  nextLabel,
  subLabel,
  progress = 0,
  remainingLabel,
  etaLabel,
  stops,
  size = 'md',
  className,
}) {
  const controlled = expanded !== undefined
  const [inner, setInner] = useState(defaultExpanded)
  const open = controlled ? !!expanded : inner
  const uReq = typeof size === 'number' ? size : SCALE[size] || 1
  const rootRef = useRef(null)
  const expRef = useRef(null)
  const { w } = useElementSize(rootRef)
  // 컨테이너가 설계 폭(372 * 크기)보다 좁으면 전체를 비례해서 줄인다. 내용이 상자 밖으로 나가지 않게 한다.
  const u = w > 0 ? Math.min(uReq, Math.max(0.88, w / 372)) : uReq
  const { h: eh } = useElementSize(expRef)
  const drag = useRef(null)

  const R = 22 * u
  const CH = 2 * R
  const EW = w
  const CW = Math.min(EW, 244 * u)
  const EH = Math.max(eh, CH + 4)
  const ready = w > 0 && eh > 0
  const cx0 = (EW - CW) / 2

  const toggle = (next) => {
    if (!controlled) setInner(next)
    if (onToggle) onToggle(next)
  }

  const piece = (x, y, ww, hh, radius, tr) => (
    <span
      aria-hidden="true"
      className="absolute"
      style={{ left: x, top: y, width: ww, height: hh, borderRadius: radius, background: tok('black'), transformOrigin: '0 0', transform: open || !ready ? 'translate3d(0,0,0) scale(1,1)' : tr, transition: ready ? 'transform 560ms var(--ue-ease-out)' : 'none', willChange: 'transform' }}
    />
  )
  const stopsList = stops && stops.length > 1 ? stops : [{ id: 'a', label: thisLabel || '' }, { id: 'b', label: nextLabel || '' }]
  const cur = progress * (stopsList.length - 1)
  const lang = useLangValue()
  const plain = (v) => (typeof v === 'string' ? v : '')
  const label = pickLang(
    lang,
    `${plain(line.name) || 'Journey'}: next stop ${plain(nextLabel)}${plain(remainingLabel) ? `, ${plain(remainingLabel)}` : ''}. ${open ? 'Collapse' : 'Expand'}`,
    `${plain(line.name) || '여정'}: 다음 역 ${plain(nextLabel)}${plain(remainingLabel) ? `, ${plain(remainingLabel)}` : ''}. ${open ? '접기' : '펼치기'}`,
  )

  return (
    <div
      ref={rootRef}
      className={cx('relative z-30 w-full', className)}
      style={{ height: CH, maxWidth: 372 * uReq, marginInline: 'auto' }}
      onKeyDown={(e) => { if (e.key === 'Escape' && open) toggle(false) }}
    >
      {/* 모양 */}
      <div className="pointer-events-none absolute inset-0" style={{ filter: 'drop-shadow(0 0 0.7px rgb(var(--ue-text-pri) / 0.6)) drop-shadow(0 10px 22px rgb(var(--ue-black) / 0.55))' }}>
        {ready && (
          <>
            {piece(0, 0, R, R, `${R}px 0 0 0`, `translate3d(${cx0}px,0,0)`)}
            {piece(EW - R, 0, R, R, `0 ${R}px 0 0`, `translate3d(${cx0 + CW - EW}px,0,0)`)}
            {piece(0, EH - R, R, R, `0 0 0 ${R}px`, `translate3d(${cx0}px,${2 * R - EH}px,0)`)}
            {piece(EW - R, EH - R, R, R, `0 0 ${R}px 0`, `translate3d(${cx0 + CW - EW}px,${2 * R - EH}px,0)`)}
            {piece(0, R, EW, EH - 2 * R, 0, `translate3d(${cx0}px,0,0) scale(${CW / EW},0.0001)`)}
            {piece(R, 0, EW - 2 * R, EH, 0, `translate3d(${cx0}px,0,0) scale(${(CW - 2 * R) / (EW - 2 * R)},${CH / EH})`)}
          </>
        )}
      </div>

      {/* 접힘 내용 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute flex items-center"
        style={{ left: cx0, top: 0, width: CW, height: CH, padding: `0 ${14 * u}px 0 ${10 * u}px`, gap: 9 * u, opacity: open ? 0 : 1, transform: open ? `translate3d(0,${-4 * u}px,0) scale(0.96)` : 'translate3d(0,0,0) scale(1)', transition: 'opacity 240ms var(--ue-ease-out), transform 480ms var(--ue-ease-out)' }}
      >
        <LineBadge code={line.code} color={line.color} size={u > 1.5 ? 'lg' : 'sm'} />
        <span className="block min-w-0 flex-1" style={{ lineHeight: 1.1 }}>
          <span className={cx('block font-label uppercase text-text-meta', KO)} style={{ fontSize: 11 * u, fontWeight: 600, letterSpacing: '0.16em' }}><Bi en="Next stop" ko="다음 역" /></span>
          <span className="block truncate text-text-pri" style={{ fontSize: 15 * u, fontWeight: 750, letterSpacing: '-0.02em' }}>{nextLabel}</span>
        </span>
        {remainingLabel && <span className="shrink-0 tabular-nums text-text-sec" style={{ fontSize: 12.5 * u, fontWeight: 600 }}>{remainingLabel}</span>}
      </div>

      {/* 펼침 내용 */}
      <div
        ref={expRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 w-full"
        style={{ padding: `${14 * u}px ${16 * u}px ${15 * u}px`, opacity: open ? 1 : 0, transform: open ? 'translate3d(0,0,0) scale(1)' : `translate3d(0,${-8 * u}px,0) scale(0.97)`, transformOrigin: '50% 0', transition: `opacity ${open ? 320 : 180}ms var(--ue-ease-out) ${open ? 90 : 0}ms, transform 560ms var(--ue-ease-out)` }}
      >
        <div className="flex items-center justify-between" style={{ gap: 10 * u }}>
          <span className="flex min-w-0 items-center" style={{ gap: 9 * u }}>
            <LineBadge code={line.code} color={line.color} size={u > 1.5 ? 'lg' : 'md'} />
            <span className="truncate font-label uppercase text-text-sec" style={{ fontSize: 12.5 * u, fontWeight: 700, letterSpacing: '0.12em' }}>{line.name}</span>
          </span>
          {etaLabel && <span className="shrink-0 tabular-nums text-text-sec" style={{ fontSize: 12.5 * u, fontWeight: 600 }}>{etaLabel}</span>}
        </div>
        <div className="grid items-end" style={{ gridTemplateColumns: 'minmax(0,0.8fr) auto minmax(0,1.4fr)', columnGap: 10 * u, marginTop: 14 * u }}>
          <span className="block min-w-0" style={{ lineHeight: 1.15 }}>
            <span className={cx('block font-label uppercase text-text-meta', KO)} style={{ fontSize: 11 * u, fontWeight: 600, letterSpacing: '0.16em' }}><Bi en="This stop" ko="이번 역" /></span>
            <span className="block text-text-sec" style={{ fontSize: 15 * u, fontWeight: 600, letterSpacing: '-0.015em' }}>{thisLabel}</span>
          </span>
          <svg width={14 * u} height={14 * u} viewBox="0 0 24 24" fill="none" stroke={tok('text-meta')} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: 4 * u }}><line x1="4" x2="20" y1="12" y2="12" /><polyline points="13 5 20 12 13 19" /></svg>
          <span className="block min-w-0" style={{ lineHeight: 1.05 }}>
            <span className={cx('block font-label uppercase', KO)} style={{ fontSize: 11 * u, fontWeight: 700, letterSpacing: '0.16em', color: lineRgb(line.color) }}><Bi en="Next stop" ko="다음 역" /></span>
            <span className="block text-text-pri" style={{ fontSize: 27 * u, fontWeight: 800, letterSpacing: '-0.035em', textWrap: 'balance' }}>{nextLabel}</span>
          </span>
        </div>
        {subLabel && <p className="m-0 text-text-meta" style={{ marginTop: 6 * u, fontSize: 13 * u, fontWeight: 450, lineHeight: 1.4 }}>{subLabel}</p>}
        <div style={{ marginTop: 14 * u }}>
          <TrainTrack stops={stopsList} current={cur} color={line.color} size={u > 1.5 ? 'lg' : 'sm'} labels="none" />
        </div>
        {remainingLabel && <p className="m-0 text-text-pri" style={{ marginTop: 6 * u, fontSize: 13.5 * u, fontWeight: 700 }}>{remainingLabel}</p>}
      </div>

      {/* 조작 */}
      <button
        type="button"
        aria-expanded={open}
        aria-label={label}
        onClick={() => toggle(!open)}
        onPointerDown={(e) => { drag.current = e.clientY }}
        onPointerUp={(e) => {
          if (drag.current == null) return
          const dy = e.clientY - drag.current
          drag.current = null
          if (dy < -24 && open) toggle(false)
          else if (dy > 24 && !open) toggle(true)
        }}
        className="absolute cursor-pointer bg-transparent"
        style={{ left: open ? 0 : cx0, top: 0, width: open ? EW : CW, height: open ? EH : CH, borderRadius: R, minHeight: 44, touchAction: 'pan-x' }}
      />
      <span className="sr-only" aria-live="polite">{pickLang(lang, `Next stop ${plain(nextLabel)}. ${plain(remainingLabel)}`, `다음 역 ${plain(nextLabel)}. ${plain(remainingLabel)}`)}</span>
    </div>
  )
}
