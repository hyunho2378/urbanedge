// Simulator.jsx v4: 경로 `/`. 운영 데모 한 화면. 왼쪽은 키오스크 기기(1대 또는 3대), 오른쪽은 운영 화면(OpsPanel: 위 1/3 카메라, 아래 2/3 대시보드).
// ?units=1|3 (기본 1). 1대일 때는 부스 탭으로 방을 바꾸고(기본 지하철, 가장 많이 쓰는 부스), 3대일 때는 부스마다 기기 하나가 고정되어 동시에 돌아간다.
// 기기마다 자기 컨트롤러를 가진다. 기기를 누르면 그 부스가 선택되어 운영 화면 카메라가 그 부스를 보여 준다.
// 페이지는 스크롤하지 않는다. 기기 크기는 남은 높이와 폭에 맞춰 계산한다(기기 높이 = 폭 x RATIO).
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cx, LangContext, pickLang } from '@urbanedge/ds'
import Stage from '../device/Stage.jsx'
import KioskScreen from '../flow/KioskScreen.jsx'
import { useKioskController } from '../flow/controller.js'
import { ROOMS } from '../flow/rooms.js'
import { ops, useOps } from '../ops/store.js'
import OpsPanel from '../ops/OpsPanel.jsx'
import { autoRun, autoSpeed, MULTS, useAutoPilot, useAutoRun } from '../ops/sim.js'
import './simulator.css'

const BEZEL = 6
const FRAME = 2 * (BEZEL + 3)
const BOOTH_IDS = [...ROOMS].sort((a, b) => a.n - b.n).map((r) => r.id)
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
  const auto = useAutoRun()
  const ctrl = useKioskController({ ...options, speed: autoSpeed(options.speed ?? 1, auto), booth, room: booth })
  const pause = useAutoPilot(ctrl, booth)
  return (
    <div
      onPointerDownCapture={() => {
        pause()
        onFocus()
      }}
      onFocusCapture={onFocus}
      data-booth={booth}
      className="relative"
      style={{ width, boxSizing: 'border-box', padding: BEZEL, borderRadius: 20, background: '#000', border: `${focused ? 3 : 2}px solid ${focused ? '#FFD400' : '#FFFFFF'}` }}
    >
      <LangContext.Provider value={ctrl.lang}>
        <div className="overflow-hidden" style={{ borderRadius: 14 }}>
          <Stage label={pickLang(ctrl.lang, `Kiosk screen, ${roomOf(booth).title.en}`, `키오스크 화면, ${roomOf(booth).title.ko}`)}>
            <KioskScreen ctrl={ctrl} />
          </Stage>
        </div>
      </LangContext.Provider>
    </div>
  )
}

function BoothLabel({ id, lang, active }) {
  const r = roomOf(id)
  return (
    <span className={cx('font-ui text-body-sm font-bold', active ? 'text-[#FFD400]' : 'text-white')}>
      {r.n} {pickLang(lang, r.title.en, r.title.ko)}
    </span>
  )
}

