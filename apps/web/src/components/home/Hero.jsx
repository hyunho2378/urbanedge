import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Ticket } from 'lucide-react'
import { Button, cx } from '@urbanedge/ds'
import { SITE, formatPrice, kioskHref } from '../../data/site.js'
import { useLang, usePick } from '../../i18n/index.jsx'
import { Wrap } from '../../layout/Wrap.jsx'
import { T } from '../../layout/type.js'

const COPY = {
  eyebrow: {
    ko: '경주 황리단길 무인 셀프 사진관',
    en: 'Self-service photo studio in Hwangridan-gil, Gyeongju',
  },
  sub: { ko: '렌즈 너머, 거리 속으로', en: 'EVERY SHOT IS A JOURNEY!' },
  lead: {
    ko: '지하철 노선처럼 이어진 포토 룸 5곳에서 직접 찍고 바로 인화한다. 기본 요금에 인화 2장이 포함된다.',
    en: 'Shoot yourself in five photo rooms laid out like subway stops and collect your prints on the spot. Two prints are included in the base price.',
  },
  visit: { ko: '방문 안내', en: 'Plan your visit' },
  kiosk: { ko: '키오스크 체험', en: 'Try the kiosk' },
  newTab: { ko: '(새 탭에서 열림)', en: '(opens in a new tab)' },
  alt: {
    ko: '검은색과 흰색 횡단보도 위를 걸어가는 사람들을 위에서 내려다본 사진. 횡단보도에 UrbanEdge 글자가 쓰여 있다.',
    en: 'Aerial photo of people walking across a black and white crosswalk with the UrbanEdge name painted on it.',
  },
  price: { ko: '인화 2장 포함', en: '2 prints included' },
}

// 등장 지연. 제목, 부제, 문단, 버튼이 차례로 올라온다(opacity와 transform만 쓴다).
const enter = (i) => ({ animationDelay: `${160 + i * 110}ms` })

export default function Hero() {
  const pick = usePick()
  const { lang } = useLang()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const facts = [
    { Icon: MapPin, text: pick(SITE.address) },
    { Icon: Clock, text: `${SITE.hours.open} ~ ${SITE.hours.close}` },
    { Icon: Ticket, text: `${formatPrice(lang)}, ${pick(COPY.price)}` },
  ]

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-dvh flex-col justify-end overflow-hidden">
      <picture>
        <source media="(max-width: 767px)" srcSet="/img/lg/hero-crosswalk-m.jpg" />
        <img
          src="/img/lg/hero-crosswalk.jpg"
          alt={pick(COPY.alt)}
          fetchPriority="high"
          decoding="async"
          draggable="false"
          className={cx(
            'absolute inset-0 -z-10 size-full object-cover object-center transition-transform duration-hero ease-out',
            ready ? 'scale-100' : 'scale-105',
          )}
        />
      </picture>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/50" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-240 bg-gradient-to-b from-bg-base/80 to-transparent" />

      <Wrap className="relative pb-32 pt-160 lg:pb-48">
        <p className={`${T.label} flex animate-fade-up items-center gap-16 text-yellow`} style={enter(0)}>
          <span aria-hidden="true" className="h-px w-40 bg-yellow lg:w-64" />
          {pick(COPY.eyebrow)}
        </p>

        <h1
          id="hero-title"
          lang="en"
          className="mt-24 font-display text-display-l font-black leading-tight tracking-tightest text-text-pri text-balance 3xl:text-display-xl"
        >
          <span className="block animate-fade-up" style={enter(1)}>Beyond the Lens,</span>
          <span className="block animate-fade-up" style={enter(2)}>Into the Streets</span>
        </h1>

        <p className={`${T.h4} mt-24 animate-fade-up text-text-pri lg:mt-32`} style={enter(3)}>
          {pick(COPY.sub)}
        </p>
        <p className={`${T.lead} mt-16 max-w-read animate-fade-up text-text-sec`} style={enter(4)}>
          {pick(COPY.lead)}
        </p>

        <div className="mt-32 flex animate-fade-up flex-col gap-12 md:flex-row md:flex-wrap lg:mt-48" style={enter(5)}>
          <Button as={Link} to="/visit" size="lg" className="text-body">
            {pick(COPY.visit)}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
          <Button
            as="a"
            href={kioskHref()}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
            className="text-body"
          >
            {pick(COPY.kiosk)}
            <span className="sr-only">{pick(COPY.newTab)}</span>
          </Button>
        </div>

        <ul
          className="mt-48 grid animate-fade-up border-t border-hairlineStrong md:grid-cols-3 lg:mt-72"
          style={enter(6)}
          aria-label={pick({ ko: '핵심 정보', en: 'Key facts' })}
        >
          {facts.map(({ Icon, text }, i) => (
            <li
              key={i}
              className={cx(
                'flex items-center gap-12 border-b border-hairline py-16 md:border-b-0 md:py-20 md:pr-24',
                i > 0 && 'md:border-l md:pl-24',
                T.small,
              )}
            >
              <Icon size={18} aria-hidden="true" className="shrink-0 text-yellow" />
              <span className="text-text-pri">{text}</span>
            </li>
          ))}
        </ul>
      </Wrap>
    </section>
  )
}
