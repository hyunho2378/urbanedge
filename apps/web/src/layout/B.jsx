import { Bi } from '@urbanedge/ds'

// B: { en, ko } 객체를 한영 전환 레이아웃 고정 컴포넌트(Bi)로 보여 준다. 두 언어가 같은 칸에 겹쳐 놓이므로 전환해도 높이가 변하지 않는다.
export function B({ v, inline = false, as, className }) {
  if (!v || typeof v !== 'object') return v ?? null
  return <Bi en={v.en} ko={v.ko} inline={inline} as={as} className={className} />
}
