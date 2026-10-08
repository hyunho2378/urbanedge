import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Container, RouteRibbon, cx } from '@urbanedge/ds'
import { usePick } from '../../i18n/index.jsx'

// 하위 페이지 공통 상단. 번호 라벨, 대형 제목, 설명, 노선 리본.
// crumbs: [{ to, label }] 마지막 항목은 to 없이 현재 위치로 표시한다.
const HOME = { ko: '홈', en: 'Home' }

export function PageHero({ index, label, title, desc, crumbs = [], aside, children, className }) {
  const pick = usePick()
  return (
    <section aria-labelledby="page-title" className={cx('relative border-b border-hairline', className)}>
      <Container
        className="pb-48 md:pb-72 lg:pb-96 4xl:max-w-screen-4xl"
        style={{ paddingTop: 'clamp(40px, 6vw, 112px)' }}
      >
        <nav aria-label={pick({ ko: '현재 위치', en: 'Breadcrumb' })}>
          <ol className="flex flex-wrap items-center gap-x-8 gap-y-4 text-caption 4xl:text-bodySm text-text-meta">
            <li>
              <Link to="/" className="rounded-sm hover:text-yellow">
                {pick(HOME)}
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-8">
                <ChevronRight size={14} aria-hidden="true" />
                {c.to ? (
                  <Link to={c.to} className="rounded-sm hover:text-yellow">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-text-sec">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-40 grid items-end gap-x-64 gap-y-32 lg:mt-56 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <p className="ue-label flex items-baseline gap-16 text-label 4xl:text-bodySm text-text-sec">
              <span className="text-yellow">{index}</span>
              <span>{label}</span>
            </p>
            <div className="mt-16 h-px w-full max-w-read bg-hairline" />
            <h1
              id="page-title"
              className="mt-24 font-display text-display-l font-black leading-tight tracking-tightest text-text-pri text-balance"
            >
              {title}
            </h1>
            <p className="mt-24 max-w-read text-lead text-text-sec text-pretty 4xl:text-h3">{desc}</p>
            {children}
          </div>
          {aside && <div className="min-w-0 lg:col-span-4 lg:justify-self-end">{aside}</div>}
        </div>
      </Container>
      <RouteRibbon />
    </section>
  )
}
