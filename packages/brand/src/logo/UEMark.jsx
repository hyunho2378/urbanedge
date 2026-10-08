// UEMark: 어반엣지 UE 블록 심볼. 직사각형만으로 이루어진 벡터. 색은 currentColor.
// 원본은 인화물 하단의 검정 UE 로고이며, 픽셀 측정으로 좌표를 복원했다(380x280).
export const UE_MARK_PATH =
  'M0 0H80V140H100V0H180V280H0ZM200 0H380V88H290V104H380V176H290V192H380V280H200Z'
export const UE_MARK_VIEWBOX = '0 0 380 280'

export function UEMark({ className, title = 'UrbanEdge', ...rest }) {
  return (
    <svg viewBox={UE_MARK_VIEWBOX} role="img" aria-label={title} className={className} {...rest}>
      <path d={UE_MARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
