import { cx } from '@urbanedge/ds'
import { T } from '../../components/lang.jsx'
import { CouponDemo, DragDemo, HowRoute, LensDiagram, StandDiagram } from '../../components/Illustrations.jsx'
import { COPY } from '../copy.js'
import { INTRO_PAGES } from '../controller.js'
import { DEMO_COUPON } from '../coupon.js'

// 3. intro: 온보딩 다섯 장이 가로로 넘어간다(자동 진행 없음, 오른쪽 아래 다음 버튼으로 넘긴다).
//   1 이용 순서와 이야기  2 카메라는 화면 아래(hintZone camera)  3 서는 곳과 1번 출구(hintZone slot)  4 끌어서 바꾸기  5 쿠폰
// 한 장에 하나의 생각만 담는다. 노랑 면은 카메라 위치를 강조하는 장이다.
const TILES = ['/img/team/shot-1.jpg', '/img/team/shot-2.jpg', '/img/team/shot-3.jpg']

function Slide({ yellow, title, body, children }) {
  return (
    <section className={cx('absolute inset-y-0 h-full overflow-hidden', yellow ? 'k-tiles-yellow text-text-onYellow' : 'k-tiles text-text-pri')} style={{ width: 1920 }}>
      <div className="absolute" style={{ left: 64, top: 176, width: 820 }}>
        <T n={title} as="h1" className="kt-title" />
        <T n={body} as="p" className={cx('kt-body mt-32', yellow ? 'text-text-onYellow' : 'text-text-sec')} />
      </div>
      <div className="absolute" style={{ left: 980, top: 150, width: 880, height: 780 }}>
        {children}
      </div>
    </section>
  )
}

export default function Intro({ ctrl }) {
  const page = ctrl.introPage
  const S = COPY.intro.slides
  const slides = [
    <Slide key="how" title={S.how.title} body={S.how.body}>
      <div className="flex h-full items-center justify-center">
        <HowRoute stops={S.how.stops} />
      </div>
    </Slide>,
    <Slide key="lens" yellow title={S.lens.title} body={S.lens.body}>
      <div className="flex h-full items-start justify-center" style={{ paddingTop: 10 }}>
        <LensDiagram />
      </div>
    </Slide>,
    <Slide key="stand" title={S.stand.title} body={S.stand.body}>
      <div className="flex h-full items-start justify-center">
        <StandDiagram />
      </div>
    </Slide>,
    <Slide key="touch" title={S.touch.title} body={S.touch.body}>
      <div className="flex h-full items-center justify-center">
        <DragDemo tiles={TILES} />
      </div>
    </Slide>,
    <Slide key="coupon" yellow title={S.coupon.title} body={S.coupon.body}>
      <div className="flex h-full items-center justify-center">
        <CouponDemo code={DEMO_COUPON} />
      </div>
    </Slide>,
  ]
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 left-0 transition-transform duration-slow ease-out" style={{ width: 1920 * INTRO_PAGES, transform: `translate3d(${-page * 1920}px, 0, 0)` }}>
        {slides.map((s, i) => (
          <div key={i} className="absolute inset-y-0" style={{ left: i * 1920, width: 1920 }}>
            {s}
          </div>
        ))}
      </div>
      <p className={cx('kt-caption absolute flex items-center gap-12', page === 1 || page === 4 ? 'text-text-onYellow' : 'text-text-meta')} style={{ left: 380, bottom: 82 }} role="status">
        <span className="flex gap-8" aria-hidden="true">
          {Array.from({ length: INTRO_PAGES }, (_, i) => (
            <span key={i} className={cx('block rounded-pill', i === page ? 'bg-current' : 'bg-current opacity-30')} style={{ width: i === page ? 36 : 12, height: 12 }} />
          ))}
        </span>
        <T n={COPY.intro.page} v={{ n: page + 1, total: INTRO_PAGES }} inline />
      </p>
    </div>
  )
}
