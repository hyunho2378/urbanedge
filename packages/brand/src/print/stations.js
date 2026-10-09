// stations.js: Gyeongju Metro(코드 GY)와 GY-01 UrbanEdge 역. docs/NAMING.md 기준.
// 경주에는 지하철이 없고, 이것은 어반엣지가 만든 가상의 지하철 관광 경험이다(실제 교통시설이 아님).
// 실제 역은 GY-01 어반엣지(황리단길) 하나이고, 방 3곳이 그 역의 승강장(Platform 1에서 3, 시간 순서)이다. 화장실 방은 없다.
export const SYSTEM = {
  code: 'GY',
  name: { en: 'Gyeongju Metro', ko: '경주 메트로' },
  tagline: { en: 'Explore Gyeongju, One Station at a Time.', ko: '경주를 한 역씩 탐험하세요.' },
  notice: 'Imaginary Metro · Travel Experience',
}
export const LINE = SYSTEM // 예전 이름. 같은 값을 돌려 준다.

export const STATION = { id: 'gy-01', code: 'GY-01', name: 'URBANEDGE', title: { en: 'UrbanEdge Station', ko: '어반엣지역' }, area: { en: 'Hwangridan-gil', ko: '황리단길' } }

// 노선도에 그리는 정거장. 후보 역은 Concept stop으로만 표시하고 열렸다고 말하지 않는다(코드는 GY-02부터 임시).
export const METRO_STOPS = [
  { id: 'gy-01', code: 'GY-01', name: { en: 'UrbanEdge', ko: '어반엣지' }, area: { en: 'Hwangridan-gil', ko: '황리단길' }, status: 'open' },
  { id: 'gy-02', code: 'GY-02', name: { en: 'Daereungwon', ko: '대릉원' }, status: 'concept' },
  { id: 'gy-03', code: 'GY-03', name: { en: 'Cheomseongdae', ko: '첨성대' }, status: 'concept' },
  { id: 'gy-04', code: 'GY-04', name: { en: 'Donggung & Wolji', ko: '동궁과 월지' }, status: 'concept' },
]

// 승강장 번호는 시간 순서다: 1 Retro(1968), 2 Karaoke(2008), 3 Subway(2000년대 현재). 방 id와 색은 그대로다.
// era는 시대 태그(화면에 아직 쓰지 않는다). 없어진 Public Phone 방은 목록에서 뺐다.
const PLATFORMS = [
  { id: 'retro', platform: 1, shot: 'RETRO SHOT', color: 'green', title: { en: 'Retro Shot', ko: '레트로 샷' }, era: { en: '1968 · The Roots', ko: '1968 · 뿌리' } },
  { id: 'karaoke', platform: 2, shot: 'KARAOKE SHOT', color: 'red', title: { en: 'Karaoke Shot', ko: '노래방 샷' }, era: { en: '2008 · The Memory', ko: '2008 · 추억' } },
  { id: 'subway', platform: 3, shot: 'SUBWAY SHOT', color: 'yellow', title: { en: 'Subway Shot', ko: '지하철 샷' }, era: { en: '2000s · The Present', ko: '2000년대 · 현재' } },
]

// STATIONS: 승강장 3곳. 항목마다 역 정보(code 'GY-01', name 'URBANEDGE')와 승강장 정보(platform, platformText, pCode, shot, color)가 같이 있다.
export const STATIONS = PLATFORMS.map((pl) => ({
  ...pl,
  code: STATION.code,
  name: STATION.name,
  platformText: `PLATFORM ${pl.platform}`,
  pCode: `P${pl.platform}`,
}))

// roomId: 'karaoke' 같은 id, 'P2', 2, 'Platform 2', 예전 노선 코드 'L2'(번호가 아니라 예전 방 기준으로 읽는다). 알 수 없으면 karaoke(팀 샘플 인화물이 찍힌 승강장).
// 없어진 'toilet', 'phone'과 4 이상의 번호는 Subway Shot으로 돌려 오류를 막고, 화면에는 나타나지 않는다.
const BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]))
export function getStation(roomId) {
  const k = String(roomId ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '')
  const num = k.match(/^(?:p|platform)?([1-9])$/)
  const legacy = k.match(/^l([1-9])$/) // 예전 노선 코드: L1 subway, L2 karaoke, L3 phone, L4 retro, L5 toilet
  return (
    STATIONS.find((s) => s.id === k || s.shot.toLowerCase().replace(/\s/g, '') === k || s.title.en.toLowerCase().replace(/\s/g, '') === k) ||
    (legacy && (BY_ID[{ 1: 'subway', 2: 'karaoke', 4: 'retro' }[legacy[1]]] || BY_ID.subway)) ||
    (num && (STATIONS[Number(num[1]) - 1] || BY_ID.subway)) ||
    (/toilet|phone/.test(k) && BY_ID.subway) ||
    BY_ID.karaoke
  )
}

const pad = (n) => String(n).padStart(2, '0')

// 2026.10.09 형식. Date, 타임스탬프, 'YYYY-MM-DD', 'YYYY.MM.DD' 문자열을 받는다. 없으면 오늘.
export function formatShotDate(input) {
  if (typeof input === 'string' && /^\d{4}[.\-/]\d{2}[.\-/]\d{2}/.test(input)) return input.slice(0, 10).replace(/[-/]/g, '.')
  const d = input instanceof Date ? input : input != null ? new Date(input) : new Date()
  if (Number.isNaN(d.getTime())) return formatShotDate(new Date())
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
