// Simulator.jsx v4: 경로 `/`. 운영 데모 한 화면. 왼쪽은 키오스크 기기(1대 또는 3대), 오른쪽은 운영 화면(OpsPanel: 위 1/3 카메라, 아래 2/3 대시보드).
// ?units=1|3 (기본 1). 1대일 때는 부스 탭으로 방을 바꾸고(기본 지하철, 가장 많이 쓰는 부스), 3대일 때는 부스마다 기기 하나가 고정되어 동시에 돌아간다.
// 기기마다 자기 컨트롤러를 가진다. 기기를 누르면 그 부스가 선택되어 운영 화면 카메라가 그 부스를 보여 준다.
// 페이지는 스크롤하지 않는다. 기기 크기는 남은 높이와 폭에 맞춰 계산한다(기기 높이 = 폭 x RATIO).
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cx, LangContext, pickLang } from '@urbanedge/ds'
import DeviceFrame from '../device/DeviceFrame.jsx'
import Stage from '../device/Stage.jsx'
import { RATIO } from '../device/geometry.js'
import KioskScreen from '../flow/KioskScreen.jsx'
import { useKioskController } from '../flow/controller.js'
import { ROOMS } from '../flow/rooms.js'
import { ops, useOps } from '../ops/store.js'
import OpsPanel from '../ops/OpsPanel.jsx'
import './simulator.css'

const BOOTH_IDS = ['retro', 'karaoke', 'subway']
const DOT = { yellow: 'bg-line-yellow', red: 'bg-line-red', green: 'bg-line-green', blue: 'bg-line-blue' }
const roomOf = (id) => ROOMS.find((r) => r.id === id) || ROOMS[0]

function useSize(ref) {
  const [s, setS] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const up = () => setS({ w: el.clientWidth, h: el.clientHeight })
    up()
    const ro = new ResizeObserver(up)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return s
}

// 기기 한 대: 자기 컨트롤러, 자기 언어. 누르면 부스를 고른다.
function KioskUnit({ booth, width, options, focused, onFocus, showOutline }) {
  const ctrl = useKioskController({ ...options, booth, room: booth })
  return (
    <div
      onPointerDownCapture={onFocus}
      onFocusCapture={onFocus}
      data-booth={booth}
      className={cx('relative rounded-lg transition-shadow duration-fast', showOutline && focused && 'ring-2 ring-yellow ring-offset-4 ring-offset-bg-base')}
      style={{ width }}
    >
      <LangContext.Provider value={ctrl.lang}>
        <DeviceFrame hint={null} flashing={ctrl.flashing} printUrl={ctrl.printUrl} cameraActive={ctrl.cameraActive} annotate={false} bg="base">
          <Stage label={pickLang(ctrl.lang, `Kiosk screen, ${roomOf(booth).title.en}`, `키오스크 화면, ${roomOf(booth).title.ko}`)}>
            <KioskScreen ctrl={ctrl} />
          </Stage>
        </DeviceFrame>
      </LangContext.Provider>
    </div>
  )
}

function BoothLabel({ id, lang, active }) {
  const r = roomOf(id)
  return (
    <span className={cx('inline-flex items-center gap-8 font-ui text-body-sm font-semibold', active ? 'text-text-pri' : 'text-text-sec')}>
      <span className={cx('grid h-20 w-20 place-items-center rounded-pill text-[11px] font-bold text-black', DOT[r.color])}>{r.n}</span>
      {pickLang(lang, r.title.en, r.title.ko)}
    </span>
  )
}

