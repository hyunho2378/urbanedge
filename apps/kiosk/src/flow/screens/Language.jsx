import { cx } from '@urbanedge/ds'
import { T } from '../../components/lang.jsx'
import { COPY } from '../copy.js'

// 2. language v3: 가운데 큰 면 두 개가 선택지의 전부다. 고르면 바로 탑승 안내로 넘어간다.
function Option({ code, word, sub, on, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      lang={code}
      className={cx('ue-press flex flex-col justify-end rounded-xl text-left transition-[transform,background-color] duration-fast ease-out', on ? 'bg-yellow text-text-onYellow' : 'bg-bg-panel text-text-pri')}
      style={{ width: 720, height: 440, padding: 64 }}
    >
      <span className="kt-display">{word}</span>
      <span className={cx('kt-lead mt-16', on ? 'text-text-onYellow' : 'text-text-sec')}>{sub}</span>
    </button>
  )
}

export default function Language({ ctrl }) {
  const pick = (code) => {
    ctrl.setLang(code)
    ctrl.next()
  }
  return (
    <div className="absolute inset-0 bg-bg-base">
      <T n={COPY.language.title} as="h1" className="sr-only" />
      <div className="absolute flex justify-center gap-48" style={{ left: 0, right: 0, top: 380 }}>
        <Option code="en" word="English" sub="" on={ctrl.lang === 'en'} onPick={() => pick('en')} />
        <Option code="ko" word="한국어" sub="" on={ctrl.lang === 'ko'} onPick={() => pick('ko')} />
      </div>
    </div>
  )
}
