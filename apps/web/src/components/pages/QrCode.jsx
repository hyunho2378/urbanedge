import { useMemo } from 'react'
import QRCode from 'qrcode'
import { cx } from '@urbanedge/ds'

// QR 코드: qrcode 라이브러리로 모듈 행렬을 만들고 SVG 사각형으로 그린다. 색은 부모의 글자색(currentColor)을 따른다.
export function QrCode({ value, label, className }) {
  const { size, path } = useMemo(() => {
    const q = QRCode.create(value, { errorCorrectionLevel: 'M' })
    const n = q.modules.size
    const d = []
    for (let y = 0; y < n; y++) {
      let x = 0
      while (x < n) {
        if (q.modules.get(x, y)) {
          let w = 1
          while (x + w < n && q.modules.get(x + w, y)) w++
          d.push(`M${x} ${y}h${w}v1h${-w}z`)
          x += w
        } else x++
      }
    }
    return { size: n, path: d.join('') }
  }, [value])
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} role="img" aria-label={label} className={cx('block h-auto', /\bw-/.test(className || '') ? null : 'w-full', className)} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill="currentColor" className="text-white" />
      <path d={path} fill="currentColor" className="text-black" />
    </svg>
  )
}
