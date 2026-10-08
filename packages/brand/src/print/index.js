// print/index.js: 인화 프레임과 공유 카드 계약. 작업 B(A2)가 실제 구현으로 교체한다.
//
// FRAMES: [{ id, name:{ko,en}, cuts: 4|8, slots: number, ... }]   프레임 정의(검정과 옐로우, UE 심볼, 워드마크, 날짜 인쇄)
// composeStrip({ frameId, photos, date, roomId, stamp, message }) => Promise<HTMLCanvasElement>   photos: HTMLImageElement|ImageBitmap|HTMLCanvasElement 배열
// StripPreview({ frameId, photos, date, roomId, className })   composeStrip 결과를 보여주는 컴포넌트
// makeShareCard({ strip, format }) => Promise<Blob>             format: 'story'(1080x1920) | 'feed'(1080x1350)
export const FRAMES = []
export async function composeStrip() { return document.createElement('canvas') }
export function StripPreview() { return null }
export async function makeShareCard() { return new Blob() }
