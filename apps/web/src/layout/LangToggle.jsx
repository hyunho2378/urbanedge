import { cx } from '@urbanedge/ds'
import { LANGS, useLang } from '../i18n/index.jsx'

const LABEL = { ko: 'KR', en: 'EN' }
const NAME = { ko: '한국어', en: 'English' }

// KR/EN 알약 토글. 노란 알약이 transform으로 미끄러진다. 텍스트만 바뀌고 페이지는 리마운트되지 않는다.
export default function LangToggle({ className }) {
  const { lang, setLang } = useLang()
  return (
    <div
      role="group"
      aria-label={lang === 'ko' ? '언어 선택' : 'Language'}
      className={cx('relative inline-grid shrink-0 grid-cols-[48px_48px] rounded-pill border border-hairlineStrong bg-bg-base/60', className)}
    >
      <span
        aria-hidden="true"
        className={cx(
          'absolute inset-y-0 left-0 w-1/2 rounded-pill bg-yellow transition-transform duration-base ease-out',
          lang === 'ko' && 'translate-x-full',
        )}
      />
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          aria-label={NAME[l]}
          onClick={() => setLang(l)}
          className={cx(
            'ue-label relative z-10 grid h-40 w-48 place-items-center rounded-pill text-body-sm tracking-wide transition-colors duration-fast ease-out',
            lang === l ? 'text-text-onYellow' : 'text-text-sec hover:text-text-pri',
          )}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  )
}
