import { Container } from '@urbanedge/ds'
import { Tx } from './Bilingual.jsx'
import { NOTICE } from './content.js'

// 하위 페이지 공통 머리말: 큰 제목, 도입문, 선택적인 오른쪽 그림. 제목 위에 작은 머리글을 얹지 않는다.
export function PageTop({ title, lead, aside, notice = false, children }) {
  return (
    <header className="pb-40 pt-40 md:pb-64 md:pt-64 lg:pt-96">
      <Container className="grid items-end gap-x-64 gap-y-32 lg:grid-cols-12 4xl:max-w-screen-4xl">
        <div className={aside ? 'lg:col-span-8' : 'lg:col-span-10'}>
          <Tx {...title} as="h1" role="title" inner="text-display-m" className="text-text-pri" />
          {lead && <Tx {...lead} as="p" role="lead" className="mt-24 max-w-read text-text-sec" />}
          {notice && (
            <p className="mt-24 flex items-center gap-8 text-text-meta">
              <span aria-hidden="true" className="size-8 shrink-0 rounded-pill bg-yellow" />
              <Tx {...NOTICE} role="caption" />
            </p>
          )}
          {children}
        </div>
        {aside && <div className="lg:col-span-4 lg:justify-self-end">{aside}</div>}
      </Container>
    </header>
  )
}
