import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Container, useLangValue } from '@urbanedge/ds'
import { HwangnidanMap } from '@urbanedge/map'
import { SITE } from '../data/site.js'
import { PageShell, Tx } from '../components/pages/Bilingual.jsx'
import { OpenNow } from '../components/pages/OpenNow.jsx'
import { PageTop } from '../components/pages/PageTop.jsx'
import { NaverMark } from '../components/pages/NaverMark.jsx'
import { useNearView } from '../components/pages/hooks.js'
import { NAVER_PLACE } from '../components/pages/content.js'
import { usePageTitle } from '../components/pages/usePageTitle.js'

const GOOGLE_MAPS = 'https://www.google.com/maps/dir/?api=1&destination=35.83751,129.20919'

const T = {
  title: { en: 'Location', ko: '위치' },
  h1: { en: 'Location', ko: '위치' },
  lead: {
    en: 'Black front with a checkerboard step.',
    ko: '검은 외관, 체커보드 문턱.',
  },
  naver: { en: 'Naver Place', ko: '네이버 플레이스' },
  google: { en: 'Google Maps', ko: '구글 지도' },
  copy: { en: 'Copy address', ko: '주소 복사' },
  copied: { en: 'Copied', ko: '복사됨' },
  copyFail: { en: 'Copy failed', ko: '복사 실패' },
  hours: {
    openNow: { en: 'Open now', ko: '영업 중' },
    closedNow: { en: 'Closed', ko: '영업 종료' },
    until: { en: 'until', ko: '마감' },
    opensAt: { en: 'opens at', ko: '오픈' },
    localTime: { en: 'Local time', ko: '현지 시각' },
  },
}

const link = 'inline-flex min-h-48 items-center gap-8 text-text-pri underline decoration-hairline underline-offset-8 hover:text-yellow'

export default function Visit() {
  const lang = useLangValue()
  usePageTitle(T.title)
  const [mapRef, mapSeen] = useNearView('240px 0px')
  const [copy, setCopy] = useState('idle')
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const onCopy = async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(SITE.address[lang] ?? SITE.address.ko)
      setCopy('done')
    } catch {
      setCopy('fail')
    }
    timer.current = setTimeout(() => setCopy('idle'), 2000)
  }

  return (
    <PageShell>
      <PageTop title={T.h1} lead={T.lead} />
      <section className="ue-light py-40 md:py-64">
        <Container className="4xl:max-w-screen-4xl">
          <div ref={mapRef} className="relative w-full overflow-hidden rounded-lg bg-bg-panel" style={{ height: 'clamp(340px, 56dvh, 600px)' }}>
            {mapSeen && <HwangnidanMap mode="3d" showRoute lang={lang} className="size-full" />}
          </div>
          <div className="mt-32 grid gap-x-64 gap-y-24 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Tx {...SITE.address} as="p" role="subhead" className="text-text-pri" />
              <div className="mt-8 flex flex-wrap items-center gap-x-24">
                <button type="button" onClick={onCopy} className={link}>
                  {copy === 'done' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                  <Tx inline {...(copy === 'done' ? T.copied : copy === 'fail' ? T.copyFail : T.copy)} />
                </button>
                <a href={NAVER_PLACE} target="_blank" rel="noopener noreferrer" className={link}>
                  <NaverMark size={18} />
                  <Tx inline {...T.naver} />
                </a>
                <a href={GOOGLE_MAPS} target="_blank" rel="noopener noreferrer" className={link}>
                  <Tx inline {...T.google} />
                </a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <OpenNow copy={T.hours} />
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  )
}
