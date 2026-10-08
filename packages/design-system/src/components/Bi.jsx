import { createContext, useContext } from 'react'
import { cx } from './cx.js'

// 한영 전환 레이아웃 고정 컴포넌트.
// 영문과 한글을 같은 grid 셀에 겹쳐 렌더하고 비활성 언어는 visibility: hidden으로 숨긴다.
// 칸의 높이와 폭이 항상 두 언어 중 긴 쪽에 맞으므로 언어를 바꿔도 아래 요소가 오르내리지 않고 줄바꿈 때문에 박스가 움직이지 않는다.
export const LangContext = createContext('en')
export const useLangValue = () => useContext(LangContext)

/**
 * Bi({ en, ko, as, inline, className })
 * - 블록(기본): display grid. 제목, 문단, 버튼 라벨에 쓴다.
 * - inline: display inline-grid. 한 줄 라벨, 칩, 내비게이션에 쓴다.
 * 문자열 속성(aria-label, alt, placeholder)에는 쓰지 않고 useLangValue()로 고른다.
 */
export function Bi({ en, ko, as: Tag = 'span', inline = false, className }) {
  const lang = useLangValue()
  const hide = 'invisible select-none pointer-events-none'
  return (
    <Tag className={cx(inline ? 'inline-grid' : 'grid', className)}>
      <span lang="en" aria-hidden={lang !== 'en' || undefined} className={cx('col-start-1 row-start-1', lang !== 'en' && hide)}>
        {en}
      </span>
      <span lang="ko" aria-hidden={lang !== 'ko' || undefined} className={cx('col-start-1 row-start-1', lang !== 'ko' && hide)}>
        {ko}
      </span>
    </Tag>
  )
}

export const pickLang = (lang, en, ko) => (lang === 'ko' ? ko : en)
