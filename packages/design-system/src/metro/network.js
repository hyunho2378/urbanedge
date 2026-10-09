// network.js: 기본 노선도 데이터 (docs/NAMING.md 기준).
// 서사: 경주에는 지하철이 없다. 어반엣지는 "Gyeongju Metro, Powered by UrbanEdge"라는 가상의 관광 경험을 만든다.
// 실제 역은 GY-01 UrbanEdge(황리단길) 하나이고 방 3개(Subway, Karaoke, Retro Shot)는 그 안의 승강장 1에서 3이다(시간을 거슬러 가는 순서).
// GY-02 이후는 후보(Concept stop)이며 열렸다고 말하지 않는다. 공식 교통 서비스가 아니라 가상의 이야기다.
//
// 좌표 규칙(격자 단위): x, y는 가로 노선도 기준이다. 세로 노선도는 기본으로 x와 y를 맞바꾼다.
// 세로 전용 좌표가 필요하면 vx, vy(세로 화면에서의 격자 좌표)와 vLabelDir을 쓴다. 선 하나는 stations 순서대로 이어지고
// 역 사이는 수평/수직 + 45도 한 번 꺾임으로 그려진다. 지도에 쓰는 도식이며 실제 위치와 거리를 뜻하지 않는다.

export const GYEONGJU_LINE = { id: 'gy', code: 'GY', color: 'yellow', name: 'Gyeongju Metro', nameKo: '경주 메트로' }
export const HWANGNIDAN_LINE = GYEONGJU_LINE // 이전 이름 호환

export const STATION = { id: 'gy-01', code: 'GY-01', name: 'UrbanEdge', nameKo: '어반엣지', area: 'Hwangridan-gil', areaKo: '황리단길', line: 'GY', color: 'yellow' }

// 후보 역(Concept stop). 실제 부스 설치와 운영 협의가 확인되기 전에는 후보로만 표시한다.
export const CONCEPT_STOPS = [
  { id: 'gy-02', code: 'GY-02', name: 'Daereungwon', nameKo: '대릉원', icon: 'landmark', accent: 'red' },
  { id: 'gy-03', code: 'GY-03', name: 'Cheomseongdae', nameKo: '첨성대', icon: 'star', accent: 'blue' },
  { id: 'gy-04', code: 'GY-04', name: 'Donggung & Wolji', nameKo: '동궁과 월지', icon: 'waves', accent: 'green' },
]

// 승강장 3개(유료 촬영 방). 번호는 시간을 거슬러 가는 순서다: 1 Subway(2000년대 현재), 2 Karaoke(2008), 3 Retro(1968). 방 id와 색은 그대로다.
// id는 tokens.js lines의 방 id와 같다. legacyCode는 이전 L1에서 L4 코드다. era는 시대 태그(화면에 아직 쓰지 않는다).
export const PLATFORMS = [
  { id: 'subway', number: 1, name: 'Subway Shot', short: 'Subway', nameKo: '지하철 샷', accent: 'yellow', icon: 'subway', legacyCode: 'L1', era: { en: '2000s · The Present', ko: '2000년대 · 현재' } },
  { id: 'karaoke', number: 2, name: 'Karaoke Shot', short: 'Karaoke', nameKo: '노래방 샷', accent: 'red', icon: 'mic', legacyCode: 'L2', era: { en: '2008 · The Memory', ko: '2008 · 추억' } },
  { id: 'retro', number: 3, name: 'Retro Shot', short: 'Retro', nameKo: '레트로 샷', accent: 'green', icon: 'retro', legacyCode: 'L4', era: { en: '1968 · The Roots', ko: '1968 · 뿌리' } },
]
export const platformById = (id) => PLATFORMS.find((p) => p.id === id)

// ---- 1) Gyeongju Metro 전체 노선도: GY-01 실제 역 + 후보 역 3개 ----
const MC = [
  { x: 0, y: 0, vx: 0, vy: 0, d: 'n', vd: 'e' },
  { x: 2.7, y: 0, vx: 0, vy: 2.4, d: 'n', vd: 'e' },
  { x: 5.7, y: 3, vx: 0.9, vy: 4.8, d: 's', vd: 'e' },
  { x: 8.4, y: 3, vx: 0.9, vy: 7.2, d: 's', vd: 'e' },
]
export const METRO_NETWORK = {
  id: 'gyeongju-metro',
  title: 'Gyeongju Metro map',
  lines: [
    {
      id: GYEONGJU_LINE.id,
      color: 'yellow',
      code: 'GY',
      name: GYEONGJU_LINE.name,
      stations: [
        { id: STATION.id, kind: 'station', complex: true, code: STATION.code, label: STATION.name, labelKo: STATION.nameKo, icon: 'camera', accent: 'yellow', x: MC[0].x, y: MC[0].y, vx: MC[0].vx, vy: MC[0].vy, labelDir: MC[0].d, vLabelDir: MC[0].vd },
        ...CONCEPT_STOPS.map((c, i) => ({ id: c.id, kind: 'station', concept: true, code: c.code, label: c.name, labelKo: c.nameKo, icon: c.icon, accent: c.accent, approach: 'straight-first', x: MC[i + 1].x, y: MC[i + 1].y, vx: MC[i + 1].vx, vy: MC[i + 1].vy, labelDir: MC[i + 1].d, vLabelDir: MC[i + 1].vd })),
      ],
    },
  ],
}

