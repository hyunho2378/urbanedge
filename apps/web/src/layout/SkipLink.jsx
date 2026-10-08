import { usePick } from '../i18n/index.jsx'

// 키보드 사용자를 위한 본문 바로가기. 첫 Tab에서 나타난다.
export default function SkipLink({ targetId = 'main' }) {
  const pick = usePick()
  const go = (e) => {
    const el = document.getElementById(targetId)
    if (!el) return
    e.preventDefault()
    el.focus({ preventScroll: false })
    el.scrollIntoView()
  }
  return (
    <a
      href={`#${targetId}`}
      onClick={go}
      className="sr-only focus:not-sr-only focus:fixed focus:left-16 focus:top-16 focus:z-toast focus:rounded-md focus:bg-yellow focus:px-20 focus:py-12 focus:font-ui focus:font-semibold focus:text-text-onYellow"
    >
      {pick({ ko: '본문 바로가기', en: 'Skip to content' })}
    </a>
  )
}
