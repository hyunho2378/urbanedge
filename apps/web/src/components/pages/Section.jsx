import { Container, SectionLabel, Reveal, cx } from '@urbanedge/ds'

// 본문 구간 공통 틀. 번호 라벨과 헤어라인, 제목, 도입문을 갖는다.
// tone: base | elev(한 단계 밝은 바탕으로 구간을 나눈다)
export function Section({ index, label, title, intro, id, tone = 'base', className, children }) {
  return (
    <section
      aria-labelledby={id}
      className={cx('section-y', tone === 'elev' && 'border-y border-hairline bg-bg-elev', className)}
    >
      <Container className="4xl:max-w-screen-4xl">
        <SectionLabel index={index}>{label}</SectionLabel>
        {title && (
          <Reveal>
            <h2
              id={id}
              className="font-display text-h1 font-black leading-tight tracking-tightest text-text-pri text-balance 4xl:text-display-m"
            >
              {title}
            </h2>
            {intro && <p className="mt-20 max-w-read text-lead text-text-sec text-pretty 4xl:text-h3">{intro}</p>}
          </Reveal>
        )}
        <div className={title ? 'mt-40 lg:mt-64' : undefined}>{children}</div>
      </Container>
    </section>
  )
}
