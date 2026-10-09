import { cx } from '@urbanedge/ds'
import { LANGS, useLang } from '../i18n/index.jsx'

const LABEL = { ko: 'KR', en: 'EN' }
const NAME = { ko: '한국어', en: 'English' }

// EN/KR 작은 토글. 완전한 알약 모양이고, 선택된 쪽만 노란 바탕에 검은 글자로 채운다.
export default function LangToggle({ className }) {
  const { lang, setLang } = useLang()
  return (
    <div role="group" aria-label={lang === 'ko' ? '언어 선택' : 'Language'} className={cx('inline-flex shrink-0 overflow-hidden rounded-pill border border-text-pri/40', className)}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          aria-label={NAME[l]}
          onClick={() => setLang(l)}
          className={cx(
            'ue-label grid h-32 min-w-36 place-items-center rounded-pill px-10 text-caption font-semibold transition-colors duration-fast ease-out',
            lang === l ? 'bg-yellow text-text-onYellow' : 'bg-transparent text-text-pri hover:text-yellow',
          )}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  )
}
