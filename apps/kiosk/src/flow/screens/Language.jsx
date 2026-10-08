import { T } from '../../components/lang.jsx'
import { COPY } from '../copy.js'

// 2. language: 화면을 반으로 나눈 두 면. 노랑 면은 English, 검정 면은 한국어다. 면 전체가 버튼이고 고르면 바로 안내로 넘어간다.
function Half({ code, word, sub, onPick, tone }) {
  const yellow = tone === 'yellow'
  return (
    <button
      type="button"
      onClick={onPick}
      lang={code}
      className={`ue-press relative h-full flex-1 overflow-hidden text-left transition-[transform,opacity] duration-fast ease-out ${yellow ? 'bg-yellow text-text-onYellow' : 'bg-bg-base text-text-pri'}`}
    >
      <span className={`absolute select-none font-display font-extrabold leading-none ${yellow ? 'text-black/10' : 'text-text-pri/10'}`} style={{ right: -60, bottom: -120, fontSize: 760 }} aria-hidden="true">
        {code === 'en' ? 'A' : '가'}
      </span>
      <span className="absolute kt-display" style={{ left: 96, top: 380 }}>
        {word}
      </span>
      <span className="absolute kt-lead" style={{ left: 100, top: 590 }}>
        {sub}
      </span>
    </button>
  )
}

export default function Language({ ctrl }) {
  const pick = (code) => {
    ctrl.setLang(code)
    ctrl.next()
  }
  return (
    <div className="absolute inset-0 flex">
      <Half code="en" word="English" sub="Guide in English" tone="yellow" onPick={() => pick('en')} />
      <Half code="ko" word="한국어" sub="한국어로 안내합니다" tone="black" onPick={() => pick('ko')} />
      <T n={COPY.language.title} as="h1" className="sr-only" />
    </div>
  )
}
