import { createContext, useCallback, useContext } from 'react'
import { tr } from '../flow/copy.js'

// 현재 언어를 컴포넌트 트리에 내려 준다. 언어를 바꿔도 화면이 리마운트되지 않고 문구만 바뀐다.
export const LangContext = createContext('ko')
export const useLang = () => useContext(LangContext)

// t(node, vars): { ko, en } 노드를 현재 언어 문자열로 바꾼다.
export function useT() {
  const lang = useLang()
  return useCallback((node, vars) => tr(node, lang, vars), [lang])
}
