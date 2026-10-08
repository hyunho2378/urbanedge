import { B } from '../../layout/B.jsx'
import { COPY } from './copy.js'

// 영상 재생. 자동 재생과 소리 자동 재생을 하지 않는다. 첫 프레임은 preload=metadata와 #t 로 보여 준다.
export function ResultVideo({ video }) {
  return (
    <video
      controls
      playsInline
      preload="metadata"
      src={`${video.src}#t=0.1`}
      className="block w-full rounded-md bg-bg-panel"
      style={{ maxHeight: '72dvh' }}
    >
      <p className="p-16 text-text-sec">
        <B v={COPY.videoFallback} />
      </p>
      <a href={video.src} download={video.file} className="p-16 text-yellow underline">
        {video.file}
      </a>
    </video>
  )
}
