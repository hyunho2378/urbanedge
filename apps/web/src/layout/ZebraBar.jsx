import { cx } from '@urbanedge/ds'

// 횡단보도 띠. 검정과 흰색이 번갈아 나온다(index.css의 .ue-zebra 토큰). 장식이므로 보조기기에는 숨긴다.
// thickness: '8px' 같은 CSS 길이. vertical이면 세로 띠(부모 높이를 채운다).
export function ZebraBar({ vertical = false, thickness, className }) {
  return <span aria-hidden="true" className={cx(vertical ? 'ue-zebra-v' : 'ue-zebra', className)} style={thickness ? { '--ue-zebra-h': thickness } : undefined} />
}

export default ZebraBar
