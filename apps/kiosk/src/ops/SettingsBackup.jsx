// ops/SettingsBackup.jsx: 설정 내보내기/불러오기. 상품, 프레임, 쿠폰, 카메라 설정을 파일 하나로 남기고 되돌린다.
// 이 화면은 서버 없이 이 탭 안에서만 돌기 때문에, 바꾼 설정을 남기려면 여기서 파일로 내려받아 둔다.
import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { ops, useOps } from './store.js'
import { useL } from './ui.jsx'

export default function SettingsBackup() {
  const L = useL()
  const input = useRef(null)
  const [msg, setMsg] = useState(null)
  const counts = { p: useOps((s) => s.products.length), f: useOps((s) => s.frames.length), c: useOps((s) => s.coupons.length) }

  const exportFile = () => {
    const data = ops.exportSettings()
    const d = new Date()
    const p = (n) => String(n).padStart(2, '0')
    const name = `urbanedge-settings-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.json`
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMsg({ ok: true, text: L(`Saved ${name}`, `${name} 파일 저장 완료`) })
  }

  const importFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const obj = JSON.parse(await file.text())
      const r = ops.importSettings(obj)
      setMsg(r.ok ? { ok: true, text: L('Settings restored. The kiosks use them from the next payment.', '설정 불러오기 완료, 다음 결제부터 적용') } : { ok: false, text: r.error })
    } catch {
      setMsg({ ok: false, text: L('This file cannot be read. Pick a settings file saved from this screen.', '읽을 수 없는 파일, 이 화면에서 저장한 설정 파일 선택') })
    }
  }

  return (
    <div className="op-stack">
      <section className="op-card" aria-label={L('Settings backup', '설정 백업')}>
        <h3 className="op-h3">{L('Save and restore settings', '설정 저장과 불러오기')}</h3>
        <p className="op-body">
          {L('Prices, products, frames, coupons and camera settings go into one file. Keep it somewhere safe, and load it again to get the same settings back.', '가격, 상품, 프레임, 쿠폰, 카메라 설정을 파일 하나로 저장, 같은 설정이 필요할 때 다시 불러오기')}
        </p>
        <p className="op-meta">
          {L(`Now: ${counts.p} products, ${counts.f} frames, ${counts.c} coupons`, `지금 상품 ${counts.p}개, 프레임 ${counts.f}개, 쿠폰 ${counts.c}개`)}
        </p>
        <div className="op-row">
          <button type="button" className="op-btn" onClick={exportFile}>
            <Download size={16} aria-hidden="true" />
            {L('Save settings file', '설정 파일 저장')}
          </button>
          <button type="button" className="op-btn op-btn-ghost" onClick={() => input.current?.click()}>
            <Upload size={16} aria-hidden="true" />
            {L('Load settings file', '설정 파일 불러오기')}
          </button>
          <input ref={input} type="file" accept="application/json,.json" onChange={importFile} className="op-sr" tabIndex={-1} aria-label={L('Settings file', '설정 파일')} />
        </div>
        {msg ? (
          <p className={`op-note ${msg.ok ? '' : 'op-note-warn'}`} role="status">
            {msg.text}
          </p>
        ) : null}
        <p className="op-meta">{L('This screen runs inside this tab only, so reloading the page returns to the starting settings. Save a file first if you want to keep your changes.', '서버 미연결 시 새로고침하면 처음 설정으로 복귀, 변경 내용은 파일로 먼저 저장')}</p>
      </section>
    </div>
  )
}
