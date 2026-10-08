import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Camera, Video } from 'lucide-react'
import { Wordmark } from '@urbanedge/ds'
import { usePick } from '../i18n/index.jsx'
import { B } from '../layout/B.jsx'
import '../layout/lang-stable.css'
import '../components/result/result.css'
import { COPY, countLine } from '../components/result/copy.js'
import { formatMB, getResultSession } from '../components/result/sample.js'
import { ActionLink } from '../components/result/ActionLink.jsx'
import { LangPill } from '../components/result/LangPill.jsx'
import { PhotoCarousel } from '../components/result/PhotoCarousel.jsx'
import { ResultVideo } from '../components/result/ResultVideo.jsx'

// 키오스크 완료 화면 QR이 여는 모바일 결과 페이지: /result/:sessionId
// 헤더와 푸터가 없는 단독 화면이다(App.jsx에서 Layout 밖에 등록). 사진 저장, 영상 저장, 보기를 한 화면에 둔다.
// 지금은 어떤 세션 id든 샘플 세션을 보여 준다(components/result/sample.js). 업로드와 저장소는 없다.
export default function Result() {
  const { sessionId } = useParams()
  const pick = usePick()
  const session = useMemo(() => getResultSession(sessionId), [sessionId])
  const [index, setIndex] = useState(0)
  const photo = session.photos[index] ?? session.photos[0]

  useEffect(() => {
    document.title = `${pick(COPY.title)} | UrbanEdge`
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [pick])

  return (
    <div className="rs-page min-h-dvh bg-bg-base text-text-pri">
      <div className="mx-auto w-full max-w-md px-24" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
        <header className="flex min-h-64 items-center justify-between">
          <Link to="/" aria-label="UrbanEdge" className="focus-visible:shadow-focus">
            <Wordmark />
          </Link>
          <LangPill />
        </header>

        <main id="main" className="mt-24">
          <p className="t-label flex flex-wrap items-center gap-x-12 gap-y-4 text-yellow">
            <span className="font-label">{session.station}</span>
            <span aria-hidden="true">‡</span>
            <B v={session.platform} inline />
          </p>
          <h1 className="t-title mt-12 text-text-pri">
            <B v={COPY.title} />
          </h1>
          <p className="t-body mt-8 text-text-sec">
            <B v={countLine(session.photos.length)} />
          </p>
          <p className="t-caption mt-4 text-text-meta">
            <span className="font-label">{session.date}</span>
            {session.isSample && (
              <>
                <span aria-hidden="true"> ‡ </span>
                <B v={COPY.sample} inline />
              </>
            )}
          </p>

          <div className="mt-24 grid grid-cols-2 gap-12">
            <ActionLink href={photo.src} file={photo.file} icon={Camera}>
              <B v={COPY.savePhoto} inline />
            </ActionLink>
            <ActionLink href={session.video.src} file={session.video.file} tone="outline" icon={Video}>
              <B v={COPY.saveVideo} inline />
            </ActionLink>
          </div>
          <p className="t-caption mt-8 grid grid-cols-2 gap-12 text-text-meta">
            <span className="font-label">
              JPG ‡ {index + 1} / {session.photos.length}
            </span>
            <span className="font-label">MP4 ‡ {formatMB(session.video.bytes)}</span>
          </p>

          <section aria-labelledby="rs-photos" className="mt-48">
            <h2 id="rs-photos" className="t-label flex items-center gap-12 text-text-meta">
              <span className="font-label text-yellow">{COPY.photoSectionNum}</span>
              <B v={COPY.photoSection} inline />
            </h2>
            <p className="t-caption mt-8 mb-16 text-text-meta">
              <B v={COPY.photoHint} />
            </p>
            <PhotoCarousel photos={session.photos} index={index} onIndex={setIndex} />
          </section>

          <section aria-labelledby="rs-video" className="mt-48">
            <h2 id="rs-video" className="t-label flex items-center gap-12 text-text-meta">
              <span className="font-label text-yellow">{COPY.videoSectionNum}</span>
              <B v={COPY.videoSection} inline />
            </h2>
            <p className="t-caption mt-8 mb-16 text-text-meta">
              <B v={COPY.videoHint} />
            </p>
            <ResultVideo video={session.video} />
          </section>

          <p className="t-caption mt-48 text-text-meta">
            <B v={COPY.tip} />
          </p>
          {session.isSample && (
            <p className="t-caption mt-12 text-text-meta">
              <B v={COPY.sampleNote} />
            </p>
          )}

          <p className="mt-32">
            <Link to="/" className="rs-hit inline-flex items-center gap-8 font-ui text-body font-semibold text-yellow underline underline-offset-8 focus-visible:shadow-focus">
              <B v={COPY.about} inline />
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </p>
        </main>
      </div>
    </div>
  )
}
