import { Link } from 'react-router-dom'
import { ArrowRight, Languages } from 'lucide-react'
import { Button, Reveal } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'
import { T } from '../../layout/type.js'
import DeviceDiagram from './DeviceDiagram.jsx'
import { Section, SectionHead } from './parts.jsx'

const COPY = {
  label: { ko: '처음 오는 분께', en: 'First time here' },
  title: { ko: '카메라는 화면 아래에 있다', en: 'The camera is below the screen' },
  desc: {
    ko: '일반 포토 부스와 달리 렌즈가 모니터 아래에 있어서 처음에는 어디를 봐야 할지 헷갈린다. 기기 구성을 먼저 확인하고 들어가면 된다.',
    en: 'Unlike typical photo booths, the lens sits under the monitor, which can be confusing the first time. Here is how the machine is laid out.',
  },
  caption: { ko: '도식이며 실제 비율과 다를 수 있다.', en: 'Schematic only. Not to scale.' },
  parts: { ko: '기기 구성', en: 'Machine layout' },
  cuts: { ko: '4컷과 8컷', en: '4 cuts or 8 cuts' },
  cut4: {
    t: { ko: '4컷', en: '4 cuts' },
    d: { ko: '4장을 촬영해 모두 프레임에 담는다.', en: 'You shoot 4 photos and all of them go into the frame.' },
  },
  cut8: {
    t: { ko: '8컷', en: '8 cuts' },
    d: { ko: '8장을 촬영한 뒤 4장을 골라 프레임에 담는다.', en: 'You shoot 8 photos, then choose 4 to place in the frame.' },
  },
  guide: { ko: '촬영 가이드 보기', en: 'Read the shooting guide' },
  abroad: {
    t: { ko: '해외에서 오셨다면', en: 'Visiting from abroad' },
    d: {
      ko: '상단 KR/EN 스위치로 영어 화면을 볼 수 있다. 키오스크 체험판도 한국어와 영어를 지원한다.',
      en: 'Use the KR/EN switch at the top to read this site in English. The kiosk preview also supports Korean and English.',
    },
  },
}

const PARTS = [
  {
    t: { ko: '렌즈는 모니터 아래 가운데', en: 'The lens is under the monitor' },
    d: {
      ko: '일반 포토 부스와 달리 카메라가 모니터 아래에 있다. 촬영 중에는 화면 아래 렌즈를 바라본다.',
      en: 'Unlike typical photo booths, the camera sits below the monitor. While shooting, look at the lens under the screen.',
    },
  },
  {
    t: { ko: '카드 단말기는 렌즈 아래 오른쪽', en: 'Card terminal, below the lens on the right' },
    d: {
      ko: '초록 LED가 켜진 카드 단말기가 카메라 아래 오른쪽에 있다.',
      en: 'The card terminal with a green LED sits under the camera, on the right.',
    },
  },
  {
    t: { ko: '인화물은 하단 슬롯에서', en: 'Prints come out at the bottom' },
    d: {
      ko: '인화 출구 슬롯과 흰색 트레이는 기기 하단에 있다.',
      en: 'The print slot and the white tray are at the bottom of the machine.',
    },
  },
]

export default function FirstTime() {
  const pick = usePick()
  return (
    <Section id="first" labelledBy="first-title" tone="elev">
      <SectionHead index={4} label={COPY.label} titleId="first-title" title={COPY.title} desc={COPY.desc} />

      <div className="grid gap-48 lg:grid-cols-12 lg:gap-x-64">
        <Reveal className="lg:col-span-5">
          <figure className="rounded-lg border border-hairline bg-bg-base p-24 lg:p-40">
            <DeviceDiagram className="mx-auto block h-auto w-full max-w-lg" />
            <figcaption className={`${T.small} mt-16 text-center text-text-meta`}>{pick(COPY.caption)}</figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <h3 className={`${T.label} text-text-meta`}>{pick(COPY.parts)}</h3>
            <ol className="mt-16 border-t border-hairline">
              {PARTS.map((p, i) => (
                <li key={i} className="flex gap-20 border-b border-hairline py-24 lg:gap-24">
                  <span aria-hidden="true" className="grid size-32 shrink-0 place-items-center rounded-pill bg-yellow font-label text-body font-bold text-text-onYellow">
                    {i + 1}
                  </span>
                  <div>
                    <p className={`${T.h4} text-text-pri`}>{pick(p.t)}</p>
                    <p className={`${T.body} mt-8 max-w-read text-text-sec`}>{pick(p.d)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={80} className="mt-40">
            <h3 className={`${T.label} text-text-meta`}>{pick(COPY.cuts)}</h3>
            <div className="mt-16 grid gap-16 md:grid-cols-2">
              {[COPY.cut4, COPY.cut8].map((c, i) => (
                <div key={i} className="rounded-lg border border-hairlineStrong bg-bg-panel p-24">
                  <p className="font-label text-display-m font-bold leading-none text-yellow">{i === 0 ? '4' : '8'}</p>
                  <p className={`${T.h4} mt-16 text-text-pri`}>{pick(c.t)}</p>
                  <p className={`${T.small} mt-8 text-text-sec`}>{pick(c.d)}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="mt-24 flex gap-16 rounded-lg border border-hairline p-24">
            <Languages size={26} aria-hidden="true" className="mt-4 shrink-0 text-yellow" />
            <div>
              <p className={`${T.h4} text-text-pri`}>{pick(COPY.abroad.t)}</p>
              <p className={`${T.small} mt-8 text-text-sec`}>{pick(COPY.abroad.d)}</p>
            </div>
          </Reveal>

          <Reveal delay={160} className="mt-40">
            <Button as={Link} to="/guide" size="lg" className="text-body">
              {pick(COPY.guide)}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
