// metro/index.js: 지하철 어휘 컴포넌트 계약. 작업 M(A1)이 실제 구현으로 교체한다. 시그니처를 바꾸지 않는다.
//
// LineBadge({ code, color, size })           Seoul 지하철식 원형 노선 배지. color: 'yellow'|'red'|'blue'|'green'. size: 'xs'|'sm'|'md'|'lg'|'xl'
// StationSign({ name, sub, code, color })    승강장 역명판(흰 알약 안 역명, 위에 노선 배지, 양옆 이전역 다음역)
// TrainTrack({ stops, current, color, orientation })  stops: [{ id, label }], current: 인덱스(소수 가능, 열차가 구간 사이를 이동)
// LiveIsland({ expanded, onToggle, line, nextLabel, subLabel, progress, remainingLabel, etaLabel, className })
//                                            다이내믹 아일랜드형 라이브 액티비티. 검정 알약이 접힘과 펼침 사이를 transform으로 전환
// TransitMap({ network, orientation, activeId, onSelect, animateTrain, className })  옥틸리니어 노선도 SVG
//   network: { lines: [{ id, color, name, stations: [{ id, label, x, y, interchange?, labelDir? }] }] }
export { LineBadge } from '../components/Line.jsx'
export function StationSign() { return null }
export function TrainTrack() { return null }
export function LiveIsland() { return null }
export function TransitMap() { return null }
