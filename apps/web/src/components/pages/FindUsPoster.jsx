import { Printer } from 'lucide-react'
import { UEMark } from '@urbanedge/brand'
import { Button, CautionTape, ExitSign, ShareButton, useLangValue } from '@urbanedge/ds'
import { Tx, useV } from './Bilingual.jsx'
import { SITE } from '../../data/site.js'
import { NOTICE, STATION } from './content.js'
import { QrCode } from './QrCode.jsx'

// 출력용 "찾아오는 길" 포스터. 종이에 찍는 것을 전제로 흰 바탕과 검정 글자로 만들고, 사이트 주소의 QR을 넣는다.
// 인쇄 버튼은 이 포스터만 종이에 내보낸다(@media print로 나머지를 가린다). 장난스러운 설정이며 실제 교통시설이 아니다.
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .ue-poster, .ue-poster * { visibility: visible !important; }
  .ue-poster { position: fixed !important; inset: 0 !important; margin: 0 !important; width: 100% !important; max-width: none !important; border-radius: 0 !important; box-shadow: none !important; }
  .ue-poster-ui { display: none !important; }
}
`
const exact = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }

const T = {
  title: { en: 'Find us at Exit 1.', ko: '1번 출구에서 만나요' },
  addr: { en: '6, Poseok-ro 1079beon-gil, Gyeongju-si, Gyeongbuk', ko: '경북 경주시 포석로1079번길 6' },
  look: { en: 'Black front, checkerboard step', ko: '검은 외관과 체커보드 문턱' },
  hours: { en: 'Hours', ko: '영업 시간' },
  scan: { en: 'Scan for the guide, the platforms and directions', ko: '여정 안내와 승강장, 길 찾기는 QR로 확인' },
  print: { en: 'Print the poster', ko: '포스터 출력' },
  share: { en: 'Send it to a friend', ko: '친구에게 보내기' },
  qr: { en: 'QR code linking to the UrbanEdge website', ko: '어반엣지 웹사이트로 연결되는 QR 코드' },
}

export function FindUsPoster() {
  const v = useV()
  const lang = useLangValue()
  const site = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://urbanedge.example')).replace(/\/$/, '') + '/'
  const hours = { en: `${SITE.hours.open} to ${SITE.hours.close}`, ko: `${SITE.hours.open}부터 ${SITE.hours.close}까지` }
  return (
    <div>
      <style>{PRINT_CSS}</style>
      <article className="ue-poster relative mx-auto w-full max-w-read overflow-hidden rounded-md bg-white text-black shadow-lift" style={{ aspectRatio: '1 / 1.414', ...exact }} aria-label={v(T.title)}>
        <div className="flex h-full flex-col">
          <div className="h-16 shrink-0" aria-hidden="true" style={exact}>
            <CautionTape size={16} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-between p-24 md:p-32">
            <div>
              <div className="flex items-start justify-between gap-16">
                <ExitSign number={1} label={STATION.name} labelKo={STATION.nameKo} size="md" />
                <UEMark className="size-48 shrink-0" aria-hidden="true" />
              </div>
              <Tx {...T.title} as="h3" role="display" inner="text-display-m" className="mt-24 text-black" />
              <Tx {...T.addr} as="p" role="body" className="mt-16 text-bg-raised" />
              <Tx {...T.look} as="p" role="body" className="text-bg-raised" />
            </div>
            <div className="flex items-end justify-between gap-16">
              <div className="min-w-0">
                <Tx {...T.hours} as="p" role="caption" className="text-bg-raised" />
                <Tx {...hours} as="p" role="subhead" className="tabular-nums text-black" />
                <Tx {...T.scan} as="p" role="caption" className="mt-16 max-w-240 text-bg-raised" />
                <Tx {...NOTICE} as="p" role="caption" className="mt-8 max-w-240 font-semibold text-black" />
              </div>
              <QrCode value={site} label={v(T.qr)} className="w-1/3 shrink-0" />
            </div>
          </div>
        </div>
      </article>
      <div className="ue-poster-ui mt-24 flex flex-wrap items-center justify-center gap-x-24 gap-y-8">
        <Button onClick={() => window.print()} size="lg">
          <Printer size={20} aria-hidden="true" />
          <Tx inline {...T.print} />
        </Button>
        <ShareButton url={site} title={SITE.name} text={v(T.title)} variant="ghost" lang={lang}>
          <Tx inline {...T.share} />
        </ShareButton>
      </div>
    </div>
  )
}
