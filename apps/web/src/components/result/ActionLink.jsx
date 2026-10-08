import { cx } from '@urbanedge/ds'

// 저장 링크. 같은 출처의 파일에 download 속성을 걸어 모바일 브라우저가 바로 내려받게 한다.
// tone: primary(노랑 면) | outline(노랑 1px). 터치 영역 56px.
const tones = {
  primary: 'bg-yellow text-text-onYellow active:bg-yellow-pressed',
  outline: 'border border-yellow text-yellow',
}

export function ActionLink({ href, file, tone = 'primary', icon: Icon, children, className }) {
  return (
    <a
      href={href}
      download={file}
      className={cx(
        'ue-press inline-flex min-h-56 w-full items-center justify-center gap-8 rounded-md px-12 font-ui text-body font-semibold whitespace-nowrap select-none',
        'transition-[transform,opacity,background-color] duration-fast ease-out focus-visible:shadow-focus',
        tones[tone],
        className,
      )}
    >
      {Icon && <Icon size={20} aria-hidden="true" />}
      {children}
    </a>
  )
}
