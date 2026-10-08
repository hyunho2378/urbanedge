import { cx } from '../components/cx.js'
import { LineBadge } from '../components/Line.jsx'
import { INK, lineRgb, tok } from './colors.js'
import { StationNumberBadge } from './StationNumberBadge.jsx'
import { StationIcon } from './icons.jsx'
import { Bi, pickLang, useLangValue } from '../components/Bi.jsx'

const KO = '[&_[lang=ko]]:tracking-normal [&_[lang=ko]]:normal-case'

const U = { sm: 0.78, md: 1, lg: 1.5, xl: 2.2 }

const Chevron = ({ dir = 'right', u }) => (
  <svg width={9 * u} height={12 * u} viewBox="0 0 9 12" aria-hidden="true" style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined, flex: 'none' }}>
    <path d="M1.5 1.5 7 6l-5.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Neighbor({ side, stop, u }) {
  if (!stop) return <span />
  return (
    <span className={cx('flex min-w-0 items-center gap-1.5 text-text-sec', side === 'right' && 'flex-row-reverse text-right')} style={{ fontSize: 12 * u, lineHeight: 1.2 }}>
      <Chevron dir={side === 'left' ? 'left' : 'right'} u={u} />
      <span className="min-w-0">
        <span className="block text-text-pri" style={{ fontWeight: 650, letterSpacing: '-0.01em' }}>{stop.name}</span>
        {stop.nameKo && <span className="block text-text-meta" style={{ fontSize: 10.5 * u, fontWeight: 450 }}>{stop.nameKo}</span>}
      </span>
    </span>
  )
}

