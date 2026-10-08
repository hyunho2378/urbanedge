import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Download } from 'lucide-react'
import { Button, cx, useLangValue } from '@urbanedge/ds'
import { Tx, useV } from './Bilingual.jsx'
import { SITE } from '../../data/site.js'

// 휴대폰 저장용 작은 카드(1080x1350 PNG). 화면에 보이는 그림과 저장되는 파일이 같도록 canvas로 한 번 그려서 둘 다에 쓴다.
const W = 1080
const H = 1350
const FONT = "'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', sans-serif"

const T = {
  save: { en: 'Save image', ko: '이미지 저장' },
  alt: {
    en: 'UrbanEdge card: 6, Poseok-ro 1079beon-gil, Gyeongju. Open 10:00 to 24:00. QR code to the website.',
    ko: '어반엣지 카드: 경북 경주시 포석로1079번길 6, 10:00부터 24:00까지 영업, 웹사이트 QR 코드',
  },
}

const cssRgb = (name) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace(/\s+/g, ' ')
  return v ? `rgb(${v.split(' ').join(',')})` : null
}

async function drawCard({ lang, url }) {
  try {
    await document.fonts?.ready
  } catch {
    /* 글꼴을 기다리지 못해도 기본 글꼴로 그린다 */
  }
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  const ink = cssRgb('--ue-black') || 'rgb(10,10,10)'
  const paper = cssRgb('--ue-white') || 'rgb(255,255,255)'
  const yellow = cssRgb('--ue-yellow') || 'rgb(240,200,60)'
  const grey = 'rgb(96,96,96)'
  const P = 96

  g.fillStyle = paper
  g.fillRect(0, 0, W, H)
  g.fillStyle = yellow
  g.fillRect(0, 0, W, 24)

  // 1번 출구 표식
  g.fillStyle = yellow
  g.beginPath()
  if (g.roundRect) g.roundRect(P, 120, 96, 96, 18)
  else g.rect(P, 120, 96, 96)
  g.fill()
  g.fillStyle = ink
  g.font = `800 64px ${FONT}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('1', P + 48, 170)
  g.textAlign = 'left'
  g.font = `700 34px ${FONT}`
  g.fillText(lang === 'ko' ? '1번 출구' : 'Exit 1', P + 124, 168)

  g.textBaseline = 'alphabetic'
  g.font = `800 120px ${FONT}`
  g.fillText('UrbanEdge', P, 380)
  g.font = `600 44px ${FONT}`
  g.fillStyle = grey
  g.fillText(lang === 'ko' ? '어반엣지 메트로그래피' : 'Metrography, Gyeongju', P, 446)

  // 주소와 시간. 한국어 주소는 택시와 지도 앱에 그대로 보여 줄 수 있게 항상 넣는다.
  g.fillStyle = ink
  g.font = `700 48px ${FONT}`
  g.fillText('경북 경주시 포석로1079번길 6', P, 586)
  g.font = `500 36px ${FONT}`
  g.fillStyle = grey
  g.fillText(lang === 'ko' ? '황리단길 · 검은 외관, 체커보드 문턱' : '6, Poseok-ro 1079beon-gil, Gyeongju', P, 642)
  g.fillStyle = ink
  g.font = `700 48px ${FONT}`
  g.fillText(`${SITE.hours.open} – ${SITE.hours.close}`, P, 742)
  g.font = `500 36px ${FONT}`
  g.fillStyle = grey
  g.fillText(lang === 'ko' ? '매일 영업' : 'Open daily', P, 794)

  // QR(오른쪽 아래, 카드 폭의 약 30%)
  const q = QRCode.create(url, { errorCorrectionLevel: 'M' })
  const n = q.modules.size
  const cell = Math.floor(320 / n)
  const real = cell * n
  const qx = W - P - real
  const qy = H - P - real
  g.fillStyle = ink
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.modules.get(x, y)) g.fillRect(qx + x * cell, qy + y * cell, cell, cell)

  g.font = `600 32px ${FONT}`
  g.fillStyle = ink
  g.fillText(url.replace(/^https?:\/\//, '').replace(/\/$/, ''), P, H - P - 56)
  g.font = `500 30px ${FONT}`
  g.fillStyle = grey
  g.fillText('@__urbanedge', P, H - P - 6)

  return new Promise((resolve) => c.toBlob((b) => resolve(b), 'image/png'))
}

export function FindUsPoster({ className }) {
  const v = useV()
  const lang = useLangValue()
  const url = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://urbanedge-web.vercel.app')).replace(/\/$/, '') + '/'
  const [card, setCard] = useState(null) // { blob, src }

  useEffect(() => {
    let alive = true
    let src = null
    drawCard({ lang, url }).then((blob) => {
      if (!alive || !blob) return
      src = URL.createObjectURL(blob)
      setCard({ blob, src })
    })
    return () => {
      alive = false
      if (src) URL.revokeObjectURL(src)
    }
  }, [lang, url])

  const save = async () => {
    if (!card) return
    const name = 'urbanedge-card.png'
    const file = typeof File !== 'undefined' ? new File([card.blob], name, { type: 'image/png' }) : null
    // 휴대폰은 공유 시트의 "이미지 저장"으로 사진 앱에 바로 넣는다. 데스크탑은 파일로 내려받는다.
    const coarse = window.matchMedia?.('(pointer: coarse)').matches
    if (coarse && file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: SITE.name })
        return
      } catch (e) {
        if (e?.name === 'AbortError') return
      }
    }
    const a = document.createElement('a')
    a.href = card.src
    a.download = name
    document.body.append(a)
    a.click()
    a.remove()
  }

  return (
    <div className={cx('flex flex-col items-start gap-16 sm:flex-row sm:items-end sm:gap-32', className)}>
      <div className="w-full max-w-[280px] overflow-hidden rounded-md bg-white shadow-lift" style={{ aspectRatio: `${W} / ${H}` }}>
        {card && <img src={card.src} alt={v(T.alt)} width={W} height={H} className="block size-full" />}
      </div>
      <Button onClick={save} size="lg" disabled={!card}>
        <Download size={20} aria-hidden="true" />
        <Tx inline {...T.save} />
      </Button>
    </div>
  )
}
