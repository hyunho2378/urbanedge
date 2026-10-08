// UE 블록 심볼 경로. 원본은 @urbanedge/brand의 UE_MARK_PATH(packages/brand/src/logo/UEMark.jsx)다.
// brand 패키지가 디자인시스템을 의존하므로 순환 import를 피하려고 같은 값을 여기에 둔다. 원본을 바꾸면 여기도 바꾼다.
export const UE_PATH = 'M0 0H80V140H100V0H180V280H0ZM200 0H380V88H290V104H380V176H290V192H380V280H200Z'
export const UE_W = 380
export const UE_H = 280

// (x, y) 왼쪽 위에서 높이 h로 그리는 UE 심볼
export function UEGlyph({ x = 0, y = 0, h = 20, fill, opacity }) {
  const s = h / UE_H
  return <path d={UE_PATH} fill={fill} fillRule="evenodd" opacity={opacity} transform={`translate(${x} ${y}) scale(${s})`} />
}
