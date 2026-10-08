import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// 언어 상태. 브라우저 저장소를 쓰지 않고 URL 쿼리(?lang=en)와 브라우저 언어로 초기값을 정한다.
// 언어 전환은 텍스트만 교체하고 컴포넌트를 리마운트하지 않는다.
export const LANGS = ['ko', 'en']

const initial = () => {
  if (typeof window === 'undefined') return 'ko'
  const q = new URLSearchParams(window.location.search).get('lang')
  if (LANGS.includes(q)) return q
  return (navigator.language || 'ko').toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

const LangContext = createContext({ lang: 'ko', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initial)
  const setLang = useCallback((l) => {
    if (!LANGS.includes(l)) return
    setLangState(l)
    const u = new URL(window.location.href)
    u.searchParams.set('lang', l)
    window.history.replaceState(window.history.state, '', u)
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

// pick({ ko: '...', en: '...' }) 형태의 값에서 현재 언어를 고른다. 없는 언어는 영어, 그다음 한국어로 대체한다.
export function usePick() {
  const { lang } = useLang()
  return useCallback(
    (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('ko' in v || 'en' in v) ? v[lang] ?? v.en ?? v.ko : v),
    [lang],
  )
}
