// ops/CameraPanel.jsx: 부스별 카메라 미리보기와 설정(좌우 반전, 줌, 밝기, 대비, 색온도, 필터), 저장 폴더.
// 키오스크가 웹캠 스트림을 store.stream에 올리면 그것을, 없으면 팀 사진을 보여 준다. 설정은 촬영과 저장에 같은 값으로 쓰인다.
import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { BOOTHS, CAMERA_FILTERS, cameraCss, ops, useOps } from './store.js'
import { Dialog, STEP_LABEL, Slider, Switch, Tabs, boothOf, hhmm, useL, useLangCode } from './ui.jsx'

const SAMPLE = { retro: '/img/team/shot-1.jpg', karaoke: '/img/team/shot-2.jpg', subway: '/img/team/shot-3.jpg' }
const FILTER_LABEL = {
  original: { en: 'Original', ko: '원본' },
  mono: { en: 'Mono', ko: '흑백' },
  film: { en: 'Film', ko: '필름' },
  warm: { en: 'Warm', ko: '따뜻하게' },
  cool: { en: 'Cool', ko: '차갑게' },
}

function Live({ stream, style }) {
  const v = useRef(null)
  useEffect(() => {
    if (v.current && v.current.srcObject !== stream) v.current.srcObject = stream
  }, [stream])
  return <video ref={v} autoPlay muted playsInline className="op-cam-media" style={style} />
}

export default function CameraPanel() {
  const L = useL()
  const lang = useLangCode()
  const sel = useOps((s) => s.selectedBooth)
  const cam = useOps((s) => s.camera[sel])
  const bs = useOps((s) => s.booth[sel])
  const stream = useOps((s) => s.stream?.[sel])
  const files = useOps((s) => s.files)
  const [open, setOpen] = useState(null)
  const css = cameraCss(cam)
  const mine = files.filter((f) => f.booth === sel).slice(0, 12)
  const stepLabel = bs.cameraActive ? L('Shooting', '촬영 중') : STEP_LABEL[bs.step]?.[lang] || STEP_LABEL[bs.step]?.ko || bs.step
  const set = (patch) => ops.setCamera(sel, patch)

  return (
    <section className="op-camera" aria-label={L('Camera', '카메라')}>
      <div className="op-cam-left">
        <div className="op-row-between">
          <Tabs
            size="sm"
            label={L('Booth', '부스')}
            value={sel}
            onChange={ops.selectBooth}
            items={BOOTHS.map((b) => ({ id: b.id, label: b.name[lang] || b.name.ko }))}
          />
        </div>
        <div className="op-cam-vwrap">
        <div className="op-cam-view">
          {stream ? <Live stream={stream} style={css} /> : <img src={SAMPLE[sel]} alt={L('Team photo standing in for the camera', '카메라 대신 보여 주는 팀 사진')} className="op-cam-media" style={css} />}
          <span className={`op-chip op-cam-status ${bs.cameraActive ? 'op-chip-live' : ''}`}>
            P{boothOf(sel).n} · {bs.online ? stepLabel : L('Offline', '연결 끊김')}
          </span>
          {!stream ? <span className="op-chip op-cam-src">{L('Team photo', '팀 사진')}</span> : null}
        </div>
        </div>
      </div>

      <div className="op-cam-controls">
        <div className="op-row-between">
          <h3 className="op-h3">{L('Camera settings', '카메라 설정')}</h3>
          <div className="op-row op-gap-6">
            <span className="op-switch-row">{L('Mirror', '좌우 반전')}</span>
            <Switch checked={cam.mirror} onChange={(v) => set({ mirror: v })} label={L('Mirror', '좌우 반전')} />
            <button type="button" className="op-btn op-btn-sm op-btn-ghost" onClick={() => ops.resetCamera(sel)}>
              <RotateCcw size={14} aria-hidden="true" />
              {L('Defaults', '기본값')}
            </button>
          </div>
        </div>
        <div className="op-sliders">
          <Slider label={L('Zoom', '줌')} value={cam.zoom} min={1} max={1.6} step={0.05} onChange={(v) => set({ zoom: v })} format={(v) => `${v.toFixed(2)}x`} />
          <Slider label={L('Brightness', '밝기')} value={cam.brightness} min={0.7} max={1.5} step={0.05} onChange={(v) => set({ brightness: v })} />
          <Slider label={L('Contrast', '대비')} value={cam.contrast} min={0.8} max={1.4} step={0.05} onChange={(v) => set({ contrast: v })} />
          <Slider label={L('Color temp.', '색온도')} value={cam.warmth} min={-1} max={1} step={0.1} onChange={(v) => set({ warmth: v })} format={(v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))} />
        </div>
        <div className="op-chips" role="radiogroup" aria-label={L('Filter', '필터')}>
          {CAMERA_FILTERS.map((f) => (
            <button key={f} type="button" role="radio" aria-checked={cam.filter === f} className="op-chip-btn" onClick={() => set({ filter: f })}>
              {FILTER_LABEL[f][lang] || FILTER_LABEL[f].ko}
            </button>
          ))}
        </div>
      </div>

      <div className="op-cam-files">
        <h3 className="op-files-title">
          {L('Save folder', '저장 폴더')}
          <span className="op-meta op-num">{mine.length}</span>
          <span className="op-meta op-files-key">
            <span className="op-file-key" aria-hidden="true" />
            {L('print', '인화본')}
          </span>
        </h3>
        {mine.length === 0 ? (
          <p className="op-empty">{L('Shots and prints from this booth land here.', '이 부스에서 찍은 컷과 인화본이 여기에 쌓인다.')}</p>
        ) : (
          <ul className="op-files">
            {mine.map((f) => (
              <li key={f.id}>
                <button type="button" className={`op-file ${f.kind === 'print' ? 'op-file-print' : ''}`} onClick={() => setOpen(f)} aria-label={`${f.kind === 'print' ? L('Print', '인화본') : L('Shot', '컷')} ${hhmm(f.ts)}`}>
                  <img src={f.url} alt="" />
                  <span className="op-file-meta op-num">
                    {hhmm(f.ts)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!open} onClose={() => setOpen(null)} title={open ? `${boothOf(open.booth).name[lang] || boothOf(open.booth).name.ko} · ${hhmm(open.ts)}` : ''} wide>
        {open ? <img src={open.url} alt="" className="op-file-big" /> : null}
      </Dialog>
    </section>
  )
}