// 승강장 역명판. 위에 노선 배지와 이전역/다음역, 가운데에 노선 색 띠를 가로지르는 흰 알약 안의 역 번호와 역명, 아래에 플랫폼.
// station: { code:'H01', name:'UrbanEdge', nameKo:'어반엣지' }, platform?: { number, name, nameKo, accent, icon },
// line: { code:'H', color:'yellow' }, prev/next: { name, nameKo }. 이전 서명 { name, sub, code, color }도 받는다.
export function StationSign({ station, platform, line, prev, next, size = 'md', className, name, sub, code, color }) {
  const u = U[size] || 1
  const st = station || { name, nameKo: sub, code: undefined }
  const ln = line || { code: code || 'GY', color: color || 'yellow' }
  const accent = (platform && platform.accent) || ln.color
  const lang = useLangValue()
  return (
    <figure
      className={cx('relative m-0 w-full overflow-hidden bg-bg-panel', className)}
      style={{ borderRadius: 16 * u, padding: `${14 * u}px ${16 * u}px ${16 * u}px`, boxShadow: 'inset 0 0 0 1px rgb(var(--ue-text-pri) / 0.06)' }}
      aria-label={`${st.code ? `${st.code} ` : ''}${pickLang(lang, st.name, st.nameKo || st.name)}${platform ? pickLang(lang, `, Platform ${platform.number} ${platform.name}`, `, ${platform.number}번 승강장 ${platform.nameKo}`) : ''}`}
    >
      <div className="grid items-center" style={{ gridTemplateColumns: '1fr auto 1fr', columnGap: 10 * u }}>
        <Neighbor side="left" stop={prev} u={u} />
        <LineBadge code={ln.code} color={ln.color} size={size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm'} />
        <Neighbor side="right" stop={next} u={u} />
      </div>
      <div className="relative flex justify-center" style={{ marginTop: 10 * u }}>
        <span aria-hidden="true" className="absolute" style={{ left: -16 * u, right: -16 * u, top: '50%', height: 14 * u, marginTop: -7 * u, background: lineRgb(ln.color) }} />
        <div className="relative flex items-center" style={{ gap: 10 * u, padding: `${9 * u}px ${20 * u}px ${9 * u}px ${st.code ? 12 * u : 20 * u}px`, borderRadius: 999, background: tok('white'), color: INK, boxShadow: `0 0 0 ${5 * u}px ${tok('bg-panel')}` }}>
          {st.code && <StationNumberBadge code={st.code} lineColor={ln.color} accent={ln.color} size={size === 'xl' ? 'lg' : 'md'} />}
          <span className="block text-left" style={{ lineHeight: 1.05 }}>
            <span className="block" style={{ fontSize: 26 * u, fontWeight: 800, letterSpacing: '-0.03em' }}>{st.name}</span>
            {st.nameKo && <span className="block" style={{ fontSize: 12.5 * u, fontWeight: 600, opacity: 0.72, marginTop: 2 * u }}>{st.nameKo}</span>}
          </span>
        </div>
      </div>
      {platform && (
        <div className="flex items-center justify-center" style={{ marginTop: 12 * u, gap: 10 * u }}>
          <span className="grid place-items-center rounded-pill font-label font-extrabold tabular-nums" style={{ width: 28 * u, height: 28 * u, fontSize: 17 * u, background: lineRgb(accent), color: INK, boxShadow: `0 0 0 ${2 * u}px ${tok('white')}` }}>{platform.number}</span>
          {platform.icon && <StationIcon name={platform.icon} size={18 * u} className="text-text-pri" />}
          <span className="block" style={{ lineHeight: 1.15 }}>
            <span className={cx('block font-label uppercase text-text-meta', KO)} style={{ fontSize: 10.5 * u, fontWeight: 600, letterSpacing: '0.16em' }}><Bi en={`Platform ${platform.number}`} ko={`${platform.number}번 승강장`} /></span>
            <span className="block text-text-pri" style={{ fontSize: 14.5 * u, fontWeight: 700, letterSpacing: '-0.015em' }}>{platform.name}{platform.nameKo ? <span className="text-text-meta" style={{ fontWeight: 450 }}>{` ${platform.nameKo}`}</span> : null}</span>
          </span>
        </div>
      )}
    </figure>
  )
}

// 출구 표지. number는 출구 번호, label은 방향 안내.
export function ExitSign({ number = 1, label = 'Hwangridan-gil', labelKo = '황리단길', size = 'md', className }) {
  const u = U[size] || 1
  return (
    <div className={cx('inline-flex items-stretch overflow-hidden', className)} style={{ borderRadius: 12 * u, background: tok('bg-panel') }} role="img" aria-label={`Exit ${number}, ${label}`}>
      <span className="grid place-items-center font-label font-extrabold tabular-nums" style={{ minWidth: 52 * u, fontSize: 34 * u, background: tok('yellow'), color: INK }}>{number}</span>
      <span className="flex items-center" style={{ gap: 10 * u, padding: `${10 * u}px ${16 * u}px` }}>
        <StationIcon name="exit" size={20 * u} className="text-text-pri" />
        <span className="block" style={{ lineHeight: 1.15 }}>
          <span className={cx('block font-label uppercase text-text-meta', KO)} style={{ fontSize: 10.5 * u, fontWeight: 600, letterSpacing: '0.16em' }}><Bi en="Exit" ko="출구" /></span>
          <span className="block text-text-pri" style={{ fontSize: 16 * u, fontWeight: 700, letterSpacing: '-0.015em' }}>{label} <span className="text-text-meta" style={{ fontWeight: 450, fontSize: 13 * u }}>{labelKo}</span></span>
        </span>
      </span>
    </div>
  )
}

// 환승 표지. to: [{ code, color, name, nameKo }]
export function TransferSign({ to = [], label = 'Transfer', labelKo = '환승', size = 'md', className }) {
  const u = U[size] || 1
  return (
    <div className={cx('inline-flex flex-col', className)} style={{ borderRadius: 14 * u, background: tok('bg-panel'), padding: `${10 * u}px ${14 * u}px`, gap: 8 * u }} role="group" aria-label={label}>
      <span className="flex items-baseline" style={{ gap: 8 * u }}>
        <span className={cx('font-label uppercase text-text-meta', KO)} style={{ fontSize: 11 * u, fontWeight: 600, letterSpacing: '0.16em' }}><Bi inline en={label} ko={labelKo} /></span>
      </span>
      {to.map((t) => (
        <span key={t.code} className="flex items-center" style={{ gap: 10 * u }}>
          <LineBadge code={t.code} color={t.color} size={size === 'xl' ? 'lg' : 'md'} />
          <span className="block" style={{ lineHeight: 1.15 }}>
            <span className="block text-text-pri" style={{ fontSize: 16 * u, fontWeight: 700, letterSpacing: '-0.015em' }}>{t.name}</span>
            {t.nameKo && <span className="block text-text-meta" style={{ fontSize: 12 * u, fontWeight: 450 }}>{t.nameKo}</span>}
          </span>
          <StationIcon name="arrow" size={18 * u} className="ml-auto text-text-sec" />
        </span>
      ))}
    </div>
  )
}

// 객차 문 위 노선 안내 띠. stations: [{ id, code?, label, labelKo? }], current: 인덱스, direction: 'right' | 'left'
export function LineMapStrip({ line = { code: 'GY', color: 'yellow', name: 'Gyeongju Metro' }, stations = [], current = 0, size = 'md', className }) {
  const u = U[size] || 1
  const n = stations.length
  return (
    <div className={cx('w-full', className)} style={{ borderRadius: 14 * u, background: tok('bg-panel'), padding: `${12 * u}px ${14 * u}px` }} role="group" aria-label={`${line.name} stations`}>
      <div className="flex items-center" style={{ gap: 8 * u, marginBottom: 10 * u }}>
        <LineBadge code={line.code} color={line.color} size="sm" />
        <span className="font-label uppercase text-text-pri" style={{ fontSize: 12.5 * u, fontWeight: 700, letterSpacing: '0.12em' }}>{line.name}</span>
      </div>
      <ol className="m-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {stations.map((s, i) => {
          const passed = i < current
          const here = i === current
          return (
            <li key={s.id} className="relative flex flex-col items-center text-center" aria-current={here ? 'step' : undefined}>
              <span aria-hidden="true" className="absolute" style={{ top: 12 * u - 3 * u, height: 6 * u, left: i === 0 ? '50%' : 0, right: i === n - 1 ? '50%' : 0, background: passed || here ? lineRgb(line.color, passed ? 0.4 : 1) : tok('text-pri', 0.16) }} />
              <span className="relative grid place-items-center rounded-pill font-label font-extrabold tabular-nums" style={{ width: 24 * u, height: 24 * u, fontSize: 12 * u, background: here ? tok('white') : passed ? lineRgb(line.color, 0.5) : tok('bg-raised'), color: here || passed ? INK : tok('text-meta'), boxShadow: here ? `0 0 0 ${3.5 * u}px ${lineRgb(line.color)}` : undefined }}>{s.code || i + 1}</span>
              <span className={cx('block', here ? 'text-text-pri' : 'text-text-meta')} style={{ marginTop: 8 * u, fontSize: 11.5 * u, lineHeight: 1.2, fontWeight: here ? 750 : 500, textWrap: 'balance', letterSpacing: '-0.01em' }}>{s.label}</span>
              {s.labelKo && <span className="block text-text-meta" style={{ fontSize: 10 * u, fontWeight: 450 }}>{s.labelKo}</span>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
