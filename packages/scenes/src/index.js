// scenes/index.js: Three.js 장면 계약. 작업 T(A3)가 실제 구현으로 교체한다.
//
// PlatformDiorama({ className, interactive, activeRoom, onSelectRoom, quality, progress })  지하철 승강장 디오라마(노란 의자, 타일 벽, 열차). progress 0..1은 스크롤 진행
// PhotoStrip3D({ photos, className, interactive })       실제 인화 스트립이 떠 있는 3D 오브젝트
// hasWebGL()                                              WebGL 지원 여부
export function PlatformDiorama() { return null }
export function PhotoStrip3D() { return null }
export function hasWebGL() { return typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl2') }
