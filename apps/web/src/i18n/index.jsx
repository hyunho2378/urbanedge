import { LangContext as DsLangContext } from '@urbanedge/ds'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

// 언어 상태. 브라우저 저장소를 쓰지 않는다. 기본은 영어이고 URL 쿼리(?lang=ko)가 있으면 그 값을 쓴다.
// 언어 전환은 텍스트만 교체하고 컴포넌트를 리마운트하지 않는다.
export const LANGS = ['en', 'ko']

const queryLang = () => {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search).get('lang')
  return LANGS.includes(q) ? q : null
}

const initial = () => {
  // 기본 언어는 영어다(외국인 방문객이 주 사용자). 주소에 ?lang=ko가 있을 때만 한국어로 시작한다.
  if (typeof window === 'undefined') return 'en'
  return queryLang() || 'en'
}

const LangContext = createContext({ lang: 'en', setLang: () => {}, ensureLangParam: () => {} })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initial)
  const langRef = useRef(lang)
  // 주소에 ?lang= 이 있거나 사용자가 직접 전환했을 때만 주소에 언어를 싣는다.
  const explicit = useRef(queryLang() !== null)

  const writeUrl = useCallback(() => {
    if (!explicit.current || typeof window === 'undefined') return
    const u = new URL(window.location.href)
    if (u.searchParams.get('lang') === langRef.current) return
    u.searchParams.set('lang', langRef.current)
    window.history.replaceState(window.history.state, '', u)
  }, [])

  const setLang = useCallback(
    (l) => {
      if (!LANGS.includes(l)) return
      langRef.current = l
      explicit.current = true
      setLangState(l)
      writeUrl()
    },
    [writeUrl],
  )

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // 라우터가 경로를 바꾸면 쿼리가 사라지므로 Layout이 경로 변경 뒤에 호출해 언어를 다시 싣는다.
  const value = useMemo(() => ({ lang, setLang, ensureLangParam: writeUrl }), [lang, setLang, writeUrl])
  return (
    <LangContext.Provider value={value}>
      <DsLangContext.Provider value={lang}>{children}</DsLangContext.Provider>
    </LangContext.Provider>
  )
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
