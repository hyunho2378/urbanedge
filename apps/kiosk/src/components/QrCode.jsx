import { useMemo } from 'react'
import QRCode from 'qrcode'

// QrCode: 실제로 스캔되는 QR. qrcode 라이브러리로 모듈 행렬을 만들어 SVG로 그린다(서버 호출 없음).
// 검정 모듈과 흰 바탕, 여백(quiet zone) 2칸을 지킨다.
export function QrCode({ value, label, className, size = 320 }) {
  const { n, d } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M' })
    const size2 = qr.modules.size
    const data = qr.modules.data
    let path = ''
    for (let y = 0; y < size2; y++) {
      for (let x = 0; x < size2; x++) if (data[y * size2 + x]) path += `M${x} ${y}h1v1h-1z`
    }
    return { n: size2, d: path }
  }, [value])
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label={label} className={className} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} className="fill-white" />
      <path d={d} className="fill-black" />
    </svg>
  )
}
