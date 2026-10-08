import { cx } from '@urbanedge/ds'
import { useLang, usePick } from '../../i18n/index.jsx'
import { COPY } from './copy.js'

// KO/EN 전환. 리마운트 없이 텍스트만 바뀐다. 각 버튼의 터치 영역은 48px.
export function LangPill() {
  const { lang, setLang } = useLang()
  const pick = usePick()
  return (
    <div role="group" aria-label={pick(COPY.langLabel)} className="flex items-center rounded-pill bg-bg-panel">
      {['ko', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          lang={l}
          className={cx(
            'ue-label min-h-48 min-w-48 rounded-pill px-12 font-label text-body-sm font-semibold transition-colors duration-fast ease-out focus-visible:shadow-focus',
            lang === l ? 'bg-yellow text-text-onYellow' : 'text-text-sec',
          )}
        >
          {l === 'ko' ? 'KO' : 'EN'}
        </button>
      ))}
    </div>
  )
}