function Segmented({ value, onChange, items, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex h-32 items-center gap-4">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="radio"
          aria-checked={value === it.value}
          onClick={() => onChange(it.value)}
          className={cx('h-full rounded-pill px-12 font-ui text-body-sm font-bold transition-colors duration-fast', value === it.value ? 'bg-[#FFD400] text-black' : 'bg-transparent text-white hover:text-[#FFD400]')}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

// 자동 운영 켜기/끄기와 배속. 켜면 화면의 키오스크들이 손님처럼 흐름을 돌고 결제가 대시보드에 실시간으로 쌓인다.
function AutoControl({ lang }) {
  const a = useAutoRun()
  return (
    <div className="flex items-center gap-8">
      <button
        type="button"
        aria-pressed={a.on}
        onClick={() => (a.on ? autoRun.stop() : autoRun.start())}
        className={cx('flex h-32 items-center gap-8 rounded-pill px-16 font-ui text-body-sm font-semibold transition-colors duration-fast', a.on ? 'bg-[#FFD400] text-black' : 'bg-transparent text-white hover:text-[#FFD400]')}
      >
        {a.on ? pickLang(lang, 'Stop', '정지') : pickLang(lang, 'Auto run', '자동 운영')}
      </button>
      <Segmented label={pickLang(lang, 'Speed', '배속')} value={a.mult} onChange={autoRun.setMult} items={MULTS.map((m) => ({ value: m, label: `${m}x` }))} />
    </div>
  )
}

export default function Simulator({ options = {} }) {
  const [params, setParams] = useSearchParams()
  const units = params.get('units') === '3' ? 3 : 1
  const opsLang = 'ko'
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

  const bodyRef = useRef(null)
  const { w: bw, h: bh } = useSize(bodyRef)
  const PAD = 16
  const LABEL = 24
  const TABS = 32
  const GAP3 = 16
  let w = 0
  let devH = 0
  let colW = 0
  if (bw > 0 && bh > 0) {
    if (units === 1) {
      colW = Math.max(300, Math.round(bw * 0.28))
      const availH = bh - 2 * PAD - TABS - 8
      w = Math.floor(Math.min(colW - 2 * PAD, ((availH - FRAME) * 16) / 9 + FRAME))
    } else {
      colW = Math.max(300, Math.round(bw * 0.24))
      const rowH = Math.floor((bh - 2 * PAD - 3 * LABEL - 2 * GAP3) / 3)
      w = Math.floor(Math.min(colW - 2 * PAD, ((rowH - FRAME) * 16) / 9 + FRAME))
    }
    devH = Math.floor(((w - FRAME) * 9) / 16) + FRAME
  }
  const L = opsLang
  const fsQ = new URLSearchParams({ room: units === 1 ? single : selected || 'subway', lang: options.lang || 'en', from: 'sim' })

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black text-white">
      <header className="flex h-48 shrink-0 items-center gap-16 bg-black px-16 text-white">
        <p className="font-display text-body font-bold">
          UrbanEdge <span className="font-ui font-semibold text-white">{pickLang(L, 'Ops demo', '운영 데모')}</span>
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
        <AutoControl lang={L} />
        <div className="ml-auto flex items-center gap-12">
          <Link to={`/screen?${fsQ.toString()}`} className="ue-press px-8 font-ui text-body-sm font-bold text-white hover:text-[#FFD400]">
            {pickLang(L, 'Full screen', '전체 화면')}
          </Link>
        </div>
      </header>

      <div ref={bodyRef} className="flex min-h-0 flex-1">
        <section aria-label={pickLang(L, 'Kiosks', '키오스크')} className="flex min-h-0 shrink-0 flex-col justify-center bg-black" style={{ width: colW || '28%', padding: PAD }}>
          {units === 1 ? (
            <>
              <div role="tablist" aria-label={pickLang(L, 'Booth', '부스')} className="mb-8 flex h-32 items-center gap-4">
                {BOOTH_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={single === id}
                    onClick={() => setSingle(id)}
                    className={cx('h-32 rounded-pill px-12 transition-colors duration-fast', single === id ? 'bg-[#FFD400]' : 'bg-transparent')}
                  >
                    <span className={cx('font-ui text-body-sm font-bold', single === id ? 'text-black' : 'text-white')}>
                      {roomOf(id).n} {pickLang(L, roomOf(id).title.en, roomOf(id).title.ko)}
                    </span>
                  </button>
                ))}
              </div>
              {w > 0 && <KioskUnit key={single} booth={single} width={w} options={kOpts} focused={false} onFocus={() => {}} />}
            </>
          ) : (
            <div className="flex flex-col" style={{ rowGap: GAP3 }}>
              {w > 0 &&
                BOOTH_IDS.map((id) => (
                  <div key={id} className="flex flex-col">
                    <button type="button" onClick={() => ops.selectBooth(id)} aria-pressed={selected === id} className="flex items-center text-left" style={{ height: LABEL }}>
                      <BoothLabel id={id} lang={L} active={selected === id} />
                    </button>
                    <div className="relative" style={{ width: w, height: devH, borderRadius: 20 }}>
                      <KioskUnit booth={id} width={w} options={kOpts} focused={selected === id} onFocus={() => ops.get().selectedBooth !== id && ops.selectBooth(id)} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section aria-label={pickLang(L, 'Operations', '운영 화면')} className="min-h-0 min-w-0 flex-1">
          <LangContext.Provider value={L}>
            <OpsPanel lang={L} />
          </LangContext.Provider>
        </section>
      </div>
    </div>
  )
}
