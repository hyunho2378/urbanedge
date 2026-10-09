// print/index.js: 인화 프레임과 공유 카드. 작업 B가 구현했다. 시그니처는 계약을 유지한다.
//
// FRAMES: [{ id, name:{ko,en}, cuts: 4|8, slots, tone, layout, paper, mockup, blurb }]
// composeStrip({ frameId, photos, date, roomId, stamp, message, mode, scale }) => Promise<HTMLCanvasElement>
// StripPreview({ frameId, photos, date, roomId, className })
// makeShareCard({ strip, format, roomId, date, visited, platforms }) => Promise<Blob>   format: 'story'(1080x1920) | 'feed'(1080x1350) | 'journey'(1080x1920, Journey Complete)
export { FRAMES, FRAME_IDS, getFrame, registerFrame } from './frames/index.js'
export { composeStrip, canvasToBlob, loadImage, ensureFrameFonts, SAMPLE_PHOTO_URLS, PAPER_SHEET } from './compose.js'
export { StripPreview } from './StripPreview.jsx'
export { makeShareCard, SHARE_FORMATS } from './shareCard.js'
export { STATIONS, STATION, SYSTEM, LINE, METRO_STOPS, getStation, formatShotDate } from './stations.js'
