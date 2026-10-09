// ops/Frames.jsx: 프레임 켜고 끄기와 추가. 수정 즉시 키오스크 반영. 가격은 상품과 가격 탭
// 프레임은 데이터(이름, 색, 컷 수, 기본 레이아웃) 한 줄이라 하나를 더해도 프로그램을 다시 짤 필요가 없다.
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { allFrames } from '../flow/prints.js'
import { StripView } from '../components/StripView.jsx'
import { ops, useOps } from './store.js'
import { Switch, useL, useLangCode } from './ui.jsx'

export default function Frames() {
  const L = useL()
  const lang = useLangCode()
  const frames = useOps((s) => s.frames)
  const base = allFrames()
  const [name, setName] = useState('')
  const [bg, setBg] = useState('#FFD400')
  const [fg, setFg] = useState('#000000')
  const [cuts, setCuts] = useState(4)

  const add = (e) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    const cloneFrom = base.find((f) => f.cuts === cuts) || base[0]
    ops.addFrame({ id: `custom-${Date.now().toString(36)}`, name: n, bg, fg, cuts, base: cloneFrom.id })
    setName('')
  }

  return (
    <div className="op-stack">
      <div className="op-stack">
        <section className="op-card" aria-label={L('Add a frame', '프레임 추가')}>
          <h3 className="op-h3">{L('Add a frame', '프레임 추가')}</h3>
          <p className="op-meta">{L('A frame is one line of data, so adding one needs no program rewrite.', '프레임은 데이터 한 줄, 추가에 프로그램 수정 불필요')}</p>
          <form className="op-form" onSubmit={add}>
            <label className="op-field op-span-2">
              <span>{L('Name', '이름')}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={L('e.g. Olive Cafe', '예: 올리브 카페')} />
            </label>
            <label className="op-field">
              <span>{L('Background', '배경색')}</span>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            </label>
            <label className="op-field">
              <span>{L('Text', '글자색')}</span>
              <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
            </label>
            <fieldset className="op-field op-span-2">
              <legend>{L('Cuts', '컷 수')}</legend>
              <div className="op-row">
                {[4, 8].map((c) => (
                  <label key={c} className="op-radio">
                    <input type="radio" name="op-cuts" checked={cuts === c} onChange={() => setCuts(c)} />
                    {c}
                    {L(' cuts', '컷')}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="op-btn op-span-2" disabled={!name.trim()}>
              <Plus size={16} aria-hidden="true" />
              {L('Add frame', '프레임 추가')}
            </button>
          </form>
        </section>
      </div>

      <section className="op-card" aria-label={L('Frames', '프레임')}>
        <h3 className="op-h3">
          {L('Frames', '프레임')} <span className="op-meta op-num">{frames.filter((f) => f.enabled).length}/{frames.length} {L('on', '사용 중')}</span>
        </h3>
        <ul className="op-frames">
          {frames.map((f) => {
            const real = base.find((b) => b.id === f.id)
            const label = real ? real.name[lang] || real.name.ko : f.custom?.name
            const c = real ? real.cuts : f.custom?.cuts
            return (
              <li key={f.id} className={f.enabled ? '' : 'op-off'}>
                <div className="op-frame-thumb">
                  {real ? (
                    <StripView frame={real} height={96} scale={0.12} label={label} />
                  ) : (
                    <div className="op-frame-swatch" style={{ background: f.custom.bg, color: f.custom.fg }}>
                      {f.custom.name.slice(0, 6)}
                    </div>
                  )}
                </div>
                <div className="op-frame-info">
                  <span className="op-strong">{label}</span>
                  <span className="op-meta">
                    {c}
                    {L(' cuts', '컷')}
                    {f.custom ? ` ${L('added', '추가됨')}` : ''}
                  </span>
                </div>
                <Switch checked={f.enabled} onChange={() => ops.toggleFrame(f.id)} label={`${label} ${L('on kiosks', '키오스크에 표시')}`} />
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
