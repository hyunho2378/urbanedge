import { Globe } from 'lucide-react'
import { useT } from '../../components/lang.jsx'
import { COPY, tr } from '../copy.js'

// 2. language: 한국어, English 큰 버튼 두 개. 고르면 바로 안내 단계로 넘어간다.
// 제목은 두 언어를 함께 보여 준다.
function LangCard({ code, title, sub, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      lang={code}
      className="ue-press group flex min-h-touch flex-1 flex-col justify-between rounded-xl border border-yellow bg-bg-panel p-56 text-left transition-[transform,opacity,background-color] duration-fast ease-out hover:bg-tint"
    >
      <span className="ue-label text-k-label text-yellow">{code === 'ko' ? 'KO' : 'EN'}</span>
      <span className="font-display text-k-hero font-black leading-none tracking-tightest">{title}</span>
      <span className="text-k-lead text-text-sec">{sub}</span>
    </button>
  )
}

export default function Language({ ctrl }) {
  const t = useT()
  const pick = (code) => {
    ctrl.setLang(code)
    ctrl.next()
  }
  return (
    <div className="flex h-full flex-col gap-32 px-64 pb-24 pt-32">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-k-h2 font-black leading-tight tracking-tightest">{tr(COPY.language.title, 'ko')}</h1>
        <p className="flex items-center gap-16 font-display text-k-h3 font-bold leading-tight text-text-sec">
          <Globe size={52} aria-hidden="true" className="text-yellow" />
          {tr(COPY.language.title, 'en')}
        </p>
      </div>
      <div className="flex min-h-0 flex-1 gap-32">
        <LangCard code="ko" title={t(COPY.language.ko)} sub={tr(COPY.language.koSub, 'ko')} onPick={() => pick('ko')} />
        <LangCard code="en" title={t(COPY.language.en)} sub={tr(COPY.language.enSub, 'en')} onPick={() => pick('en')} />
      </div>
    </div>
  )
}