// ---- 2) GY-01 UrbanEdge 역사 안: 승강장 4개가 갈라지는 확대 보기 ----
const ROWS = [-2.1, -0.7, 0.7, 2.1]
const PEEL = [1.2, 2.6, 4.0, 5.4]
const LANES = [-1.5, -0.5, 0.5, 1.5]
const hub = () => ({ id: STATION.id, x: 0, y: 0, vx: 0, vy: 0, kind: 'hub', code: STATION.code, label: STATION.name, labelKo: STATION.nameKo, accent: 'yellow', labelDir: 'n', vLabelDir: 'w' })

export const ROOM_NETWORK = {
  id: 'urbanedge-station',
  title: 'GY-01 UrbanEdge Station, four platforms',
  lines: [
    {
      id: GYEONGJU_LINE.id,
      color: 'yellow',
      code: 'GY',
      name: GYEONGJU_LINE.name,
      stations: [
        { id: 'gy-start', x: -3.8, y: 0, vx: 0, vy: -3.4, kind: 'terminus', pill: true, code: 'GY', label: GYEONGJU_LINE.name, labelKo: GYEONGJU_LINE.nameKo, color: 'yellow', labelDir: 'n', vLabelDir: 'e' },
        hub(),
      ],
    },
    ...PLATFORMS.map((p, i) => ({
      id: p.id,
      color: p.accent,
      code: String(p.number),
      name: p.name,
      lane: LANES[i],
      zone: true,
      stations: [
        { id: STATION.id, x: 0, y: 0, vx: 0, vy: 0 },
        { id: `via-${p.id}`, x: 2.3, y: 0, vx: 0, vy: PEEL[i], kind: 'hidden' },
        { id: p.id, x: 7.2, y: ROWS[i], vx: 3.4, vy: PEEL[i] + 1.1, kind: 'platform', platform: p.number, label: p.name, labelKo: p.nameKo, accent: p.accent, icon: p.icon, labelDir: 'e', vLabelDir: 'e' },
      ],
    })),
  ],
}

// ---- 3) 이용 4단계(Board, Choose, Pose, Print): 한 번의 여정을 역 4개로 ----
export const JOURNEY_STEPS = [
  { id: 'board', code: '1', label: 'Board', labelKo: '탑승', icon: 'door', accent: 'yellow', sub: 'Find the entrance', subKo: '입구 찾기' },
  { id: 'choose', code: '2', label: 'Choose', labelKo: '선택', icon: 'grid', accent: 'red', sub: 'Pick 4 or 8 cuts', subKo: '4컷 또는 8컷 선택' },
  { id: 'pose', code: '3', label: 'Pose', labelKo: '포즈', icon: 'user', accent: 'blue', sub: 'The lens sits below the screen', subKo: '렌즈는 화면 아래' },
  { id: 'print', code: '4', label: 'Print', labelKo: '인화', icon: 'printer', accent: 'green', sub: 'Two strips from the slot', subKo: '인화물 2장은 아래 출구로' },
]
export const JOURNEY_LINE = { id: 'journey', code: 'GY', color: 'yellow', name: 'Photo journey', nameKo: '촬영 여정' }
export const SHUTTER_LINE = JOURNEY_LINE // 이전 이름 호환

const JC = [
  { x: 0, y: 0, vx: 0, vy: 0, d: 'n', vd: 'e' },
  { x: 2.6, y: 0, vx: 0, vy: 2.4, d: 'n', vd: 'e' },
  { x: 5.6, y: 3, vx: 0.9, vy: 4.8, d: 's', vd: 'e' },
  { x: 8.2, y: 3, vx: 0.9, vy: 7.2, d: 's', vd: 'e' },
]
export const JOURNEY_NETWORK = {
  id: 'photo-journey',
  title: 'Photo journey: Board, Choose, Pose, Print',
  lines: [
    {
      id: JOURNEY_LINE.id,
      color: 'yellow',
      code: 'GY',
      name: JOURNEY_LINE.name,
      stations: JOURNEY_STEPS.map((s, i) => ({ id: s.id, kind: 'station', code: s.code, label: s.label, labelKo: s.labelKo, icon: s.icon, accent: s.accent, approach: 'straight-first', x: JC[i].x, y: JC[i].y, vx: JC[i].vx, vy: JC[i].vy, labelDir: JC[i].d, vLabelDir: JC[i].vd })),
    },
  ],
}

export const defaultNetwork = METRO_NETWORK
