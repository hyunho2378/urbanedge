import { useEffect, useState } from 'react'
import { Tx } from './Bilingual.jsx'
import { SITE } from '../../data/site.js'

// 영업 시간 트랙: 24시간 선 위에 영업 구간을 칠하고, 경주의 현재 시각에 표시를 얹는다(Asia/Seoul).
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const seoulNow = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date())
  const h = Number(parts.find((p) => p.type === 'hour').value) % 24
  const m = Number(parts.find((p) => p.type === 'minute').value)
  return { min: h * 60 + m, label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` }
}

export function OpenNow({ copy }) {
  const [now, setNow] = useState(seoulNow)
  useEffect(() => {
    const id = setInterval(() => setNow(seoulNow()), 30000)
    return () => clearInterval(id)
  }, [])
  const open = toMin(SITE.hours.open)
  const close = SITE.hours.close === '24:00' ? 1440 : toMin(SITE.hours.close)
  const isOpen = now.min >= open && now.min < close
  const pct = (m) => `${(m / 1440) * 100}%`
  const state = isOpen ? copy.openNow : copy.closedNow
  const detail = isOpen
    ? { en: `${copy.until.en} ${SITE.hours.close}`, ko: `${SITE.hours.close} ${copy.until.ko}` }
    : { en: `${copy.opensAt.en} ${SITE.hours.open}`, ko: `${SITE.hours.open} ${copy.opensAt.ko}` }
  return (
    <div>
      <p role="status" className="flex flex-wrap items-baseline gap-x-12">
        <Tx {...state} role="subhead" className="text-text-pri" />
        <Tx {...detail} role="body" className="text-text-sec" />
      </p>
      <div className="relative mt-24 h-56" aria-hidden="true">
        <div className="absolute inset-x-0 top-24 h-8 rounded-pill bg-bg-raised" />
        <div className="absolute top-24 h-8 rounded-pill bg-yellow" style={{ left: pct(open), width: pct(close - open) }} />
        <div className="absolute top-12 w-0" style={{ left: pct(now.min) }}>
          <span className="absolute -left-12 top-0 grid size-24 place-items-center rounded-pill bg-text-pri">
            <span className="size-8 rounded-pill bg-bg-base" />
          </span>
        </div>
        {[0, 6, 12, 18, 24].map((h) => (
          <span key={h} className="t-caption absolute top-48 tabular-nums text-text-meta" style={{ left: pct(h * 60), transform: h === 0 ? 'none' : h === 24 ? 'translateX(-100%)' : 'translateX(-50%)' }}>
            {String(h).padStart(2, '0')}
          </span>
        ))}
      </div>
      <p className="t-caption mt-24 text-text-meta">
        <Tx inline {...copy.localTime} /> <span className="tabular-nums text-text-sec">{now.label}</span>
      </p>
    </div>
  )
}
