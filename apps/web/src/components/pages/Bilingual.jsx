import { Bi, LangContext, cx, useLangValue } from '@urbanedge/ds'
import { useLang } from '../../i18n/index.jsx'

// 한영 전환에서 레이아웃이 움직이지 않도록 모든 보이는 문구를 Bi로 쓴다(UI.md 17장).
// Tx는 Bi에 글꼴 역할(t-title 같은 타이포 레시피)을 얹은 것이다. 언어마다 자기 줄 간격과 자간 레시피를 쓰도록
// 역할 클래스를 각 언어의 칸 안쪽 요소에 둔다. 그래서 어느 언어가 켜져 있어도 칸의 높이가 같다.
//   <Tx {...T.h1} as="h1" role="title" inner="text-display-m lg:text-display-l" className="text-text-pri" />
// Tailwind는 전체 클래스 이름을 소스에서 찾아야 생성하므로 역할 클래스를 문자열로 모두 적어 둔다.
const ROLE = {
  display: 't-display',
  title: 't-title',
  headline: 't-headline',
  subhead: 't-subhead',
  lead: 't-lead',
  body: 't-body',
  strong: 't-strong',
  label: 't-label',
  caption: 't-caption',
}

export function Tx({ en, ko, as: Tag = 'span', role, inner, inline = false, className, ...rest }) {
  const wrap = (node) =>
    role || inner ? <span className={cx(role && ROLE[role], !inline && 'block', inner)}>{node}</span> : node
  return (
    <Tag className={className} {...rest}>
      <Bi inline={inline} en={wrap(en)} ko={wrap(ko)} />
    </Tag>
  )
}

// 앱의 언어 상태를 디자인시스템 LangContext로 내려 주는 얇은 껍데기. 앱이 이미 내려 주고 있으면 같은 값을 다시 내려 줄 뿐이다.
export function PageShell({ children, className }) {
  const { lang } = useLang()
  return (
    <LangContext.Provider value={lang === 'ko' ? 'ko' : 'en'}>
      <div className={className}>{children}</div>
    </LangContext.Provider>
  )
}

// 속성 문자열(aria-label, alt, title)에 쓰는 선택 함수.
export function useV() {
  const lang = useLangValue()
  return (o) => (o && typeof o === 'object' ? o[lang] ?? o.en : o)
}
