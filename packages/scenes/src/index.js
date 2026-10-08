// scenes/index.js: Three.js 장면 계약(작업 T 구현).
//
// PlatformDiorama({ className, interactive, activeRoom, onSelectRoom, quality, progress })  황리단선 승강장 디오라마. progress 0..1은 스크롤 진행
// PhotoStrip3D({ photos, className, interactive })       실제 인화 스트립이 떠 있는 3D 오브젝트
// hasWebGL()                                              WebGL 지원 여부
export { PlatformDiorama } from './PlatformDiorama.jsx'
export { PhotoStrip3D } from './PhotoStrip3D.jsx'
export { hasWebGL } from './lib/env.js'
export { LINE, STATION, PLATFORMS } from './lib/palette.js'
