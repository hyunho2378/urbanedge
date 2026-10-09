// rooms.js: 경주 메트로(Gyeongju Metro, 코드 GY) 첫 역 GY-01 어반엣지(UrbanEdge, 황리단길). 유료 촬영 방 3곳이 역 안의 승강장(Platform)이다.
// 승강장 번호는 시간을 거슬러 가는 순서다: 1 Subway Shot(노랑, 2000년대 현재), 2 Karaoke Shot(빨강, 2008), 3 Retro Shot(초록, 1968). 색은 방을 따라간다. 화장실 방은 없다.
// 이 키오스크는 승강장마다 따로 있으므로 room은 셋 중 하나다. 실제 교통시설이 아닌 가상의 관광 경험이다(docs/NAMING.md).
import { ROOM_COPY } from './copy.js'

export const LINE = { code: 'GY', color: 'yellow', name: { en: 'Gyeongju Metro', ko: '경주 메트로' } }
export const STATION = { code: 'GY-01', name: 'URBANEDGE', title: { en: 'UrbanEdge', ko: '어반엣지' }, full: { en: 'GY-01 UrbanEdge', ko: 'GY-01 어반엣지역' }, place: { en: 'Hwangridan-gil', ko: '황리단길' } }

const P = [
  ['subway', 'SUBWAY SHOT', { en: 'Subway Shot', ko: '지하철 샷' }, 'yellow', { en: '2000s: The Present', ko: '2000년대: 현재' }],
  ['karaoke', 'KARAOKE SHOT', { en: 'Karaoke Shot', ko: '노래방 샷' }, 'red', { en: '2008: The Memory', ko: '2008: 추억' }],
  ['retro', 'RETRO SHOT', { en: 'Retro Shot', ko: '레트로 샷' }, 'green', { en: '1968: The Roots', ko: '1968: 뿌리' }],
]

// 승강장(방) 3곳
export const ROOMS = P.map(([id, name, title, color, era], i) => ({ id, n: i + 1, name, title, color, era, station: STATION, copy: ROOM_COPY[id] }))

// 승강장 색 클래스(Tailwind가 정적 문자열을 읽도록 전부 적어 둔다)
export const PLATFORM_BG = { yellow: 'bg-line-yellow text-text-onYellow', red: 'bg-line-red text-text-pri', blue: 'bg-line-blue text-text-pri', green: 'bg-line-green text-text-onYellow' }

export const roomById = (id) => ROOMS.find((r) => r.id === id) || ROOMS[0]
