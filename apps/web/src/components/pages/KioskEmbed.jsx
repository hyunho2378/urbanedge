import { useState } from 'react'
import { ExternalLink, RotateCw } from 'lucide-react'
import { Button } from '@urbanedge/ds'
import { Tx, useV } from './Bilingual.jsx'
import * as site from '../../data/site.js'
import { useNearView } from './hooks.js'

// 키오스크 시뮬레이터를 iframe으로 체험한다. 화면에 가까워질 때 불러온다.
// 주 행동은 새 창 전체 화면 하나이고, 다시 시작은 텍스트 링크다.
const base = () => {
  const raw = typeof site.kioskHref === 'function' ? site.kioskHref() : site.SITE?.kioskUrl || '/'
  const abs = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  if (!abs.pathname.endsWith('/')) abs.pathname += '/'
  return abs
}

export function KioskEmbed({ copy }) {
  const v = useV()
  const [ref, seen] = useNearView('200px 0px')
  const [nonce, setNonce] = useState(0)
  const root = base()
  const embed = new URL('screen?embed=1', root).toString()
  const full = new URL('screen', root).toString()
  return (
    <div>
      <div ref={ref} className="relative w-full overflow-hidden rounded-lg bg-bg-panel" style={{ aspectRatio: '16 / 9' }}>
        {seen ? (
          <iframe key={nonce} src={embed} title={v(copy.title)} loading="lazy" className="absolute inset-0 size-full border-0" allow="fullscreen" />
        ) : (
          <div className="grid size-full place-items-center">
            <Tx {...copy.loading} role="label" className="text-text-meta" />
          </div>
        )}
      </div>
      <div className="mt-16 flex flex-wrap items-center gap-x-24 gap-y-8">
        <Button as="a" href={full} target="_blank" rel="noopener noreferrer">
          <Tx inline {...copy.full} />
          <ExternalLink size={18} aria-hidden="true" />
        </Button>
        <button type="button" onClick={() => setNonce((n) => n + 1)} className="t-strong inline-flex min-h-48 items-center gap-8 text-text-sec hover:text-yellow">
          <RotateCw size={16} aria-hidden="true" />
          <Tx inline {...copy.restart} />
        </button>
      </div>
    </div>
  )
}
