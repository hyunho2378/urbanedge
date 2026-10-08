import { useRef } from 'react'
import { UEMark } from '@urbanedge/brand'
import { cx } from '@urbanedge/ds'
import { TEAM_SHOTS } from '../../data/site.js'
import { usePick } from '../../i18n/index.jsx'
import { prefersReducedMotion } from '../../layout/scroll.js'

// 팀 인화물 스트립. 포인터를 따라 기울고(터치는 드래그), 빛 반사가 따라 움직인다. 동작 줄이기에서는 정지 상태로 보인다.
// 작업 T의 PhotoStrip3D(WebGL)가 준비되면 Prints에서 이 컴포넌트 대신 쓴다.
export default function TiltStrip({ className, date = '2026.10.09' }) {
  const pick = usePick()
  const ref = useRef(null)
  const glare = useRef(null)

  const move = (e) => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${px * 34}deg) rotateX(${-py * 20}deg) rotateZ(${px * -3}deg)`
    if (glare.current) glare.current.style.transform = `translate3d(${px * 140}%, ${py * 60}%, 0)`
  }
  const rest = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(-14deg) rotateX(4deg) rotateZ(2deg)'
    if (glare.current) glare.current.style.transform = 'translate3d(-60%, 0, 0)'
  }

  return (
    <div
      className={cx('touch-pan-y select-none', className)}
      onPointerMove={move}
      onPointerLeave={rest}
      onPointerUp={rest}
      role="img"
      aria-label={pick({ en: 'A four-cut print of the UrbanEdge team in the karaoke room. Move your pointer or drag to tilt it.', ko: '노래방에서 찍은 어반엣지 팀의 4컷 인화물. 포인터를 움직이거나 끌면 기울어진다.' })}
    >
      <div
        ref={ref}
        className="relative mx-auto w-full overflow-hidden rounded-md bg-white p-8 shadow-lift will-change-transform"
        style={{ aspectRatio: '1 / 2.6', maxWidth: 220, transform: 'perspective(900px) rotateY(-14deg) rotateX(4deg) rotateZ(2deg)', transition: 'transform 420ms var(--ue-ease-out)' }}
      >
        <div className="flex h-full flex-col gap-6">
          {TEAM_SHOTS.slice(0, 4).map((src, i) => (
            <div key={src} className="min-h-0 flex-1 overflow-hidden rounded-sm bg-bg-panel">
              <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" className="size-full object-cover" style={{ objectPosition: i % 2 ? '60% 40%' : '40% 40%' }} />
            </div>
          ))}
          <div className="flex items-center justify-between px-4 pb-2 pt-2 text-bg-base">
            <UEMark className="w-20" title="" aria-hidden="true" role="presentation" />
            <span className="font-label text-caption font-semibold tracking-wide">{date}</span>
          </div>
        </div>
        <span ref={glare} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent" style={{ transform: 'translate3d(-60%, 0, 0)', transition: 'transform 300ms var(--ue-ease-out)' }} />
      </div>
    </div>
  )
}
