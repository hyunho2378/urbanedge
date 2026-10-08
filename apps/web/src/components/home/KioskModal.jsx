import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { kioskEmbedHref, kioskHref } from '../../data/site.js'
import Modal from '../../layout/Modal.jsx'
import { usePick } from '../../i18n/index.jsx'

// 키오스크 체험 창. 작업 K1의 /screen?embed=1을 iframe으로 연다. 모달이 열릴 때만 불러온다.
export default function KioskModal() {
  const pick = usePick()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setOpen(true)
    window.addEventListener('ue:kiosk', on)
    return () => window.removeEventListener('ue:kiosk', on)
  }, [])
  const full = (() => {
    try {
      return new URL('screen', kioskHref()).toString()
    } catch {
      return '/screen'
    }
  })()
  return (
    <Modal open={open} onClose={() => setOpen(false)} label={pick({ en: 'Kiosk preview', ko: '키오스크 체험' })} className="md:max-w-5xl">
      <div className="p-16 pt-64 md:p-24 md:pt-72">
        <div className="overflow-hidden rounded-lg bg-black" style={{ aspectRatio: '16 / 9' }}>
          <iframe title={pick({ en: 'UrbanEdge kiosk screen', ko: '어반엣지 키오스크 화면' })} src={kioskEmbedHref()} className="size-full border-0" allow="camera" />
        </div>
        <div className="mt-16 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <p className="t-caption text-text-meta">{pick({ en: 'This is the real kiosk flow, minus payment. Tap the screen to start.', ko: '결제를 뺀 실제 키오스크 흐름이다. 화면을 눌러 시작한다.' })}</p>
          <a href={full} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-48 items-center gap-8 font-ui text-body-sm font-semibold text-yellow hover:text-yellow-hover">
            {pick({ en: 'Open full screen in a new window', ko: '새 창에서 전체 화면으로 열기' })}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </Modal>
  )
}
