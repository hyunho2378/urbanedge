import { useCallback } from 'react'
import { Bi, LangContext, useLangValue, cx } from '@urbanedge/ds'
import { tr, fillVars } from '../flow/copy.js'

// 현재 언어는 디자인시스템의 LangContext로 내려 준다. 언어를 바꿔도 화면이 리마운트되지 않는다.
export { LangContext }
export const useLang = useLangValue

// t(node, vars): { en, ko } 노드를 현재 언어 문자열로 바꾼다. aria-label, alt, placeholder 같은 속성에만 쓴다.
export function useT() {
  const lang = useLangValue()
  return useCallback((node, vars) => tr(node, lang, vars), [lang])
}

// T: 화면에 보이는 문구. 두 언어를 같은 칸에 겹쳐 놓고 긴 쪽에 칸을 맞추므로 언어를 바꿔도 레이아웃이 움직이지 않는다.
//   <T n={COPY.cuts.title} v={{ sec: 5 }} as="h1" className="kt-title" />
export function T({ n, v, as, inline, className }) {
  return <Bi en={fillVars(n.en, 'en', v)} ko={fillVars(n.ko, 'ko', v)} as={as} inline={inline} className={cx(className)} />
}