function Segmented({ value, onChange, items, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex h-32 items-center rounded-pill border border-hairline p-2">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="radio"
          aria-checked={value === it.value}
          onClick={() => onChange(it.value)}
          className={cx('h-full rounded-pill px-12 font-ui text-body-sm font-semibold transition-colors duration-fast', value === it.value ? 'bg-yellow text-text-onYellow' : 'text-text-sec hover:text-text-pri')}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

export default function Simulator({ options = {} }) {
  const [params, setParams] = useSearchParams()
  const units = params.get('units') === '3' ? 3 : 1
  const [opsLang, setOpsLang] = useState(params.get('opslang') === 'en' ? 'en' : 'ko')
  const selected = useOps((s) => s.selectedBooth)
  const [single, setSingle] = useState(BOOTH_IDS.includes(options.room) ? options.room : 'subway')
  const kOpts = { lang: options.lang, cameraMode: options.cameraMode, speed: options.speed }

  useEffect(() => {
    if (units === 1) ops.selectBooth(single)
  }, [units, single])

  const setUnits = (n) => {
    const q = new URLSearchParams(params)
    q.set('units', String(n))
    setParams(q, { replace: true })
  }

  const leftRef = useRef(null)
  const { w: lw, h: lh } = useSize(leftRef)
  const gap = 16
  const rowGap = 28 // 기기 아래 트레이와 다리가 상자 밖으로 조금 나온다
  const labelH = 40
  let layout = { cols: 1, w: 0 }
  if (units === 1) {
    layout = { cols: 1, w: Math.max(0, Math.min(lw - 32, (lh - 32 - labelH) / RATIO)) }
  } else {
    for (const cols of [3, 2, 1]) {
      const rows = Math.ceil(3 / cols)
      const w = Math.min((lw - 32 - (cols - 1) * gap) / cols, (lh - 24 - rows * labelH - (rows - 1) * rowGap) / rows / RATIO)
      if (w > layout.w) layout = { cols, w }
    }
  }
  const L = opsLang
  const fsQ = new URLSearchParams({ room: units === 1 ? single : selected || 'subway', lang: options.lang || 'en' })

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg-base text-text-pri">
      <header className="flex h-56 shrink-0 items-center gap-16 border-b border-hairline px-20">
        <p className="font-display text-body font-bold">
          UrbanEdge <span className="font-ui font-semibold text-text-sec">{pickLang(L, 'Ops demo', '운영 데모')}</span>
        </p>
        <Segmented
          label={pickLang(L, 'Number of kiosks', '키오스크 대수')}
          value={units}
          onChange={setUnits}
          items={[
            { value: 1, label: pickLang(L, '1 kiosk', '키오스크 1대') },
            { value: 3, label: pickLang(L, '3 kiosks', '3대') },
          ]}
        />
        <div className="ml-auto flex items-center gap-12">
          <Segmented label={pickLang(L, 'Ops language', '운영 화면 언어')} value={L} onChange={setOpsLang} items={[{ value: 'ko', label: 'KO' }, { value: 'en', label: 'EN' }]} />
          <Link to={`/screen?${fsQ.toString()}`} className="ue-press px-8 font-ui text-body-sm font-semibold text-text-sec hover:text-text-pri">
            {pickLang(L, 'Full screen', '전체 화면')}
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section ref={leftRef} aria-label={pickLang(L, 'Kiosks', '키오스크')} className={cx('flex min-h-0 shrink-0 flex-col items-center justify-center px-16', units === 1 ? 'w-[44%]' : 'w-[48%]')}>
          {units === 1 ? (
            <>
              <div role="tablist" aria-label={pickLang(L, 'Booth', '부스')} className="mb-8 flex h-32 items-center gap-8">
                {BOOTH_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={single === id}
                    onClick={() => setSingle(id)}
                    className={cx('h-32 rounded-pill border px-12 transition-colors duration-fast', single === id ? 'border-yellow' : 'border-hairline hover:border-hairlineStrong')}
                  >
                    <BoothLabel id={id} lang={L} active={single === id} />
                  </button>
                ))}
              </div>
              {layout.w > 0 && <KioskUnit key={single} booth={single} width={Math.floor(layout.w)} options={kOpts} focused onFocus={() => {}} />}
            </>
          ) : (
            <div className="grid justify-center" style={{ gridTemplateColumns: `repeat(${layout.cols}, ${Math.floor(layout.w)}px)`, columnGap: gap, rowGap }}>
              {layout.w > 0 &&
                BOOTH_IDS.map((id) => (
                  <div key={id} className="flex flex-col items-center">
                    <button type="button" onClick={() => ops.selectBooth(id)} aria-pressed={selected === id} className="flex items-center" style={{ height: labelH }}>
                      <BoothLabel id={id} lang={L} active={selected === id} />
                    </button>
                    <KioskUnit booth={id} width={Math.floor(layout.w)} options={kOpts} focused={selected === id} showOutline onFocus={() => ops.get().selectedBooth !== id && ops.selectBooth(id)} />
                  </div>
                ))}
            </div>
          )}
        </section>

        <section aria-label={pickLang(L, 'Operations', '운영 화면')} className="min-h-0 min-w-0 flex-1 border-l border-hairline">
          <LangContext.Provider value={L}>
            <OpsPanel lang={L} />
          </LangContext.Provider>
        </section>
      </div>
    </div>
  )
}
